export type HomeSectionType =
  | "hero"
  | "skills"
  | "latest-projects"
  | "latest-posts"
  | "experience"
  | "custom";

export type HomeSectionParams = {
  title?: string;
  count?: number;
  body?: string;
};

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  params?: HomeSectionParams;
};

export type ParamField = "title" | "count" | "body";

export type BlockTypeDef = {
  type: HomeSectionType;
  label: string;
  singleton: boolean;
  paramFields: ParamField[];
  defaultParams: HomeSectionParams;
};

export const BLOCK_TYPES: BlockTypeDef[] = [
  {
    type: "hero",
    label: "Hero（顶部介绍）",
    singleton: true,
    paramFields: [],
    defaultParams: {},
  },
  {
    type: "skills",
    label: "技术能力",
    singleton: true,
    paramFields: ["title"],
    defaultParams: { title: "技术能力" },
  },
  {
    type: "latest-projects",
    label: "精选项目",
    singleton: true,
    paramFields: ["title", "count"],
    defaultParams: { title: "精选项目", count: 3 },
  },
  {
    type: "latest-posts",
    label: "技术文章",
    singleton: true,
    paramFields: ["title", "count"],
    defaultParams: { title: "技术文章", count: 3 },
  },
  {
    type: "experience",
    label: "工作经历",
    singleton: true,
    paramFields: ["title"],
    defaultParams: { title: "工作经历" },
  },
  {
    type: "custom",
    label: "自由块（自定义内容）",
    singleton: false,
    paramFields: ["title", "body"],
    defaultParams: { title: "新区块", body: "" },
  },
];

export const DEFAULT_SECTIONS: HomeSection[] = [
  { id: "hero", type: "hero", enabled: true, params: {} },
  { id: "skills", type: "skills", enabled: true, params: { title: "技术能力" } },
  { id: "latest-projects", type: "latest-projects", enabled: true, params: { title: "精选项目", count: 3 } },
  { id: "latest-posts", type: "latest-posts", enabled: true, params: { title: "技术文章", count: 3 } },
  { id: "experience", type: "experience", enabled: true, params: { title: "工作经历" } },
];

export function getBlockType(type: string): BlockTypeDef | undefined {
  return BLOCK_TYPES.find((b) => b.type === type);
}

export function resolveHomeSections(raw: unknown): HomeSection[] {
  const sectionsInput = extractSectionsArray(raw);
  if (!sectionsInput) return DEFAULT_SECTIONS;

  const seenSingletons = new Set<string>();
  const cleaned: HomeSection[] = [];

  for (const entry of sectionsInput) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const typeStr = typeof e.type === "string" ? e.type : "";
    const def = getBlockType(typeStr);
    if (!def) continue;

    if (def.singleton) {
      if (seenSingletons.has(def.type)) continue;
      seenSingletons.add(def.type);
    }

    const rawId = typeof e.id === "string" && e.id.trim() ? e.id : def.singleton ? def.type : `${def.type}-${Date.now()}-${cleaned.length}`;
    const enabled = e.enabled !== false;

    const params: HomeSectionParams = { ...def.defaultParams };
    const ep = (e.params && typeof e.params === "object") ? (e.params as Record<string, unknown>) : {};
    if (def.paramFields.includes("title") && typeof ep.title === "string") params.title = ep.title;
    if (def.paramFields.includes("count") && typeof ep.count === "number" && Number.isFinite(ep.count)) {
      params.count = Math.max(1, Math.floor(ep.count));
    }
    if (def.paramFields.includes("body") && typeof ep.body === "string") params.body = ep.body;

    cleaned.push({ id: rawId, type: def.type, enabled, params });
  }

  return cleaned.length > 0 ? cleaned : DEFAULT_SECTIONS;
}

function extractSectionsArray(raw: unknown): unknown[] | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.sections)) return obj.sections;
  if (Array.isArray(raw)) return raw as unknown[];
  return null;
}
