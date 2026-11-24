/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SAMPLE CONTENT — not shown on the site
 *  A fictional resume that Storybook and the screenshot tests render instead
 *  of the real one (src/content/resume.ts). Because of it, editing your own
 *  resume never changes a story or a reference screenshot.
 *
 *  Keep it fictional: links go to the reserved example.com/.org/.net domains
 *  only. It deliberately covers every case the components handle (a current
 *  role, entries with and without links or tech, ongoing community work), and
 *  src/content/resume.test.ts checks that it still does.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { Resume } from "./types";

export const sampleResume: Resume = {
  name: "Jordan Example",
  headlines: ["Software Engineer", "Open-Source Maintainer", "Occasional Speaker"],
  location: "Anytown, USA",
  summary:
    "This is sample content. Replace it with a sentence or two about who you are and what you do best, in src/content/resume.ts.",
  resumePdf: "/put-your-resume-here.pdf",

  contact: [
    { kind: "email", label: "Email", href: "mailto:jordan@example.com" },
    { kind: "github", label: "GitHub", href: "https://github.example.com/jordan" },
    { kind: "linkedin", label: "LinkedIn", href: "https://linkedin.example.com/in/jordan" },
    { kind: "website", label: "Website", href: "https://jordan.example.com" },
  ],

  stats: [
    { value: 12, suffix: "+", label: "Years building software" },
    { value: 40, suffix: "+", label: "Projects shipped" },
    { value: 8, label: "Engineers mentored" },
  ],

  experience: [
    {
      role: "Staff Engineer",
      company: "Example Corp",
      href: "https://corp.example.com",
      location: "Anytown, USA",
      start: "2021",
      summary: "Platform and developer tooling.",
      highlights: [
        "Led the move to a shared build platform used by every product team.",
        "Cut median CI time from 25 minutes to 6.",
        "Mentored engineers through their first design reviews.",
      ],
      tech: ["TypeScript", "Go", "Kubernetes"],
    },
    {
      role: "Senior Engineer",
      company: "Acme Widgets",
      href: "https://acme.example.com",
      location: "Remote",
      start: "2017",
      end: "2021",
      highlights: [
        "Built the public API and its SDKs in three languages.",
        "Ran the on-call rotation and its incident reviews.",
      ],
      tech: ["Python", "PostgreSQL"],
    },
    {
      role: "Software Engineer",
      company: "Sample Systems",
      location: "Anytown, USA",
      start: "2014",
      end: "2017",
      highlights: ["Maintained the billing service.", "Wrote the team's first integration tests."],
    },
    {
      role: "Junior Developer",
      company: "Placeholder Labs",
      href: "https://labs.example.org",
      location: "Elsewhere, USA",
      start: "2012",
      end: "2014",
      highlights: ["Shipped internal tools for the support team."],
      tech: ["PHP", "MySQL"],
    },
  ],

  skills: [
    { group: "Languages", items: ["TypeScript", "Go", "Python", "SQL"] },
    { group: "Frontend", items: ["React", "CSS", "Accessibility"] },
    { group: "Infrastructure", items: ["Kubernetes", "Terraform", "PostgreSQL", "Linux"] },
    { group: "Practices", items: ["System design", "Testing", "Mentoring", "Code review"] },
  ],

  projects: [
    {
      name: "Sample Project One",
      description: "A short description of something you built, and why it mattered.",
      href: "https://one.example.com",
      tech: ["TypeScript", "React"],
    },
    {
      name: "Sample Project Two",
      description:
        "A longer description, to show how cards and lists handle a few lines of text: what the problem was, what you did about it, and what happened next.",
      tech: ["Go", "PostgreSQL", "Docker"],
    },
    {
      name: "Sample Project Three",
      description: "A project with a link and no tech list.",
      href: "https://three.example.net",
    },
  ],

  education: [
    {
      institution: "Example University",
      qualification: "BSc Computer Science",
      start: "2008",
      end: "2012",
      notes: "Placeholder notes, such as a thesis title or honours.",
    },
    {
      institution: "Online Course Provider",
      qualification: "Certificate in Distributed Systems",
      end: "2019",
    },
  ],

  community: [
    {
      organization: "Example Open Source Foundation",
      role: "Maintainer",
      href: "https://foundation.example.org",
      start: "2019",
      description: "Reviews pull requests and runs the release process.",
    },
    {
      organization: "Anytown Coding Club",
      role: "Volunteer mentor",
      start: "2016",
      end: "2020",
      description: "Weekly sessions teaching teenagers to program.",
    },
  ],
};
