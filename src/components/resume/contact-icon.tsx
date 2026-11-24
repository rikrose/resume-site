import { CodeXml, Globe, Link, Mail, Phone, UserRound } from "lucide-react";
import type { LucideProps } from "lucide-react";

import type { ContactKind } from "@/content/types";

const icons: Record<ContactKind, React.ComponentType<LucideProps>> = {
  email: Mail,
  phone: Phone,
  github: CodeXml,
  linkedin: UserRound,
  website: Globe,
  other: Link,
};

export function ContactIcon({ kind, ...props }: { kind: ContactKind } & LucideProps) {
  const Icon = icons[kind];
  return <Icon aria-hidden {...props} />;
}
