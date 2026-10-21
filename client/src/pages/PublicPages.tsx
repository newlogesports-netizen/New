import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDashed,
  FileSpreadsheet,
  Filter,
  Flag,
  Goal,
  Search,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { competitions, teamDirectory, workbookFacts } from "@shared/newlogData";
import {
  DataSourceNote,
  PageIntro,
  ScoreBar,
  SectionHeading,
  TeamMark,
} from "@/components/site/SitePrimitives";
import { trpc } from "@/lib/trpc";
import {
  competitionsFromSnapshot,
  playersFromSnapshot,
  rankingFromSnapshot,
} from "@/lib/publicSnapshot";

export function HistoryPage() {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const liveCompetitions = competitionsFromSnapshot(snapshot.data);
  return (
    <>
      <PageIntro
        kicker="O arquivo"
        title="A história das Copas Newlog."
        text="Uma linha do tempo construída a partir da planilha oficial, com dez edições registradas e novos capítulos já preparados."
      />
      <section className="shell history-layout">
        <div className="history-main">
          <DataSourceNote>
            Fonte analisada: 8 abas na planilha oficial, preservada sem
            alterações.
          </DataSourceNote>
          {liveCompetitions.map(edition => (
            <article className="history-entry" key={edition.edition}>
              <div className="history-entry__marker">
                <span>{String(edition.edition).padStart(2, "0")}</span>
                <i />
              </div>
              <div className="history-entry__body">
                <div className="history-entry__meta">
                  <span className="eyebrow">
                    {edition.year ?? "Sem ano informado"}
                  </span>
                  <span className="edition-chip">{edition.label}</span>
                </div>
                <h2>{edition.edition}ª Copa Newlog</h2>
                <p>Destaques registrados nesta edição no arquivo histórico.</p>
                <div className="highlight-chips">
                  {edition.highlights.map(highlight => (
                    <span key={`${edition.edition}-${highlight.name}`}>
                      <b>{highlight.role}</b>
                      {highlight.name}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="history-aside">
          <div className="aside-card aside-card--dark">
            <span className="eyebrow">Recorte do arquivo</span>
            <strong>
              2022<span>—</span>2026
            </strong>
            <p>Período coberto pelas dez Copas listadas na aba de destaques.</p>
          </div>
          <div className="aside-card">
            <span className="eyebrow">Também disponível</span>
            <Link href="/ranking" className="aside-link">
              Ranking geral <ArrowUpRight size={16} />
            </Link>
            <Link href="/jogadores" className="aside-link">
              Maiores no geral <ArrowUpRight size={16} />
            </Link>
            <Link href="/copas" className="aside-link">
              Tabelas e edições <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}

export function RankingPage() {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const liveRanking = rankingFromSnapshot(snapshot.data);
  const [query, setQuery] = useState("");
  const filtered = liveRanking.filter(team =>
    team.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <PageIntro
        kicker="Ranking geral Newlog"
        title="A tabela que conecta cada edição."
        text="Pontuação consolidada encontrada na planilha oficial. Traços e lacunas foram preservados como ausência de registro."
      />
      <section className="shell section-block">
        <div className="toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar time"
              aria-label="Buscar time no ranking"
            />
          </label>
          <span className="toolbar__result">
            <Filter size={15} /> {filtered.length} times
          </span>
        </div>
        <div className="ranking-table">
          <div className="ranking-table__head">
            <span>#</span>
            <span>Time</span>
            <span className="hide-mobile">Edições e ligas</span>
            <span>Total</span>
          </div>
          {filtered.map(team => (
            <div className="ranking-table__row" key={team.name}>
              <span className={`rank-badge rank-badge--${team.rank}`}>
                {String(team.rank).padStart(2, "0")}
              </span>
              <span className="ranking-team">
                <TeamMark entry={team} size="md" />
                <b>{team.name}</b>
              </span>
              <span className="score-cells hide-mobile">
                {team.scores.map((score, index) => (
                  <span
                    key={`${team.name}-${index}`}
                    className={score === null ? "is-empty" : ""}
                  >
                    {score ?? "—"}
                  </span>
                ))}
              </span>
              <span className="ranking-total">
                <strong>{team.points}</strong>
                <small>pts</small>
              </span>
            </div>
          ))}
        </div>
        <DataSourceNote>
          Os pontos foram importados da aba “RANKING GERAL NEWLOG”.
        </DataSourceNote>
      </section>
    </>
  );
}

export function TeamsPage() {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const liveTeams = snapshot.data?.teams?.length
    ? snapshot.data.teams.map(team => ({ name: team.name, logo: team.logoUrl }))
    : teamDirectory;
  const [query, setQuery] = useState("");
  const filtered = liveTeams.filter(team =>
    team.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <PageIntro
        kicker="Times e escudos"
        title="Quem faz a competição acontecer."
        text="Os escudos abaixo são os arquivos recebidos no pacote oficial. Times sem escudo correspondente permanecem identificados, sem substituição inventada."
      />
      <section className="shell section-block">
        <div className="toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar time"
              aria-label="Buscar time"
            />
          </label>
          <span className="toolbar__result">
            <Flag size={15} /> {filtered.length} nomes no diretório
          </span>
        </div>
        <div className="team-directory">
          {filtered.map(team => (
            <article className="team-card" key={team.name}>
              <div className="team-card__logo">
                <TeamMark entry={team} size="lg" />
              </div>
              <div>
                <span className="eyebrow">Arquivo Newlog</span>
                <h2>{team.name}</h2>
                <p>
                  {team.logo
                    ? "Escudo oficial recebido"
                    : "Escudo ainda não fornecido"}
                </p>
              </div>
              <ArrowUpRight size={17} className="team-card__arrow" />
            </article>
          ))}
        </div>
        <DataSourceNote>
          Arquivos originais preservados no storage do projeto. Proporções não
          são alteradas.
        </DataSourceNote>
      </section>
    </>
  );
}

export function PlayersPage() {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const [metric, setMetric] = useState<"participations" | "goals">(
    "participations"
  );
  const entries = playersFromSnapshot(
    snapshot.data,
    metric === "goals" ? "Gols" : "Participações"
  );
  return (
    <>
      <PageIntro
        kicker="Maiores no geral"
        title="As marcas que ficaram."
        text="Recortes de participações e gols encontrados na aba “MAIORES NO GERAL”. A origem de cada registro permanece identificada."
      />
      <section className="shell section-block">
        <div
          className="metric-tabs"
          role="tablist"
          aria-label="Métricas históricas"
        >
          <button
            className={metric === "participations" ? "is-active" : ""}
            onClick={() => setMetric("participations")}
          >
            <BarChart3 size={16} /> Participações
          </button>
          <button
            className={metric === "goals" ? "is-active" : ""}
            onClick={() => setMetric("goals")}
          >
            <Goal size={16} /> Gols
          </button>
        </div>
        <div className="player-list">
          {entries.map(player => (
            <div className="player-row" key={`${metric}-${player.name}`}>
              <span className="player-row__rank">
                {String(player.position).padStart(2, "0")}
              </span>
              <div className="player-row__avatar">
                {player.name.slice(0, 1)}
              </div>
              <strong>{player.name}</strong>
              <span className="player-row__line" />
              <span className="player-row__value">
                {player.value}
                <small>{metric === "goals" ? " gols" : " copas"}</small>
              </span>
            </div>
          ))}
        </div>
        <DataSourceNote>
          Não há imagens de jogadores no pacote recebido; o painel está
          preparado para receber fotos depois.
        </DataSourceNote>
      </section>
    </>
  );
}

export function CompetitionsPage() {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const liveCompetitions = competitionsFromSnapshot(snapshot.data);
  const [selected, setSelected] = useState(
    competitions[competitions.length - 1].edition
  );
  const current =
    liveCompetitions.find(edition => edition.edition === selected) ??
    liveCompetitions[0];
  return (
    <>
      <PageIntro
        kicker="Copas Newlog"
        title="Cada edição tem seu capítulo."
        text="Navegue pelos destaques individuais registrados na aba oficial de Copas. Resultados detalhados podem ser adicionados ao CMS quando revisados."
      />
      <section className="shell competition-layout">
        <aside className="edition-nav">
          <span className="eyebrow">Edições</span>
          {liveCompetitions.map(edition => (
            <button
              className={edition.edition === selected ? "is-active" : ""}
              key={edition.edition}
              onClick={() => setSelected(edition.edition)}
            >
              <span>{String(edition.edition).padStart(2, "0")}</span>
              {edition.label}
              <ArrowUpRight size={14} />
            </button>
          ))}
        </aside>
        <div className="competition-detail">
          <div className="competition-detail__top">
            <div>
              <span className="eyebrow">
                {current.year ?? "Ano não informado"} · arquivo oficial
              </span>
              <h2>{current.label.replace("ºCOPA", "ª Copa")}</h2>
            </div>
            <Trophy size={28} />
          </div>
          <p className="competition-detail__lead">
            Destaques individuais listados para esta edição, preservando a
            posição registrada na fonte.
          </p>
          <div className="highlight-table">
            {current.highlights.map((highlight, index) => (
              <div key={`${current.edition}-${highlight.name}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{highlight.role}</b>
                <strong>{highlight.name}</strong>
              </div>
            ))}
          </div>
          <DataSourceNote>Fonte: TIMES E DESTAQUES DAS COPAS.</DataSourceNote>
        </div>
      </section>
    </>
  );
}

export function AboutPage() {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const aboutPage = snapshot.data?.pages.find(page => page.slug === "sobre");
  const aboutBlock = Array.isArray(aboutPage?.blocks)
    ? (aboutPage.blocks.find(
        block => typeof block === "object" && block && "text" in block
      ) as { text?: string; title?: string } | undefined)
    : undefined;
  return (
    <>
      <PageIntro
        kicker="Sobre a instituição"
        title="Competição, comunidade e arquivo."
        text="A página institucional está pronta para receber a redação oficial da Newlog Esportes pelo painel administrativo."
      />
      <section className="shell about-grid">
        <div className="about-copy">
          <span className="eyebrow">Conteúdo editorial</span>
          <h2>
            {aboutBlock?.title ??
              "O que está confirmado nos materiais recebidos."}
          </h2>
          <p>
            {aboutBlock?.text ??
              "A planilha enviada registra oito abas de dados, dez Copas históricas, rankings gerais e listas de participantes para as próximas edições. O site organiza esse conteúdo em uma leitura pública, com a fonte sempre identificada."}
          </p>
          <p>
            Textos institucionais adicionais, contatos e marca-d'água da
            desenvolvedora permanecem como campos editáveis no CMS, aguardando
            materiais oficiais.
          </p>
          <Link className="button button--primary" href="/admin">
            Abrir painel <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="about-facts">
          <div>
            <FileSpreadsheet size={20} />
            <strong>{workbookFacts.sheetCount}</strong>
            <span>abas analisadas</span>
          </div>
          <div>
            <Trophy size={20} />
            <strong>{workbookFacts.historicalCups}</strong>
            <span>Copas registradas</span>
          </div>
          <div>
            <CircleDashed size={20} />
            <strong>{workbookFacts.rankingTeams}</strong>
            <span>times no ranking</span>
          </div>
        </div>
      </section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <section className="shell empty-page">
      <span className="eyebrow">404 / fora do arquivo</span>
      <h1>Esta página ainda não entrou em campo.</h1>
      <p>O endereço não corresponde a uma página publicada.</p>
      <Link href="/" className="button button--primary">
        Voltar ao início <ArrowUpRight size={16} />
      </Link>
    </section>
  );
}
