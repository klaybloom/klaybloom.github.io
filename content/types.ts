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

export type Profile = {
  name: string;
  nickname: string;
  title: string;
  summary: string;
  bio: string[];
  links: {
    github: string;
    blog: string;
    projects: string;
    email: string;
  };
};

export type Highlight = {
  label: string;
  value: string;
};

export type SkillGroup = {
  group: string;
  items: string[];
};

export type ExperienceItem = {
  period: string;
  title: string;
  company: string;
  description: string[];
};

export type ProjectStatus =
  | "planning"
  | "building"
  | "launched"
  | "paused"
  | "archived";

export type Project = {
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  stack: string[];
  category: string;
  cover: string;
  github: string;
  demo: string;
  date: string;
  updated: string;
  status: ProjectStatus;
  featured: boolean;
  pinned: boolean;
};
