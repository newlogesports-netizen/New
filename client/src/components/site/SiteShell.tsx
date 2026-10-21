import { ArrowUpRight, Instagram, Menu, Shield, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { INSTAGRAM_URL, OFFICIAL_LOGO } from "@shared/newlogData";
import { trpc } from "@/lib/trpc";

const navItems = [
  ["História", "/historia"],
  ["Ranking", "/ranking"],
  ["Times", "/times"],
  ["Jogadores", "/jogadores"],
  ["Copas", "/copas"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const logo = snapshot.data?.settings.logo_url || OFFICIAL_LOGO;
  const instagram = snapshot.data?.settings.instagram_url || INSTAGRAM_URL;
  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <img src={logo} alt="Newlog Esportes" className="brand__logo" />
          <span className="brand__name">
            NEWLOG <em>ESPORTES</em>
          </span>
        </Link>
        <nav
          className={`site-nav ${open ? "site-nav--open" : ""}`}
          aria-label="Navegação principal"
        >
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="site-nav__admin"
            onClick={() => setOpen(false)}
          >
            Painel <ArrowUpRight size={14} />
          </Link>
        </nav>
        <div className="site-header__actions">
          <a
            className="icon-link"
            href={instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram Newlog Esportes"
          >
            <Instagram size={17} />
          </a>
          <button
            className="menu-button"
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen(value => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const logo = snapshot.data?.settings.logo_url || OFFICIAL_LOGO;
  const instagram = snapshot.data?.settings.instagram_url || INSTAGRAM_URL;
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <div className="brand brand--footer">
            <img src={logo} alt="" className="brand__logo" />
            <span className="brand__name">
              NEWLOG <em>ESPORTES</em>
            </span>
          </div>
          <p className="footer-copy">
            Arquivo, competição e comunidade. A história registrada rodada a
            rodada.
          </p>
        </div>
        <div className="footer-links">
          <span className="eyebrow">Navegar</span>
          <Link href="/historia">História</Link>
          <Link href="/ranking">Ranking geral</Link>
          <Link href="/times">Times</Link>
          <Link href="/admin">Administração</Link>
        </div>
        <div className="footer-links">
          <span className="eyebrow">Conectar</span>
          <a href={instagram} target="_blank" rel="noreferrer">
            Instagram <ArrowUpRight size={14} />
          </a>
          <span className="muted-text">
            Dados-fonte: COPANEWLOG-HISTÓRIA.xlsx
          </span>
        </div>
      </div>
      <div className="shell site-footer__bottom">
        <span>© {new Date().getFullYear()} Newlog Esportes</span>
        <span className="footer-watermark">
          <Shield size={12} /> Marca-d'água da desenvolvedora não configurada
        </span>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
