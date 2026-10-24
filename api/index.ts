import type { Request, Response } from "express";
import { createApp } from "../server/_core/index";

const appPromise = createApp();

export default async function handler(req: Request, res: Response) {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error("[Vercel] App initialization failed", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "App initialization failed",
        message: error instanceof Error ? error.message : "unknown error",
      });
    }
  }
}
