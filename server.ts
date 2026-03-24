import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mammoth from "mammoth";
import * as xlsx from "xlsx";
import { marked } from "marked";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Setup multer for file uploads
const upload = multer({ dest: "uploads/" });

app.use(express.json());

// API route for file conversion
app.post("/api/convert", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const ext = path.extname(originalName).toLowerCase();

  try {
    let htmlContent = "";
    let type = "html";

    if (ext === ".docx") {
      const result = await mammoth.convertToHtml({ path: filePath });
      htmlContent = result.value;
    } else if (ext === ".xlsx" || ext === ".xls") {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      htmlContent = xlsx.utils.sheet_to_html(worksheet);
    } else if (ext === ".md") {
      const mdContent = fs.readFileSync(filePath, "utf-8");
      htmlContent = await marked(mdContent);
    } else if (ext === ".txt") {
      const txtContent = fs.readFileSync(filePath, "utf-8");
      htmlContent = `<pre style="white-space: pre-wrap; font-family: inherit;">${txtContent}</pre>`;
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      const imgData = fs.readFileSync(filePath).toString("base64");
      htmlContent = `<img src="data:image/${ext.slice(1)};base64,${imgData}" style="max-width: 100%;" />`;
    } else if (ext === ".html") {
      htmlContent = fs.readFileSync(filePath, "utf-8");
    } else {
      // Cleanup
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Cleanup uploaded file
    fs.unlinkSync(filePath);

    res.json({ html: htmlContent, fileName: originalName });
  } catch (error) {
    console.error("Conversion error:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: "Failed to process file" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
