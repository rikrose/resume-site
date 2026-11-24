import { StickyBanner } from "performative-ui";

import { useAppearance } from "@/appearance";
import { siteConfig } from "@/config";
import { CommunitySection } from "./community";
import { ContactProvider, useContact } from "./contact-dialog";
import { EducationSection } from "./education";
import { ExperienceSection } from "./experience";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { ProjectsSection } from "./projects";
import { SkillsSection } from "./skills";

/**
 * The whole resume. Rendered by the `/` route, and by the page stories, which
 * set `currentlyEmployed` to show both states without touching src/config.ts.
 */
export function ResumePage({
  currentlyEmployed = siteConfig.currentlyEmployed,
}: {
  currentlyEmployed?: boolean;
}) {
  const banner = useAppearance("banner");
  return (
    <ContactProvider>
      {!currentlyEmployed && banner === "sticky" && <OpenToWorkBanner />}

      <Hero currentlyEmployed={currentlyEmployed} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <ExperienceSection currentlyEmployed={currentlyEmployed} />
        <SkillsSection />
        <ProjectsSection />
        <EducationSection />
        <CommunitySection />
      </main>

      <Footer />
    </ContactProvider>
  );
}

function OpenToWorkBanner() {
  const { openContact } = useContact();
  return (
    <StickyBanner
      data-section="banner"
      data-variant="sticky"
      trailing={
        <button
          type="button"
          onClick={openContact}
          aria-haspopup="dialog"
          className="cursor-pointer underline underline-offset-4"
        >
          Let's talk →
        </button>
      }
    >
      Open to new roles
    </StickyBanner>
  );
}
