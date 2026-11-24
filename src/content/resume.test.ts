/**
 * Checks on the resume content that the types can't express. The components
 * use these fields as React keys, so duplicates cause rendering glitches
 * without any error in the build.
 *
 * Runs on the live content (src/content/resume.ts) and on the placeholder
 * content the stories and screenshot tests render (src/content/sample-resume.ts).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vite-plus/test";

import { resume } from "./resume";
import { sampleResume } from "./sample-resume";
import type { Resume } from "./types";

function duplicates(values: string[]) {
  return values.filter((v, i) => values.indexOf(v) !== i);
}

function links(r: Resume) {
  return [
    ...r.contact.map((c) => c.href),
    ...r.experience.flatMap((j) => (j.href ? [j.href] : [])),
    ...r.projects.flatMap((p) => (p.href ? [p.href] : [])),
    ...r.community.flatMap((c) => (c.href ? [c.href] : [])),
  ];
}

describe.each([
  ["live resume", resume],
  ["sample resume", sampleResume],
])("%s", (_, r) => {
  test("has a name and at least one headline (used in the page title)", () => {
    expect(r.name.trim()).not.toBe("");
    expect(r.headlines.length).toBeGreaterThan(0);
  });

  test("React keys are unique within each list", () => {
    expect(duplicates(r.experience.map((j) => `${j.company}-${j.start}`))).toEqual([]);
    expect(duplicates(r.skills.map((g) => g.group))).toEqual([]);
    for (const group of r.skills) {
      expect(duplicates(group.items), `skills group "${group.group}"`).toEqual([]);
    }
    expect(duplicates(r.projects.map((p) => p.name))).toEqual([]);
    expect(duplicates(r.education.map((e) => `${e.institution}-${e.qualification}`))).toEqual([]);
    expect(duplicates(r.community.map((c) => `${c.organization}-${c.role}`))).toEqual([]);
    expect(duplicates(r.contact.map((c) => c.href))).toEqual([]);
    expect(duplicates(r.stats.map((s) => s.label))).toEqual([]);
    for (const job of r.experience) {
      expect(duplicates(job.highlights), `highlights for ${job.company}`).toEqual([]);
    }
  });

  test("the downloadable PDF exists in public/", () => {
    if (!r.resumePdf) return;
    expect(r.resumePdf.startsWith("/")).toBe(true);
    const file = join(import.meta.dirname, "../../public", r.resumePdf);
    expect(existsSync(file), `${r.resumePdf} is missing from public/`).toBe(true);
  });

  test("links are absolute http(s), mailto: or tel: URLs", () => {
    for (const href of links(r)) {
      expect(["https:", "http:", "mailto:", "tel:"], href).toContain(new URL(href).protocol);
    }
  });
});

describe("sample resume", () => {
  test("is clearly placeholder content, not a real person", () => {
    expect(sampleResume.name).not.toBe(resume.name);
    // Reserved for documentation (RFC 2606), so no link can reach a real site.
    for (const href of links(sampleResume)) {
      const url = new URL(href);
      const host = url.protocol === "mailto:" ? url.pathname.split("@")[1]! : url.hostname;
      expect(host, href).toMatch(/(^|\.)example\.(com|org|net)$/);
    }
  });

  test("shares no text with the live resume", () => {
    const words = (r: Resume) => new Set([r.name, r.summary, ...r.headlines, r.location ?? ""]);
    for (const text of words(sampleResume)) {
      expect(words(resume).has(text), text).toBe(false);
    }
  });

  test("exercises everything the components can show", () => {
    const s = sampleResume;
    expect(s.headlines.length, "several headlines, so WordRoll/typewriter animate").toBeGreaterThan(
      1,
    );
    expect(s.resumePdf, "a PDF path, so the download button shows").toBeTruthy();
    expect(s.location).toBeTruthy();
    expect(s.stats).toHaveLength(3);
    expect(new Set(s.contact.map((c) => c.kind)).size, "several contact icons").toBeGreaterThan(2);

    expect(
      s.experience.filter((j) => !j.end),
      "exactly one current role",
    ).toHaveLength(1);
    expect(s.experience[0]!.end, "the current role comes first").toBeUndefined();
    expect(s.experience.some((j) => j.href) && s.experience.some((j) => !j.href)).toBe(true);
    expect(s.experience.some((j) => j.tech?.length) && s.experience.some((j) => !j.tech)).toBe(
      true,
    );

    expect(s.skills.length).toBeGreaterThan(1);
    expect(s.projects.some((p) => p.href) && s.projects.some((p) => !p.href)).toBe(true);
    expect(s.education.length).toBeGreaterThan(1);
    expect(
      s.community.some((c) => !c.end && c.start),
      "an ongoing role",
    ).toBe(true);
    expect(
      s.community.some((c) => !c.href),
      "an organization without a link",
    ).toBe(true);
  });
});
