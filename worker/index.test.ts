/**
 * Tests for the contact form API. They run in Node (the `unit` project), which
 * has the same Request/Response/fetch APIs as the Workers runtime. Bindings
 * are faked, and fetch is stubbed so nothing reaches Turnstile or Resend.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

import worker from "./index";

const ORIGIN = "https://resume.example.com";

function makeEnv(overrides: Partial<Env> = {}, { rateLimited = false } = {}): Env {
  return {
    CONTACT_FROM: "contact@example.com",
    CONTACT_TO: "owner@example.com",
    TURNSTILE_SECRET_KEY: "turnstile-secret",
    RESEND_API_KEY: "resend-key",
    CONTACT_DRY_RUN: "",
    CONTACT_RATE_LIMIT: { limit: vi.fn(async () => ({ success: !rateLimited })) },
    ASSETS: { fetch: vi.fn(async () => new Response("asset")) },
    ...overrides,
  } as unknown as Env;
}

const validBody = {
  name: "Sam Sender",
  email: "sam@example.com",
  message: "Hello!",
  website: "",
  turnstileToken: "token",
};

function contactRequest(
  body: unknown = validBody,
  { origin = ORIGIN, contentType = "application/json", method = "POST" } = {},
) {
  const headers: Record<string, string> = { Origin: origin, "CF-Connecting-IP": "203.0.113.7" };
  if (contentType) headers["Content-Type"] = contentType;
  const url = `${ORIGIN}/api/contact`;
  if (method !== "POST") return new Request(url, { method, headers });
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new Request(url, { method: "POST", headers, body: text });
}

interface ApiBody {
  ok: boolean;
  error?: string;
}

async function call(request: Request, env: Env = makeEnv()) {
  const response = await worker.fetch(request as Parameters<typeof worker.fetch>[0], env);
  const body = (await response.json()) as ApiBody;
  return { status: response.status, headers: response.headers, body };
}

/** Stubs the two outside services. Returns the mock so tests can inspect calls. */
function stubServices({ turnstile = true, resendStatus = 200 } = {}) {
  const fetchMock = vi.fn(async (input: string | URL, _init?: RequestInit) => {
    const url = input.toString();
    if (url.startsWith("https://challenges.cloudflare.com/")) {
      return Response.json({ success: turnstile });
    }
    if (url === "https://api.resend.com/emails") {
      return resendStatus === 200
        ? Response.json({ id: "email-id" })
        : new Response("domain not verified", { status: resendStatus });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function resendCalls(fetchMock: ReturnType<typeof stubServices>) {
  return fetchMock.mock.calls.filter(([url]) => url.toString() === "https://api.resend.com/emails");
}

/** The request options of the one call to Resend. */
function resendInit(fetchMock: ReturnType<typeof stubServices>): RequestInit {
  const calls = resendCalls(fetchMock);
  expect(calls).toHaveLength(1);
  return calls[0]![1]!;
}

beforeEach(() => {
  // The Worker logs failures on purpose; keep test output quiet.
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("routing", () => {
  test("unknown /api/ paths are a JSON 404", async () => {
    const res = await call(new Request(`${ORIGIN}/api/nope`));
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "not_found" });
  });

  test("only POST is allowed on /api/contact", async () => {
    const res = await call(contactRequest(undefined, { method: "GET" }));
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("POST");
  });

  test("responses are never cached", async () => {
    const res = await call(new Request(`${ORIGIN}/api/nope`));
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("rejections", () => {
  test("503 when secrets are missing", async () => {
    const res = await call(contactRequest(), makeEnv({ CONTACT_TO: "" }));
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("not_configured");
  });

  test("403 for a request from another origin", async () => {
    const res = await call(contactRequest(validBody, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  test("415 for a body that isn't JSON", async () => {
    const res = await call(contactRequest("name=x", { contentType: "text/plain" }));
    expect(res.status).toBe(415);
  });

  test("413 for a body over 16 KiB", async () => {
    const res = await call(contactRequest({ ...validBody, message: "x".repeat(17 * 1024) }));
    expect(res.status).toBe(413);
  });

  test("429 with Retry-After when the rate limit is hit", async () => {
    const res = await call(contactRequest(), makeEnv({}, { rateLimited: true }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  test("400 for malformed JSON", async () => {
    const res = await call(contactRequest("{not json"));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("bad_request");
  });

  test.each([
    ["missing name", { name: "" }],
    ["name too long", { name: "x".repeat(101) }],
    ["bad email", { email: "not-an-email" }],
    ["email with a space", { email: "a b@example.com" }],
    ["empty message", { message: "   " }],
    ["message too long", { message: "x".repeat(5001) }],
  ])("400 invalid: %s", async (_, change) => {
    const fetchMock = stubServices();
    const res = await call(contactRequest({ ...validBody, ...change }));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("400 captcha when Turnstile rejects the token", async () => {
    const fetchMock = stubServices({ turnstile: false });
    const res = await call(contactRequest());
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("captcha");
    expect(resendCalls(fetchMock)).toHaveLength(0);
  });

  test("a filled honeypot gets a fake success and sends nothing", async () => {
    const fetchMock = stubServices();
    const res = await call(contactRequest({ ...validBody, website: "https://spam.example" }));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("sending", () => {
  test("emails the message through Resend, with Reply-To set to the visitor", async () => {
    const fetchMock = stubServices();
    const res = await call(contactRequest());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const init = resendInit(fetchMock);
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer resend-key");
    const email = JSON.parse(init.body as string);
    expect(email).toMatchObject({
      from: "Resume contact form <contact@example.com>",
      to: ["owner@example.com"],
      reply_to: "sam@example.com",
      subject: "Resume contact from Sam Sender",
    });
    expect(email.text).toContain("Hello!");
  });

  test("a name with line breaks can't inject into the subject", async () => {
    const fetchMock = stubServices();
    await call(contactRequest({ ...validBody, name: "Sam\r\nBcc: victim@example.com" }));
    const init = resendInit(fetchMock);
    expect(JSON.parse(init.body as string).subject).toBe(
      "Resume contact from Sam Bcc: victim@example.com",
    );
  });

  test("dry run logs instead of sending, and needs no Resend key", async () => {
    const fetchMock = stubServices();
    const env = makeEnv({ CONTACT_DRY_RUN: "true", RESEND_API_KEY: "" });
    const res = await call(contactRequest(), env);
    expect(res.status).toBe(200);
    expect(resendCalls(fetchMock)).toHaveLength(0);
    expect(console.log).toHaveBeenCalled();
  });

  test("502 when Resend fails", async () => {
    stubServices({ resendStatus: 403 });
    const res = await call(contactRequest());
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("send_failed");
  });
});
