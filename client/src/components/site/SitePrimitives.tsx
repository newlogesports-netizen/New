import { ArrowUpRight, Check, CircleDashed } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import type { RankingEntry } from "@shared/newlogData";

export function SectionHeading({
  eyebrow,
  title,
  text,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {href && (
        <Link href={href} className="text-link">
          {linkLabel ?? "Ver tudo"}
          <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function TeamMark({
  entry,
  size = "md",
}: {
  entry: Pick<RankingEntry, "name" | "logo">;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span className={`team-mark team-mark--${size}`}>
      {entry.logo ? (
        <img src={entry.logo} alt={`Escudo ${entry.name}`} />
      ) : (
        <CircleDashed size={size === "lg" ? 26 : 16} />
      )}
    </span>
  );
}

export function ScoreBar({
  value,
  max = 615,
}: {
  value: number;
  max?: number;
}) {
  return (
    <span className="score-bar">
      <span
        style={{ width: `${Math.max(4, Math.min(100, (value / max) * 100))}%` }}
      />
    </span>
  );
}

export function DataSourceNote({
  children = "Dados oficiais da planilha COPANEWLOG-HISTÓRIA.xlsx",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="source-note">
      <Check size={14} /> <span>{children}</span>
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  text,
}: {
  kicker: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-intro shell">
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
