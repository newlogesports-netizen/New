import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { getMediaBlob } from "../db";

export async function createApp(_server?: import("http").Server, options?: { useVite?: boolean }) {
  const app = express();
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/media/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).end();
    const blob = await getMediaBlob(id);
    if (!blob) return res.status(404).end();
    res.type(blob.mimeType).send(Buffer.from(blob.base64Data, "base64"));
  });
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (!options?.useVite) {
    const { serveStatic } = await import("./static");
    serveStatic(app);
  }
  return app;
}
