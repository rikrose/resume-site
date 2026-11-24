/**
 * Worker entry point. Static files are served by Workers static assets before
 * this runs (see `run_worker_first` in wrangler.jsonc), so the only job here
 * is the contact form API:
 *
 *   POST /api/contact   { name, email, message, website, turnstileToken }
 *
 * Checks, cheapest first: same-origin request, body size, per-IP rate limit,
 * field validation, honeypot, Turnstile. Then the message is emailed to
 * CONTACT_TO through the Resend API, with Reply-To set to the visitor.
 */

const MAX_BODY_BYTES = 16 * 1024;
const LIMITS = { name: 100, email: 254, message: 5000 } as const;
// Pragmatic check, not full RFC 5322: one @, no spaces, a dot in the domain.
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;

type ContactErrorCode =
  | "bad_request"
  | "forbidden"
  | "too_large"
  | "rate_limited"
  | "invalid"
  | "captcha"
  | "send_failed"
  | "not_configured";

function json(status: number, body: object, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
}

function fail(status: number, error: ContactErrorCode, extra?: Record<string, string>) {
  return json(status, { ok: false, error }, extra);
}

function field(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  if (!res.ok) return false;
  const outcome: { success?: boolean } = await res.json();
  return outcome.success === true;
}

interface ContactEmail {
  subject: string;
  text: string;
  replyTo: string;
}

/** Strips CR/LF so visitor text can't break out of a header-bound field. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Sends through https://resend.com/docs/api-reference/emails/send-email.
 * CONTACT_FROM must be on a domain verified in Resend. Throws on failure.
 */
async function sendViaResend(env: Env, email: ContactEmail): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Resume contact form <${env.CONTACT_FROM}>`,
      to: [env.CONTACT_TO],
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
    }),
  });
  if (!res.ok) {
    // Resend's error body names the problem (bad key, unverified domain,
    // quota); it contains no visitor data, so it's safe to log.
    const detail = (await res.text().catch(() => "")).slice(0, 500);
    throw new Error(`Resend responded ${res.status}: ${detail}`);
  }
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return fail(405, "bad_request", { Allow: "POST" });

  const dryRun = env.CONTACT_DRY_RUN === "true";
  if (!env.CONTACT_TO || !env.TURNSTILE_SECRET_KEY || (!dryRun && !env.RESEND_API_KEY)) {
    console.error("contact: CONTACT_TO, TURNSTILE_SECRET_KEY or RESEND_API_KEY is not set");
    return fail(503, "not_configured");
  }

  // Only accept submissions from the site's own pages.
  const origin = request.headers.get("Origin");
  if (origin !== new URL(request.url).origin) return fail(403, "forbidden");

  if (!request.headers.get("Content-Type")?.startsWith("application/json")) {
    return fail(415, "bad_request");
  }
  const declared = Number(request.headers.get("Content-Length") ?? 0);
  if (declared > MAX_BODY_BYTES) return fail(413, "too_large");

  const ip = request.headers.get("CF-Connecting-IP");
  const { success: allowed } = await env.CONTACT_RATE_LIMIT.limit({ key: ip ?? "unknown" });
  if (!allowed) return fail(429, "rate_limited", { "Retry-After": "60" });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return fail(413, "too_large");
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return fail(400, "bad_request");
  }

  // The name goes into the subject, so keep it to one line everywhere.
  const name = oneLine(field(body, "name"));
  const email = field(body, "email");
  const message = field(body, "message");
  const honeypot = field(body, "website");
  const token = field(body, "turnstileToken");

  if (
    !name ||
    name.length > LIMITS.name ||
    !EMAIL_RE.test(email) ||
    email.length > LIMITS.email ||
    !message ||
    message.length > LIMITS.message
  ) {
    return fail(400, "invalid");
  }

  // Bots that fill in the hidden field get a fake success and no email.
  if (honeypot) return json(200, { ok: true });

  if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) {
    return fail(400, "captcha");
  }

  const contactEmail: ContactEmail = {
    // EMAIL_RE already rejects whitespace, so the address is a single line.
    replyTo: email,
    subject: `Resume contact from ${name}`,
    text: [
      `Name:  ${name}`,
      `Email: ${email}`,
      "",
      message,
      "",
      "--",
      `Sent from the contact form on ${new URL(request.url).host}.`,
      "Reply to this email to answer the sender directly.",
    ].join("\n"),
  };

  // Local development only (.dev.vars): log the email instead of sending it.
  if (dryRun) {
    console.log("contact: dry run, not sent", { to: env.CONTACT_TO, ...contactEmail });
    return json(200, { ok: true });
  }

  try {
    await sendViaResend(env, contactEmail);
  } catch (err) {
    console.error("contact: send failed", err);
    return fail(502, "send_failed");
  }

  return json(200, { ok: true });
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/contact") return handleContact(request, env);
    if (pathname.startsWith("/api/")) return json(404, { ok: false, error: "not_found" });
    // Not reached with the current run_worker_first patterns; kept as a safe default.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
