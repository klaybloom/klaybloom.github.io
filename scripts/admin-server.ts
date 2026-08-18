import fs from "node:fs";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import matter from "gray-matter";
import { ZodError, type ZodType } from "zod";
import {
  experienceFileSchema,
  homeSectionsFileSchema,
  postFrontmatterSchema,
  postSaveSchema,
  profileSchema,
  projectsFileSchema,
  skillsFileSchema,
} from "../lib/content-schema";
import {
  convertImageToWebp,
  IMAGE_MAX_BYTES,
} from "../lib/image-processing";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4100",
  "http://127.0.0.1:4100",
];
const DEFAULT_MAX_SAVE_BYTES = 1024 * 1024;
const DEFAULT_MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const DEFAULT_MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ADMIN_REQUEST_HEADER = "x-klay-admin";

type AdminServerOptions = {
  rootDir?: string;
  allowedOrigins?: string[];
  maxSaveBytes?: number;
  maxUploadBytes?: number;
  maxImageBytes?: number;
};

type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

const fileSchemas: Record<string, { fileName: string; schema: ZodType }> = {
  profile: { fileName: "profile.json", schema: profileSchema },
  experience: { fileName: "experience.json", schema: experienceFileSchema },
  projects: { fileName: "projects.json", schema: projectsFileSchema },
  skills: { fileName: "skills.json", schema: skillsFileSchema },
  "home-sections": {
    fileName: "home-sections.json",
    schema: homeSectionsFileSchema,
  },
};

export function createAdminServer(options: AdminServerOptions = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const allowedOrigins = new Set(
    options.allowedOrigins ?? DEFAULT_ALLOWED_ORIGINS,
  );
  const maxSaveBytes = options.maxSaveBytes ?? DEFAULT_MAX_SAVE_BYTES;
  const maxUploadBytes = options.maxUploadBytes ?? DEFAULT_MAX_UPLOAD_BYTES;
  const maxImageBytes = options.maxImageBytes ?? DEFAULT_MAX_IMAGE_BYTES;

  return http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = requestUrl.pathname;

      validateHost(request);
      if (pathname !== "/api/admin/health") {
        validateOrigin(request, allowedOrigins, response);
      }

      if (request.method === "OPTIONS") {
        response.writeHead(204, corsHeaders(request, allowedOrigins));
        response.end();
        return;
      }

      if (pathname === "/api/admin/health" && request.method === "GET") {
        sendJson(response, 200, {
          success: true,
          data: { service: "klay-admin", version: 1 },
        });
        return;
      }

      if (pathname === "/api/admin/load-data" && request.method === "GET") {
        const contentDir = path.join(rootDir, "content");
        const profile = readAndParse(
          path.join(contentDir, "profile.json"),
          profileSchema,
        );
        const experience = readAndParse(
          path.join(contentDir, "experience.json"),
          experienceFileSchema,
        );
        const projects = readAndParse(
          path.join(contentDir, "projects.json"),
          projectsFileSchema,
        );
        const skills = readAndParse(
          path.join(contentDir, "skills.json"),
          skillsFileSchema,
        );
        const homeSections = readAndParse(
          path.join(contentDir, "home-sections.json"),
          homeSectionsFileSchema,
        );

        sendJson(
          response,
          200,
          {
            success: true,
            data: {
              profile,
              experience: experience.experience,
              projects: projects.projects,
              skills: skills.skills,
              homeSections: homeSections.sections,
            },
          },
          corsHeaders(request, allowedOrigins),
        );
        return;
      }

      if (pathname === "/api/admin/list-posts" && request.method === "GET") {
        const postsDir = path.join(rootDir, "content", "posts");
        const posts = fs.existsSync(postsDir)
          ? fs
              .readdirSync(postsDir)
              .filter((fileName) => fileName.endsWith(".md"))
              .map((fileName) => readPost(postsDir, fileName))
              .sort(
                (a, b) =>
                  new Date(b.frontmatter.date).getTime() -
                  new Date(a.frontmatter.date).getTime(),
              )
          : [];

        sendJson(
          response,
          200,
          { success: true, data: { posts } },
          corsHeaders(request, allowedOrigins),
        );
        return;
      }

      if (pathname === "/api/admin/save" && request.method === "POST") {
        requireAdminHeader(request);
        const body = await readJsonBody(request, maxSaveBytes);
        await saveContent(rootDir, body);
        sendJson(
          response,
          200,
          { success: true, message: "Content saved" },
          corsHeaders(request, allowedOrigins),
        );
        return;
      }

      if (pathname === "/api/admin/upload" && request.method === "POST") {
        requireAdminHeader(request);
        const body = await readJsonBody(request, maxUploadBytes);
        const url = await saveUploadedImage(rootDir, body, maxImageBytes);
        sendJson(
          response,
          200,
          { success: true, data: { url }, message: "Image uploaded" },
          corsHeaders(request, allowedOrigins),
        );
        return;
      }

      throw new HttpError(404, "NOT_FOUND", "Endpoint not found");
    } catch (error) {
      const normalized = normalizeError(error);
      sendJson(
        response,
        normalized.status,
        {
          success: false,
          error: normalized.error,
        },
      );
    }
  });
}

function validateHost(request: IncomingMessage) {
  const host = request.headers.host ?? "";
  let hostname = "";
  try {
    hostname = new URL(`http://${host}`).hostname;
  } catch {
    throw new HttpError(403, "HOST_FORBIDDEN", "Request host is not allowed");
  }
  if (hostname !== "127.0.0.1" && hostname !== "localhost") {
    throw new HttpError(403, "HOST_FORBIDDEN", "Request host is not allowed");
  }
}

function validateOrigin(
  request: IncomingMessage,
  allowedOrigins: Set<string>,
  response: ServerResponse,
) {
  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) {
    throw new HttpError(
      403,
      "ORIGIN_FORBIDDEN",
      "Request origin is not allowed",
    );
  }
  Object.entries(corsHeaders(request, allowedOrigins)).forEach(([name, value]) =>
    response.setHeader(name, value),
  );
}

function corsHeaders(
  request: IncomingMessage,
  allowedOrigins: Set<string>,
): Record<string, string> {
  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Klay-Admin",
    Vary: "Origin",
  };
}

function requireAdminHeader(request: IncomingMessage) {
  if (request.headers[ADMIN_REQUEST_HEADER] !== "1") {
    throw new HttpError(
      403,
      "ADMIN_HEADER_REQUIRED",
      "Admin request header is required",
    );
  }
}

async function readJsonBody(request: IncomingMessage, maxBytes: number) {
  const declaredLength = Number(request.headers["content-length"] ?? 0);
  if (declaredLength > maxBytes) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }

  let size = 0;
  let tooLarge = false;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) {
      tooLarge = true;
      continue;
    }
    chunks.push(buffer);
  }

  if (tooLarge) {
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body must be valid JSON");
  }
}

async function saveContent(rootDir: string, body: unknown) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "VALIDATION_FAILED", "Save payload is invalid");
  }
  const request = body as Record<string, unknown>;
  const type = request.type;

  if (typeof type !== "string") {
    throw new HttpError(400, "VALIDATION_FAILED", "Save type is required");
  }

  if (type === "post") {
    const parsed = postSaveSchema.parse({
      slug: request.slug,
      data: request.data,
    });
    const output = matter.stringify(
      parsed.data.content,
      parsed.data.frontmatter,
    );
    await atomicWrite(
      path.join(rootDir, "content", "posts", `${parsed.slug}.md`),
      output,
    );
    return;
  }

  if (type === "delete-post") {
    const slug = postSaveSchema.shape.slug.parse(request.slug);
    const filePath = path.join(rootDir, "content", "posts", `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      throw new HttpError(404, "POST_NOT_FOUND", "Post file was not found");
    }
    await fs.promises.unlink(filePath);
    return;
  }

  const definition = fileSchemas[type];
  if (!definition) {
    throw new HttpError(400, "VALIDATION_FAILED", "Save type is invalid");
  }
  const parsed = definition.schema.parse(request.data);
  await atomicWrite(
    path.join(rootDir, "content", definition.fileName),
    `${JSON.stringify(parsed, null, 2)}\n`,
  );
}

async function atomicWrite(filePath: string, content: string | Buffer) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  try {
    await fs.promises.writeFile(temporaryPath, content);
    await fs.promises.rename(temporaryPath, filePath);
  } finally {
    await fs.promises.rm(temporaryPath, { force: true });
  }
}

function readAndParse<T>(filePath: string, schema: ZodType<T>): T {
  const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return schema.parse(value);
}

function readPost(postsDir: string, fileName: string) {
  const raw = fs.readFileSync(path.join(postsDir, fileName), "utf8");
  const parsed = matter(raw);
  const slug = fileName.replace(/\.md$/, "");
  const frontmatter = postFrontmatterSchema.parse({
    title: String(parsed.data.title ?? slug),
    date: String(parsed.data.date ?? slug.slice(0, 10)),
    updated: parsed.data.updated
      ? String(parsed.data.updated)
      : undefined,
    description: String(parsed.data.description ?? ""),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
    category: parsed.data.category
      ? String(parsed.data.category)
      : undefined,
    cover: parsed.data.cover ? String(parsed.data.cover) : undefined,
    published: parsed.data.published !== false,
    featured: parsed.data.featured === true,
  });
  return { slug, frontmatter, content: parsed.content };
}

async function saveUploadedImage(
  rootDir: string,
  body: unknown,
  maxImageBytes: number,
) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "INVALID_IMAGE", "Image payload is invalid");
  }
  const { fileName, fileData } = body as Record<string, unknown>;
  if (typeof fileName !== "string" || typeof fileData !== "string") {
    throw new HttpError(
      400,
      "INVALID_IMAGE",
      "fileName and fileData are required",
    );
  }

  const safeBaseName = path
    .basename(fileName, path.extname(fileName))
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (!safeBaseName) {
    throw new HttpError(400, "INVALID_IMAGE", "Image file name is invalid");
  }

  const match =
    /^data:image\/(?:png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=]+)$/i.exec(
      fileData,
    );
  if (!match) {
    throw new HttpError(400, "INVALID_IMAGE", "Image payload is invalid");
  }
  const input = Buffer.from(match[1], "base64");
  if (input.byteLength > maxImageBytes) {
    throw new HttpError(413, "IMAGE_TOO_LARGE", "Decoded image is too large");
  }

  let output: Buffer;
  try {
    output = await convertImageToWebp(input, { maxBytes: IMAGE_MAX_BYTES });
  } catch {
    throw new HttpError(400, "INVALID_IMAGE", "Image could not be processed");
  }

  const outputName = `${Date.now()}-${safeBaseName}.webp`;
  const relativeUrl = `/images/uploads/${outputName}`;
  await atomicWrite(
    path.join(rootDir, "public", "images", "uploads", outputName),
    output,
  );
  return relativeUrl;
}

function normalizeError(error: unknown): { status: number; error: ApiError } {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      error: {
        code: error.code,
        message: error.message,
        fields: error.fields,
      },
    };
  }
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const key = issue.path.join(".") || "_";
      fields[key] = [...(fields[key] ?? []), issue.message];
    });
    return {
      status: 400,
      error: {
        code: "VALIDATION_FAILED",
        message: "Content validation failed",
        fields,
      },
    };
  }
  return {
    status: 500,
    error: {
      code: "INTERNAL_ERROR",
      message: "The local admin service could not complete the request",
    },
  };
}

function sendJson(
  response: ServerResponse,
  status: number,
  payload: unknown,
  headers: Record<string, string> = {},
) {
  if (response.headersSent) return;
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}
