import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  auditLogs,
  competitions,
  importJobs,
  mediaAssets,
  pages,
  players,
  publications,
  rankingEntries,
  siteSettings,
  teams,
  users,
} from "../drizzle/schema";
import {
  competitions as sourceCompetitions,
  historicalPlayers,
  OFFICIAL_LOGO,
  ranking,
  SOURCE_FILE,
  teamDirectory,
} from "@shared/newlogData";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let seedPromise: Promise<void> | null = null;

export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0];
}

const settingDefaults: Record<string, string> = {
  site_name: "Newlog Esportes",
  site_description: "A história das Copas Newlog, rodada a rodada.",
  instagram_url: "https://www.instagram.com/newlogesports",
  logo_url: OFFICIAL_LOGO,
  source_file: SOURCE_FILE,
  developer_watermark_url: "",
};

const homeBlocks = [
  {
    type: "hero",
    eyebrow: "Arquivo oficial",
    title: "A história é feita rodada a rodada.",
    text: "Explore a memória competitiva da Newlog Esportes a partir dos dados oficiais enviados pela organização.",
    actionLabel: "Ver ranking",
    actionHref: "/ranking",
  },
  {
    type: "text",
    title: "Um arquivo vivo do fut-7",
    text: "O acervo reúne dez edições históricas, rankings gerais, destaques individuais e as listas das próximas edições. Os dados desta página vêm da planilha COPANEWLOG-HISTÓRIA.xlsx.",
  },
];

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function ensureSeedData() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const db = await getDb();
    if (!db) return;

    const existingSettings = await db
      .select({ settingKey: siteSettings.settingKey })
      .from(siteSettings);
    const settingKeys = new Set(existingSettings.map(row => row.settingKey));
    const missingSettings = Object.entries(settingDefaults)
      .filter(([settingKey]) => !settingKeys.has(settingKey))
      .map(([settingKey, value]) => ({ settingKey, value, isPublic: 1 }));
    if (missingSettings.length > 0)
      await db.insert(siteSettings).values(missingSettings);

    const existingTeams = await db.select({ name: teams.name }).from(teams);
    const teamNames = new Set(existingTeams.map(row => row.name));
    const teamSlugs = new Set(existingTeams.map(row => slugify(row.name)));
    const rankingPoints = new Map(
      ranking.map(entry => [entry.name, entry.points])
    );
    const missingTeams = teamDirectory
      .filter(
        entry =>
          !teamNames.has(entry.name) && !teamSlugs.has(slugify(entry.name))
      )
      .map(entry => ({
        name: entry.name,
        slug: slugify(entry.name),
        logoUrl: entry.logo ?? null,
        modality: "Futebol 7",
        category: "Histórico Newlog",
        rankingPoints: rankingPoints.get(entry.name) ?? 0,
        status: "published" as const,
        sourceSheet: rankingPoints.has(entry.name)
          ? "RANKING GERAL NEWLOG"
          : "TABELAS DAS COPAS",
      }));
    if (missingTeams.length > 0) await db.insert(teams).values(missingTeams);

    const existingRanking = await db
      .select({ teamName: rankingEntries.teamName })
      .from(rankingEntries);
    const rankingNames = new Set(existingRanking.map(row => row.teamName));
    const missingRanking = ranking
      .filter(entry => !rankingNames.has(entry.name))
      .map(entry => ({
        teamName: entry.name,
        position: entry.rank,
        totalPoints: entry.points,
        scores: entry.scores,
        sourceSheet: "RANKING GERAL NEWLOG",
      }));
    if (missingRanking.length > 0)
      await db.insert(rankingEntries).values(missingRanking);

    const existingPlayers = await db
      .select({ name: players.name, metric: players.metric })
      .from(players);
    const playerKeys = new Set(
      existingPlayers.map(row => `${row.name}|${row.metric}`)
    );
    const sourcePlayers = Object.entries(historicalPlayers).flatMap(
      ([metric, entries]) =>
        entries.map(entry => ({
          name: entry.name,
          metric:
            metric === "participations"
              ? "Participações"
              : metric === "goals"
                ? "Gols"
                : metric,
          value: entry.value,
          position: Number(entry.position),
          sourceSheet: "MAIORES NO GERAL",
          status: "published" as const,
          imageUrl: null,
        }))
    );
    const missingPlayers = sourcePlayers.filter(
      player => !playerKeys.has(`${player.name}|${player.metric}`)
    );
    if (missingPlayers.length > 0)
      await db.insert(players).values(missingPlayers);

    const existingCompetitions = await db
      .select({ edition: competitions.edition })
      .from(competitions);
    const competitionEditions = new Set(
      existingCompetitions.map(row => row.edition)
    );
    const missingCompetitions = sourceCompetitions
      .filter(entry => !competitionEditions.has(entry.edition))
      .map(entry => ({
        edition: entry.edition,
        label: entry.label,
        year: entry.year,
        highlights: entry.highlights,
        sourceSheet: "TIMES E DESTAQUES DAS COPAS",
        status: "published" as const,
      }));
    if (missingCompetitions.length > 0)
      await db.insert(competitions).values(missingCompetitions);

    const existingPages = await db.select({ slug: pages.slug }).from(pages);
    const pageSlugs = new Set(existingPages.map(row => row.slug));
    const sourcePages = [
      {
        title: "Página inicial",
        slug: "home",
        excerpt: "Arquivo institucional Newlog Esportes",
        blocks: homeBlocks,
        status: "published",
        seoTitle: "Newlog Esportes — história e ranking",
        seoDescription:
          "Conheça a história, os rankings e as Copas Newlog Esportes.",
        publishedAt: new Date(),
      },
      {
        title: "Sobre a Newlog",
        slug: "sobre",
        excerpt: "Uma organização esportiva construída em comunidade.",
        blocks: [
          {
            type: "text",
            title: "Sobre a Newlog Esportes",
            text: "Esta página está pronta para receber o texto institucional oficial pelo painel administrativo.",
          },
        ],
        status: "published",
        seoTitle: "Sobre a Newlog Esportes",
        seoDescription:
          "Conheça a Newlog Esportes e seu arquivo de competições.",
        publishedAt: new Date(),
      },
      {
        title: "História das Copas",
        slug: "historia",
        excerpt: "Dez edições registradas na planilha histórica.",
        blocks: [
          {
            type: "text",
            title: "Dez edições no arquivo",
            text: "A história registrada começa em 2022 e reúne dez Copas, rankings, destaques e listas de participantes.",
          },
        ],
        status: "published",
        seoTitle: "História das Copas Newlog",
        seoDescription: "Veja a linha do tempo das Copas Newlog Esportes.",
        publishedAt: new Date(),
      },
    ] as const;
    const missingPages = sourcePages.filter(page => !pageSlugs.has(page.slug));
    if (missingPages.length > 0) await db.insert(pages).values(missingPages);

    const existingMedia = await db
      .select({ storagePath: mediaAssets.storagePath })
      .from(mediaAssets);
    const mediaPaths = new Set(existingMedia.map(row => row.storagePath));
    const sourceMedia = [
      {
        title: "Logo oficial Newlog Esportes",
        storagePath: OFFICIAL_LOGO,
        mimeType: "image/png",
        altText: "Logo Newlog Esportes",
        folder: "identidade",
        status: "active",
      },
      ...ranking
        .filter(entry => entry.logo)
        .map(entry => ({
          title: `Escudo ${entry.name}`,
          storagePath: entry.logo as string,
          mimeType: "image/png",
          altText: `Escudo do time ${entry.name}`,
          folder: "escudos",
          status: "active" as const,
        })),
    ] as const;
    const missingMedia = sourceMedia.filter(
      asset => !mediaPaths.has(asset.storagePath)
    );
    if (missingMedia.length > 0)
      await db.insert(mediaAssets).values(missingMedia);

    const existingImport = await db
      .select({ fileName: importJobs.fileName })
      .from(importJobs);
    if (!existingImport.some(row => row.fileName === SOURCE_FILE)) {
      await db.insert(importJobs).values({
        fileName: SOURCE_FILE,
        status: "completed",
        summary: {
          sheets: 8,
          rankingTeams: ranking.length,
          historicalCups: sourceCompetitions.length,
          note: "Importação inicial do inventário; revisão manual permanece disponível.",
        },
      });
    }
  })().catch(error => {
    seedPromise = null;
    console.warn(
      "[Database] Seed skipped:",
      error instanceof Error ? error.message : error
    );
  });
  return seedPromise;
}

export async function getPublicSnapshot() {
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
  ] = await Promise.all([
    db.select().from(siteSettings).where(eq(siteSettings.isPublic, 1)),
    db
      .select()
      .from(teams)
      .where(eq(teams.status, "published"))
      .orderBy(desc(teams.rankingPoints)),
    db.select().from(rankingEntries).orderBy(rankingEntries.position),
    db
      .select()
      .from(players)
      .where(eq(players.status, "published"))
      .orderBy(players.position),
    db
      .select()
      .from(competitions)
      .where(eq(competitions.status, "published"))
      .orderBy(competitions.edition),
    db
      .select()
      .from(pages)
      .where(eq(pages.status, "published"))
      .orderBy(pages.slug),
  ]);
  const settings = Object.fromEntries(
    settingsRows.map(row => [row.settingKey, row.value ?? ""])
  );
  return {
    settings,
    teams: teamRows,
    ranking: rankingRows,
    players: playerRows,
    competitions: competitionRows,
    pages: pageRows,
  };
}

export async function getAdminDashboard() {
  await ensureSeedData();
  const db = await getDb();
  if (!db) return null;
  const [pageRows, publicationRows, mediaRows, imports, activity] =
    await Promise.all([
      db.select().from(pages).orderBy(desc(pages.updatedAt)),
      db.select().from(publications).orderBy(desc(publications.updatedAt)),
      db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)),
      db.select().from(importJobs).orderBy(desc(importJobs.createdAt)),
      db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(10),
    ]);
  return {
    counts: {
      publishedPages: pageRows.filter(page => page.status === "published")
        .length,
      drafts: pageRows.filter(page => page.status === "draft").length,
      publications: publicationRows.length,
      media: mediaRows.length,
    },
    pages: pageRows,
    publications: publicationRows,
    media: mediaRows,
    imports,
    activity,
  };
}

export async function updateSetting(
  settingKey: string,
  value: string,
  userId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(siteSettings)
    .values({ settingKey, value, isPublic: 1, updatedBy: userId ?? null })
    .onDuplicateKeyUpdate({ set: { value, updatedBy: userId ?? null } });
  await db.insert(auditLogs).values({
    action: "update",
    entity: "site_settings",
    entityId: settingKey,
    userId: userId ?? null,
    metadata: { valueChanged: true },
  });
  return { settingKey, value };
}

export async function savePage(
  input: {
    id?: number;
    title: string;
    slug: string;
    excerpt?: string;
    blocks: unknown;
    status: "draft" | "published" | "archived";
    seoTitle?: string;
    seoDescription?: string;
  },
  userId?: number
) {
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
    publishedAt: input.status === "published" ? new Date() : null,
    authorId: userId ?? null,
  };
  if (input.id) {
    await db.update(pages).set(payload).where(eq(pages.id, input.id));
    await db.insert(auditLogs).values({
      action: "update",
      entity: "pages",
      entityId: String(input.id),
      userId: userId ?? null,
      metadata: { slug: input.slug },
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
    metadata: { slug: input.slug },
  });
  return { id, ...payload };
}
