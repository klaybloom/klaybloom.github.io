import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const stringList = z.array(nonEmptyString);
const slugSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-_]*$/, "slug must use lowercase letters, numbers, hyphens, or underscores");

export const isoDateSchema = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}, "date must use a valid YYYY-MM-DD value");

const publicLinkSchema = z.string().refine((value) => {
  if (value === "" || value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}, "link must be empty, site-relative, or use http/https");

export const profileSchema = z
  .object({
    name: nonEmptyString,
    nickname: nonEmptyString,
    title: nonEmptyString,
    summary: nonEmptyString,
    bio: stringList,
    links: z
      .object({
        github: publicLinkSchema,
        blog: publicLinkSchema,
        projects: publicLinkSchema,
        email: z.string().email(),
      })
      .strict(),
  })
  .strict();

export const experienceItemSchema = z
  .object({
    period: nonEmptyString,
    title: nonEmptyString,
    company: nonEmptyString,
    description: stringList,
  })
  .strict();

export const experienceFileSchema = z
  .object({
    experience: z.array(experienceItemSchema),
  })
  .strict();

export const projectStatusSchema = z.enum([
  "planning",
  "building",
  "launched",
  "paused",
  "archived",
]);

export const projectSchema = z
  .object({
    title: nonEmptyString,
    slug: slugSchema,
    description: nonEmptyString,
    longDescription: nonEmptyString,
    stack: stringList,
    category: nonEmptyString,
    cover: publicLinkSchema,
    github: publicLinkSchema,
    demo: publicLinkSchema,
    date: isoDateSchema,
    updated: isoDateSchema,
    status: projectStatusSchema,
    featured: z.boolean(),
    pinned: z.boolean(),
  })
  .strict();

export const projectsFileSchema = z
  .object({
    projects: z.array(projectSchema),
  })
  .strict()
  .superRefine(({ projects }, context) => {
    const seen = new Set<string>();
    projects.forEach((project, index) => {
      if (seen.has(project.slug)) {
        context.addIssue({
          code: "custom",
          message: `duplicate project slug: ${project.slug}`,
          path: ["projects", index, "slug"],
        });
      }
      seen.add(project.slug);
    });
  });

export const skillGroupSchema = z
  .object({
    group: nonEmptyString,
    items: stringList,
  })
  .strict();

export const skillsFileSchema = z
  .object({
    skills: z.array(skillGroupSchema),
  })
  .strict();

export const homeSectionTypeSchema = z.enum([
  "hero",
  "skills",
  "latest-projects",
  "latest-posts",
  "experience",
  "custom",
]);

export const homeSectionSchema = z
  .object({
    id: nonEmptyString,
    type: homeSectionTypeSchema,
    enabled: z.boolean(),
    params: z
      .object({
        title: z.string().optional(),
        count: z.number().int().min(1).optional(),
        body: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const homeSectionsFileSchema = z
  .object({
    sections: z.array(homeSectionSchema),
  })
  .strict()
  .superRefine(({ sections }, context) => {
    const seen = new Set<string>();
    sections.forEach((section, index) => {
      if (seen.has(section.id)) {
        context.addIssue({
          code: "custom",
          message: `duplicate home section id: ${section.id}`,
          path: ["sections", index, "id"],
        });
      }
      seen.add(section.id);
    });
  });

export const postFrontmatterSchema = z
  .object({
    title: nonEmptyString,
    date: isoDateSchema,
    updated: isoDateSchema.optional(),
    description: z.string(),
    tags: z.array(nonEmptyString),
    category: z.string().optional(),
    cover: publicLinkSchema.optional(),
    published: z.boolean(),
    featured: z.boolean(),
  })
  .strict();

export const postSaveSchema = z
  .object({
    slug: slugSchema,
    data: z
      .object({
        frontmatter: postFrontmatterSchema,
        content: nonEmptyString,
      })
      .strict(),
  })
  .strict();

export type Profile = z.infer<typeof profileSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type HomeSection = z.infer<typeof homeSectionSchema>;
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
