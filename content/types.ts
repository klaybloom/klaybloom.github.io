export type NavItem = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  title: string;
  description: string;
  url: string;
  nav: NavItem[];
};

export type Highlight = {
  label: string;
  value: string;
};

export type {
  ExperienceItem,
  Profile,
  Project,
  ProjectStatus,
  SkillGroup,
} from "@/lib/content-schema";
