import { ArrowUpRight, Instagram, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { INSTAGRAM_URL, OFFICIAL_LOGO } from "@shared/newlogData";
import { trpc } from "@/lib/trpc";

const WR_LOGO = "/assets/newlog/wr-icon.png";

const navItems = [
  ["História", "/historia"],
  ["Ranking", "/ranking"],
  ["Times", "/times"],
  ["Jogadores", "/jogadores"],
  ["Copas", "/copas"],
  ["Arquivo completo", "/arquivo"],
] as const;

function publicMenuItems(value: unknown) {
  const fallback = navItems.map(([label, href]) => ({ label, href }));
  if (!Array.isArray(value)) return fallback;
  const items = value.filter(
    (item): item is { label: string; href: string } =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { label?: unknown }).label === "string" &&
      typeof (item as { href?: unknown }).href === "string"
  );
  return items.length ? items : fallback;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  const logo = snapshot.data?.settings.logo_url || OFFICIAL_LOGO;
  const instagram = snapshot.data?.settings.instagram_url || INSTAGRAM_URL;
  const primaryMenu = snapshot.data?.menus?.find(
    menu => menu.location === "primary"
  );
  const links = publicMenuItems(primaryMenu?.items);
  const visibleLinks = links.some(item => item.href === "/arquivo")
    ? links
    : [...links, { label: "Arquivo completo", href: "/arquivo" }];
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
          {visibleLinks.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
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
          <Link href="/arquivo">Arquivo completo</Link>
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
              <img src={WR_LOGO} alt="WR" /> Desenvolvido por WR
            </span>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    staleTime: 60_000,
  });
  useEffect(() => {
    const title = snapshot.data?.settings.site_name || "Newlog Esportes";
    const description =
      snapshot.data?.settings.site_description ||
      "Arquivo oficial Newlog Esportes.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
    const root = document.documentElement;
    if (snapshot.data?.settings.primary_color)
      root.style.setProperty("--violet", snapshot.data.settings.primary_color);
    if (snapshot.data?.settings.accent_color)
      root.style.setProperty(
        "--violet-bright",
        snapshot.data.settings.accent_color
      );
  }, [
    snapshot.data?.settings.site_name,
    snapshot.data?.settings.site_description,
    snapshot.data?.settings.primary_color,
    snapshot.data?.settings.accent_color,
  ]);
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
