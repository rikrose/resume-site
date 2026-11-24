export type ContactKind = "email" | "phone" | "github" | "linkedin" | "website" | "other";

export interface ContactLink {
  kind: ContactKind;
  label: string;
  href: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface Experience {
  role: string;
  company: string;
  href?: string;
  location?: string;
  start: string;
  /** Omit for a role you still hold. */
  end?: string;
  summary?: string;
  highlights: string[];
  tech?: string[];
}

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface Project {
  name: string;
  description: string;
  href?: string;
  tech?: string[];
}

export interface Education {
  institution: string;
  qualification: string;
  start?: string;
  end?: string;
  notes?: string;
}

export interface CommunityService {
  organization: string;
  role: string;
  href?: string;
  start?: string;
  /** Omit (with a `start`) for something you're still involved in. */
  end?: string;
  description?: string;
}

export interface Resume {
  name: string;
  headlines: string[];
  location?: string;
  summary: string;
  /** Path to a PDF in /public, e.g. "/resume.pdf". Empty string hides the button. */
  resumePdf?: string;
  contact: ContactLink[];
  stats: Stat[];
  experience: Experience[];
  skills: SkillGroup[];
  projects: Project[];
  education: Education[];
  community: CommunityService[];
}
