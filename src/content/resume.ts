/**
 * ─────────────────────────────────────────────────────────────────────────
 *  RESUME CONTENT
 *  Everything shown on the site lives in this file. Edit the values below
 *  and rebuild; no component code needs to change.
 *
 *  - Sections with an empty array are hidden automatically.
 *  - Dates are free-form strings ("Jan 2023", "2021", …). Leave `end` out
 *    for a role you still hold and it will show as "Present".
 *  - Put a PDF copy of your resume in /public and set `resumePdf` to its
 *    path (e.g. "/resume.pdf") to show a download button. Leave it empty to
 *    hide the button.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { Resume } from "./types";

export const resume: Resume = {
  name: "James McNamerson",
  /** Rotating headline under your name. The first one is used in the page title. */
  headlines: [
    "Person who has looked at src/content/resume.ts",
    "Job Hunter",
    "Probably someone that you should hire",
  ],
  location: "Earth",
  summary: "Someone capable of looking at documentation. Reading it, too..",
  resumePdf: "/put-your-resume-here.pdf",

  contact: [
    { kind: "github", label: "GitHub", href: "https://github.com/" },
    { kind: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/" },
    { kind: "website", label: "Website", href: "https://google.com" },
  ],

  /** Big animated numbers near the top. Keep it to 3–4. */
  stats: [
    { value: 10, suffix: "+", label: "Years of doing something" },
    { value: 15, suffix: "+", label: "Items heard of" },
    { value: 5, label: "Animals pet" },
  ],

  experience: [
    {
      role: "Chief bottle washer",
      company: "Coca Cola",
      href: "https://test.com",
      location: "Seattle, WA",
      start: "2016",
      end: "2026",
      summary: "CLEAN.",
      highlights: ["Did clean.", "Very clean.", "Didn't tihnk this through.", "So clean."],
      tech: ["Brush", "Water", "Soap"],
    },
    {
      role: "Duties as assigned",
      company: "Unnamed Startup (we were in stealth mode, then we were in bankruptcy)",
      href: "https://example.com",
      location: "A garage, then a smaller garage",
      start: "2011",
      end: "2016",
      highlights: [
        "Pivoted 14 times, most of them on purpose.",
        "Wore many hats. Lost three of them. Still invoicing for the hats.",
        "Ate the free snacks before anyone else could disrupt them.",
      ],
      tech: ["Blockchain (in the pitch deck)", "Excel (in reality)", "Hope"],
    },
    {
      role: "Third Line Support Engineer",
      company: "The Third Line",
      location: "Behind the second line",
      start: "2009",
      end: "2010",
      highlights: [
        "Asked users if they had tried turning it off and on again. Then did it for them.",
        "Escalated to the fourth line. There was no fourth line.",
      ],
    },
    {
      role: "Intern",
      company: "Dad's Friend's Company",
      location: "A desk near the printer",
      start: "2008",
      end: "2009",
      highlights: [
        "Fixed the printer. Became the printer person forever.",
        "Made coffee with a 99.9% uptime SLA.",
      ],
      tech: ["Printer", "Kettle"],
    },
  ],

  skills: [
    {
      group: "Languages",
      items: ["English (mostly)", "Sarcasm", "HTML (it counts)", "Regex (read-only)"],
    },
    {
      group: "Frontend",
      items: ["Centering a div (on the second try)", "Dark mode", "Making it pop"],
    },
    {
      group: "Backend & Infra",
      items: ["Restarting it", "Restarting it again", "It works on my machine", "YAML indentation"],
    },
    {
      group: "Practices",
      items: ["Copying from Stack Overflow", "Blaming DNS", "Friday deploys", "Rubber ducking"],
    },
  ],

  projects: [
    {
      name: "This Resume Website",
      description:
        "Forked it, changed nothing, deployed it. Visionary. (Hint: replace this with your real projects in src/content/resume.ts.)",
      href: "https://example.com",
      tech: ["Ctrl+C", "Ctrl+V"],
    },
    {
      name: "TODO App #47",
      description:
        'A to-do list app, unique in every way except for all of them. Its only remaining item is "finish TODO app".',
      tech: ["React", "localStorage", "Unearned confidence"],
    },
    {
      name: "Side Project (abandoned)",
      description:
        "Bought the domain, designed the logo, wrote the README. The rest was left as an exercise for the reader.",
      tech: ["Domain registrar", "Logo generator"],
    },
  ],

  education: [
    {
      institution: "University of YouTube Tutorials",
      qualification: "BSc (Hons) in Skipping the Intro",
      start: "2001",
      end: "2005",
      notes: "Graduated at 2x playback speed.",
    },
    {
      institution: "School of Hard Knocks",
      qualification: "Certificate in Merging to Main",
    },
  ],

  /** Volunteering, mentoring, open-source stewardship, community organizing… */
  community: [
    {
      organization: "The Group Chat",
      role: "Unpaid IT support",
      start: "2010",
      // no `end` → shown as "Present"
      description: "Resetting relatives' passwords, one holiday at a time.",
    },
    {
      organization: "Open Source",
      role: "Starred a repo",
      href: "https://example.com",
      start: "2022",
      // no `end` → shown as "Present"
      description: 'Opened one issue: "+1".',
    },
    {
      organization: "Neighbourhood Book Club",
      role: "Read the blurb",
      start: "2015",
      end: "2016",
      description: "Led discussion on books I had definitely finished.",
    },
  ],
};
