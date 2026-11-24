import type { ComponentType } from "react";
import { BigBack, GradientText } from "performative-ui";

import { useAppearance, type AppearanceOption } from "@/appearance";
import { useResume } from "@/content/context";
import type { Resume } from "@/content/types";

type FooterProps = { resume: Resume; copyright: string };

/** One component per `footer` option. Each renders its own <footer>. */
const footers = {
  bigback: ({ resume, copyright }) => (
    <BigBack
      className="mt-16"
      company={resume.name}
      gradient
      social={resume.contact.map((c) => ({ label: c.label, href: c.href }))}
      copyright={copyright}
    />
  ),
  simple: ({ resume, copyright }) => (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-lg font-semibold">
          <GradientText>{resume.name}</GradientText>
        </p>
        {resume.contact.length > 0 && (
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Contact links">
            {resume.contact.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">{copyright}</p>
      </div>
    </footer>
  ),
} satisfies Record<AppearanceOption<"footer">, ComponentType<FooterProps>>;

export function Footer() {
  const resume = useResume();
  const variant = useAppearance("footer");
  const Variant = footers[variant];
  return (
    <div data-section="footer" data-variant={variant}>
      <Variant resume={resume} copyright={`© ${__BUILD_YEAR__} ${resume.name}`} />
    </div>
  );
}
