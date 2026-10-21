import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";

const blockInput = z
  .object({
    type: z.enum(["text", "hero", "heading", "image", "button", "spacer"]),
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
  }),
  admin: router({
    dashboard: adminProcedure.query(() => db.getAdminDashboard()),
    savePage: adminProcedure
      .input(pageInput)
      .mutation(({ input, ctx }) => db.savePage(input, ctx.user.id)),
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
