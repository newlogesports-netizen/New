import {
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  value: text("value"),
  isPublic: int("isPublic").default(1).notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  excerpt: text("excerpt"),
  blocks: json("blocks").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("draft")
    .notNull(),
  seoTitle: varchar("seoTitle", { length: 180 }),
  seoDescription: varchar("seoDescription", { length: 320 }),
  featuredImage: varchar("featuredImage", { length: 500 }),
  authorId: int("authorId"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull().unique(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  modality: varchar("modality", { length: 100 }),
  category: varchar("category", { length: 100 }),
  rankingPoints: int("rankingPoints").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("published")
    .notNull(),
  sourceSheet: varchar("sourceSheet", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const rankingEntries = mysqlTable("ranking_entries", {
  id: int("id").autoincrement().primaryKey(),
  teamName: varchar("teamName", { length: 180 }).notNull().unique(),
  position: int("position").notNull(),
  totalPoints: int("totalPoints").notNull(),
  scores: json("scores").notNull(),
  sourceSheet: varchar("sourceSheet", { length: 180 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  metric: varchar("metric", { length: 80 }).notNull(),
  value: int("value").notNull(),
  position: int("position").notNull(),
  sourceSheet: varchar("sourceSheet", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("published")
    .notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const competitions = mysqlTable("competitions", {
  id: int("id").autoincrement().primaryKey(),
  edition: int("edition").notNull().unique(),
  label: varchar("label", { length: 180 }).notNull(),
  year: int("year"),
  highlights: json("highlights").notNull(),
  sourceSheet: varchar("sourceSheet", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("published")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const publications = mysqlTable("publications", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImage: varchar("coverImage", { length: 500 }),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("draft")
    .notNull(),
  authorId: int("authorId"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const menus = mysqlTable("menus", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  location: varchar("location", { length: 80 }).notNull().default("primary"),
  items: json("items").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("published")
    .notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const forms = mysqlTable("forms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  fields: json("fields").notNull(),
  notificationEmail: varchar("notificationEmail", { length: 320 }),
  active: int("active").default(1).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const formSubmissions = mysqlTable("form_submissions", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  data: json("data").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const revisions = mysqlTable("revisions", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 40 }).notNull(),
  entityId: int("entityId").notNull(),
  version: int("version").notNull(),
  snapshot: json("snapshot").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 220 }).notNull(),
  storagePath: varchar("storagePath", { length: 500 }).notNull().unique(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  altText: varchar("altText", { length: 300 }),
  folder: varchar("folder", { length: 120 }),
  status: mysqlEnum("status", ["active", "hidden"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const importJobs = mysqlTable("import_jobs", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["preview", "completed", "review"]).notNull(),
  summary: json("summary").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 120 }).notNull(),
  entityId: varchar("entityId", { length: 80 }),
  userId: int("userId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type RankingEntry = typeof rankingEntries.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type Publication = typeof publications.$inferSelect;
export type Menu = typeof menus.$inferSelect;
export type Form = typeof forms.$inferSelect;
