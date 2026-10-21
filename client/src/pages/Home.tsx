import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Instagram,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";
import { workbookFacts } from "@shared/newlogData";
import {
  DataSourceNote,
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

export default function Home() {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const liveRanking = rankingFromSnapshot(snapshot.data);
  const livePlayers = playersFromSnapshot(snapshot.data, "Gols");
  const liveCompetitions = competitionsFromSnapshot(snapshot.data);
  const topTeams = liveRanking.slice(0, 5);
  const topGoals = livePlayers.slice(0, 3);
  return (
    <>
      <section className="hero shell">
        <div className="hero__copy">
          <span className="eyebrow hero__eyebrow">
            Arquivo oficial · 2022—2026
          </span>
          <h1>
            A história é feita <span>rodada</span> a rodada.
          </h1>
          <p>
            Um arquivo vivo das Copas Newlog Esportes: times, jogadores,
            rankings e momentos que seguem em jogo.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/historia">
              Explorar a história <ArrowUpRight size={16} />
            </Link>
            <Link className="button button--text" href="/ranking">
              Ver ranking geral <ArrowDownRight size={16} />
            </Link>
          </div>
          <div className="hero__proof">
            <span className="proof-number">{workbookFacts.historicalCups}</span>
            <span>
              edições históricas
              <br />
              registradas
            </span>
          </div>
        </div>
        <div className="hero__visual" aria-label="Identidade Newlog Esportes">
          <div className="hero__grid-lines" />
          <div className="hero__orb hero__orb--one" />
          <div className="hero__orb hero__orb--two" />
          <div className="hero__wordmark" aria-hidden="true">
            <span>NEWLOG</span>
            <em>ESPORTES</em>
          </div>
          <div className="hero__field-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="hero__stamp">
            <span>NL</span>
            <small>
              ARQUIVO
              <br />
              OFICIAL
            </small>
          </div>
          <div className="hero__caption">
            <span>NEWLOG / 001</span>
            <span>FUTEBOL 7</span>
          </div>
        </div>
      </section>

      <section className="signal-strip">
        <div className="shell signal-strip__inner">
          <div>
            <span className="eyebrow">Leitura rápida</span>
            <strong>{workbookFacts.rankingTeams} times</strong>
            <span>no ranking geral</span>
          </div>
          <div>
            <span className="eyebrow">Arquivo</span>
            <strong>{workbookFacts.sheetCount} abas</strong>
            <span>na planilha-fonte</span>
          </div>
          <div>
            <span className="eyebrow">Próximos capítulos</span>
            <strong>11ª + 12ª</strong>
            <span>edições já listadas</span>
          </div>
          <Link href="/copas" className="signal-strip__link">
            Ver as edições <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <section className="shell section-block">
        <SectionHeading
          eyebrow="O acervo"
          title="Uma competição com memória."
          text="A planilha oficial organiza a linha do tempo, os destaques e o ranking que conecta cada edição."
          href="/historia"
          linkLabel="Linha do tempo"
        />
        <div className="story-grid">
          <div className="story-panel story-panel--dark">
            <span className="panel-index">01 / 03</span>
            <div className="story-panel__copy">
              <span className="eyebrow">Desde 2022</span>
              <h3>Dez Copas. Uma história em movimento.</h3>
              <p>
                O arquivo começa em 2022 e acompanha as edições até 2026, com
                novas listas já preparadas para a continuidade da competição.
              </p>
              <Link href="/historia" className="text-link text-link--light">
                Conhecer o acervo <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="story-timeline">
              <span>2022</span>
              <i />
              <span>2023</span>
              <i />
              <span>2025</span>
              <i />
              <span>2026</span>
            </div>
          </div>
          <div className="story-panel story-panel--stat">
            <span className="eyebrow">Líder histórico</span>
            <div className="story-panel__stat-number">{topTeams[0].points}</div>
            <p>pontos acumulados por</p>
            <div className="story-panel__team">
              <TeamMark entry={topTeams[0]} size="sm" />
              <strong>{topTeams[0].name}</strong>
            </div>
            <Link href="/ranking" className="text-link">
              Abrir ranking <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="shell section-block">
        <SectionHeading
          eyebrow="Ranking geral Newlog"
          title="Quem está no topo?"
          text="Pontuação consolidada das competições registradas na fonte oficial."
          href="/ranking"
          linkLabel="Ranking completo"
        />
        <div className="ranking-preview">
          <div className="ranking-preview__head">
            <span>POSIÇÃO / TIME</span>
            <span>PONTOS</span>
          </div>
          {topTeams.map(team => (
            <div className="ranking-row" key={team.name}>
              <span className="ranking-row__position">
                {String(team.rank).padStart(2, "0")}
              </span>
              <TeamMark entry={team} size="sm" />
              <span className="ranking-row__name">{team.name}</span>
              <ScoreBar value={team.points} />
              <strong>{team.points}</strong>
            </div>
          ))}
        </div>
        <DataSourceNote />
      </section>

      <section className="shell section-block">
        <SectionHeading
          eyebrow="Marcas individuais"
          title="Quem deixou sua marca."
          text="Os maiores registros gerais disponíveis na aba de histórico de jogadores."
          href="/jogadores"
          linkLabel="Ver jogadores"
        />
        <div className="player-leaders">
          <div className="leader-card leader-card--featured">
            <span className="eyebrow">Artilharia histórica</span>
            <div className="leader-card__number">{topGoals[0].value}</div>
            <h3>{topGoals[0].name}</h3>
            <p>gols registrados</p>
            <Trophy className="leader-card__icon" size={28} />
          </div>
          {topGoals.slice(1).map(player => (
            <div className="leader-card" key={player.name}>
              <span className="eyebrow">#{player.position} · artilharia</span>
              <div className="leader-card__number">{player.value}</div>
              <h3>{player.name}</h3>
              <p>gols registrados</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div className="shell home-cta__inner">
          <div>
            <span className="eyebrow">Acompanhe a próxima rodada</span>
            <h2>O arquivo cresce quando a comunidade joga.</h2>
          </div>
          <a
            className="button button--light"
            href="https://www.instagram.com/newlogesports"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={17} /> Seguir no Instagram{" "}
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <section className="shell section-block section-block--last">
        <div className="edition-row">
          <div>
            <span className="eyebrow">Próxima leitura</span>
            <h2>As edições em destaque.</h2>
          </div>
          <div className="edition-list">
            {liveCompetitions
              .slice(-3)
              .reverse()
              .map(edition => (
                <Link
                  href="/copas"
                  className="edition-item"
                  key={edition.edition}
                >
                  <span>{String(edition.edition).padStart(2, "0")}</span>
                  <strong>{edition.label.replace("ºCOPA", "ª COPA")}</strong>
                  <CalendarDays size={16} />
                  <ChevronRight size={16} />
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
