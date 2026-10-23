import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";

const blockInput = z
  .object({
    type: z.enum([
      "text",
      "hero",
      "heading",
      "image",
      "gallery",
      "banner",
      "button",
      "columns",
      "video",
      "list",
      "cards",
      "teams",
      "news",
      "events",
      "social",
      "separator",
      "spacer",
      "section",
    ]),
    title: z.string().max(200).optional(),
    text: z.string().max(5000).optional(),
    imageUrl: z.string().max(500).optional(),
    href: z.string().max(500).optional(),
    label: z.string().max(120).optional(),
  })
  .strict();

const pageInput = z.object({
  id: z.number().optional(),
  title: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().max(500).optional(),
  blocks: z.array(blockInput).max(30),
  status: z.enum(["draft", "published", "archived"]),
  seoTitle: z.string().max(180).optional(),
  seoDescription: z.string().max(320).optional(),
});

const publicationInput = z.object({
  id: z.number().optional(),
  title: z.string().min(2).max(220),
  slug: z
    .string()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().max(20000).optional(),
  coverImage: z.string().max(500).optional(),
  status: z.enum(["draft", "published", "archived"]),
});

const menuInput = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(160),
  location: z.string().min(2).max(80),
  items: z
    .array(
      z
        .object({ label: z.string().max(120), href: z.string().max(300) })
        .strict()
    )
    .max(40),
  status: z.enum(["draft", "published", "archived"]),
});

const formInput = z.object({
  id: z.number().optional(),
  name: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  fields: z
    .array(
      z
        .object({
          name: z.string().max(80),
          label: z.string().max(120),
          type: z.enum(["text", "email", "textarea", "tel"]),
        })
        .strict()
    )
    .max(30),
  notificationEmail: z.string().email().max(320).optional(),
  active: z.boolean(),
});

const mediaInput = z.object({
  title: z.string().min(2).max(220),
  storagePath: z.string().url().max(500),
  mimeType: z.string().min(3).max(120),
  altText: z.string().max(300).optional(),
  folder: z.string().max(120).optional(),
});

const workbookInput = z.object({
  fileName: z.string().min(1).max(255),
  base64: z.string().min(10).max(20_000_000),
});

const uploadInput = z.object({
  title: z.string().min(2).max(220),
  mimeType: z.string().regex(/^image\/(png|jpeg|webp|gif)$/),
  base64Data: z.string().min(20).max(60_000),
  altText: z.string().max(300).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  public: router({
    snapshot: publicProcedure.query(() => db.getPublicSnapshot()),
    submitForm: publicProcedure
      .input(
        z.object({
          slug: z.string().min(2).max(160),
          data: z.record(z.string(), z.string().max(500)),
        })
      )
      .mutation(({ input }) => db.submitForm(input.slug, input.data)),
  }),
  admin: router({
    dashboard: adminProcedure.query(() => db.getAdminDashboard()),
    users: adminProcedure.query(() => db.getAdminUsers()),
    modules: adminProcedure.query(() => db.getAdminContentModules()),
    savePage: adminProcedure
      .input(pageInput)
      .mutation(({ input, ctx }) => db.savePage(input, ctx.user.id)),
    savePublication: adminProcedure
      .input(publicationInput)
      .mutation(({ input, ctx }) => db.savePublication(input, ctx.user.id)),
    saveMenu: adminProcedure
      .input(menuInput)
      .mutation(({ input, ctx }) => db.saveMenu(input, ctx.user.id)),
    saveForm: adminProcedure
      .input(formInput)
      .mutation(({ input, ctx }) => db.saveForm(input, ctx.user.id)),
    registerMedia: adminProcedure
      .input(mediaInput)
      .mutation(({ input, ctx }) => db.registerMedia(input, ctx.user.id)),
    previewWorkbook: adminProcedure
      .input(workbookInput)
      .mutation(({ input, ctx }) =>
        db.previewWorkbook(input.fileName, input.base64, ctx.user.id)
      ),
    confirmWorkbook: adminProcedure
      .input(workbookInput)
      .mutation(({ input, ctx }) =>
        db.confirmWorkbook(input.fileName, input.base64, ctx.user.id)
      ),
    uploadMedia: adminProcedure
      .input(uploadInput)
      .mutation(({ input, ctx }) => db.uploadMedia(input, ctx.user.id)),
    updateSetting: adminProcedure
      .input(
        z.object({
          key: z.string().min(2).max(120),
          value: z.string().max(1000),
        })
      )
      .mutation(({ input, ctx }) =>
        db.updateSetting(input.key, input.value, ctx.user.id)
      ),
  }),
});

export type AppRouter = typeof appRouter;
