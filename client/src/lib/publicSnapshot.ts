import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";
import {
  competitions as fallbackCompetitions,
  historicalPlayers as fallbackPlayers,
  ranking as fallbackRanking,
  type CompetitionEntry,
  type PlayerEntry,
  type RankingEntry,
} from "@shared/newlogData";

export type PublicSnapshot = NonNullable<
  inferRouterOutputs<AppRouter>["public"]["snapshot"]
>;

export function rankingFromSnapshot(
  snapshot: PublicSnapshot | null | undefined
): RankingEntry[] {
  if (!snapshot?.ranking?.length) return fallbackRanking;
  const logoByName = new Map(
    snapshot.teams.map(team => [team.name, team.logoUrl])
  );
  return snapshot.ranking.map(entry => ({
    name: entry.teamName,
    points: entry.totalPoints,
    scores: Array.isArray(entry.scores)
      ? entry.scores.map(value => (typeof value === "number" ? value : null))
      : [],
    rank: entry.position,
    logo: logoByName.get(entry.teamName) ?? null,
  }));
}

export function playersFromSnapshot(
  snapshot: PublicSnapshot | null | undefined,
  metric: "Participações" | "Gols"
): PlayerEntry[] {
  const fallbackKey = metric === "Gols" ? "goals" : "participations";
  if (!snapshot?.players?.length) return fallbackPlayers[fallbackKey];
  return snapshot.players
    .filter(player => player.metric === metric)
    .map(player => ({
      position: player.position,
      name: player.name,
      value: player.value,
    }));
}

export function competitionsFromSnapshot(
  snapshot: PublicSnapshot | null | undefined
): CompetitionEntry[] {
  if (!snapshot?.competitions?.length) return fallbackCompetitions;
  return snapshot.competitions.map(entry => ({
    edition: entry.edition,
    year: entry.year,
    label: entry.label,
    highlights: Array.isArray(entry.highlights)
      ? (entry.highlights as CompetitionEntry["highlights"])
      : [],
  }));
}
