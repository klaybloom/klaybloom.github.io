import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const PORT = 8081;

// CORS helper
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  console.log(`[Dev Server] ${req.method} ${pathname}`);

  const contentDir = path.join(process.cwd(), "content");
  const postsDir = path.join(contentDir, "posts");

  // Helper to read JSON safely
  const readJsonFile = (fileName, defaultData) => {
    const filePath = path.join(contentDir, fileName);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        return JSON.parse(content);
      } catch (e) {
        console.error(`Error parsing ${fileName}:`, e);
        return defaultData;
      }
    }
    return defaultData;
  };

  // 1. GET /api/admin/load-data
  if (req.method === "GET" && pathname === "/api/admin/load-data") {
    try {
      const profile = readJsonFile("profile.json", {
        name: "",
        nickname: "",
        title: "",
        summary: "",
        bio: [],
        links: { github: "", blog: "", projects: "", email: "" }
      });
      const experience = readJsonFile("experience.json", { experience: [] });
      const projects = readJsonFile("projects.json", { projects: [] });
      const skills = readJsonFile("skills.json", { skills: [] });
      const homeSectionsRaw = readJsonFile("home-sections.json", null);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        profile,
        experience: experience.experience || [],
        projects: projects.projects || [],
        skills: skills.skills || [],
        homeSections: homeSectionsRaw && Array.isArray(homeSectionsRaw.sections) ? homeSectionsRaw.sections : null
      }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // 2. GET /api/admin/list-posts
  if (req.method === "GET" && pathname === "/api/admin/list-posts") {
    try {
      if (!fs.existsSync(postsDir)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ posts: [] }));
        return;
      }

      const fileNames = fs.readdirSync(postsDir).filter((file) => file.endsWith(".md"));
      const posts = fileNames.map((fileName) => {
        const fullPath = path.join(postsDir, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);
        const slug = fileName.replace(/\.md$/, "");

        return {
          slug,
          frontmatter: {
            title: data.title || "",
            date: data.date || "",
            updated: data.updated || "",
            description: data.description || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            category: data.category || "",
            cover: data.cover || "",
            published: data.published !== false,
            featured: data.featured === true,
          },
          content: content || "",
        };
      });

      posts.sort((a, b) => {
        const dateA = new Date(a.frontmatter.date).getTime() || 0;
        const dateB = new Date(b.frontmatter.date).getTime() || 0;
        return dateB - dateA;
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ posts }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // Helper to accumulate POST request body
  const collectBody = (request, callback) => {
    let bodyData = "";
    request.on("data", (chunk) => {
      bodyData += chunk.toString();
    });
    request.on("end", () => {
      try {
        const parsed = JSON.parse(bodyData);
        callback(null, parsed);
      } catch (err) {
        callback(err, null);
      }
    });
  };

  // 3. POST /api/admin/save
  if (req.method === "POST" && pathname === "/api/admin/save") {
    collectBody(req, (err, body) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        return;
      }

      const { type, data, slug } = body;

      try {
        if (!fs.existsSync(contentDir)) {
          fs.mkdirSync(contentDir, { recursive: true });
        }
        if (!fs.existsSync(postsDir)) {
          fs.mkdirSync(postsDir, { recursive: true });
        }

        if (type === "profile") {
          const filePath = path.join(contentDir, "profile.json");
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Profile saved successfully" }));
          return;
        }

        if (type === "experience") {
          const filePath = path.join(contentDir, "experience.json");
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Experience saved successfully" }));
          return;
        }

        if (type === "projects") {
          const filePath = path.join(contentDir, "projects.json");
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Projects saved successfully" }));
          return;
        }

        if (type === "skills") {
          const filePath = path.join(contentDir, "skills.json");
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Skills saved successfully" }));
          return;
        }

        if (type === "home-sections") {
          const filePath = path.join(contentDir, "home-sections.json");
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Home sections saved successfully" }));
          return;
        }

        if (type === "post") {
          if (!slug) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Slug is required" }));
            return;
          }
          const filePath = path.join(postsDir, `${slug}.md`);
          const { frontmatter, content } = data;
          const fileContent = matter.stringify(content || "", frontmatter);
          
          fs.writeFileSync(filePath, fileContent, "utf8");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: `Post '${slug}' saved successfully` }));
          return;
        }

        if (type === "delete-post") {
          if (!slug) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Slug is required" }));
            return;
          }
          const filePath = path.join(postsDir, `${slug}.md`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: `Post '${slug}' deleted successfully` }));
            return;
          }
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Post file not found" }));
          return;
        }

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid save type" }));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // 4. POST /api/admin/upload
  if (req.method === "POST" && pathname === "/api/admin/upload") {
    collectBody(req, (err, body) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        return;
      }

      const { fileName, fileData } = body;

      if (!fileName || !fileData) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "fileName and fileData are required" }));
        return;
      }

      try {
        const uploadsDir = path.join(process.cwd(), "public/images/uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, fileName);
        const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
        
        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
        const publicPath = `/images/uploads/${fileName}`;

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          url: publicPath,
          message: "Image uploaded and saved successfully"
        }));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Route not found
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, () => {
  console.log(`[Dev Server] Custom Admin local API proxy running at http://localhost:${PORT}`);
});
