import type {
  ExperienceItem,
  HomeSection,
  PostFrontmatter,
  Profile,
  Project,
  SkillGroup,
} from "../content-schema";

const DEFAULT_BASE_URL = "http://127.0.0.1:8081";
const ADMIN_HEADER = { "X-Klay-Admin": "1" };

type AdminSuccess<T> = {
  success: true;
  data?: T;
  message?: string;
};

type AdminFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

export type AdminData = {
  profile: Profile;
  experience: ExperienceItem[];
  projects: Project[];
  skills: SkillGroup[];
  homeSections: HomeSection[];
};

export type AdminPost = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

export type AdminSaveType =
  | "profile"
  | "experience"
  | "projects"
  | "skills"
  | "post"
  | "delete-post"
  | "home-sections";

type ClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export function createAdminClient(options: ClientOptions = {}) {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchImpl = options.fetchImpl ?? fetch;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetchImpl(`${baseUrl}${path}`, init);
    const payload = (await response.json()) as AdminSuccess<T> | AdminFailure;
    if (!response.ok || !payload.success) {
      const message = payload.success
        ? `Admin request failed with status ${response.status}`
        : `${payload.error.message} (${payload.error.code})`;
      throw new Error(message);
    }
    return payload.data as T;
  }

  return {
    health: () =>
      request<{ service: string; version: number }>("/api/admin/health"),
    loadData: () => request<AdminData>("/api/admin/load-data"),
    listPosts: async () => {
      const data = await request<{ posts: AdminPost[] }>(
        "/api/admin/list-posts",
      );
      return data.posts;
    },
    save: async (type: AdminSaveType, data: unknown, slug?: string) => {
      await request<never>("/api/admin/save", {
        method: "POST",
        headers: {
          ...ADMIN_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data, slug }),
      });
    },
    upload: async (file: File) => {
      const fileData = await readFileAsDataUrl(file);
      const data = await request<{ url: string }>("/api/admin/upload", {
        method: "POST",
        headers: {
          ...ADMIN_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: file.name, fileData }),
      });
      return data.url;
    },
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () =>
      reject(reader.error ?? new Error("Unable to read image file")),
    );
    reader.readAsDataURL(file);
  });
}

export const adminClient = createAdminClient();
