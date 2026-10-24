import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const candidates = process.env.NODE_ENV === "development"
    ? [path.resolve(import.meta.dirname, "../..", "dist", "public")]
    : [
        path.resolve(import.meta.dirname, "public"),
        path.resolve(import.meta.dirname, "../dist", "public"),
        path.resolve(process.cwd(), "dist", "public"),
        path.resolve(process.cwd(), "public"),
      ];
  const distPath = candidates.find(candidate => fs.existsSync(path.join(candidate, "index.html"))) ?? candidates[0];

  if (!fs.existsSync(distPath)) {
    console.error(`[Static] Build directory not found: ${distPath}`);
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
