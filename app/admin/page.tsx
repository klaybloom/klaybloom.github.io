"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  BLOCK_TYPES,
  DEFAULT_SECTIONS,
  getBlockType,
  type HomeSection,
  type HomeSectionType,
} from "@/lib/home-sections";

// ==========================================
// Types
// ==========================================

interface Profile {
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
}

interface ExperienceItem {
  period: string;
  title: string;
  company: string;
  description: string[];
  isNewExp?: boolean;
}

interface ProjectItem {
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  stack: string[];
  category: string;
  cover: string;
  github?: string;
  demo?: string;
  date: string;
  updated?: string;
  status: "planning" | "building" | "launched";
  featured: boolean;
  pinned: boolean;
  isNewProj?: boolean;
}

interface SkillGroup {
  group: string;
  items: string[];
}

interface PostFrontmatter {
  title: string;
  date: string;
  updated?: string;
  description: string;
  tags: string[];
  category?: string;
  cover?: string;
  published: boolean;
  featured: boolean;
}

interface PostItem {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  sha?: string; // used for GitHub API updates
  isNewPost?: boolean;
  originalSlug?: string;
}

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif"]);

function isSafePostSlug(value: string) {
  return /^[a-z0-9][a-z0-9-_]*$/.test(value);
}

function getSafeImageFileName(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!IMAGE_EXTENSIONS.has(extension)) return null;

  const rawName = file.name.slice(0, Math.max(0, file.name.length - extension.length - 1));
  const safeName = rawName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "upload";

  return `${Date.now()}-${safeName}.${extension}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function validatePostBeforeSave(post: PostItem, slug: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fm = post.frontmatter;

  if (!isSafePostSlug(slug)) {
    errors.push("Slug 只能使用小写字母、数字、连字符或下划线，并且必须以字母或数字开头");
  }
  if (!fm.title.trim()) errors.push("文章标题不能为空");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date || "")) {
    errors.push("发布日期必须使用 YYYY-MM-DD 格式");
  }
  if (fm.updated && !/^\d{4}-\d{2}-\d{2}$/.test(fm.updated)) {
    errors.push("更新日期必须使用 YYYY-MM-DD 格式");
  }
  if (!post.content.trim()) errors.push("正文不能为空");

  if (!fm.description.trim()) warnings.push("缺少文章摘要，列表页和 RSS 会不够清晰");
  if (!fm.tags.filter((tag) => tag.trim()).length) warnings.push("缺少标签，博客筛选效果会变差");
  if (fm.cover && !fm.cover.startsWith("/images/") && !fm.cover.startsWith("https://")) {
    warnings.push("封面路径建议使用 /images/... 或 https://...");
  }
  if (post.content.includes("<script")) {
    warnings.push("正文包含 script 标签，正式页面不会渲染原始 HTML");
  }

  return { errors, warnings };
}

// ==========================================
// Main Component
// ==========================================

export default function AdminDashboard() {
  // Environment & Auth States
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [githubPat, setGithubPat] = useState<string>("");
  const [githubRepo, setGithubRepo] = useState<string>("klaybloom/klaybloom.github.io");
  const [githubBranch, setGithubBranch] = useState<string>("main");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"profile" | "experience" | "projects" | "skills" | "posts" | "home">("profile");

  // Loaders & Alerts
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  // Content States
  const [profile, setProfile] = useState<Profile>({
    name: "",
    nickname: "",
    title: "",
    summary: "",
    bio: [],
    links: { github: "", blog: "", projects: "", email: "" },
  });
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>(DEFAULT_SECTIONS);

  // SHAs for GitHub tracking
  const [shas, setShas] = useState<{
    profile?: string;
    experience?: string;
    projects?: string;
    skills?: string;
    home?: string;
  }>({});

  // Active editors state
  const [selectedExpIndex, setSelectedExpIndex] = useState<number | null>(null);
  const [selectedProjIndex, setSelectedProjIndex] = useState<number | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [pendingDeletePost, setPendingDeletePost] = useState<{ post: PostItem; index: number | null } | null>(null);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState("");
  
  // Image Uploading state
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);


  // Checks environment & localStorage token on mount
  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    // Check if we are running on localhost or 127.0.0.1
    const isLocalhost = typeof window !== "undefined" && (
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1"
    );
    
    queueMicrotask(() => setIsLocal(isDev && isLocalhost));

    if (typeof window !== "undefined") {
      const storedPat = localStorage.getItem("klay_admin_pat");
      const storedRepo = localStorage.getItem("klay_admin_repo") || "klaybloom/klaybloom.github.io";
      const storedBranch = localStorage.getItem("klay_admin_branch") || "main";
      
      if (storedPat) {
        queueMicrotask(() => {
          setGithubPat(storedPat);
          setGithubRepo(storedRepo);
          setGithubBranch(storedBranch);
          
          if (!(isDev && isLocalhost)) {
            // If online and we have a PAT, authorize
            setIsAuthorized(true);
          }
        });
      }
    }
  }, []);

  // Alert self-diminish
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // ==========================================
  // Local Dev API Calls
  // ==========================================

  const loadLocalData = async () => {
    setIsLoading(true);
    try {
      // Fetch profile, experience, projects, skills
      const dataRes = await fetch("http://localhost:8081/api/admin/load-data");
      if (!dataRes.ok) throw new Error("Failed to load local data");
      const data = await dataRes.json();

      setProfile(data.profile);
      setExperiences(data.experience);
      setProjects(data.projects);
      setSkills(data.skills);
      if (Array.isArray(data.homeSections) && data.homeSections.length > 0) {
        setHomeSections(data.homeSections);
      } else {
        setHomeSections(DEFAULT_SECTIONS);
      }

      // Fetch posts
      const postsRes = await fetch("http://localhost:8081/api/admin/list-posts");
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
      
      setAlert({ type: "success", msg: "成功加载本地文件数据" });
    } catch (e: unknown) {
      setAlert({ type: "error", msg: `本地数据加载失败: ${getErrorMessage(e)}` });
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocalData = async (type: "profile" | "experience" | "projects" | "skills" | "post" | "delete-post" | "home-sections", payload: unknown, slug?: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:8081/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: payload, slug }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "保存失败");
      
      setAlert({ type: "success", msg: `本地保存成功！${result.message || ""}` });
      return true;
    } catch (e: unknown) {
      setAlert({ type: "error", msg: `保存错误: ${getErrorMessage(e)}` });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadLocalImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const fileData = await base64Promise;
      
      const res = await fetch("http://localhost:8081/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileData }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "图片上传失败");
      
      setAlert({ type: "success", msg: `图片已上传至本地: ${result.url}` });
      return result.url;
    } catch (e: unknown) {
      setAlert({ type: "error", msg: `图片上传错误: ${getErrorMessage(e)}` });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // Online GitHub API Calls
  // ==========================================

  const getFileSha = async (path: string): Promise<string | undefined> => {
    try {
      const lastSlashIdx = path.lastIndexOf("/");
      const dirPath = lastSlashIdx !== -1 ? path.slice(0, lastSlashIdx) : "";
      const fileName = lastSlashIdx !== -1 ? path.slice(lastSlashIdx + 1) : path;
      
      const url = `https://api.github.com/repos/${githubRepo}/contents/${dirPath}?ref=${githubBranch}`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Authorization: `token ${githubPat}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (!res.ok) return undefined;
      const items = await res.json();
      if (Array.isArray(items)) {
        const match = items.find((item) => item.name === fileName);
        if (match) return match.sha;
      }
    } catch {}
    return undefined;
  };

  const fetchGithubFile = async (path: string) => {
    const url = `https://api.github.com/repos/${githubRepo}/contents/${path}?ref=${githubBranch}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `token ${githubPat}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const data = await res.json();
    
    let decodedContent = "";
    try {
      decodedContent = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ""))));
    } catch {
      decodedContent = data.content; // If binary (e.g. image), fallback to raw base64
    }
    
    return {
      content: decodedContent,
      sha: data.sha,
    };
  };

  const commitGithubFile = async (path: string, contentStr: string, sha?: string, message?: string, isBase64?: boolean) => {
    const url = `https://api.github.com/repos/${githubRepo}/contents/${path}`;
    
    let base64Content = "";
    if (isBase64) {
      base64Content = contentStr;
    } else {
      const utf8Content = unescape(encodeURIComponent(contentStr));
      base64Content = btoa(utf8Content);
    }

    let fileSha = sha;
    if (!fileSha) {
      fileSha = await getFileSha(path);
    }

    const body: { message: string; content: string; branch: string; sha?: string } = {
      message: message || `admin: update ${path}`,
      content: base64Content,
      branch: githubBranch,
    };
    if (fileSha) body.sha = fileSha;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${githubPat}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to commit file to GitHub");
    return result.content.sha;
  };

  const loadOnlineData = async () => {
    setIsLoading(true);
    try {
      // 1. Profile
      const profileFile = await fetchGithubFile("content/profile.json");
      if (profileFile) {
        setProfile(JSON.parse(profileFile.content));
        setShas((prev) => ({ ...prev, profile: profileFile.sha }));
      }

      // 2. Experience
      const expFile = await fetchGithubFile("content/experience.json");
      if (expFile) {
        const parsed = JSON.parse(expFile.content);
        setExperiences(parsed.experience || []);
        setShas((prev) => ({ ...prev, experience: expFile.sha }));
      }

      // 3. Projects
      const projFile = await fetchGithubFile("content/projects.json");
      if (projFile) {
        const parsed = JSON.parse(projFile.content);
        setProjects(parsed.projects || []);
        setShas((prev) => ({ ...prev, projects: projFile.sha }));
      }

      // 4. Skills
      const skillFile = await fetchGithubFile("content/skills.json");
      if (skillFile) {
        const parsed = JSON.parse(skillFile.content);
        setSkills(parsed.skills || []);
        setShas((prev) => ({ ...prev, skills: skillFile.sha }));
      }

      // 4b. Home Sections (optional file)
      try {
        const homeFile = await fetchGithubFile("content/home-sections.json");
        if (homeFile) {
          const parsed = JSON.parse(homeFile.content);
          if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
            setHomeSections(parsed.sections);
          } else {
            setHomeSections(DEFAULT_SECTIONS);
          }
          setShas((prev) => ({ ...prev, home: homeFile.sha }));
        } else {
          setHomeSections(DEFAULT_SECTIONS);
        }
      } catch {
        setHomeSections(DEFAULT_SECTIONS);
      }

      // 5. Posts (Read list of files under content/posts)
      const postsUrl = `https://api.github.com/repos/${githubRepo}/contents/content/posts?ref=${githubBranch}`;
      const postsRes = await fetch(postsUrl, {
        cache: "no-store",
        headers: {
          Authorization: `token ${githubPat}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      
      if (postsRes.ok) {
        const files = await postsRes.json();
        if (Array.isArray(files)) {
          const mdFiles = files.filter((f) => f.name.endsWith(".md"));
          
          // Simple custom client-side YAML Frontmatter Parser
          const parsedPosts = await Promise.all(
            mdFiles.map(async (file): Promise<PostItem | null> => {
              const fileData = await fetchGithubFile(file.path);
              if (!fileData) return null;
              
              const raw = fileData.content;
              const slug = file.name.replace(/\.md$/, "");
              
              // Parse frontmatter
              const match = raw.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
              const frontmatter: PostFrontmatter = {
                title: slug,
                date: new Date().toISOString().split("T")[0],
                description: "",
                tags: [],
                published: true,
                featured: false,
              };
              let content = raw;

              if (match) {
                const fmBlock = match[1];
                content = match[2];
                
                fmBlock.split("\n").forEach((line) => {
                  const colonIdx = line.indexOf(":");
                  if (colonIdx > 0) {
                    const key = line.slice(0, colonIdx).trim();
                    let val = line.slice(colonIdx + 1).trim();
                    // strip quotes if wrapped
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                      val = val.slice(1, -1);
                    }
                    
                    if (key === "title") frontmatter.title = val;
                    else if (key === "date") frontmatter.date = val;
                    else if (key === "updated") frontmatter.updated = val;
                    else if (key === "description") frontmatter.description = val;
                    else if (key === "category") frontmatter.category = val;
                    else if (key === "cover") frontmatter.cover = val;
                    else if (key === "published") frontmatter.published = val !== "false";
                    else if (key === "featured") frontmatter.featured = val === "true";
                    else if (key === "tags") {
                      // simple array parsing e.g. [Tag1, Tag2] or list strings
                      try {
                        if (val.startsWith("[") && val.endsWith("]")) {
                          frontmatter.tags = val.slice(1, -1).split(",").map(s => s.trim().replace(/['"]/g, ""));
                        } else {
                          frontmatter.tags = val.split(",").map(s => s.trim());
                        }
                      } catch {
                        frontmatter.tags = [val];
                      }
                    }
                  }
                });
              }

              return {
                slug,
                frontmatter,
                content,
                sha: fileData.sha,
              };
            })
          );

          const filteredPosts = parsedPosts.filter((p): p is PostItem => p !== null);
          // Sort by date desc
          filteredPosts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
          setPosts(filteredPosts);
        }
      }

      setAlert({ type: "success", msg: "成功从 GitHub 仓库加载数据" });
    } catch (e: unknown) {
      setAlert({ type: "error", msg: `GitHub 数据加载失败: ${getErrorMessage(e)}` });
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnlineFile = async (path: string, contentStr: string, shaKey: "profile" | "experience" | "projects" | "skills" | string, sha?: string): Promise<string | null> => {
    setIsSaving(true);
    try {
      const currentSha = sha || shas[shaKey as keyof typeof shas] || undefined;
      const newSha = await commitGithubFile(path, contentStr, currentSha);
      
      // Update SHA tracker
      if (["profile", "experience", "projects", "skills", "home"].includes(shaKey)) {
        setShas((prev) => ({ ...prev, [shaKey]: newSha }));
      }
      
      setAlert({ type: "success", msg: `已提交更改至 GitHub 仓库: ${path}，GitHub Actions 正在自动构建部署！` });
      return newSha;
    } catch (e: unknown) {
      setAlert({ type: "error", msg: `GitHub 提交失败: ${getErrorMessage(e)}` });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOnlinePostFile = async (slug: string, sha?: string) => {
    if (!sha) {
      setAlert({ type: "error", msg: "无法删除文章，未找到对应的 SHA" });
      return false;
    }
    setIsSaving(true);
    try {
      const url = `https://api.github.com/repos/${githubRepo}/contents/content/posts/${slug}.md`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `token ${githubPat}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `admin: delete post content/posts/${slug}.md`,
          sha,
          branch: githubBranch,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete post from GitHub");
      
      setAlert({ type: "success", msg: `文章已从 GitHub 仓库删除！` });
      return true;
    } catch (e: unknown) {
      setAlert({ type: "error", msg: `删除失败: ${getErrorMessage(e)}` });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadOnlineImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const safeFileName = getSafeImageFileName(file);
      if (!safeFileName) {
        throw new Error("仅支持 png、jpg、jpeg、webp、gif 图片");
      }

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const fileData = await base64Promise;
      const match = /^data:image\/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=]+)$/i.exec(fileData);
      if (!match) {
        throw new Error("图片数据格式无效");
      }
      const base64Data = match[2];

      const path = `public/images/uploads/${safeFileName}`;
      
      // Check if file already exists to get SHA (best-effort using our robust check)
      const fileSha = await getFileSha(path);

      await commitGithubFile(path, base64Data, fileSha, `admin: upload image ${safeFileName}`, true);

      const publicPath = `/images/uploads/${safeFileName}`;
      setAlert({ type: "success", msg: `图片已上传并保存至 GitHub 仓库: ${publicPath}` });
      return publicPath;
    } catch (e: unknown) {
      setAlert({ type: "error", msg: `图片上传错误: ${getErrorMessage(e)}` });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch all data
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isLocal) {
        void loadLocalData();
      } else if (isAuthorized && githubPat) {
        void loadOnlineData();
      }
    }, 0);

    return () => window.clearTimeout(timer);
    // loadLocalData/loadOnlineData are event-style loaders that intentionally read current state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocal, isAuthorized, githubPat]);

  // ==========================================
  // Auth Form Handlers
  // ==========================================

  const handleSignIn = () => {
    if (!githubPat.trim()) {
      setAlert({ type: "error", msg: "请输入有效的 GitHub 访问令牌 (PAT)" });
      return;
    }
    
    if (typeof window !== "undefined") {
      localStorage.setItem("klay_admin_pat", githubPat.trim());
      localStorage.setItem("klay_admin_repo", githubRepo.trim());
      localStorage.setItem("klay_admin_branch", githubBranch.trim());
    }
    
    setIsAuthorized(true);
    setAlert({ type: "info", msg: "正在验证令牌并加载仓库数据..." });
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("klay_admin_pat");
    }
    setGithubPat("");
    setIsAuthorized(false);
    setAlert({ type: "info", msg: "已退出登录" });
  };

  // ==========================================
  // Markdown Custom Parser (Simplified for Live Preview)
  // ==========================================

  const parseMarkdown = (md: string): string => {
    if (!md) return "";
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-md font-bold mt-4 mb-2 text-notion-text">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-6 mb-3 pb-1 border-b border-notion-line text-notion-text">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-8 mb-4 text-notion-text">$1</h1>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gm, '<pre class="bg-gray-900 text-gray-100 p-3 rounded-lg my-3 font-mono text-sm overflow-x-auto"><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-notion-hover text-red-600 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-notion-line pl-3 py-1 my-3 text-notion-muted italic">$1</blockquote>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc my-1">$1</li>');
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc my-1">$1</li>');

    // Links & Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded border border-notion-line my-3" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-notion-accent font-semibold underline">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, "<br />");

    return html;
  };

  // ==========================================
  // Form Save Actions
  // ==========================================

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = profile;
    if (isLocal) {
      await saveLocalData("profile", payload);
    } else {
      const contentStr = JSON.stringify(payload, null, 2);
      await saveOnlineFile("content/profile.json", contentStr, "profile");
    }
  };

  const handleExperienceSave = async (customExpList?: ExperienceItem[]) => {
    const targetList = customExpList || experiences;
    const cleaned = targetList.map(({ period, title, company, description }) => ({
      period,
      title,
      company,
      description,
    }));
    setExperiences(cleaned);
    const payload = { experience: cleaned };
    if (isLocal) {
      await saveLocalData("experience", payload);
    } else {
      const contentStr = JSON.stringify(payload, null, 2);
      await saveOnlineFile("content/experience.json", contentStr, "experience");
    }
    setSelectedExpIndex(null);
  };

  const handleProjectsSave = async (customProjList?: ProjectItem[]) => {
    const targetList = customProjList || projects;
    const cleaned = targetList.map((project) => ({
      title: project.title,
      slug: project.slug,
      description: project.description,
      longDescription: project.longDescription,
      stack: project.stack,
      category: project.category,
      cover: project.cover,
      github: project.github,
      demo: project.demo,
      date: project.date,
      updated: project.updated,
      status: project.status,
      featured: project.featured,
      pinned: project.pinned,
    }));
    setProjects(cleaned);
    const payload = { projects: cleaned };
    if (isLocal) {
      await saveLocalData("projects", payload);
    } else {
      const contentStr = JSON.stringify(payload, null, 2);
      await saveOnlineFile("content/projects.json", contentStr, "projects");
    }
    setSelectedProjIndex(null);
  };

  const handleSkillsSave = async () => {
    const payload = { skills };
    if (isLocal) {
      await saveLocalData("skills", payload);
    } else {
      const contentStr = JSON.stringify(payload, null, 2);
      await saveOnlineFile("content/skills.json", contentStr, "skills");
    }
  };

  const handleHomeSectionsSave = async () => {
    const payload = { sections: homeSections };
    if (isLocal) {
      await saveLocalData("home-sections", payload);
    } else {
      const contentStr = JSON.stringify(payload, null, 2);
      await saveOnlineFile("content/home-sections.json", contentStr, "home");
    }
  };

  const handleEditPost = (idx: number) => {
    setPosts((current) =>
      current.map((item, itemIdx) =>
        itemIdx === idx ? { ...item, originalSlug: item.slug } : item
      )
    );
    setSelectedPostIndex(idx);
  };

  const handlePostSave = async (post: PostItem) => {
    if (!post.slug.trim()) {
      setAlert({ type: "error", msg: "文章的 Slug (路径) 不能为空！" });
      return;
    }

    // 网页路径排重校验 (Collision Protection)
    const targetSlug = post.slug.trim().toLowerCase();
    const preflight = validatePostBeforeSave(post, targetSlug);
    if (preflight.errors.length) {
      setAlert({ type: "error", msg: `发布前检查未通过：${preflight.errors.join("；")}` });
      return;
    }
    if (preflight.warnings.length && !window.confirm(`发布前检查提醒：\n\n${preflight.warnings.join("\n")}\n\n仍然继续保存吗？`)) {
      return;
    }

    const isDuplicate = posts.some((p, idx) => idx !== selectedPostIndex && p.slug.trim().toLowerCase() === targetSlug);
    if (isDuplicate) {
      setAlert({ type: "error", msg: `❌ 保存失败：网页路径 "/posts/${post.slug}.md" 已被其他文章占用，请使用其他路径！` });
      return;
    }
    
    // Frontmatter formatter helper
    const fm = { ...post.frontmatter };
    if (!fm.date) {
      fm.date = new Date().toISOString().split("T")[0];
    }
    if (!fm.title) {
      fm.title = post.slug;
    }

    const frontmatterLines = [
      "---",
      `title: "${fm.title.replace(/"/g, '\\"')}"`,
      `date: "${fm.date}"`,
      fm.updated ? `updated: "${fm.updated}"` : null,
      `description: "${fm.description.replace(/"/g, '\\"')}"`,
      `tags: [${fm.tags.map((t) => `"${t.trim()}"`).join(", ")}]`,
      fm.category ? `category: "${fm.category}"` : null,
      fm.cover ? `cover: "${fm.cover}"` : null,
      `published: ${fm.published}`,
      `featured: ${fm.featured}`,
      "---",
    ].filter(Boolean);

    const fullContent = `${frontmatterLines.join("\n")}\n${post.content || ""}`;

    const isRename = post.originalSlug && post.originalSlug !== targetSlug;

    const savedItem: PostItem = {
      slug: targetSlug,
      frontmatter: fm,
      content: post.content,
      originalSlug: targetSlug,
    };

    if (isLocal) {
      if (isRename) {
        await saveLocalData("delete-post", null, post.originalSlug);
      }
      const success = await saveLocalData("post", { frontmatter: fm, content: post.content }, targetSlug);
      if (success) {
        // 乐观 UI 更新
        const updatedPosts = [...posts];
        updatedPosts[selectedPostIndex!] = savedItem;
        setPosts(updatedPosts);
        setSelectedPostIndex(null);
      }
    } else {
      if (isRename) {
        try {
          await deleteOnlinePostFile(post.originalSlug!, post.sha);
        } catch {}
      }
      const newSha = await saveOnlineFile(`content/posts/${targetSlug}.md`, fullContent, targetSlug, isRename ? undefined : post.sha);
      if (newSha) {
        const savedItemOnline: PostItem = {
          ...savedItem,
          sha: newSha,
        };
        // 乐观 UI 更新
        const updatedPosts = [...posts];
        updatedPosts[selectedPostIndex!] = savedItemOnline;
        setPosts(updatedPosts);
        setSelectedPostIndex(null);
      }
    }
  };

  const handlePostDelete = (post: PostItem, index: number | null = selectedPostIndex) => {
    setPendingDeletePost({ post, index });
    setDeleteConfirmSlug("");
  };

  const cancelPostDelete = () => {
    setPendingDeletePost(null);
    setDeleteConfirmSlug("");
  };

  const confirmPostDelete = async () => {
    if (!pendingDeletePost) return;
    const { post, index } = pendingDeletePost;
    const targetSlug = post.originalSlug || post.slug;
    if (deleteConfirmSlug.trim() !== targetSlug) {
      setAlert({ type: "error", msg: "请输入完整 slug 后再删除" });
      return;
    }

    const removeDeletedPost = () => {
      setPosts((current) => {
        if (index !== null) {
          return current.filter((_, idx) => idx !== index);
        }

        return current.filter((item) => item.slug !== targetSlug);
      });
      cancelPostDelete();
      setSelectedPostIndex(null);
    };
    
    if (isLocal) {
      const success = await saveLocalData("delete-post", null, targetSlug);
      if (success) {
        removeDeletedPost();
      }
    } else {
      const success = await deleteOnlinePostFile(targetSlug, post.sha);
      if (success) {
        removeDeletedPost();
      }
    }
  };

  // ==========================================
  // Helper list editors
  // ==========================================

  const handleAddBioLine = () => {
    setProfile({ ...profile, bio: [...profile.bio, ""] });
  };

  const handleRemoveBioLine = (index: number) => {
    const updatedBio = profile.bio.filter((_, i) => i !== index);
    setProfile({ ...profile, bio: updatedBio });
  };

  const handleBioLineChange = (index: number, val: string) => {
    const updatedBio = [...profile.bio];
    updatedBio[index] = val;
    setProfile({ ...profile, bio: updatedBio });
  };

  // Image file handler
  const handleImageUploadClick = async (e: React.ChangeEvent<HTMLInputElement>, onUrlResult: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let uploadedUrl: string | null = null;
    if (isLocal) {
      uploadedUrl = await uploadLocalImage(file);
    } else {
      uploadedUrl = await uploadOnlineImage(file);
    }

    if (uploadedUrl) {
      onUrlResult(uploadedUrl);
    }
  };

  // ==========================================
  // Sub-forms Render
  // ==========================================

  const renderProfileForm = () => {
    return (
      <form onSubmit={handleProfileSave} className="space-y-6 max-w-4xl">
        <div className="tahoe-system-card space-y-4 !p-6">
          <h3 className="text-lg font-semibold pb-2 flex items-center gap-2"
              style={{ color: "var(--tahoe-text)", borderBottom: "1px solid var(--tahoe-card-border)" }}>
            <span>👤</span> 基本信息
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>姓名</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg focus:outline-none"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>昵称</label>
              <input
                type="text"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                className="w-full px-3 py-2 rounded-lg focus:outline-none"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>职位头衔 (如: Java Backend Engineer)</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>一句话简介</label>
            <input
              type="text"
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
            />
          </div>
        </div>

        <div className="tahoe-system-card space-y-4 !p-6">
          <div className="flex justify-between items-center pb-2"
              style={{ borderBottom: "1px solid var(--tahoe-card-border)" }}>
            <h3 className="text-lg font-semibold flex items-center gap-2"
              style={{ color: "var(--tahoe-text)" }}>
              <span>📝</span> 详细段落介绍 (Bio)
            </h3>
            <button
              type="button"
              onClick={handleAddBioLine}
              className="px-3 py-1 text-xs font-semibold rounded hover:bg-opacity-80 transition"
              style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)" }}
            >
              ➕ 添加段落
            </button>
          </div>

          <div className="space-y-3">
            {profile.bio.map((line, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="text-xs mt-3 w-6" style={{ color: "var(--tahoe-faint)" }}>{idx + 1}.</span>
                <textarea
                  value={line}
                  onChange={(e) => handleBioLineChange(idx, e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="输入一段关于你的介绍..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBioLine(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"
                  title="删除段落"
                >
                  🗑️
                </button>
              </div>
            ))}
            {profile.bio.length === 0 && (
              <p className="text-sm italic py-2" style={{ color: "var(--tahoe-faint)" }}>暂无详细段落介绍，请点击“添加段落”按钮。</p>
            )}
          </div>
        </div>

        <div className="tahoe-system-card space-y-4 !p-6">
          <h3 className="text-lg font-semibold pb-2 flex items-center gap-2"
              style={{ color: "var(--tahoe-text)", borderBottom: "1px solid var(--tahoe-card-border)" }}>
            <span>🔗</span> 社交与联系链接
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>GitHub 链接</label>
              <input
                type="text"
                value={profile.links.github}
                onChange={(e) => setProfile({ ...profile, links: { ...profile.links, github: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>Email (如: mailto:test@email.com)</label>
              <input
                type="text"
                value={profile.links.email}
                onChange={(e) => setProfile({ ...profile, links: { ...profile.links, email: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>项目归档链接 (默认: /projects)</label>
              <input
                type="text"
                value={profile.links.projects}
                onChange={(e) => setProfile({ ...profile, links: { ...profile.links, projects: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>博客链接 (默认: /blog)</label>
              <input
                type="text"
                value={profile.links.blog}
                onChange={(e) => setProfile({ ...profile, links: { ...profile.links, blog: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="tahoe-button tahoe-button-primary px-6 py-2.5 font-semibold disabled:opacity-50"
          >
            {isSaving ? "正在保存..." : "💾 保存个人信息"}
          </button>
        </div>
      </form>
    );
  };

  const renderExperienceTab = () => {
    // Render list view or editing view
    if (selectedExpIndex !== null) {
      const exp = experiences[selectedExpIndex];
      const isNew = !!exp?.isNewExp;
      
      const handleSave = () => {
        handleExperienceSave();
      };

      const handleFieldChange = <K extends keyof Omit<ExperienceItem, "isNewExp">>(
        field: K,
        val: ExperienceItem[K]
      ) => {
        const updated = [...experiences];
        updated[selectedExpIndex] = { ...exp, [field]: val };
        setExperiences(updated);
      };

      const handleAddBullet = () => {
        const updated = [...experiences];
        updated[selectedExpIndex] = { ...exp, description: [...(exp.description || []), ""] };
        setExperiences(updated);
      };

      const handleRemoveBullet = (bulletIdx: number) => {
        const updated = [...experiences];
        const newDesc = exp.description.filter((_, i) => i !== bulletIdx);
        updated[selectedExpIndex] = { ...exp, description: newDesc };
        setExperiences(updated);
      };

      const handleBulletChange = (bulletIdx: number, val: string) => {
        const updated = [...experiences];
        const newDesc = [...exp.description];
        newDesc[bulletIdx] = val;
        updated[selectedExpIndex] = { ...exp, description: newDesc };
        setExperiences(updated);
      };

      return (
        <div className="tahoe-system-card space-y-6 max-w-4xl animate-on-scroll visible !p-6">
          <div className="flex justify-between items-center pb-2"
              style={{ borderBottom: "1px solid var(--tahoe-card-border)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--tahoe-text)" }}>
              {isNew ? "➕ 添加工作经历" : "✏️ 编辑工作经历"}
            </h3>
            <button
              onClick={() => {
                // If it was new and we cancel, slice it off
                if (isNew) {
                  setExperiences(experiences.slice(0, -1));
                }
                setSelectedExpIndex(null);
              }}
              className="text-sm font-semibold hover:opacity-70" style={{ color: "var(--tahoe-muted)" }}
            >
              返回列表
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>起止时间 (如: 2022 - 至今)</label>
                <input
                  type="text"
                  value={exp?.period || ""}
                  onChange={(e) => handleFieldChange("period", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="例如: 2022 - Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>公司名称</label>
                <input
                  type="text"
                  value={exp?.company || ""}
                  onChange={(e) => handleFieldChange("company", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="公司名称"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>职位头衔</label>
              <input
                type="text"
                value={exp?.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                placeholder="例如: Senior Java Developer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-1">
                <label className="block text-sm font-medium" style={{ color: "var(--tahoe-muted)" }}>工作职责与详情 (Bullet Points)</label>
                <button
                  type="button"
                  onClick={handleAddBullet}
                  className="px-2 py-0.5 text-xs font-semibold rounded hover:opacity-80 transition"
                  style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)" }}
                >
                  ➕ 添加详情行
                </button>
              </div>

              <div className="space-y-2">
                {exp?.description?.map((bullet, bulletIdx) => (
                  <div key={bulletIdx} className="flex gap-2 items-center">
                    <span className="text-xs w-4" style={{ color: "var(--tahoe-faint)" }}>•</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(bulletIdx, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                      placeholder="编写具体的工作职责、项目成就或技术点..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(bulletIdx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                {(!exp?.description || exp.description.length === 0) && (
                  <p className="text-xs italic py-1" style={{ color: "var(--tahoe-faint)" }}>暂无详情项，请点击右侧“添加详情行”。</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid var(--tahoe-card-border)" }}>
            <button
              onClick={() => {
                if (isNew) {
                  setExperiences(experiences.slice(0, -1));
                }
                setSelectedExpIndex(null);
              }}
              className="px-4 py-2 rounded-lg text-sm transition hover:opacity-70"
              style={{ border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-muted)" }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="tahoe-button tahoe-button-primary px-5 py-2 font-semibold text-sm disabled:opacity-50"
            >
              {isSaving ? "正在保存..." : "💾 保存此经历"}
            </button>
          </div>
        </div>
      );
    }

    const handleDelete = (index: number) => {
      if (!window.confirm("确定要删除这条工作经历吗？")) return;
      const updated = experiences.filter((_, i) => i !== index);
      setExperiences(updated);
      // Save changes immediately
      const payload = { experience: updated };
      if (isLocal) {
        saveLocalData("experience", payload);
      } else {
        const contentStr = JSON.stringify(payload, null, 2);
        saveOnlineFile("content/experience.json", contentStr, "experience");
      }
    };

    const handleAddNew = () => {
      const newExp: ExperienceItem = { period: "", title: "", company: "", description: [], isNewExp: true };
      setExperiences([...experiences, newExp]);
      setSelectedExpIndex(experiences.length); // edit the newly appended index
    };

    const moveItem = (index: number, direction: "up" | "down") => {
      const updated = [...experiences];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return;
      
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      
      setExperiences(updated);
      
      // Save order
      const payload = { experience: updated };
      if (isLocal) {
        saveLocalData("experience", payload);
      } else {
        const contentStr = JSON.stringify(payload, null, 2);
        saveOnlineFile("content/experience.json", contentStr, "experience");
      }
    };

    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--tahoe-text)" }}>
            <span>💼</span> 简历与经历时间轴
          </h3>
          <button
            onClick={handleAddNew}
            className="tahoe-button tahoe-button-primary px-4 py-2 text-sm font-semibold"
          >
            ➕ 添加工作履历
          </button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              className="tahoe-system-card !p-5 hover:shadow-md transition flex justify-between items-start"
            >
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md font-mono"
                  style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)" }}>
                    {exp.period || "起止时间未定"}
                  </span>
                  <h4 className="text-base font-bold" style={{ color: "var(--tahoe-text)" }}>
                    {exp.title || "暂无职位名称"}
                  </h4>
                  <span className="text-sm" style={{ color: "var(--tahoe-faint)" }}>@</span>
                  <span className="text-sm font-medium" style={{ color: "var(--tahoe-muted)" }}>
                    {exp.company || "未指明公司"}
                  </span>
                </div>
                
                <ul className="list-disc list-inside pl-2 space-y-1">
                  {exp.description?.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="text-xs" style={{ color: "var(--tahoe-muted)" }}>
                      {bullet}
                    </li>
                  ))}
                  {(!exp.description || exp.description.length === 0) && (
                    <span className="text-xs italic" style={{ color: "var(--tahoe-faint)" }}>双击编辑以添加详情项</span>
                  )}
                </ul>
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-xs rounded hover:opacity-80 disabled:opacity-30"
                    style={{ background: "var(--tahoe-glass-strong)", border: "1px solid var(--tahoe-card-border)" }}
                    title="上移"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(idx, "down")}
                    disabled={idx === experiences.length - 1}
                    className="p-1 text-xs rounded hover:opacity-80 disabled:opacity-30"
                    style={{ background: "var(--tahoe-glass-strong)", border: "1px solid var(--tahoe-card-border)" }}
                    title="下移"
                  >
                    ▼
                  </button>
                </div>
                
                <button
                  onClick={() => setSelectedExpIndex(idx)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md hover:opacity-80 transition"
                  style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)" }}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(idx)}
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-600 font-semibold rounded-md hover:bg-red-100 transition"
                >
                  删除
                </button>
              </div>
            </div>
          ))}

          {experiences.length === 0 && (
            <div className="text-center py-10 rounded-xl"
              style={{ background: "var(--tahoe-glass)", border: "1px dashed var(--tahoe-card-border)", color: "var(--tahoe-faint)" }}>
              📭 暂无简历项，点击右上角“添加工作履历”开始创建！
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProjectsTab = () => {
    if (selectedProjIndex !== null) {
      const proj = projects[selectedProjIndex];
      const isNew = !!proj?.isNewProj;

      const handleSave = () => {
        handleProjectsSave();
      };

      const handleFieldChange = <K extends keyof Omit<ProjectItem, "isNewProj">>(
        field: K,
        val: ProjectItem[K]
      ) => {
        const updated = [...projects];
        updated[selectedProjIndex] = { ...proj, [field]: val };
        setProjects(updated);
      };

      const handleStackChange = (val: string) => {
        const tags = val.split(",").map((s) => s.trim()).filter(Boolean);
        handleFieldChange("stack", tags);
      };

      return (
        <div className="tahoe-system-card space-y-6 max-w-5xl !p-6">
          <div className="flex justify-between items-center pb-2"
              style={{ borderBottom: "1px solid var(--tahoe-card-border)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--tahoe-text)" }}>
              {isNew ? "➕ 上传与创建新项目" : "✏️ 编辑项目详情"}
            </h3>
            <button
              onClick={() => {
                if (isNew) {
                  setProjects(projects.slice(0, -1));
                }
                setSelectedProjIndex(null);
              }}
              className="text-sm font-semibold hover:opacity-70" style={{ color: "var(--tahoe-muted)" }}
            >
              返回列表
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>项目标题</label>
                <input
                  type="text"
                  value={proj?.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="项目标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>Slug 路径名 (URL 标识，如: my-project)</label>
                <input
                  type="text"
                  value={proj?.slug || ""}
                  onChange={(e) => handleFieldChange("slug", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="my-project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>一句话简短介绍 (Description)</label>
                <input
                  type="text"
                  value={proj?.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="在卡片中显示的简短一句话介绍"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>项目分类</label>
                <input
                  type="text"
                  value={proj?.category || ""}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="例如: Personal Site, Web Application"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>项目状态</label>
                  <select
                    value={proj?.status || "building"}
                    onChange={(e) => handleFieldChange("status", e.target.value as ProjectItem["status"])}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  >
                    <option value="planning">规划中 (Planning)</option>
                    <option value="building">进行中 (Building)</option>
                    <option value="launched">已上线 (Launched)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>开发时间</label>
                  <input
                    type="date"
                    value={proj?.date || ""}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>技术栈 (用逗号分隔，如: Next.js, Java)</label>
                <input
                  type="text"
                  value={proj?.stack?.join(", ") || ""}
                  onChange={(e) => handleStackChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="React, TypeScript, Spring Boot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>项目封面图链接</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={proj?.cover || ""}
                    onChange={(e) => handleFieldChange("cover", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg focus:outline-none text-sm"
                    style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                    placeholder="/images/projects/default.png"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      className="px-3 py-2 font-semibold rounded-lg hover:opacity-80 text-sm transition"
                      style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)" }}
                    >
                      {isUploading ? "Uploading..." : "📁 上传"}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleImageUploadClick(e, (url) => handleFieldChange("cover", url))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>GitHub 链接</label>
                  <input
                    type="text"
                    value={proj?.github || ""}
                    onChange={(e) => handleFieldChange("github", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>Demo 演示链接</label>
                  <input
                    type="text"
                    value={proj?.demo || ""}
                    onChange={(e) => handleFieldChange("demo", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proj?.featured}
                    onChange={(e) => handleFieldChange("featured", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "var(--tahoe-accent)" }}
                  />
                  <span className="text-sm font-medium" style={{ color: "var(--tahoe-text)" }}>精选展示 (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proj?.pinned}
                    onChange={(e) => handleFieldChange("pinned", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "var(--tahoe-accent)" }}
                  />
                  <span className="text-sm font-medium" style={{ color: "var(--tahoe-text)" }}>置顶展示 (Pinned)</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>详细描述 (Long Description)</label>
            <textarea
              value={proj?.longDescription || ""}
              onChange={(e) => handleFieldChange("longDescription", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              placeholder="编写更详尽的项目技术介绍、业务痛点解决方案及个人贡献..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid var(--tahoe-card-border)" }}>
            <button
              onClick={() => {
                if (isNew) {
                  setProjects(projects.slice(0, -1));
                }
                setSelectedProjIndex(null);
              }}
              className="px-4 py-2 rounded-lg text-sm transition hover:opacity-70"
              style={{ border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-muted)" }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="tahoe-button tahoe-button-primary px-5 py-2 font-semibold text-sm disabled:opacity-50"
            >
              {isSaving ? "正在保存..." : "💾 保存此项目"}
            </button>
          </div>
        </div>
      );
    }

    const handleDelete = (index: number) => {
      if (!window.confirm("确定要删除此项目吗？")) return;
      const updated = projects.filter((_, i) => i !== index);
      setProjects(updated);
      
      const payload = { projects: updated };
      if (isLocal) {
        saveLocalData("projects", payload);
      } else {
        const contentStr = JSON.stringify(payload, null, 2);
        saveOnlineFile("content/projects.json", contentStr, "projects");
      }
    };

    const handleAddNew = () => {
      const newProj: ProjectItem = {
        title: "",
        slug: "",
        description: "",
        longDescription: "",
        stack: [],
        category: "Web Application",
        cover: "/images/projects/default-cover.jpg",
        date: new Date().toISOString().split("T")[0],
        status: "building",
        featured: true,
        pinned: false,
        isNewProj: true,
      };
      setProjects([...projects, newProj]);
      setSelectedProjIndex(projects.length);
    };

    const moveItem = (index: number, direction: "up" | "down") => {
      const updated = [...projects];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return;
      
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      
      setProjects(updated);
      
      // Save order
      const payload = { projects: updated };
      if (isLocal) {
        saveLocalData("projects", payload);
      } else {
        const contentStr = JSON.stringify(payload, null, 2);
        saveOnlineFile("content/projects.json", contentStr, "projects");
      }
    };

    return (
      <div className="space-y-6 max-w-full animate-on-scroll visible">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--tahoe-text)" }}>
            <span>🚀</span> 技术项目管理与上传
          </h3>
          <button
            onClick={handleAddNew}
            className="tahoe-button tahoe-button-primary px-4 py-2 text-sm font-semibold"
          >
            ➕ 上传/新增个人项目
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="tahoe-system-card overflow-hidden hover:shadow-md transition flex flex-col justify-between !p-0"
            >
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-lg font-bold" style={{ color: "var(--tahoe-text)" }}>{proj.title || "未命名项目"}</h4>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md uppercase font-mono ${
                    proj.status === "launched" ? "bg-green-100 text-green-800" :
                    proj.status === "building" ? "bg-orange-100 text-orange-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {proj.status === "launched" ? "已上线" : proj.status === "building" ? "进行中" : "规划中"}
                  </span>
                </div>

                {proj.cover && (
                  <img
                    src={proj.cover}
                    alt={proj.title}
                    className="w-full h-36 object-cover rounded-lg" style={{ border: "1px solid var(--tahoe-card-border)" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/default-cover.jpg";
                    }}
                  />
                )}

                <p className="text-xs line-clamp-2" style={{ color: "var(--tahoe-muted)" }}>{proj.description || "暂无简短介绍"}</p>
                
                <div className="flex flex-wrap gap-1">
                  {proj.stack?.map((tag, sIdx) => (
                    <span key={sIdx} className="px-1.5 py-0.5 text-[10px] rounded"
                      style={{ background: "var(--tahoe-glass-strong)", color: "var(--tahoe-muted)", border: "1px solid var(--tahoe-card-border)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 flex justify-between items-center gap-2"
                style={{ background: "var(--tahoe-glass)", borderTop: "1px solid var(--tahoe-card-border)" }}>
                <span className="text-[10px] font-mono" style={{ color: "var(--tahoe-faint)" }}>/{proj.slug || "no-slug"}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-xs rounded hover:opacity-80 disabled:opacity-30"
                    style={{ background: "var(--tahoe-card)", border: "1px solid var(--tahoe-card-border)" }}
                    title="前移"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => moveItem(idx, "down")}
                    disabled={idx === projects.length - 1}
                    className="p-1 text-xs rounded hover:opacity-80 disabled:opacity-30"
                    style={{ background: "var(--tahoe-card)", border: "1px solid var(--tahoe-card-border)" }}
                    title="后移"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => setSelectedProjIndex(idx)}
                    className="px-2.5 py-1 text-xs font-semibold rounded hover:opacity-80 transition"
                    style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)" }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="px-2.5 py-1 text-xs bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100 transition"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-2 text-center py-10 rounded-xl"
              style={{ background: "var(--tahoe-glass)", border: "1px dashed var(--tahoe-card-border)", color: "var(--tahoe-faint)" }}>
              📭 暂无项目，点击右上角“上传/新增项目”开始展示你的个人成就！
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSkillsTab = () => {
    const handleAddGroup = () => {
      setSkills([...skills, { group: "新技能分组", items: ["HTML", "CSS"] }]);
    };

    const handleRemoveGroup = (idx: number) => {
      if (!window.confirm("确定删除此技能分组吗？")) return;
      setSkills(skills.filter((_, i) => i !== idx));
    };

    const handleGroupNameChange = (idx: number, name: string) => {
      const updated = [...skills];
      updated[idx].group = name;
      setSkills(updated);
    };

    const handleTagsChange = (idx: number, tagsStr: string) => {
      const updated = [...skills];
      updated[idx].items = tagsStr.split(",").map((s) => s.trim()).filter(Boolean);
      setSkills(updated);
    };

    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center pb-2"
              style={{ borderBottom: "1px solid var(--tahoe-card-border)" }}>
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--tahoe-text)" }}>
            <span>🧠</span> 专业技能分类管理
          </h3>
          <button
            onClick={handleAddGroup}
            className="tahoe-button tahoe-button-primary px-3 py-1.5 text-xs font-semibold"
          >
            ➕ 添加技能分组
          </button>
        </div>

        <div className="space-y-4">
          {skills.map((group, idx) => (
            <div key={idx} className="tahoe-system-card !p-5 space-y-4">
              <div className="flex gap-4 items-center justify-between">
                <div className="flex-1 max-w-xs">
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--tahoe-faint)" }}>分组名称</label>
                  <input
                    type="text"
                    value={group.group}
                    onChange={(e) => handleGroupNameChange(idx, e.target.value)}
                    className="w-full px-3 py-1 rounded-lg focus:outline-none text-sm font-semibold"
                    style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  />
                </div>
                <button
                  onClick={() => handleRemoveGroup(idx)}
                  className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                >
                  删除分组
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--tahoe-faint)" }}>包含技能 (逗号分隔，如: Java, Spring Boot, MySQL)</label>
                <input
                  type="text"
                  value={group.items?.join(", ") || ""}
                  onChange={(e) => handleTagsChange(idx, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="Java, Spring Boot, MySQL"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {group.items?.map((item, iIdx) => (
                  <span key={iIdx} className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)", border: "1px solid var(--tahoe-card-border)" }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSkillsSave}
            disabled={isSaving}
            className="tahoe-button tahoe-button-primary px-6 py-2 font-semibold disabled:opacity-50"
          >
            {isSaving ? "正在保存..." : "💾 保存全部技能"}
          </button>
        </div>
      </div>
    );
  };

  const renderHomeSectionsTab = () => {
    const updateSection = (idx: number, patch: Partial<HomeSection>) => {
      const updated = [...homeSections];
      updated[idx] = { ...updated[idx], ...patch };
      setHomeSections(updated);
    };

    const updateParams = (idx: number, paramPatch: Record<string, unknown>) => {
      const updated = [...homeSections];
      updated[idx] = {
        ...updated[idx],
        params: { ...(updated[idx].params || {}), ...paramPatch },
      };
      setHomeSections(updated);
    };

    const moveSection = (idx: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? idx - 1 : idx + 1;
      if (targetIndex < 0 || targetIndex >= homeSections.length) return;
      const updated = [...homeSections];
      const tmp = updated[idx];
      updated[idx] = updated[targetIndex];
      updated[targetIndex] = tmp;
      setHomeSections(updated);
    };

    const removeSection = (idx: number) => {
      const target = homeSections[idx];
      const def = getBlockType(target.type);
      if (def?.singleton) {
        setAlert({ type: "info", msg: "预设块不可删除，可改成「关闭」隐藏它" });
        return;
      }
      if (!window.confirm("确定要删除这个自由块吗？")) return;
      setHomeSections(homeSections.filter((_, i) => i !== idx));
    };

    const enabledTypes = new Set(homeSections.map((s) => s.type));
    const availableToAdd = BLOCK_TYPES.filter((def) => !def.singleton || !enabledTypes.has(def.type));

    const addBlock = (type: HomeSectionType) => {
      const def = getBlockType(type);
      if (!def) return;
      const newSection: HomeSection = {
        id: def.singleton ? def.type : `custom-${Date.now()}`,
        type: def.type,
        enabled: true,
        params: { ...def.defaultParams },
      };
      setHomeSections([...homeSections, newSection]);
    };

    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center pb-2"
              style={{ borderBottom: "1px solid var(--tahoe-card-border)" }}>
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--tahoe-text)" }}>
            <span>🏠</span> 首页布局配置
          </h3>
          <div className="flex items-center gap-2">
            {availableToAdd.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addBlock(e.target.value as HomeSectionType);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
                className="px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer hover:opacity-80 transition"
                style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)", border: "1px solid var(--tahoe-card-border)" }}
              >
                <option value="" disabled>
                  ➕ 添加新区块
                </option>
                {availableToAdd.map((def) => (
                  <option key={def.type} value={def.type}>
                    {def.label}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleHomeSectionsSave}
              disabled={isSaving}
              className="tahoe-button tahoe-button-primary px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              {isSaving ? "正在保存..." : "💾 保存首页布局"}
            </button>
          </div>
        </div>

        <p className="text-xs -mt-2" style={{ color: "var(--tahoe-faint)" }}>
          顺序、开关、参数都在这里控制。预设块只能关闭不能删除；自由块可任意添加和删除。
        </p>

        <div className="space-y-3">
          {homeSections.map((section, idx) => {
            const def = getBlockType(section.type);
            if (!def) return null;
            const isCustom = !def.singleton;

            return (
              <div
                key={section.id}
                className={`tahoe-system-card !p-4 transition ${
                  section.enabled ? "" : "opacity-60"
                }`}
                style={section.enabled ? undefined : { borderStyle: "dashed" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs w-6 text-center" style={{ color: "var(--tahoe-faint)" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) => updateSection(idx, { enabled: e.target.checked })}
                      className="w-4 h-4 rounded"
                    style={{ accentColor: "var(--tahoe-accent)" }}
                    />
                    <span className="text-sm font-semibold" style={{ color: "var(--tahoe-text)" }}>{def.label}</span>
                  </label>
                  <span className="font-mono text-[10px]" style={{ color: "var(--tahoe-faint)" }}>/{section.id}</span>
                  <div className="flex-1" />
                  <button
                    onClick={() => moveSection(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-xs rounded hover:opacity-80 disabled:opacity-30"
                    style={{ background: "var(--tahoe-glass-strong)", border: "1px solid var(--tahoe-card-border)" }}
                    title="上移"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveSection(idx, "down")}
                    disabled={idx === homeSections.length - 1}
                    className="p-1 text-xs rounded hover:opacity-80 disabled:opacity-30"
                    style={{ background: "var(--tahoe-glass-strong)", border: "1px solid var(--tahoe-card-border)" }}
                    title="下移"
                  >
                    ▼
                  </button>
                  {isCustom && (
                    <button
                      onClick={() => removeSection(idx)}
                      className="px-2 py-1 text-xs bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100 transition"
                    >
                      🗑️ 删除
                    </button>
                  )}
                </div>

                {def.paramFields.length === 0 ? (
                  <p className="pl-9 text-xs italic" style={{ color: "var(--tahoe-faint)" }}>此区块无可调参数</p>
                ) : (
                  <div className="pl-9 space-y-3">
                    {def.paramFields.includes("title") && (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>区块标题</label>
                        <input
                          type="text"
                          value={(section.params?.title as string) ?? ""}
                          onChange={(e) => updateParams(idx, { title: e.target.value })}
                          placeholder={def.defaultParams.title as string}
                          className="w-full max-w-md px-3 py-1.5 rounded-lg focus:outline-none text-sm"
                          style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                        />
                      </div>
                    )}
                    {def.paramFields.includes("count") && (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>展示条数</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={(section.params?.count as number) ?? (def.defaultParams.count as number) ?? 3}
                          onChange={(e) => {
                            const n = parseInt(e.target.value, 10);
                            updateParams(idx, { count: Number.isFinite(n) ? Math.max(1, n) : 3 });
                          }}
                          className="w-24 px-3 py-1.5 rounded-lg focus:outline-none text-sm"
                          style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                        />
                      </div>
                    )}
                    {def.paramFields.includes("body") && (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>内容（Markdown，支持 GFM、代码高亮）</label>
                        <textarea
                          value={(section.params?.body as string) ?? ""}
                          onChange={(e) => updateParams(idx, { body: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 rounded-lg focus:outline-none font-mono text-xs leading-relaxed"
                          style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                          placeholder="## 子标题&#10;&#10;支持 markdown 语法、链接、列表、代码块..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {homeSections.length === 0 && (
            <div className="text-center py-10 rounded-xl"
              style={{ background: "var(--tahoe-glass)", border: "1px dashed var(--tahoe-card-border)", color: "var(--tahoe-faint)" }}>
              📭 没有任何区块。从右上角下拉菜单添加。
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPostsTab = () => {
    // Article editor or list
    if (selectedPostIndex !== null) {
      const post = posts[selectedPostIndex];
      const isNew = selectedPostIndex === posts.length || !!post.isNewPost;

      const handleSave = () => {
        handlePostSave(post);
      };

      const handleFieldChange = <K extends keyof PostFrontmatter>(
        field: K,
        val: PostFrontmatter[K]
      ) => {
        const updated = [...posts];
        const updatedPost = {
          ...post,
          frontmatter: { ...post.frontmatter, [field]: val },
        };

        updated[selectedPostIndex] = updatedPost;
        setPosts(updated);
      };

      const handleSlugChange = (val: string) => {
        const updated = [...posts];
        updated[selectedPostIndex] = { ...post, slug: val.toLowerCase().replace(/[^a-z0-9-_]/g, "-") };
        setPosts(updated);
      };

      const handleContentChange = (val: string) => {
        const updated = [...posts];
        updated[selectedPostIndex] = { ...post, content: val };
        setPosts(updated);
      };

      const insertImageAtCursor = (url: string) => {
        const textarea = textareaRef.current;
        const content = post?.content || "";
        const imageMarkdown = `\n![图片描述](${url})\n`;

        if (textarea) {
          const startPos = textarea.selectionStart;
          const endPos = textarea.selectionEnd;
          
          const newContent = 
            content.substring(0, startPos) + 
            imageMarkdown + 
            content.substring(endPos);
          
          handleContentChange(newContent);
          
          // Focus back and set selection
          setTimeout(() => {
            textarea.focus();
            const cursorPosition = startPos + imageMarkdown.length;
            textarea.setSelectionRange(cursorPosition, cursorPosition);
          }, 50);
        } else {
          handleContentChange(content ? `${content}\n${imageMarkdown}` : imageMarkdown);
        }
      };

      const handleEditorPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (!file) continue;

            e.preventDefault(); // Stop default text paste
            
            let uploadedUrl: string | null = null;
            if (isLocal) {
              uploadedUrl = await uploadLocalImage(file);
            } else {
              uploadedUrl = await uploadOnlineImage(file);
            }

            if (uploadedUrl) {
              insertImageAtCursor(uploadedUrl);
            }
            break;
          }
        }
      };

      const handleEditorDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
          if (files[i].type.indexOf("image") !== -1) {
            e.preventDefault();
            
            let uploadedUrl: string | null = null;
            if (isLocal) {
              uploadedUrl = await uploadLocalImage(files[i]);
            } else {
              uploadedUrl = await uploadOnlineImage(files[i]);
            }

            if (uploadedUrl) {
              insertImageAtCursor(uploadedUrl);
            }
            break;
          }
        }
      };

      const handleTagsChange = (val: string) => {
        const tagsList = val.split(",").map((s) => s.trim()).filter(Boolean);
        handleFieldChange("tags", tagsList);
      };

      return (
        <div className="space-y-6 max-w-7xl animate-on-scroll visible">
          <div className="flex justify-between items-center pb-2"
              style={{ borderBottom: "1px solid var(--tahoe-card-border)" }}>
            <h3 className="text-lg font-bold" style={{ color: "var(--tahoe-text)" }}>
              {isNew ? "✍️ 撰写新文章" : "📝 编辑技术博文"}
            </h3>
            <div className="flex items-center gap-3">
              {!isNew && (
                <button
                  onClick={() => handlePostDelete(post, selectedPostIndex)}
                  className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-semibold transition"
                >
                  🗑️ 删除文章
                </button>
              )}
              <button
                onClick={() => {
                  if (isNew) {
                    setPosts(posts.filter((_, idx) => idx !== selectedPostIndex));
                  }
                  setSelectedPostIndex(null);
                }}
                className="text-sm font-semibold hover:opacity-70" style={{ color: "var(--tahoe-muted)" }}
              >
                返回文章列表
              </button>
            </div>
          </div>

          {/* Editor Meta Form */}
          <div className="tahoe-system-card !p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>文章标题</label>
                <input
                  type="text"
                  value={post?.frontmatter?.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm font-semibold"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="输入文章标题..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>Slug 网页路径 (英文/拼音/数字连字符，例如: java-high-concurrency)</label>
                <input
                  type="text"
                  value={post?.slug || ""}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  disabled={false}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm font-mono disabled:opacity-50"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="java-high-concurrency"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>简介简介 (Description)</label>
                <input
                  type="text"
                  value={post?.frontmatter?.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="简短一两句总结文章内容..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>发布日期</label>
                  <input
                    type="date"
                    value={post?.frontmatter?.date || ""}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg focus:outline-none text-xs"
                    style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>分类 (Category)</label>
                  <input
                    type="text"
                    value={post?.frontmatter?.category || ""}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg focus:outline-none text-xs"
                    style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                    placeholder="如: Java, Frontend"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>标签 Tags (逗号分隔，如: Spring, SQL)</label>
                <input
                  type="text"
                  value={post?.frontmatter?.tags?.join(", ") || ""}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                  style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                  placeholder="Java, Concurrency, SpringBoot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--tahoe-muted)" }}>封面图链接</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={post?.frontmatter?.cover || ""}
                    onChange={(e) => handleFieldChange("cover", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg focus:outline-none text-sm"
                    style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                    placeholder="/images/uploads/my-cover.png"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      className="px-3 py-2 font-semibold rounded-lg hover:opacity-80 text-sm transition"
                      style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)" }}
                    >
                      上传
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleImageUploadClick(e, (url) => handleFieldChange("cover", url))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={post?.frontmatter?.published}
                    onChange={(e) => handleFieldChange("published", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "var(--tahoe-accent)" }}
                  />
                  <span className="text-xs font-semibold" style={{ color: "var(--tahoe-text)" }}>公开发布 (Published)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={post?.frontmatter?.featured}
                    onChange={(e) => handleFieldChange("featured", e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "var(--tahoe-accent)" }}
                  />
                  <span className="text-xs font-semibold" style={{ color: "var(--tahoe-text)" }}>置顶推荐 (Featured)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Double Pane Writing Block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
            {/* Editor Textarea */}
            <div className="flex flex-col h-full tahoe-system-card overflow-hidden !p-0">
              <div className="px-4 py-2 flex justify-between items-center"
                style={{ background: "var(--tahoe-glass)", borderBottom: "1px solid var(--tahoe-card-border)" }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold" style={{ color: "var(--tahoe-muted)" }}>Markdown 编辑器</span>
                  <div className="relative flex items-center justify-center">
                    <button
                      type="button"
                      disabled={isUploading}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      style={{ background: "var(--tahoe-card)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
                    >
                      <span>📷</span>
                      <span>{isUploading ? "正在上传..." : "插入图片"}</span>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => handleImageUploadClick(e, insertImageAtCursor)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                  </div>
                </div>
                <span className="text-[10px]" style={{ color: "var(--tahoe-faint)" }}>支持拖拽、截图粘贴或标准 MD 格式</span>
              </div>
              <textarea
                ref={textareaRef}
                value={post?.content || ""}
                onChange={(e) => handleContentChange(e.target.value)}
                onPaste={handleEditorPaste}
                onDrop={handleEditorDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex-1 w-full p-4 bg-transparent resize-none font-mono text-sm focus:outline-none overflow-y-auto leading-relaxed"
                style={{ color: "var(--tahoe-text)" }}
                placeholder="在此处开始使用 Markdown 编写你的高质量技术文章内容... (支持截图粘贴或拖拽图片到此处上传)"
              />
            </div>

            {/* Live Preview */}
            <div className="flex flex-col h-full tahoe-system-card overflow-hidden !p-0">
              <div className="px-4 py-2 flex justify-between items-center"
                style={{ background: "var(--tahoe-glass)", borderBottom: "1px solid var(--tahoe-card-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--tahoe-muted)" }}>实时双栏预览</span>
                <span className="text-[10px]" style={{ color: "var(--tahoe-faint)" }}>Notion 优雅渲染</span>
              </div>
              <div className="flex-1 p-5 overflow-y-auto bg-[#fffdf8]">
                <div className="markdown-body">
                  <h1 className="text-2xl font-bold pb-2" style={{ borderBottom: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}>{post?.frontmatter?.title || "未命名博文"}</h1>
                  <div className="flex gap-2 items-center text-xs my-3" style={{ color: "var(--tahoe-faint)" }}>
                    <span>🗓️ {post?.frontmatter?.date}</span>
                    <span>📂 {post?.frontmatter?.category || "未分类"}</span>
                  </div>
                  {post?.frontmatter?.cover && (
                    <img src={post.frontmatter.cover} alt="Cover Preview" className="w-full h-44 object-cover rounded-lg my-3" style={{ border: "1px solid var(--tahoe-card-border)" }} />
                  )}
                  <div
                    className="mt-4 prose prose-sm max-w-none leading-relaxed"
                    style={{ color: "var(--tahoe-muted)" }}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(post?.content || "") }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                if (isNew) {
                  setPosts(posts.filter((_, idx) => idx !== selectedPostIndex));
                }
                setSelectedPostIndex(null);
              }}
              className="px-5 py-2.5 rounded-lg text-sm transition"
              style={{ border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-muted)" }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="tahoe-button tahoe-button-primary px-6 py-2.5 font-semibold disabled:opacity-50 text-sm"
            >
              {isSaving ? "正在提交发布..." : "🚀 保存并发布文章"}
            </button>
          </div>
        </div>
      );
    }

    const handleAddNew = () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const targetDateStr = `${yyyy}-${mm}-${dd}`;

      // Count how many existing posts on the same date (both published and drafts)
      const sameDayPosts = posts.filter((p) => p.frontmatter?.date && p.frontmatter.date.startsWith(targetDateStr));
      const seq = String(sameDayPosts.length + 1).padStart(2, "0");
      const autoSlug = `${yyyy}${mm}${dd}${seq}`;

      const newPost: PostItem = {
        slug: autoSlug,
        isNewPost: true,
        frontmatter: {
          title: "",
          date: targetDateStr,
          description: "",
          tags: ["Backend"],
          published: true,
          featured: false,
        },
        content: "",
      };
      setPosts([newPost, ...posts]);
      setSelectedPostIndex(0);
    };

    return (
      <div className="space-y-6 max-w-full animate-on-scroll visible">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--tahoe-text)" }}>
            <span>✍️</span> 博文文章管理
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isLocal) {
                  loadLocalData();
                } else {
                  loadOnlineData();
                }
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-1.5"
              style={{ color: "var(--tahoe-muted)", background: "var(--tahoe-card)", border: "1px solid var(--tahoe-card-border)" }}
            >
              🔄 刷新同步
            </button>
            <button
              onClick={handleAddNew}
              className="tahoe-button tahoe-button-primary px-4 py-2 text-sm font-semibold"
            >
              ➕ 撰写新博文
            </button>
          </div>
        </div>

        <div className="tahoe-system-card overflow-hidden !p-0">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '33%' }} />
              <col style={{ width: '27%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '19%' }} />
            </colgroup>
            <thead>
              <tr className="font-medium text-xs"
              style={{ background: "var(--tahoe-glass)", color: "var(--tahoe-muted)", borderBottom: "1px solid var(--tahoe-card-border)" }}>
                <th className="p-4 pl-6">文章标题</th>
                <th className="p-4">路径 (Slug)</th>
                <th className="p-4">日期</th>
                <th className="p-4">状态</th>
                <th className="p-4 text-right pr-6">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, idx) => (
                <tr
                  key={idx}
                  className="last:border-0 transition text-sm hover:bg-[color:var(--tahoe-glass-strong)]"
                  style={{ borderBottom: "1px solid var(--tahoe-card-border)" }}
                >
                  <td className="p-4 pl-6 font-semibold truncate" style={{ color: "var(--tahoe-text)" }} title={post.frontmatter?.title || "未命名博文"}>
                    {post.frontmatter?.title || "未命名博文"}
                  </td>
                  <td className="p-4 font-mono text-xs truncate" style={{ color: "var(--tahoe-faint)" }} title={`/${post.slug}.md`}>/{post.slug}.md</td>
                  <td className="p-4 text-xs" style={{ color: "var(--tahoe-muted)" }}>{post.frontmatter?.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      post.frontmatter?.published ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border"
                    }`}>
                      {post.frontmatter?.published ? "公开" : "草稿"}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditPost(idx)}
                        className="px-3 py-1 font-semibold rounded hover:opacity-80 transition text-xs"
                        style={{ color: "var(--tahoe-accent)", background: "var(--tahoe-accent-soft)" }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handlePostDelete(post, idx)}
                        className="px-3 py-1 bg-red-50 text-red-600 font-semibold rounded hover:bg-red-100 transition text-xs"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10" style={{ color: "var(--tahoe-faint)" }}>
                    📭 暂无文章，点击右上角“撰写新博文”开始分享你的技术洞察吧！
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ==========================================
  // Auth Screen Render
  // ==========================================

  const renderAuthScreen = () => {
    return (
      <div data-tahoe-preview className="tahoe-shell min-h-screen flex flex-col justify-center items-center p-5">
        <div className="tahoe-bg-fixed" aria-hidden />
        <div className="relative z-10 w-full max-w-md tahoe-system-card !p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto" style={{ background: "var(--tahoe-accent-soft)", color: "var(--tahoe-accent)" }}>
              🔒
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--tahoe-text)" }}>Studio 内容管理器</h2>
            <p className="text-xs" style={{ color: "var(--tahoe-muted)" }}>
              您当前正通过 GitHub Pages 访问线上后台。<br />
              请输入您的 GitHub 访问令牌以建立安全连接。
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tahoe-muted)" }}>
                GitHub 个人访问令牌 (PAT)
              </label>
              <input
                type="password"
                value={githubPat}
                onChange={(e) => setGithubPat(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
              <p className="text-[10px] mt-1 leading-normal" style={{ color: "var(--tahoe-faint)" }}>
                需要 `repo` 作用域权限。令牌仅保存在浏览器本地 localStorage，直接向 GitHub 发起连接，安全无公害。
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tahoe-muted)" }}>
                目标 GitHub 仓库 (用户名/仓库名)
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="klaybloom/klaybloom.github.io"
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm font-mono"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--tahoe-muted)" }}>
                发布分支 (Branch)
              </label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 rounded-lg focus:outline-none text-sm font-mono"
                style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              />
            </div>

            <button
              onClick={handleSignIn}
              className="tahoe-button tahoe-button-primary w-full py-2.5 font-bold text-sm"
            >
              🔐 授权登录后台
            </button>
          </div>

          <div className="text-center text-[10px]" style={{ color: "var(--tahoe-faint)" }}>
            如果您在本地运行项目，请访问 <a href="http://localhost:3000/admin/" className="underline" style={{ color: "var(--tahoe-accent)" }}>localhost:3000/admin/</a> 免密自动连接本地磁盘。
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Layout Render
  // ==========================================

  // Render Auth screen if online & not authorized
  if (!isLocal && !isAuthorized) {
    return renderAuthScreen();
  }

  return (
    <div data-tahoe-preview className="tahoe-shell min-h-screen flex font-sans" style={{ color: "var(--tahoe-text)" }}>
      {/* Toast Alert */}
      {alert && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl border shadow-lg z-50 flex items-center gap-3 text-sm transition-all duration-300 animate-slide-up ${
          alert.type === "success" ? "bg-green-50 text-green-800 border-green-200" :
          alert.type === "error" ? "bg-red-50 text-red-800 border-red-200" :
          "bg-blue-50 text-blue-800 border-blue-200"
        }`}>
          <span>{alert.type === "success" ? "✅" : alert.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="font-medium">{alert.msg}</span>
        </div>
      )}

      {pendingDeletePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md tahoe-system-card !p-6" style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--tahoe-accent)" }}>删除文章</p>
              <h2 className="mt-2 text-xl font-bold" style={{ color: "var(--tahoe-text)" }}>
                {pendingDeletePost.post.frontmatter.title || pendingDeletePost.post.slug}
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--tahoe-muted)" }}>
                删除后会移除对应 Markdown 文件。请再次确认，并输入文章 slug：
                <span className="ml-1 font-mono font-semibold" style={{ color: "var(--tahoe-accent)" }}>
                  {pendingDeletePost.post.originalSlug || pendingDeletePost.post.slug}
                </span>
              </p>
            </div>

            <input
              value={deleteConfirmSlug}
              onChange={(event) => setDeleteConfirmSlug(event.target.value)}
              className="w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
              style={{ background: "var(--tahoe-reader)", border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-text)" }}
              placeholder="输入文章 slug"
              autoFocus
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={cancelPostDelete}
                disabled={isSaving}
                className="rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                style={{ border: "1px solid var(--tahoe-card-border)", color: "var(--tahoe-muted)" }}
              >
                取消
              </button>
              <button
                onClick={confirmPostDelete}
                disabled={isSaving || deleteConfirmSlug.trim() !== (pendingDeletePost.post.originalSlug || pendingDeletePost.post.slug)}
                className="tahoe-button tahoe-button-primary px-4 py-2 text-sm font-semibold disabled:opacity-45"
                style={isSaving ? {} : { background: "linear-gradient(180deg, #ef4444, #dc2626)" }}
              >
                {isSaving ? "正在删除..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="tahoe-system-card w-64 flex flex-col justify-between select-none !rounded-none !border-r !border-l-0 !border-t-0 !border-b-0" style={{ borderColor: "var(--tahoe-card-border)", background: "var(--tahoe-card)" }}>
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--tahoe-text)" }}>
              <span className="tahoe-brand-mark">K</span> Studio Admin
            </h1>
            <p className="text-[10px]" style={{ color: "var(--tahoe-faint)" }}>极简美观的内容管家</p>
          </div>

          <nav className="space-y-1">
            {[
              { key: "home", icon: "🏠", label: "首页布局" },
              { key: "profile", icon: "👤", label: "个人介绍" },
              { key: "experience", icon: "💼", label: "经历履历" },
              { key: "projects", icon: "🚀", label: "技术项目" },
              { key: "skills", icon: "🧠", label: "专业技能" },
              { key: "posts", icon: "✍️", label: "文章博文" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as typeof activeTab); setSelectedPostIndex(null); setSelectedProjIndex(null); setSelectedExpIndex(null); }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2.5 transition ${
                  activeTab === tab.key
                    ? "tahoe-segment is-active !rounded-lg"
                    : ""
                }`}
                style={activeTab !== tab.key ? { color: "var(--tahoe-muted)", background: "transparent" } : undefined}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with environment info */}
        <div className="p-4 space-y-3" style={{ borderTop: "1px solid var(--tahoe-card-border)", background: "var(--tahoe-glass)" }}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isLocal ? "bg-green-500" : "bg-blue-500"}`}></span>
              <span className="font-semibold" style={{ color: "var(--tahoe-text)" }}>
                {isLocal ? "本地开发模式" : "GitHub 线上模式"}
              </span>
            </div>
            {isLocal ? (
              <p className="text-[9px] leading-normal" style={{ color: "var(--tahoe-faint)" }}>
                📝 保存将立即更新磁盘 JSON/Markdown 文件。<br />
                📢 提示：推送到线上需要运行 `git push`！
              </p>
            ) : (
              <p className="text-[9px] leading-normal" style={{ color: "var(--tahoe-faint)" }}>
                🎯 提交修改将自动 Push 并触发 GitHub Actions，数分钟后主页刷新即更新。
              </p>
            )}
          </div>

          <div className="flex justify-between items-center gap-2 pt-1" style={{ borderTop: "1px dashed var(--tahoe-card-border)" }}>
            <Link href="/" className="text-[10px] font-semibold hover:underline" style={{ color: "var(--tahoe-accent)" }}>
              🏠 返回网站主页
            </Link>
            {!isLocal && (
              <button
                onClick={handleSignOut}
                className="text-[10px] text-red-500 font-semibold hover:underline"
              >
                🔒 退出登录
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        {isLoading ? (
          <div className="h-full w-full flex flex-col justify-center items-center space-y-3">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--tahoe-accent)", borderTopColor: "transparent" }}></div>
            <p className="text-xs" style={{ color: "var(--tahoe-muted)" }}>正在加载数据，请稍候...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "profile" && renderProfileForm()}
            {activeTab === "experience" && renderExperienceTab()}
            {activeTab === "projects" && renderProjectsTab()}
            {activeTab === "skills" && renderSkillsTab()}
            {activeTab === "posts" && renderPostsTab()}
            {activeTab === "home" && renderHomeSectionsTab()}
          </div>
        )}
      </main>
    </div>
  );
}
