var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/static.ts
var static_exports = {};
__export(static_exports, {
  serveStatic: () => serveStatic
});
import express from "express";
import fs from "fs";
import path from "path";
function serveStatic(app) {
  const candidates = process.env.NODE_ENV === "development" ? [path.resolve(import.meta.dirname, "../..", "dist", "public")] : [
    path.resolve(import.meta.dirname, "public"),
    path.resolve(import.meta.dirname, "../dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public")
  ];
  const distPath = candidates.find((candidate) => fs.existsSync(path.join(candidate, "index.html"))) ?? candidates[0];
  if (!fs.existsSync(distPath)) {
    console.error(`[Static] Build directory not found: ${distPath}`);
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
var init_static = __esm({
  "server/_core/static.ts"() {
    "use strict";
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/publicConfig.ts
function publicPlatformConfig(env = process.env) {
  return {
    projectId: env.MANUS_PROJECT_ID ?? "",
    oauthPortalUrl: env.MANUS_OAUTH_PORTAL_URL ?? "",
    apiUrl: env.MANUS_API_URL ?? "",
    apiBrowserKey: env.MANUS_API_BROWSER_KEY ?? ""
  };
}
function publicPlatformScript(env = process.env) {
  const json2 = JSON.stringify(publicPlatformConfig(env)).replaceAll("<", "\\u003c");
  return `window.__MANUS_CONFIG__=${json2};`;
}

// shared/const.ts
var COOKIE_NAME = "webdev_app_session";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function getSessionCookieOptions(_req) {
  return { httpOnly: true, path: "/", sameSite: "none", secure: true };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  get appId() {
    return process.env.MANUS_PROJECT_ID ?? "";
  },
  get cookieSecret() {
    return process.env.MANUS_JWT_SECRET ?? "";
  },
  get databaseUrl() {
    return process.env.DATABASE_URL ?? "";
  },
  get oAuthServerUrl() {
    return process.env.MANUS_OAUTH_API_URL ?? "";
  },
  // Preserve the legacy hint when supplied; otherwise roles remain application data.
  get ownerOpenId() {
    return process.env.OWNER_OPEN_ID ?? "";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get forgeApiUrl() {
    return process.env.MANUS_API_URL ?? "";
  },
  get forgeApiKey() {
    return process.env.MANUS_API_KEY ?? "";
  }
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/db.ts
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import {
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  value: text("value"),
  isPublic: int("isPublic").default(1).notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  excerpt: text("excerpt"),
  blocks: json("blocks").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  seoTitle: varchar("seoTitle", { length: 180 }),
  seoDescription: varchar("seoDescription", { length: 320 }),
  featuredImage: varchar("featuredImage", { length: 500 }),
  authorId: int("authorId"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull().unique(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  modality: varchar("modality", { length: 100 }),
  category: varchar("category", { length: 100 }),
  rankingPoints: int("rankingPoints").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  sourceSheet: varchar("sourceSheet", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var rankingEntries = mysqlTable("ranking_entries", {
  id: int("id").autoincrement().primaryKey(),
  teamName: varchar("teamName", { length: 180 }).notNull().unique(),
  position: int("position").notNull(),
  totalPoints: int("totalPoints").notNull(),
  scores: json("scores").notNull(),
  sourceSheet: varchar("sourceSheet", { length: 180 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  metric: varchar("metric", { length: 80 }).notNull(),
  value: int("value").notNull(),
  position: int("position").notNull(),
  sourceSheet: varchar("sourceSheet", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var competitions = mysqlTable("competitions", {
  id: int("id").autoincrement().primaryKey(),
  edition: int("edition").notNull().unique(),
  label: varchar("label", { length: 180 }).notNull(),
  year: int("year"),
  highlights: json("highlights").notNull(),
  sourceSheet: varchar("sourceSheet", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var publications = mysqlTable("publications", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImage: varchar("coverImage", { length: 500 }),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  authorId: int("authorId"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var menus = mysqlTable("menus", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  location: varchar("location", { length: 80 }).notNull().default("primary"),
  items: json("items").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var forms = mysqlTable("forms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  fields: json("fields").notNull(),
  notificationEmail: varchar("notificationEmail", { length: 320 }),
  active: int("active").default(1).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var formSubmissions = mysqlTable("form_submissions", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  data: json("data").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var revisions = mysqlTable("revisions", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 40 }).notNull(),
  entityId: int("entityId").notNull(),
  version: int("version").notNull(),
  snapshot: json("snapshot").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  storagePath: varchar("storagePath", { length: 500 }).notNull().unique(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  altText: varchar("altText", { length: 300 }),
  folder: varchar("folder", { length: 120 }),
  status: mysqlEnum("status", ["active", "hidden"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var mediaBlobs = mysqlTable("media_blobs", {
  id: int("id").autoincrement().primaryKey(),
  mediaId: int("mediaId").notNull().unique(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  base64Data: text("base64Data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var importJobs = mysqlTable("import_jobs", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["preview", "completed", "review"]).notNull(),
  summary: json("summary").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 120 }).notNull(),
  entityId: varchar("entityId", { length: 80 }),
  userId: int("userId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// shared/newlogData.ts
var OFFICIAL_LOGO = "/assets/newlog/logo-newlog.png";
var SOURCE_FILE = "COPANEWLOG-HIST\xD3RIA.xlsx";
var ranking = [
  {
    name: "MADRID FC",
    points: 615,
    scores: [60, 80, 40, 10, 10, 30, 40, 60, 80, 80, 5, 80, 40],
    rank: 1,
    logo: "/assets/newlog/teams/madrid-fc.png"
  },
  {
    name: "ATL\xC9TICO GURIZES",
    points: 525,
    scores: [100, 60, 100, 15, 5, 50, null, 5, 100, 60, 20, null, 10],
    rank: 2,
    logo: "/assets/newlog/teams/atletico-gurizes.png"
  },
  {
    name: "RESENHA FTyP",
    points: 430,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      50,
      80,
      null,
      20,
      100,
      100,
      80
    ],
    rank: 3,
    logo: "/assets/newlog/teams/resenha-ftyp.png"
  },
  {
    name: "INIMIGOS DA BOLA",
    points: 380,
    scores: [80, 100, 60, 40, 20, null, null, 10, 60, 10, null, null, null],
    rank: 4,
    logo: null
  },
  {
    name: "CORAGEM NACIONAL",
    points: 335,
    scores: [null, null, 20, 5, 60, null, null, 40, 40, null, 10, 60, 100],
    rank: 5,
    logo: "/assets/newlog/teams/coragem-nacional.png"
  },
  {
    name: "PUMAS FUT 7",
    points: 280,
    scores: [null, null, null, 30, 40, 20, 30, 20, null, 100, 40, null, null],
    rank: 6,
    logo: "/assets/newlog/teams/pumas-fut-7.png"
  },
  {
    name: "DEPORTIVO SANTA MARIA",
    points: 250,
    scores: [40, 20, 80, null, null, 40, null, null, null, 40, 30, null, null],
    rank: 7,
    logo: "/assets/newlog/teams/deportivo-santa-maria.png"
  },
  {
    name: "PELADEIROS FC",
    points: 160,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      100,
      null,
      null,
      60,
      null,
      null
    ],
    rank: 8,
    logo: "/assets/newlog/teams/peladeiros-fc.png"
  },
  {
    name: "300 PRIME",
    points: 150,
    scores: [
      null,
      null,
      null,
      50,
      100,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    rank: 9,
    logo: "/assets/newlog/teams/300-prime.png"
  },
  {
    name: "RESENHA CELESTES",
    points: 110,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      80,
      null,
      30
    ],
    rank: 10,
    logo: "/assets/newlog/teams/resenha-celestes.png"
  },
  {
    name: "GLV",
    points: 100,
    scores: [
      null,
      null,
      null,
      20,
      80,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ],
    rank: 11,
    logo: "/assets/newlog/teams/glv.png"
  },
  {
    name: "MERCEN\xC1RIOS",
    points: 60,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      40,
      20
    ],
    rank: 12,
    logo: "/assets/newlog/teams/mercenarios-fc.png"
  },
  {
    name: "MURARI SPORTS",
    points: 60,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      60
    ],
    rank: 13,
    logo: "/assets/newlog/teams/murari-sports.png"
  },
  {
    name: "TRUPE SM",
    points: 5,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      5
    ],
    rank: 14,
    logo: "/assets/newlog/teams/trupe-sm.png"
  }
];
var historicalPlayers = {
  participations: [
    {
      position: 1,
      name: "FERNANDO",
      value: 10
    },
    {
      position: 2,
      name: "MATTEUS",
      value: 10
    },
    {
      position: 3,
      name: "HOLKEM",
      value: 9
    },
    {
      position: 4,
      name: "LUFEL",
      value: 9
    },
    {
      position: 5,
      name: "RAFAEL CAMARGO",
      value: 8
    },
    {
      position: 6,
      name: "RUIVO",
      value: 8
    },
    {
      position: 7,
      name: "BRUNO",
      value: 7
    },
    {
      position: 8,
      name: "BRUNO ENNES",
      value: 7
    }
  ],
  goals: [
    {
      position: 1,
      name: "LUCAS PADYLHA",
      value: 20
    },
    {
      position: 2,
      name: "Z\xC9",
      value: 17
    },
    {
      position: 3,
      name: "RODRIGO",
      value: 13
    },
    {
      position: 4,
      name: "THIAGO SOBROSA",
      value: 12
    },
    {
      position: 5,
      name: "RUIVO",
      value: 11
    },
    {
      position: 6,
      name: "ADRIANO",
      value: 11
    },
    {
      position: 7,
      name: "JOS\xC9 JESUS",
      value: 11
    },
    {
      position: 8,
      name: "JACKSON",
      value: 10
    }
  ],
  assists: [],
  value: []
};
var competitions2 = [
  {
    edition: 1,
    year: 2022,
    label: "1\xBACOPA - 2022",
    highlights: [
      {
        role: "GL",
        name: "CHAR\xC3O"
      },
      {
        role: "ZG",
        name: "RAFAEL"
      },
      {
        role: "ZG",
        name: "SERAPIO"
      },
      {
        role: "AL",
        name: "MATTEUS"
      },
      {
        role: "AL",
        name: "BRUNO"
      },
      {
        role: "MC",
        name: "Z\xC9"
      }
    ]
  },
  {
    edition: 2,
    year: 2022,
    label: "2\xBACOPA - 2022",
    highlights: [
      {
        role: "GL",
        name: "CHAR\xC3O"
      },
      {
        role: "ZG",
        name: "SERAPIO"
      },
      {
        role: "ZG",
        name: "CARLOS"
      },
      {
        role: "AL",
        name: "MATTEUS"
      },
      {
        role: "AL",
        name: "STECKEL"
      },
      {
        role: "MC",
        name: "CAETANO"
      }
    ]
  },
  {
    edition: 3,
    year: 2022,
    label: "3\xBACOPA - 2022",
    highlights: [
      {
        role: "GL",
        name: "LUCAS SEVERO"
      },
      {
        role: "ZG",
        name: "PORTELLA"
      },
      {
        role: "ZG",
        name: "ALEX"
      },
      {
        role: "AL",
        name: "BRUNO ENNES"
      },
      {
        role: "AL",
        name: "BRUNO"
      },
      {
        role: "MC",
        name: "Z\xC9"
      }
    ]
  },
  {
    edition: 4,
    year: 2023,
    label: "4\xBACOPA - 2023",
    highlights: [
      {
        role: "GL",
        name: "TITO"
      },
      {
        role: "ZG",
        name: "TOM"
      },
      {
        role: "ZG",
        name: "CARVALHO"
      },
      {
        role: "AL",
        name: "DEDY"
      },
      {
        role: "AL",
        name: "GABRIEL VARGAS"
      },
      {
        role: "MC",
        name: "FELIPE TONETTO"
      }
    ]
  },
  {
    edition: 5,
    year: 2023,
    label: "5\xBACOPA - 2023",
    highlights: [
      {
        role: "GL",
        name: "CASS\xC3O"
      },
      {
        role: "ZG",
        name: "LUCAS CORR\xCAA"
      },
      {
        role: "AL",
        name: "ELISANDRO"
      },
      {
        role: "AL",
        name: "ELISANDRO"
      },
      {
        role: "MC",
        name: "MARCOS PARISE"
      },
      {
        role: "AT",
        name: "JESS\xC9"
      }
    ]
  },
  {
    edition: 6,
    year: 2023,
    label: "6\xBACOPA - 2023",
    highlights: [
      {
        role: "GL",
        name: "TOM"
      },
      {
        role: "ZG",
        name: "CRISTIAN"
      },
      {
        role: "ZG",
        name: "HOLKEM"
      },
      {
        role: "AL",
        name: "RUIVO"
      },
      {
        role: "AL",
        name: "BARIN"
      },
      {
        role: "MC",
        name: "BRUNO VIEIRA"
      }
    ]
  },
  {
    edition: 7,
    year: 2025,
    label: "7\xBACOPA - 2025",
    highlights: [
      {
        role: "GL",
        name: "JULIANO"
      },
      {
        role: "ZG",
        name: "VITOR JACAR\xC9"
      },
      {
        role: "ZG",
        name: "CARLOS"
      },
      {
        role: "ZG",
        name: "VINICIUS MICHELS"
      },
      {
        role: "MC",
        name: "F\xC1BIO"
      },
      {
        role: "MC",
        name: "DUTRA"
      }
    ]
  },
  {
    edition: 8,
    year: 2025,
    label: "8\xBACOPA - 2025",
    highlights: [
      {
        role: "GL",
        name: "CASS\xC3O"
      },
      {
        role: "ZG",
        name: "RIGUI"
      },
      {
        role: "ZG",
        name: "ANDERSON RATO"
      },
      {
        role: "ZG",
        name: "MATHEUS BIANCHI"
      },
      {
        role: "MC",
        name: "RAFINHA"
      },
      {
        role: "MC",
        name: "JOS\xC9 DE JESUS"
      }
    ]
  },
  {
    edition: 9,
    year: 2026,
    label: "9\xBACOPA - 2026",
    highlights: [
      {
        role: "GL",
        name: "ANDRIO"
      },
      {
        role: "ZG",
        name: "FERNANDO"
      },
      {
        role: "ZG",
        name: "LUCAS SAVIAN"
      },
      {
        role: "ZG",
        name: "RIGHI"
      },
      {
        role: "MC",
        name: "LUCAS CORR\xCAA"
      },
      {
        role: "MC",
        name: "DENIS"
      }
    ]
  },
  {
    edition: 10,
    year: 2026,
    label: "10\xBACOPA - 2026",
    highlights: [
      {
        role: "GL",
        name: "IGOR AMARAL"
      },
      {
        role: "ZG",
        name: "LUCAS LOPES"
      },
      {
        role: "ZG",
        name: "CARLOS"
      },
      {
        role: "ZG",
        name: "PELISSER"
      },
      {
        role: "MC",
        name: "LUCAS GRECO"
      },
      {
        role: "MC",
        name: "JOS\xC9 DE JESUS"
      }
    ]
  }
];
var teamDirectory = [
  ...ranking.map((entry) => ({ name: entry.name, logo: entry.logo })),
  { name: "Deportivo Mazembe", logo: void 0 },
  { name: "Inimigos da Bola", logo: void 0 },
  { name: "Redbull SM", logo: void 0 }
].filter(
  (team, index, list) => list.findIndex((item) => item.name === team.name) === index
);
var workbookFacts = {
  sheetCount: 8,
  historicalCups: 10,
  rankingTeams: ranking.length,
  sourceSheets: [
    "PICKS - 11\xAA EDI\xC7\xC3O",
    "12\xBA EDI\xC7\xC3O",
    "MAIORES NO GERAL",
    "RANKING GERAL NEWLOG",
    "TABELAS DAS COPAS",
    "TIMES E DESTAQUES DAS COPAS",
    "ESTATISTICAS GERAIS",
    "BID - 10\xAA EDI\xC7\xC3O"
  ],
  laterEditions: ["11\xAA EDI\xC7\xC3O", "12\xBA EDI\xC7\xC3O"]
};

// server/db.ts
import * as XLSX from "xlsx";
var _db = null;
var seedPromise = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
var settingDefaults = {
  site_name: "Newlog Esportes",
  site_description: "A hist\xF3ria das Copas Newlog, rodada a rodada.",
  instagram_url: "https://www.instagram.com/newlogesports",
  logo_url: OFFICIAL_LOGO,
  source_file: SOURCE_FILE,
  developer_watermark_url: ""
};
var homeBlocks = [
  {
    type: "hero",
    eyebrow: "Arquivo oficial",
    title: "A hist\xF3ria \xE9 feita rodada a rodada.",
    text: "Explore a mem\xF3ria competitiva da Newlog Esportes a partir dos dados oficiais enviados pela organiza\xE7\xE3o.",
    actionLabel: "Ver ranking",
    actionHref: "/ranking"
  },
  {
    type: "text",
    title: "Um arquivo vivo do fut-7",
    text: "O acervo re\xFAne dez edi\xE7\xF5es hist\xF3ricas, rankings gerais, destaques individuais e as listas das pr\xF3ximas edi\xE7\xF5es. Os dados desta p\xE1gina v\xEAm da planilha COPANEWLOG-HIST\xD3RIA.xlsx."
  }
];
function slugify(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
async function ensureSeedData() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const db = await getDb();
    if (!db) return;
    const existingSettings = await db.select({ settingKey: siteSettings.settingKey }).from(siteSettings);
    const settingKeys = new Set(existingSettings.map((row) => row.settingKey));
    const missingSettings = Object.entries(settingDefaults).filter(([settingKey]) => !settingKeys.has(settingKey)).map(([settingKey, value]) => ({ settingKey, value, isPublic: 1 }));
    if (missingSettings.length > 0)
      await db.insert(siteSettings).values(missingSettings);
    const existingTeams = await db.select({ name: teams.name }).from(teams);
    const teamNames = new Set(existingTeams.map((row) => row.name));
    const teamSlugs = new Set(existingTeams.map((row) => slugify(row.name)));
    const rankingPoints = new Map(
      ranking.map((entry) => [entry.name, entry.points])
    );
    const missingTeams = teamDirectory.filter(
      (entry) => !teamNames.has(entry.name) && !teamSlugs.has(slugify(entry.name))
    ).map((entry) => ({
      name: entry.name,
      slug: slugify(entry.name),
      logoUrl: entry.logo ?? null,
      modality: "Futebol 7",
      category: "Hist\xF3rico Newlog",
      rankingPoints: rankingPoints.get(entry.name) ?? 0,
      status: "published",
      sourceSheet: rankingPoints.has(entry.name) ? "RANKING GERAL NEWLOG" : "TABELAS DAS COPAS"
    }));
    if (missingTeams.length > 0) await db.insert(teams).values(missingTeams);
    const existingRanking = await db.select({ teamName: rankingEntries.teamName }).from(rankingEntries);
    const rankingNames = new Set(existingRanking.map((row) => row.teamName));
    const missingRanking = ranking.filter((entry) => !rankingNames.has(entry.name)).map((entry) => ({
      teamName: entry.name,
      position: entry.rank,
      totalPoints: entry.points,
      scores: entry.scores,
      sourceSheet: "RANKING GERAL NEWLOG"
    }));
    if (missingRanking.length > 0)
      await db.insert(rankingEntries).values(missingRanking);
    const existingPlayers = await db.select({ name: players.name, metric: players.metric }).from(players);
    const playerKeys = new Set(
      existingPlayers.map((row) => `${row.name}|${row.metric}`)
    );
    const sourcePlayers = Object.entries(historicalPlayers).flatMap(
      ([metric, entries]) => entries.map((entry) => ({
        name: entry.name,
        metric: metric === "participations" ? "Participa\xE7\xF5es" : metric === "goals" ? "Gols" : metric,
        value: entry.value,
        position: Number(entry.position),
        sourceSheet: "MAIORES NO GERAL",
        status: "published",
        imageUrl: null
      }))
    );
    const missingPlayers = sourcePlayers.filter(
      (player) => !playerKeys.has(`${player.name}|${player.metric}`)
    );
    if (missingPlayers.length > 0)
      await db.insert(players).values(missingPlayers);
    const existingCompetitions = await db.select({ edition: competitions.edition }).from(competitions);
    const competitionEditions = new Set(
      existingCompetitions.map((row) => row.edition)
    );
    const missingCompetitions = competitions2.filter((entry) => !competitionEditions.has(entry.edition)).map((entry) => ({
      edition: entry.edition,
      label: entry.label,
      year: entry.year,
      highlights: entry.highlights,
      sourceSheet: "TIMES E DESTAQUES DAS COPAS",
      status: "published"
    }));
    if (missingCompetitions.length > 0)
      await db.insert(competitions).values(missingCompetitions);
    const existingPages = await db.select({ slug: pages.slug }).from(pages);
    const pageSlugs = new Set(existingPages.map((row) => row.slug));
    const sourcePages = [
      {
        title: "P\xE1gina inicial",
        slug: "home",
        excerpt: "Arquivo institucional Newlog Esportes",
        blocks: homeBlocks,
        status: "published",
        seoTitle: "Newlog Esportes \u2014 hist\xF3ria e ranking",
        seoDescription: "Conhe\xE7a a hist\xF3ria, os rankings e as Copas Newlog Esportes.",
        publishedAt: /* @__PURE__ */ new Date()
      },
      {
        title: "Sobre a Newlog",
        slug: "sobre",
        excerpt: "Uma organiza\xE7\xE3o esportiva constru\xEDda em comunidade.",
        blocks: [
          {
            type: "text",
            title: "Sobre a Newlog Esportes",
            text: "Esta p\xE1gina est\xE1 pronta para receber o texto institucional oficial pelo painel administrativo."
          }
        ],
        status: "published",
        seoTitle: "Sobre a Newlog Esportes",
        seoDescription: "Conhe\xE7a a Newlog Esportes e seu arquivo de competi\xE7\xF5es.",
        publishedAt: /* @__PURE__ */ new Date()
      },
      {
        title: "Hist\xF3ria das Copas",
        slug: "historia",
        excerpt: "Dez edi\xE7\xF5es registradas na planilha hist\xF3rica.",
        blocks: [
          {
            type: "text",
            title: "Dez edi\xE7\xF5es no arquivo",
            text: "A hist\xF3ria registrada come\xE7a em 2022 e re\xFAne dez Copas, rankings, destaques e listas de participantes."
          }
        ],
        status: "published",
        seoTitle: "Hist\xF3ria das Copas Newlog",
        seoDescription: "Veja a linha do tempo das Copas Newlog Esportes.",
        publishedAt: /* @__PURE__ */ new Date()
      }
    ];
    const missingPages = sourcePages.filter((page) => !pageSlugs.has(page.slug));
    if (missingPages.length > 0) await db.insert(pages).values(missingPages);
    const existingMedia = await db.select({ storagePath: mediaAssets.storagePath }).from(mediaAssets);
    const mediaPaths = new Set(existingMedia.map((row) => row.storagePath));
    const sourceMedia = [
      {
        title: "Logo oficial Newlog Esportes",
        storagePath: OFFICIAL_LOGO,
        mimeType: "image/png",
        altText: "Logo Newlog Esportes",
        folder: "identidade",
        status: "active"
      },
      ...ranking.filter((entry) => entry.logo).map((entry) => ({
        title: `Escudo ${entry.name}`,
        storagePath: entry.logo,
        mimeType: "image/png",
        altText: `Escudo do time ${entry.name}`,
        folder: "escudos",
        status: "active"
      }))
    ];
    const missingMedia = sourceMedia.filter(
      (asset) => !mediaPaths.has(asset.storagePath)
    );
    if (missingMedia.length > 0)
      await db.insert(mediaAssets).values(missingMedia);
    const existingImport = await db.select({ fileName: importJobs.fileName }).from(importJobs);
    if (!existingImport.some((row) => row.fileName === SOURCE_FILE)) {
      await db.insert(importJobs).values({
        fileName: SOURCE_FILE,
        status: "completed",
        summary: {
          sheets: 8,
          rankingTeams: ranking.length,
          historicalCups: competitions2.length,
          note: "Importa\xE7\xE3o inicial do invent\xE1rio; revis\xE3o manual permanece dispon\xEDvel."
        }
      });
    }
  })().catch((error) => {
    seedPromise = null;
    console.warn(
      "[Database] Seed skipped:",
      error instanceof Error ? error.message : error
    );
  });
  return seedPromise;
}
async function getPublicSnapshot() {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return null;
  const [
    settingsRows,
    teamRows,
    rankingRows,
    playerRows,
    competitionRows,
    pageRows,
    menuRows,
    formRows
  ] = await Promise.all([
    db.select().from(siteSettings).where(eq(siteSettings.isPublic, 1)),
    db.select().from(teams).where(eq(teams.status, "published")).orderBy(desc(teams.rankingPoints)),
    db.select().from(rankingEntries).orderBy(rankingEntries.position),
    db.select().from(players).where(eq(players.status, "published")).orderBy(players.position),
    db.select().from(competitions).where(eq(competitions.status, "published")).orderBy(competitions.edition),
    db.select().from(pages).where(eq(pages.status, "published")).orderBy(pages.slug),
    db.select().from(menus).where(eq(menus.status, "published")).orderBy(menus.location),
    db.select().from(forms).where(eq(forms.active, 1)).orderBy(forms.name)
  ]);
  const settings = Object.fromEntries(
    settingsRows.map((row) => [row.settingKey, row.value ?? ""])
  );
  return {
    settings,
    teams: teamRows,
    ranking: rankingRows,
    players: playerRows,
    competitions: competitionRows,
    pages: pageRows,
    menus: menuRows,
    forms: formRows
  };
}
async function getAdminDashboard() {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return null;
  const [pageRows, publicationRows, mediaRows, imports, activity] = await Promise.all([
    db.select().from(pages).orderBy(desc(pages.updatedAt)),
    db.select().from(publications).orderBy(desc(publications.updatedAt)),
    db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)),
    db.select().from(importJobs).orderBy(desc(importJobs.createdAt)),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(10)
  ]);
  return {
    counts: {
      publishedPages: pageRows.filter((page) => page.status === "published").length,
      drafts: pageRows.filter((page) => page.status === "draft").length,
      publications: publicationRows.length,
      media: mediaRows.length
    },
    pages: pageRows,
    publications: publicationRows,
    media: mediaRows,
    imports,
    activity
  };
}
async function updateSetting(settingKey, value, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(siteSettings).values({ settingKey, value, isPublic: 1, updatedBy: userId ?? null }).onDuplicateKeyUpdate({ set: { value, updatedBy: userId ?? null } });
  await db.insert(auditLogs).values({
    action: "update",
    entity: "site_settings",
    entityId: settingKey,
    userId: userId ?? null,
    metadata: { valueChanged: true }
  });
  return { settingKey, value };
}
async function savePage(input, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const payload = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? null,
    blocks: input.blocks,
    status: input.status,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    publishedAt: input.status === "published" ? /* @__PURE__ */ new Date() : null,
    authorId: userId ?? null
  };
  if (input.id) {
    await db.update(pages).set(payload).where(eq(pages.id, input.id));
    await db.insert(auditLogs).values({
      action: "update",
      entity: "pages",
      entityId: String(input.id),
      userId: userId ?? null,
      metadata: { slug: input.slug }
    });
    return { id: input.id, ...payload };
  }
  const result = await db.insert(pages).values(payload);
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({
    action: "create",
    entity: "pages",
    entityId: String(id),
    userId: userId ?? null,
    metadata: { slug: input.slug }
  });
  return { id, ...payload };
}
async function savePublication(input, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const payload = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? null,
    content: input.content ?? null,
    coverImage: input.coverImage ?? null,
    status: input.status,
    publishedAt: input.status === "published" ? /* @__PURE__ */ new Date() : null,
    authorId: userId ?? null
  };
  if (input.id) {
    await db.update(publications).set(payload).where(eq(publications.id, input.id));
    await db.insert(auditLogs).values({
      action: "update",
      entity: "publications",
      entityId: String(input.id),
      userId: userId ?? null,
      metadata: { slug: input.slug, status: input.status }
    });
    return { id: input.id, ...payload };
  }
  const result = await db.insert(publications).values(payload);
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({
    action: "create",
    entity: "publications",
    entityId: String(id),
    userId: userId ?? null,
    metadata: { slug: input.slug, status: input.status }
  });
  return { id, ...payload };
}
async function getAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    loginMethod: users.loginMethod,
    lastSignedIn: users.lastSignedIn,
    createdAt: users.createdAt
  }).from(users).orderBy(desc(users.lastSignedIn));
}
async function getAdminContentModules() {
  const db = await getDb();
  if (!db) return { menus: [], forms: [], submissions: [] };
  const [menuRows, formRows, submissionRows] = await Promise.all([
    db.select().from(menus).orderBy(desc(menus.updatedAt)),
    db.select().from(forms).orderBy(desc(forms.updatedAt)),
    db.select().from(formSubmissions).orderBy(desc(formSubmissions.createdAt)).limit(50)
  ]);
  return { menus: menuRows, forms: formRows, submissions: submissionRows };
}
async function submitForm(slug, data) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const form = await db.select({ id: forms.id }).from(forms).where(and(eq(forms.slug, slug), eq(forms.active, 1))).limit(1);
  if (!form[0]) throw new Error("Formul\xE1rio n\xE3o encontrado");
  const result = await db.insert(formSubmissions).values({
    formId: form[0].id,
    data
  });
  return { id: Number(result[0].insertId) };
}
async function registerMedia(input, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(mediaAssets).values({
    title: input.title,
    storagePath: input.storagePath,
    mimeType: input.mimeType,
    altText: input.altText ?? null,
    folder: input.folder ?? "uploads",
    status: "active"
  });
  await db.insert(auditLogs).values({
    action: "create",
    entity: "media_assets",
    entityId: String(result[0].insertId),
    userId: userId ?? null,
    metadata: { storagePath: input.storagePath }
  });
  return { id: Number(result[0].insertId), ...input };
}
async function uploadMedia(input, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (input.base64Data.length > 6e4) throw new Error("Arquivo muito grande para este upload direto");
  const temporaryPath = `/api/media/pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const result = await db.insert(mediaAssets).values({
    title: input.title,
    storagePath: temporaryPath,
    mimeType: input.mimeType,
    altText: input.altText ?? null,
    folder: "uploads",
    status: "active"
  });
  const id = Number(result[0].insertId);
  const storagePath = `/api/media/${id}`;
  await db.update(mediaAssets).set({ storagePath }).where(eq(mediaAssets.id, id));
  await db.insert(mediaBlobs).values({ mediaId: id, mimeType: input.mimeType, base64Data: input.base64Data });
  await db.insert(auditLogs).values({ action: "upload", entity: "media_assets", entityId: String(id), userId: userId ?? null });
  return { id, storagePath, title: input.title, mimeType: input.mimeType };
}
async function getMediaBlob(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(mediaBlobs).where(eq(mediaBlobs.mediaId, id)).limit(1);
  return rows[0] ?? null;
}
async function previewWorkbook(fileName, base64, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength > 15 * 1024 * 1024)
    throw new Error("A planilha excede 15 MB");
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheets = workbook.SheetNames.map((name) => {
    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[name],
      { defval: null, raw: false }
    );
    return {
      name,
      columns: rows[0] ? Object.keys(rows[0]) : [],
      rowCount: rows.length,
      sample: rows.slice(0, 8)
    };
  });
  const summary = {
    sheets: sheets.length,
    totalRows: sheets.reduce((total, sheet) => total + sheet.rowCount, 0),
    sheetsDetail: sheets
  };
  await db.insert(importJobs).values({ fileName, status: "preview", summary });
  await db.insert(auditLogs).values({
    action: "preview",
    entity: "import_jobs",
    metadata: { fileName, sheets: sheets.length },
    userId: userId ?? null
  });
  return summary;
}
function numericCell(value) {
  if (value === null || value === void 0 || value === "") return null;
  const parsed = Number(String(value).replace(/[^0-9,.-]/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}
function cleanCell(value) {
  const text2 = String(value ?? "").trim();
  return text2 && text2 !== "-" ? text2 : null;
}
function sheetRows(workbook, name) {
  const sheet = workbook.Sheets[name];
  return sheet ? XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false }) : [];
}
async function confirmWorkbook(fileName, base64, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength > 15 * 1024 * 1024) throw new Error("A planilha excede 15 MB");
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const rankingRows = sheetRows(workbook, "RANKING GERAL NEWLOG");
  const playerRows = sheetRows(workbook, "MAIORES NO GERAL");
  if (!rankingRows.length) throw new Error("A planilha n\xE3o cont\xE9m a aba RANKING GERAL NEWLOG");
  const rankingValues = rankingRows.flatMap((row) => {
    const teamName = cleanCell(row["RANKING NEWLOG"]);
    if (!teamName) return [];
    const scoreKeys = Object.keys(row).filter((key) => key !== "RANKING NEWLOG" && key !== "TOTAL" && !key.startsWith("__EMPTY"));
    const scores = scoreKeys.map((key) => numericCell(row[key]));
    return [{ teamName, position: rankingRows.findIndex((item) => cleanCell(item["RANKING NEWLOG"]) === teamName) + 1, totalPoints: numericCell(row.TOTAL) ?? 0, scores }];
  });
  if (!rankingValues.length) throw new Error("Nenhuma equipe v\xE1lida foi encontrada no ranking");
  const logoByTeam = new Map(ranking.map((entry) => [entry.name, entry.logo ?? null]));
  await db.transaction(async (tx) => {
    for (const entry of rankingValues) {
      await tx.insert(rankingEntries).values({ ...entry, sourceSheet: "RANKING GERAL NEWLOG" }).onDuplicateKeyUpdate({ set: { position: entry.position, totalPoints: entry.totalPoints, scores: entry.scores, sourceSheet: "RANKING GERAL NEWLOG" } });
      await tx.insert(teams).values({ name: entry.teamName, slug: slugify(entry.teamName), logoUrl: logoByTeam.get(entry.teamName) ?? null, modality: "Futebol 7", category: "Hist\xF3rico Newlog", rankingPoints: entry.totalPoints, status: "published", sourceSheet: "RANKING GERAL NEWLOG" }).onDuplicateKeyUpdate({ set: { logoUrl: logoByTeam.get(entry.teamName) ?? null, rankingPoints: entry.totalPoints, sourceSheet: "RANKING GERAL NEWLOG" } });
    }
    if (playerRows.length) {
      await tx.delete(players).where(eq(players.sourceSheet, "MAIORES NO GERAL"));
      const playerValues = playerRows.flatMap((row, rowIndex) => [
        ["NOME", "COPAS", "Participa\xE7\xF5es", "P"],
        ["NOME_1", "GOLS", "Gols", "P_1"],
        ["NOME_2", "ASS", "Assist\xEAncias", "P_2"],
        ["NOME_3", "VALOR", "Valor", "P_3"]
      ].flatMap(([nameKey, valueKey, metric, positionKey]) => {
        const name = cleanCell(row[nameKey]);
        const value = numericCell(row[valueKey]);
        if (!name || value === null) return [];
        return [{ name, metric, value, position: numericCell(row[positionKey]) ?? rowIndex + 1, sourceSheet: "MAIORES NO GERAL", status: "published", imageUrl: null }];
      }));
      if (playerValues.length) await tx.insert(players).values(playerValues);
    }
    await tx.insert(importJobs).values({ fileName, status: "completed", summary: { sheets: workbook.SheetNames.length, rankingTeams: rankingValues.length, players: playerRows.length, confirmedAt: (/* @__PURE__ */ new Date()).toISOString() }, createdBy: userId ?? null });
    await tx.insert(auditLogs).values({ action: "confirm", entity: "import_jobs", metadata: { fileName, rankingTeams: rankingValues.length, players: playerRows.length }, userId: userId ?? null });
  });
  return { fileName, rankingTeams: rankingValues.length, playersImported: playerRows.length, sheets: workbook.SheetNames.length };
}
async function saveMenu(input, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const payload = {
    name: input.name,
    location: input.location,
    items: input.items,
    status: input.status,
    updatedBy: userId ?? null
  };
  if (input.id) {
    await db.update(menus).set(payload).where(eq(menus.id, input.id));
    return { id: input.id, ...payload };
  }
  const result = await db.insert(menus).values(payload);
  return { id: Number(result[0].insertId), ...payload };
}
async function saveForm(input, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const payload = {
    name: input.name,
    slug: input.slug,
    fields: input.fields,
    notificationEmail: input.notificationEmail ?? null,
    active: input.active ? 1 : 0,
    createdBy: userId ?? null
  };
  if (input.id) {
    await db.update(forms).set(payload).where(eq(forms.id, input.id));
    return { id: input.id, ...payload };
  }
  const result = await db.insert(forms).values(payload);
  return { id: Number(result[0].insertId), ...payload };
}

// server/routers.ts
import { z as z2 } from "zod";
var blockInput = z2.object({
  type: z2.enum([
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
    "section"
  ]),
  title: z2.string().max(200).optional(),
  text: z2.string().max(5e3).optional(),
  imageUrl: z2.string().max(500).optional(),
  href: z2.string().max(500).optional(),
  label: z2.string().max(120).optional()
}).strict();
var pageInput = z2.object({
  id: z2.number().optional(),
  title: z2.string().min(2).max(200),
  slug: z2.string().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z2.string().max(500).optional(),
  blocks: z2.array(blockInput).max(30),
  status: z2.enum(["draft", "published", "archived"]),
  seoTitle: z2.string().max(180).optional(),
  seoDescription: z2.string().max(320).optional()
});
var publicationInput = z2.object({
  id: z2.number().optional(),
  title: z2.string().min(2).max(220),
  slug: z2.string().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z2.string().max(500).optional(),
  content: z2.string().max(2e4).optional(),
  coverImage: z2.string().max(500).optional(),
  status: z2.enum(["draft", "published", "archived"])
});
var menuInput = z2.object({
  id: z2.number().optional(),
  name: z2.string().min(2).max(160),
  location: z2.string().min(2).max(80),
  items: z2.array(
    z2.object({ label: z2.string().max(120), href: z2.string().max(300) }).strict()
  ).max(40),
  status: z2.enum(["draft", "published", "archived"])
});
var formInput = z2.object({
  id: z2.number().optional(),
  name: z2.string().min(2).max(160),
  slug: z2.string().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  fields: z2.array(
    z2.object({
      name: z2.string().max(80),
      label: z2.string().max(120),
      type: z2.enum(["text", "email", "textarea", "tel"])
    }).strict()
  ).max(30),
  notificationEmail: z2.string().email().max(320).optional(),
  active: z2.boolean()
});
var mediaInput = z2.object({
  title: z2.string().min(2).max(220),
  storagePath: z2.string().url().max(500),
  mimeType: z2.string().min(3).max(120),
  altText: z2.string().max(300).optional(),
  folder: z2.string().max(120).optional()
});
var workbookInput = z2.object({
  fileName: z2.string().min(1).max(255),
  base64: z2.string().min(10).max(2e7)
});
var uploadInput = z2.object({
  title: z2.string().min(2).max(220),
  mimeType: z2.string().regex(/^image\/(png|jpeg|webp|gif)$/),
  base64Data: z2.string().min(20).max(6e4),
  altText: z2.string().max(300).optional()
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  public: router({
    snapshot: publicProcedure.query(() => getPublicSnapshot()),
    submitForm: publicProcedure.input(
      z2.object({
        slug: z2.string().min(2).max(160),
        data: z2.record(z2.string(), z2.string().max(500))
      })
    ).mutation(({ input }) => submitForm(input.slug, input.data))
  }),
  admin: router({
    dashboard: adminProcedure.query(() => getAdminDashboard()),
    users: adminProcedure.query(() => getAdminUsers()),
    modules: adminProcedure.query(() => getAdminContentModules()),
    savePage: adminProcedure.input(pageInput).mutation(({ input, ctx }) => savePage(input, ctx.user.id)),
    savePublication: adminProcedure.input(publicationInput).mutation(({ input, ctx }) => savePublication(input, ctx.user.id)),
    saveMenu: adminProcedure.input(menuInput).mutation(({ input, ctx }) => saveMenu(input, ctx.user.id)),
    saveForm: adminProcedure.input(formInput).mutation(({ input, ctx }) => saveForm(input, ctx.user.id)),
    registerMedia: adminProcedure.input(mediaInput).mutation(({ input, ctx }) => registerMedia(input, ctx.user.id)),
    previewWorkbook: adminProcedure.input(workbookInput).mutation(
      ({ input, ctx }) => previewWorkbook(input.fileName, input.base64, ctx.user.id)
    ),
    confirmWorkbook: adminProcedure.input(workbookInput).mutation(
      ({ input, ctx }) => confirmWorkbook(input.fileName, input.base64, ctx.user.id)
    ),
    uploadMedia: adminProcedure.input(uploadInput).mutation(({ input, ctx }) => uploadMedia(input, ctx.user.id)),
    updateSetting: adminProcedure.input(
      z2.object({
        key: z2.string().min(2).max(120),
        value: z2.string().max(1e3)
      })
    ).mutation(
      ({ input, ctx }) => updateSetting(input.key, input.value, ctx.user.id)
    )
  })
});

// server/_core/context.ts
import { createClient } from "@supabase/supabase-js";
function getBearerToken(req) {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}
async function authenticateSupabase(req) {
  const token = getBearerToken(req);
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) return null;
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return null;
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id, display_name, role, active").eq("id", authData.user.id).maybeSingle();
  if (profileError || !profile?.active) return null;
  return {
    id: 1,
    openId: profile.id,
    name: profile.display_name ?? authData.user.email ?? null,
    email: authData.user.email ?? null,
    loginMethod: "supabase",
    role: profile.role === "superadmin" || profile.role === "admin" ? "admin" : "user",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date(),
    lastSignedIn: /* @__PURE__ */ new Date()
  };
}
async function createContext(opts) {
  let user = null;
  try {
    user = await authenticateSupabase(opts.req);
  } catch {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}

// server/_core/index.ts
async function createApp(_server, options) {
  const app = express2();
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
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
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (!options?.useVite) {
    const { serveStatic: serveStatic2 } = await Promise.resolve().then(() => (init_static(), static_exports));
    serveStatic2(app);
  }
  return app;
}

// api/index.handler.ts
var appPromise = createApp();
async function handler(req, res) {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error("[Vercel] App initialization failed", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "App initialization failed",
        message: error instanceof Error ? error.message : "unknown error"
      });
    }
  }
}
export {
  handler as default
};
