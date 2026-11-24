/**
 * Contact form in a dialog. `ContactProvider` owns the open state so any
 * button on the page (banner, hero) can open it via `useContact()`.
 *
 * Submits JSON to the Worker at POST /api/contact (worker/index.ts), which
 * verifies the Turnstile token and emails the message through Resend.
 */
import * as React from "react";
import { Button } from "performative-ui";
import { CheckCircle2, LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

// ── Open state ────────────────────────────────────────────────────────────

const ContactContext = React.createContext<{ openContact: () => void } | null>(null);

export function useContact() {
  const ctx = React.useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used inside <ContactProvider>");
  return ctx;
}

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ openContact: () => setOpen(true) }), []);
  return (
    <ContactContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {/* Mounted only while open, so each opening starts with a fresh form. */}
          {open && <ContactForm />}
        </DialogContent>
      </Dialog>
    </ContactContext.Provider>
  );
}

// ── Turnstile ─────────────────────────────────────────────────────────────

export interface TurnstileApi {
  render(
    el: HTMLElement,
    options: {
      sitekey: string;
      theme?: "auto" | "light" | "dark";
      size?: "normal" | "flexible" | "compact";
      action?: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let turnstileLoading: Promise<TurnstileApi> | undefined;

/**
 * Loads the Turnstile script once, on first use (not on page load). An API
 * already on `window` is used as is, which is how the stories swap in a stub.
 */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  turnstileLoading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing"));
    script.onerror = () => {
      turnstileLoading = undefined; // allow a retry on next open
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return turnstileLoading;
}

function useTurnstile() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | undefined>(undefined);
  const [token, setToken] = React.useState("");
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetId.current = turnstile.render(containerRef.current, {
          sitekey: siteConfig.turnstileSiteKey,
          theme: "dark",
          size: "flexible",
          action: "contact",
          callback: (t) => {
            setToken(t);
            setFailed(false);
          },
          "expired-callback": () => setToken(""),
          "error-callback": () => {
            setToken("");
            setFailed(true);
          },
        });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, []);

  /** Tokens are single-use: get a new one after every submission attempt. */
  const reset = React.useCallback(() => {
    setToken("");
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  return { containerRef, token, failed, reset };
}

// ── Form ──────────────────────────────────────────────────────────────────

const ERROR_TEXT: Record<string, string> = {
  invalid: "Please check your name, email address and message.",
  captcha: "The anti-spam check didn't pass. Please try again.",
  rate_limited: "Too many messages in a short time. Please wait a minute and try again.",
  too_large: "That message is too long.",
};
const FALLBACK_ERROR = "Something went wrong sending your message. Please try again later.";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const inputClass =
  "w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-60";

function ContactForm() {
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const turnstile = useTurnstile();
  const sending = status.kind === "sending";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!turnstile.token) return;
    const data = new FormData(event.currentTarget);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
          turnstileToken: turnstile.token,
        }),
      });
      const result: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (res.ok && result.ok) {
        setStatus({ kind: "sent" });
        return;
      }
      setStatus({ kind: "error", message: ERROR_TEXT[result.error ?? ""] ?? FALLBACK_ERROR });
    } catch {
      setStatus({ kind: "error", message: FALLBACK_ERROR });
    }
    turnstile.reset();
  }

  if (status.kind === "sent") {
    return (
      <div className="grid justify-items-center gap-3 py-6 text-center" role="status">
        <CheckCircle2 className="size-10 text-[var(--pui-success)]" aria-hidden />
        <DialogTitle>Message sent</DialogTitle>
        <DialogDescription className="text-base">
          Thanks for getting in touch. I'll reply to the email address you gave.
        </DialogDescription>
        <DialogClose asChild>
          <Button variant="ghost" className="mt-2">
            Close
          </Button>
        </DialogClose>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Get in touch</DialogTitle>
        <DialogDescription>
          Send me a message and I'll reply by email. All fields are required.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="contact-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            disabled={sending}
            className={inputClass}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            disabled={sending}
            className={inputClass}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="contact-message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            maxLength={5000}
            rows={6}
            disabled={sending}
            className={cn(inputClass, "resize-y")}
          />
        </div>

        {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div ref={turnstile.containerRef} className="min-h-[65px]" />
        {turnstile.failed && (
          <p className="text-sm text-[var(--pui-danger)]" role="alert">
            The anti-spam check couldn't load. Check your connection or disable content blockers for
            this site, then reopen the form.
          </p>
        )}

        {status.kind === "error" && (
          <p className="text-sm text-[var(--pui-danger)]" role="alert">
            {status.message}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="glow" disabled={sending || !turnstile.token}>
            <span className="inline-flex items-center gap-2 align-top">
              {sending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {sending ? "Sending…" : "Send message"}
            </span>
          </Button>
        </div>
      </form>
    </>
  );
}
