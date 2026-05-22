"use client";

import React, { useState, useEffect } from "react";

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
  const [activeTab, setActiveTab] = useState<"profile" | "experience" | "projects" | "skills" | "posts">("profile");

  // Loaders & Alerts
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  // SHAs for GitHub tracking
  const [shas, setShas] = useState<{
    profile?: string;
    experience?: string;
    projects?: string;
    skills?: string;
  }>({});

  // Active editors state
  const [selectedExpIndex, setSelectedExpIndex] = useState<number | null>(null);
  const [selectedProjIndex, setSelectedProjIndex] = useState<number | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  
  // Image Uploading state
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Checks environment & localStorage token on mount
  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    // Check if we are running on localhost or 127.0.0.1
    const isLocalhost = typeof window !== "undefined" && (
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1"
    );
    
    setIsLocal(isDev && isLocalhost);

    if (typeof window !== "undefined") {
      const storedPat = localStorage.getItem("klay_admin_pat");
      const storedRepo = localStorage.getItem("klay_admin_repo") || "klaybloom/klaybloom.github.io";
      const storedBranch = localStorage.getItem("klay_admin_branch") || "main";
      
      if (storedPat) {
        setGithubPat(storedPat);
        setGithubRepo(storedRepo);
        setGithubBranch(storedBranch);
        
        if (!(isDev && isLocalhost)) {
          // If online and we have a PAT, authorize
          setIsAuthorized(true);
        }
      }
    }
  }, []);

  // Fetch all data
  useEffect(() => {
    if (isLocal) {
      loadLocalData();
    } else if (isAuthorized && githubPat) {
      loadOnlineData();
    } else {
      setIsLoading(false);
    }
  }, [isLocal, isAuthorized]);

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

      // Fetch posts
      const postsRes = await fetch("http://localhost:8081/api/admin/list-posts");
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
      
      setAlert({ type: "success", msg: "成功加载本地文件数据" });
    } catch (e: any) {
      setAlert({ type: "error", msg: `本地数据加载失败: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocalData = async (type: "profile" | "experience" | "projects" | "skills" | "post" | "delete-post", payload: any, slug?: string) => {
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
    } catch (e: any) {
      setAlert({ type: "error", msg: `保存错误: ${e.message}` });
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
    } catch (e: any) {
      setAlert({ type: "error", msg: `图片上传错误: ${e.message}` });
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
    } catch (_) {}
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
    } catch (_) {
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

    const body: any = {
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
              let frontmatter: PostFrontmatter = {
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
                      } catch (_) {
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
    } catch (e: any) {
      setAlert({ type: "error", msg: `GitHub 数据加载失败: ${e.message}` });
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
      if (["profile", "experience", "projects", "skills"].includes(shaKey)) {
        setShas((prev) => ({ ...prev, [shaKey]: newSha }));
      }
      
      setAlert({ type: "success", msg: `已提交更改至 GitHub 仓库: ${path}，GitHub Actions 正在自动构建部署！` });
      return newSha;
    } catch (e: any) {
      setAlert({ type: "error", msg: `GitHub 提交失败: ${e.message}` });
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
    } catch (e: any) {
      setAlert({ type: "error", msg: `删除失败: ${e.message}` });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadOnlineImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64Data = (await base64Promise).replace(/^data:image\/\w+;base64,/, "");

      const path = `public/images/uploads/${file.name}`;
      
      // Check if file already exists to get SHA (best-effort using our robust check)
      const fileSha = await getFileSha(path);

      await commitGithubFile(path, base64Data, fileSha, `admin: upload image ${file.name}`, true);

      const publicPath = `/images/uploads/${file.name}`;
      setAlert({ type: "success", msg: `图片已上传并保存至 GitHub 仓库: ${publicPath}` });
      return publicPath;
    } catch (e: any) {
      setAlert({ type: "error", msg: `图片上传错误: ${e.message}` });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

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
    const cleaned = targetList.map(({ isNewExp, ...rest }) => rest);
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
    const cleaned = targetList.map(({ isNewProj, ...rest }) => rest);
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

  const handleEditPost = (idx: number) => {
    const postToEdit = posts[idx];
    postToEdit.originalSlug = postToEdit.slug;
    setSelectedPostIndex(idx);
  };

  const handlePostSave = async (post: PostItem) => {
    if (!post.slug.trim()) {
      setAlert({ type: "error", msg: "文章的 Slug (路径) 不能为空！" });
      return;
    }

    // 网页路径排重校验 (Collision Protection)
    const targetSlug = post.slug.trim().toLowerCase();
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

    const isRename = post.originalSlug && post.originalSlug !== post.slug;
    const isNew = selectedPostIndex === posts.length || !!post.isNewPost;

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
      const success = await saveLocalData("post", { frontmatter: fm, content: post.content }, post.slug);
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
        } catch (_) {}
      }
      const newSha = await saveOnlineFile(`content/posts/${post.slug}.md`, fullContent, post.slug, isRename ? undefined : post.sha);
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

  const handlePostDelete = async (post: PostItem) => {
    if (!window.confirm(`确定要删除文章 "${post.frontmatter.title || post.slug}" 吗？此操作无法撤销！`)) {
      return;
    }
    
    if (isLocal) {
      const success = await saveLocalData("delete-post", null, post.slug);
      if (success) {
        // 乐观 UI 更新
        setPosts(posts.filter((_, idx) => idx !== selectedPostIndex));
        setSelectedPostIndex(null);
      }
    } else {
      const success = await deleteOnlinePostFile(post.slug, post.sha);
      if (success) {
        // 乐观 UI 更新
        setPosts(posts.filter((_, idx) => idx !== selectedPostIndex));
        setSelectedPostIndex(null);
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
      <form onSubmit={handleProfileSave} className="space-y-6 max-w-3xl">
        <div className="bg-notion-paper border border-notion-line rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-notion-text pb-2 border-b border-notion-line flex items-center gap-2">
            <span>👤</span> 基本信息
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-notion-muted mb-1">姓名</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-notion-muted mb-1">昵称</label>
              <input
                type="text"
                value={profile.nickname}
                onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-notion-muted mb-1">职位头衔 (如: Java Backend Engineer)</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-notion-muted mb-1">一句话简介</label>
            <input
              type="text"
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text"
            />
          </div>
        </div>

        <div className="bg-notion-paper border border-notion-line rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-notion-line">
            <h3 className="text-lg font-semibold text-notion-text flex items-center gap-2">
              <span>📝</span> 详细段落介绍 (Bio)
            </h3>
            <button
              type="button"
              onClick={handleAddBioLine}
              className="px-3 py-1 text-xs font-semibold text-notion-accent bg-notion-accentSoft rounded hover:bg-opacity-80 transition"
            >
              ➕ 添加段落
            </button>
          </div>

          <div className="space-y-3">
            {profile.bio.map((line, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="text-xs text-notion-faint mt-3 w-6">{idx + 1}.</span>
                <textarea
                  value={line}
                  onChange={(e) => handleBioLineChange(idx, e.target.value)}
                  rows={2}
                  className="flex-1 px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
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
              <p className="text-sm text-notion-faint italic py-2">暂无详细段落介绍，请点击“添加段落”按钮。</p>
            )}
          </div>
        </div>

        <div className="bg-notion-paper border border-notion-line rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-notion-text pb-2 border-b border-notion-line flex items-center gap-2">
            <span>🔗</span> 社交与联系链接
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-notion-muted mb-1">GitHub 链接</label>
              <input
                type="text"
                value={profile.links.github}
                onChange={(e) => setProfile({ ...profile, links: { ...profile.links, github: e.target.value } })}
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-notion-muted mb-1">Email (如: mailto:test@email.com)</label>
              <input
                type="text"
                value={profile.links.email}
                onChange={(e) => setProfile({ ...profile, links: { ...profile.links, email: e.target.value } })}
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-notion-muted mb-1">项目归档链接 (默认: /projects)</label>
              <input
                type="text"
                value={profile.links.projects}
                onChange={(e) => setProfile({ ...profile, links: { ...profile.links, projects: e.target.value } })}
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-notion-muted mb-1">博客链接 (默认: /blog)</label>
              <input
                type="text"
                value={profile.links.blog}
                onChange={(e) => setProfile({ ...profile, links: { ...profile.links, blog: e.target.value } })}
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-notion-accent text-white font-semibold rounded-lg hover:bg-opacity-90 shadow-sm transition disabled:opacity-50"
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

      const handleFieldChange = (field: keyof ExperienceItem, val: any) => {
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
        <div className="space-y-6 max-w-3xl bg-notion-paper border border-notion-line rounded-xl p-6 shadow-sm animate-on-scroll visible">
          <div className="flex justify-between items-center pb-2 border-b border-notion-line">
            <h3 className="text-lg font-bold text-notion-text">
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
              className="text-sm font-semibold text-notion-muted hover:text-notion-text"
            >
              返回列表
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">起止时间 (如: 2022 - 至今)</label>
                <input
                  type="text"
                  value={exp?.period || ""}
                  onChange={(e) => handleFieldChange("period", e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
                  placeholder="例如: 2022 - Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">公司名称</label>
                <input
                  type="text"
                  value={exp?.company || ""}
                  onChange={(e) => handleFieldChange("company", e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
                  placeholder="公司名称"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-notion-muted mb-1">职位头衔</label>
              <input
                type="text"
                value={exp?.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
                placeholder="例如: Senior Java Developer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-1">
                <label className="block text-sm font-medium text-notion-muted">工作职责与详情 (Bullet Points)</label>
                <button
                  type="button"
                  onClick={handleAddBullet}
                  className="px-2 py-0.5 text-xs font-semibold text-notion-accent bg-notion-accentSoft rounded hover:bg-opacity-80 transition"
                >
                  ➕ 添加详情行
                </button>
              </div>

              <div className="space-y-2">
                {exp?.description?.map((bullet, bulletIdx) => (
                  <div key={bulletIdx} className="flex gap-2 items-center">
                    <span className="text-xs text-notion-faint w-4">•</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(bulletIdx, e.target.value)}
                      className="flex-1 px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent text-notion-text text-sm"
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
                  <p className="text-xs text-notion-faint italic py-1">暂无详情项，请点击右侧“添加详情行”。</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-notion-line">
            <button
              onClick={() => {
                if (isNew) {
                  setExperiences(experiences.slice(0, -1));
                }
                setSelectedExpIndex(null);
              }}
              className="px-4 py-2 border border-notion-line rounded-lg text-notion-muted hover:text-notion-text text-sm transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-notion-accent text-white font-semibold rounded-lg hover:bg-opacity-90 shadow-sm transition text-sm disabled:opacity-50"
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
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-notion-text flex items-center gap-2">
            <span>💼</span> 简历与经历时间轴
          </h3>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 text-sm font-semibold text-white bg-notion-accent rounded-lg hover:bg-opacity-90 transition shadow-sm"
          >
            ➕ 添加工作履历
          </button>
        </div>

        <div className="space-y-4">
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              className="bg-notion-paper border border-notion-line rounded-xl p-5 shadow-sm hover:shadow-md transition flex justify-between items-start"
            >
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-notion-accentSoft text-notion-accent text-xs font-semibold rounded-md font-mono">
                    {exp.period || "起止时间未定"}
                  </span>
                  <h4 className="text-base font-bold text-notion-text">
                    {exp.title || "暂无职位名称"}
                  </h4>
                  <span className="text-sm text-notion-faint">@</span>
                  <span className="text-sm font-medium text-notion-muted">
                    {exp.company || "未指明公司"}
                  </span>
                </div>
                
                <ul className="list-disc list-inside pl-2 space-y-1">
                  {exp.description?.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="text-xs text-notion-muted">
                      {bullet}
                    </li>
                  ))}
                  {(!exp.description || exp.description.length === 0) && (
                    <span className="text-xs text-notion-faint italic">双击编辑以添加详情项</span>
                  )}
                </ul>
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-xs bg-notion-hover border border-notion-line rounded hover:bg-opacity-80 disabled:opacity-30"
                    title="上移"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(idx, "down")}
                    disabled={idx === experiences.length - 1}
                    className="p-1 text-xs bg-notion-hover border border-notion-line rounded hover:bg-opacity-80 disabled:opacity-30"
                    title="下移"
                  >
                    ▼
                  </button>
                </div>
                
                <button
                  onClick={() => setSelectedExpIndex(idx)}
                  className="px-3 py-1.5 text-xs bg-notion-accentSoft text-notion-accent font-semibold rounded-md hover:bg-opacity-80 transition"
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
            <div className="text-center py-10 bg-notion-paper border border-dashed border-notion-line rounded-xl text-notion-faint">
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

      const handleFieldChange = (field: keyof ProjectItem, val: any) => {
        const updated = [...projects];
        updated[selectedProjIndex] = { ...proj, [field]: val };
        setProjects(updated);
      };

      const handleStackChange = (val: string) => {
        const tags = val.split(",").map((s) => s.trim()).filter(Boolean);
        handleFieldChange("stack", tags);
      };

      return (
        <div className="space-y-6 max-w-4xl bg-notion-paper border border-notion-line rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-notion-line">
            <h3 className="text-lg font-bold text-notion-text">
              {isNew ? "➕ 上传与创建新项目" : "✏️ 编辑项目详情"}
            </h3>
            <button
              onClick={() => {
                if (isNew) {
                  setProjects(projects.slice(0, -1));
                }
                setSelectedProjIndex(null);
              }}
              className="text-sm font-semibold text-notion-muted hover:text-notion-text"
            >
              返回列表
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">项目标题</label>
                <input
                  type="text"
                  value={proj?.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  placeholder="项目标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">Slug 路径名 (URL 标识，如: my-project)</label>
                <input
                  type="text"
                  value={proj?.slug || ""}
                  onChange={(e) => handleFieldChange("slug", e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  placeholder="my-project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">一句话简短介绍 (Description)</label>
                <input
                  type="text"
                  value={proj?.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  placeholder="在卡片中显示的简短一句话介绍"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">项目分类</label>
                <input
                  type="text"
                  value={proj?.category || ""}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  placeholder="例如: Personal Site, Web Application"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-notion-muted mb-1">项目状态</label>
                  <select
                    value={proj?.status || "building"}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  >
                    <option value="planning">规划中 (Planning)</option>
                    <option value="building">进行中 (Building)</option>
                    <option value="launched">已上线 (Launched)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-notion-muted mb-1">开发时间</label>
                  <input
                    type="date"
                    value={proj?.date || ""}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">技术栈 (用逗号分隔，如: Next.js, Java)</label>
                <input
                  type="text"
                  value={proj?.stack?.join(", ") || ""}
                  onChange={(e) => handleStackChange(e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  placeholder="React, TypeScript, Spring Boot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">项目封面图链接</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={proj?.cover || ""}
                    onChange={(e) => handleFieldChange("cover", e.target.value)}
                    className="flex-1 px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                    placeholder="/images/projects/default.png"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      className="px-3 py-2 bg-notion-accentSoft text-notion-accent font-semibold rounded-lg hover:bg-opacity-80 text-sm transition"
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
                  <label className="block text-sm font-medium text-notion-muted mb-1">GitHub 链接</label>
                  <input
                    type="text"
                    value={proj?.github || ""}
                    onChange={(e) => handleFieldChange("github", e.target.value)}
                    className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-notion-muted mb-1">Demo 演示链接</label>
                  <input
                    type="text"
                    value={proj?.demo || ""}
                    onChange={(e) => handleFieldChange("demo", e.target.value)}
                    className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
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
                    className="w-4 h-4 text-notion-accent bg-notion-bg border-notion-line rounded focus:ring-notion-accent"
                  />
                  <span className="text-sm font-medium text-notion-text">精选展示 (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proj?.pinned}
                    onChange={(e) => handleFieldChange("pinned", e.target.checked)}
                    className="w-4 h-4 text-notion-accent bg-notion-bg border-notion-line rounded focus:ring-notion-accent"
                  />
                  <span className="text-sm font-medium text-notion-text">置顶展示 (Pinned)</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-notion-muted mb-1">详细描述 (Long Description)</label>
            <textarea
              value={proj?.longDescription || ""}
              onChange={(e) => handleFieldChange("longDescription", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
              placeholder="编写更详尽的项目技术介绍、业务痛点解决方案及个人贡献..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-notion-line">
            <button
              onClick={() => {
                if (isNew) {
                  setProjects(projects.slice(0, -1));
                }
                setSelectedProjIndex(null);
              }}
              className="px-4 py-2 border border-notion-line rounded-lg text-notion-muted hover:text-notion-text text-sm transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-notion-accent text-white font-semibold rounded-lg hover:bg-opacity-90 shadow-sm transition text-sm disabled:opacity-50"
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
      <div className="space-y-6 max-w-5xl animate-on-scroll visible">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-notion-text flex items-center gap-2">
            <span>🚀</span> 技术项目管理与上传
          </h3>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 text-sm font-semibold text-white bg-notion-accent rounded-lg hover:bg-opacity-90 transition shadow-sm"
          >
            ➕ 上传/新增个人项目
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="bg-notion-paper border border-notion-line rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-lg font-bold text-notion-text">{proj.title || "未命名项目"}</h4>
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
                    className="w-full h-36 object-cover rounded-lg border border-notion-line"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/default-cover.jpg";
                    }}
                  />
                )}

                <p className="text-xs text-notion-muted line-clamp-2">{proj.description || "暂无简短介绍"}</p>
                
                <div className="flex flex-wrap gap-1">
                  {proj.stack?.map((tag, sIdx) => (
                    <span key={sIdx} className="px-1.5 py-0.5 bg-notion-hover text-notion-muted text-[10px] rounded border border-notion-line">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-notion-bg border-t border-notion-line flex justify-between items-center gap-2">
                <span className="text-[10px] text-notion-faint font-mono">/{proj.slug || "no-slug"}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-xs bg-notion-paper border border-notion-line rounded hover:bg-opacity-80 disabled:opacity-30"
                    title="前移"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => moveItem(idx, "down")}
                    disabled={idx === projects.length - 1}
                    className="p-1 text-xs bg-notion-paper border border-notion-line rounded hover:bg-opacity-80 disabled:opacity-30"
                    title="后移"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => setSelectedProjIndex(idx)}
                    className="px-2.5 py-1 text-xs bg-notion-accentSoft text-notion-accent font-semibold rounded hover:bg-opacity-80 transition"
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
            <div className="col-span-2 text-center py-10 bg-notion-paper border border-dashed border-notion-line rounded-xl text-notion-faint">
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
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between items-center pb-2 border-b border-notion-line">
          <h3 className="text-xl font-bold text-notion-text flex items-center gap-2">
            <span>🧠</span> 专业技能分类管理
          </h3>
          <button
            onClick={handleAddGroup}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-notion-accent rounded hover:bg-opacity-90 transition"
          >
            ➕ 添加技能分组
          </button>
        </div>

        <div className="space-y-4">
          {skills.map((group, idx) => (
            <div key={idx} className="bg-notion-paper border border-notion-line rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex gap-4 items-center justify-between">
                <div className="flex-1 max-w-xs">
                  <label className="block text-xs font-medium text-notion-faint mb-1">分组名称</label>
                  <input
                    type="text"
                    value={group.group}
                    onChange={(e) => handleGroupNameChange(idx, e.target.value)}
                    className="w-full px-3 py-1 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm font-semibold"
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
                <label className="block text-xs font-medium text-notion-faint mb-1">包含技能 (逗号分隔，如: Java, Spring Boot, MySQL)</label>
                <input
                  type="text"
                  value={group.items?.join(", ") || ""}
                  onChange={(e) => handleTagsChange(idx, e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  placeholder="Java, Spring Boot, MySQL"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {group.items?.map((item, iIdx) => (
                  <span key={iIdx} className="px-2 py-0.5 bg-notion-accentSoft text-notion-accent text-xs font-medium rounded-full border border-notion-line">
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
            className="px-6 py-2 bg-notion-accent text-white font-semibold rounded-lg hover:bg-opacity-90 shadow-sm transition disabled:opacity-50"
          >
            {isSaving ? "正在保存..." : "💾 保存全部技能"}
          </button>
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

      const handleFieldChange = (field: keyof PostFrontmatter, val: any) => {
        const updated = [...posts];
        let updatedPost = {
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

      const handleTagsChange = (val: string) => {
        const tagsList = val.split(",").map((s) => s.trim()).filter(Boolean);
        handleFieldChange("tags", tagsList);
      };

      return (
        <div className="space-y-6 max-w-7xl animate-on-scroll visible">
          <div className="flex justify-between items-center pb-2 border-b border-notion-line">
            <h3 className="text-lg font-bold text-notion-text">
              {isNew ? "✍️ 撰写新文章" : "📝 编辑技术博文"}
            </h3>
            <div className="flex items-center gap-3">
              {!isNew && (
                <button
                  onClick={() => handlePostDelete(post)}
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
                className="text-sm font-semibold text-notion-muted hover:text-notion-text"
              >
                返回文章列表
              </button>
            </div>
          </div>

          {/* Editor Meta Form */}
          <div className="bg-notion-paper border border-notion-line rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">文章标题</label>
                <input
                  type="text"
                  value={post?.frontmatter?.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm font-semibold"
                  placeholder="输入文章标题..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">Slug 网页路径 (英文/拼音/数字连字符，例如: java-high-concurrency)</label>
                <input
                  type="text"
                  value={post?.slug || ""}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  disabled={false}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm font-mono disabled:opacity-50"
                  placeholder="java-high-concurrency"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">简介简介 (Description)</label>
                <input
                  type="text"
                  value={post?.frontmatter?.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  placeholder="简短一两句总结文章内容..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-notion-muted mb-1">发布日期</label>
                  <input
                    type="date"
                    value={post?.frontmatter?.date || ""}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    className="w-full px-3 py-1.5 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-notion-muted mb-1">分类 (Category)</label>
                  <input
                    type="text"
                    value={post?.frontmatter?.category || ""}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    className="w-full px-3 py-1.5 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-xs"
                    placeholder="如: Java, Frontend"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">标签 Tags (逗号分隔，如: Spring, SQL)</label>
                <input
                  type="text"
                  value={post?.frontmatter?.tags?.join(", ") || ""}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                  placeholder="Java, Concurrency, SpringBoot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-muted mb-1">封面图链接</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={post?.frontmatter?.cover || ""}
                    onChange={(e) => handleFieldChange("cover", e.target.value)}
                    className="flex-1 px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-notion-text text-sm"
                    placeholder="/images/uploads/my-cover.png"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      className="px-3 py-2 bg-notion-accentSoft text-notion-accent font-semibold rounded-lg hover:bg-opacity-80 text-sm transition"
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
                    className="w-4 h-4 text-notion-accent bg-notion-bg border-notion-line rounded focus:ring-notion-accent"
                  />
                  <span className="text-xs font-semibold text-notion-text">公开发布 (Published)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={post?.frontmatter?.featured}
                    onChange={(e) => handleFieldChange("featured", e.target.checked)}
                    className="w-4 h-4 text-notion-accent bg-notion-bg border-notion-line rounded focus:ring-notion-accent"
                  />
                  <span className="text-xs font-semibold text-notion-text">置顶推荐 (Featured)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Double Pane Writing Block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
            {/* Editor Textarea */}
            <div className="flex flex-col h-full bg-notion-paper border border-notion-line rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-notion-bg border-b border-notion-line flex justify-between items-center">
                <span className="text-xs font-semibold text-notion-muted">Markdown 编辑器</span>
                <span className="text-[10px] text-notion-faint">支持标准 MD 格式</span>
              </div>
              <textarea
                value={post?.content || ""}
                onChange={(e) => handleContentChange(e.target.value)}
                className="flex-1 w-full p-4 bg-transparent resize-none font-mono text-sm focus:outline-none text-notion-text overflow-y-auto leading-relaxed"
                placeholder="在此处开始使用 Markdown 编写你的高质量技术文章内容..."
              />
            </div>

            {/* Live Preview */}
            <div className="flex flex-col h-full bg-notion-paper border border-notion-line rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-notion-bg border-b border-notion-line flex justify-between items-center">
                <span className="text-xs font-semibold text-notion-muted">实时双栏预览</span>
                <span className="text-[10px] text-notion-faint">Notion 优雅渲染</span>
              </div>
              <div className="flex-1 p-5 overflow-y-auto bg-[#fffdf8]">
                <div className="markdown-body">
                  <h1 className="text-2xl font-bold border-b border-notion-line pb-2 text-notion-text">{post?.frontmatter?.title || "未命名博文"}</h1>
                  <div className="flex gap-2 items-center text-xs text-notion-faint my-3">
                    <span>🗓️ {post?.frontmatter?.date}</span>
                    <span>📂 {post?.frontmatter?.category || "未分类"}</span>
                  </div>
                  {post?.frontmatter?.cover && (
                    <img src={post.frontmatter.cover} alt="Cover Preview" className="w-full h-44 object-cover rounded-lg border border-notion-line my-3" />
                  )}
                  <div
                    className="mt-4 prose prose-sm max-w-none text-notion-muted leading-relaxed"
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
              className="px-5 py-2.5 border border-notion-line rounded-lg text-notion-muted hover:text-notion-text text-sm transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-notion-accent text-white font-semibold rounded-lg hover:bg-opacity-90 shadow-sm transition disabled:opacity-50 text-sm"
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
      <div className="space-y-6 max-w-5xl animate-on-scroll visible">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-notion-text flex items-center gap-2">
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
              className="px-4 py-2 text-sm font-semibold text-notion-muted bg-notion-bg border border-notion-line rounded-lg hover:text-notion-text hover:bg-notion-accentSoft transition shadow-sm flex items-center gap-1.5"
            >
              🔄 刷新同步
            </button>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 text-sm font-semibold text-white bg-notion-accent rounded-lg hover:bg-opacity-90 transition shadow-sm"
            >
              ➕ 撰写新博文
            </button>
          </div>
        </div>

        <div className="bg-notion-paper border border-notion-line rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-notion-bg text-notion-muted border-b border-notion-line font-medium text-xs">
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
                  className="border-b border-notion-line last:border-0 hover:bg-notion-hover transition text-sm"
                >
                  <td className="p-4 pl-6 font-semibold text-notion-text">
                    {post.frontmatter?.title || "未命名博文"}
                  </td>
                  <td className="p-4 font-mono text-xs text-notion-faint">/{post.slug}.md</td>
                  <td className="p-4 text-xs text-notion-muted">{post.frontmatter?.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      post.frontmatter?.published ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border"
                    }`}>
                      {post.frontmatter?.published ? "公开" : "草稿"}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleEditPost(idx)}
                      className="px-3 py-1 bg-notion-accentSoft text-notion-accent font-semibold rounded hover:bg-opacity-80 transition text-xs"
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))}

              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-notion-faint">
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
      <div className="min-h-screen bg-notion-bg text-notion-text flex flex-col justify-center items-center p-5">
        <div className="w-full max-w-md bg-notion-paper border border-notion-line p-8 rounded-2xl shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-notion-accentSoft rounded-2xl flex items-center justify-center text-3xl mx-auto text-notion-accent">
              🔒
            </div>
            <h2 className="text-2xl font-bold text-notion-text">Studio 内容管理器</h2>
            <p className="text-xs text-notion-muted">
              您当前正通过 GitHub Pages 访问线上后台。<br />
              请输入您的 GitHub 访问令牌以建立安全连接。
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-notion-muted mb-1">
                GitHub 个人访问令牌 (PAT)
              </label>
              <input
                type="password"
                value={githubPat}
                onChange={(e) => setGithubPat(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-sm"
              />
              <p className="text-[10px] text-notion-faint mt-1 leading-normal">
                需要 `repo` 作用域权限。令牌仅保存在浏览器本地 localStorage，直接向 GitHub 发起连接，安全无公害。
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-notion-muted mb-1">
                目标 GitHub 仓库 (用户名/仓库名)
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="klaybloom/klaybloom.github.io"
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-notion-muted mb-1">
                发布分支 (Branch)
              </label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 bg-notion-bg border border-notion-line rounded-lg focus:outline-none focus:border-notion-accent text-sm font-mono"
              />
            </div>

            <button
              onClick={handleSignIn}
              className="w-full py-2.5 bg-notion-accent text-white font-bold rounded-lg hover:bg-opacity-95 shadow-sm transition text-sm"
            >
              🔐 授权登录后台
            </button>
          </div>

          <div className="text-center text-[10px] text-notion-faint">
            如果您在本地运行项目，请访问 <a href="http://localhost:3000/admin/" className="text-notion-accent underline">localhost:3000/admin/</a> 免密自动连接本地磁盘。
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
    <div className="min-h-screen bg-notion-bg text-notion-text font-sans flex">
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

      {/* Sidebar navigation */}
      <aside className="w-64 bg-notion-paper border-r border-notion-line flex flex-col justify-between select-none">
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-notion-text flex items-center gap-2">
              <span>🌾</span> Studio Admin
            </h1>
            <p className="text-[10px] text-notion-faint">极简美观的内容管家</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab("profile"); setSelectedPostIndex(null); setSelectedProjIndex(null); setSelectedExpIndex(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2.5 transition ${
                activeTab === "profile" ? "bg-notion-accentSoft text-notion-accent font-semibold" : "text-notion-muted hover:bg-notion-hover"
              }`}
            >
              <span>👤</span> 个人介绍
            </button>
            <button
              onClick={() => { setActiveTab("experience"); setSelectedPostIndex(null); setSelectedProjIndex(null); setSelectedExpIndex(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2.5 transition ${
                activeTab === "experience" ? "bg-notion-accentSoft text-notion-accent font-semibold" : "text-notion-muted hover:bg-notion-hover"
              }`}
            >
              <span>💼</span> 经历履历
            </button>
            <button
              onClick={() => { setActiveTab("projects"); setSelectedPostIndex(null); setSelectedProjIndex(null); setSelectedExpIndex(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2.5 transition ${
                activeTab === "projects" ? "bg-notion-accentSoft text-notion-accent font-semibold" : "text-notion-muted hover:bg-notion-hover"
              }`}
            >
              <span>🚀</span> 技术项目
            </button>
            <button
              onClick={() => { setActiveTab("skills"); setSelectedPostIndex(null); setSelectedProjIndex(null); setSelectedExpIndex(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2.5 transition ${
                activeTab === "skills" ? "bg-notion-accentSoft text-notion-accent font-semibold" : "text-notion-muted hover:bg-notion-hover"
              }`}
            >
              <span>🧠</span> 专业技能
            </button>
            <button
              onClick={() => { setActiveTab("posts"); setSelectedPostIndex(null); setSelectedProjIndex(null); setSelectedExpIndex(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2.5 transition ${
                activeTab === "posts" ? "bg-notion-accentSoft text-notion-accent font-semibold" : "text-notion-muted hover:bg-notion-hover"
              }`}
            >
              <span>✍️</span> 文章博文
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with environment info */}
        <div className="p-4 border-t border-notion-line bg-notion-bg space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isLocal ? "bg-green-500" : "bg-blue-500"}`}></span>
              <span className="font-semibold text-notion-text">
                {isLocal ? "本地开发模式" : "GitHub 线上模式"}
              </span>
            </div>
            {isLocal ? (
              <p className="text-[9px] text-notion-faint leading-normal">
                📝 保存将立即更新磁盘 JSON/Markdown 文件。<br />
                📢 提示：推送到线上需要运行 `git push`！
              </p>
            ) : (
              <p className="text-[9px] text-notion-faint leading-normal">
                🎯 提交修改将自动 Push 并触发 GitHub Actions，数分钟后主页刷新即更新。
              </p>
            )}
          </div>

          <div className="flex justify-between items-center gap-2 pt-1 border-t border-dashed border-notion-line">
            <a href="/" className="text-[10px] text-notion-accent font-semibold hover:underline">
              🏠 返回网站主页
            </a>
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
            <div className="w-8 h-8 border-4 border-notion-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-notion-muted">正在加载数据，请稍候...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "profile" && renderProfileForm()}
            {activeTab === "experience" && renderExperienceTab()}
            {activeTab === "projects" && renderProjectsTab()}
            {activeTab === "skills" && renderSkillsTab()}
            {activeTab === "posts" && renderPostsTab()}
          </div>
        )}
      </main>
    </div>
  );
}
