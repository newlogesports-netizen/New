import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileImage,
  FileSpreadsheet,
  LayoutDashboard,
  LogIn,
  Menu as MenuIcon,
  PenSquare,
  Save,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { OFFICIAL_LOGO } from "@shared/newlogData";

const adminSections = [
  ["Dashboard", "dashboard", LayoutDashboard],
  ["Páginas", "pages", BookOpen],
  ["Publicações", "posts", PenSquare],
  ["Mídia", "media", FileImage],
  ["Aparência", "appearance", Settings2],
  ["Usuários", "users", Users],
] as const;

type Section = (typeof adminSections)[number][1];

function AdminShell({
  children,
  active,
  onChange,
}: {
  children: ReactNode;
  active: Section;
  onChange: (section: Section) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <img src={OFFICIAL_LOGO} alt="Newlog" />
          <div>
            <b>NEWLOG</b>
            <small>CMS institucional</small>
          </div>
          <button className="admin-close" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="admin-sidebar__label">Workspace</div>
        <nav>
          {adminSections.map(([label, key, Icon]) => (
            <button
              className={active === key ? "is-active" : ""}
              key={key}
              onClick={() => {
                onChange(key);
                setMobileOpen(false);
              }}
            >
              <Icon size={16} />
              {label}
              {key === "pages" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <ShieldCheck size={15} />
          <span>
            Conteúdo protegido
            <br />
            por autenticação
          </span>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu" onClick={() => setMobileOpen(true)}>
            <MenuIcon size={20} />
          </button>
          <div>
            <span className="eyebrow">Administração</span>
            <h1>Newlog Esportes</h1>
          </div>
          <Link href="/" className="admin-back">
            <ArrowLeft size={15} /> Ver site
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}

function LoginState() {
  return (
    <div className="admin-login">
      <div className="admin-login__mark">
        <img src={OFFICIAL_LOGO} alt="Newlog Esportes" />
      </div>
      <span className="eyebrow">Área restrita</span>
      <h1>O arquivo por trás do site.</h1>
      <p>
        Entre com sua conta Manus para editar páginas, configurações e conteúdo
        publicado.
      </p>
      <button className="button button--primary" onClick={() => startLogin()}>
        <LogIn size={16} /> Entrar para administrar
      </button>
      <Link href="/" className="text-link">
        Voltar ao site <ArrowLeft size={15} />
      </Link>
    </div>
  );
}

export default function AdminPage() {
  const me = trpc.auth.me.useQuery();
  const isAdmin = me.data?.role === "admin";
  const dashboard = trpc.admin.dashboard.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const snapshot = trpc.public.snapshot.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const [active, setActive] = useState<Section>("dashboard");
  const [editing, setEditing] = useState<number | undefined>();
  const [pageTitle, setPageTitle] = useState("Nova página");
  const [pageSlug, setPageSlug] = useState("nova-pagina");
  const [pageExcerpt, setPageExcerpt] = useState("");
  const [pageText, setPageText] = useState("");
  const [instagram, setInstagram] = useState("");
  const [description, setDescription] = useState("");
  const savePage = trpc.admin.savePage.useMutation({
    onSuccess: () => {
      toast.success("Página salva no banco de dados.");
      dashboard.refetch();
      setActive("pages");
    },
    onError: error => toast.error(error.message),
  });
  const updateSetting = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      toast.success("Configuração atualizada.");
      snapshot.refetch();
    },
    onError: error => toast.error(error.message),
  });
  const settings = snapshot.data?.settings ?? {};
  useEffect(() => {
    if (settings.instagram_url && !instagram)
      setInstagram(settings.instagram_url);
    if (settings.site_description && !description)
      setDescription(settings.site_description);
  }, [settings.instagram_url, settings.site_description]);

  if (me.isLoading)
    return (
      <div className="admin-loading">
        <span className="loader" />
        Verificando acesso...
      </div>
    );
  if (!me.data) return <LoginState />;
  if (!isAdmin)
    return (
      <div className="admin-login">
        <ShieldCheck size={42} />
        <span className="eyebrow">Acesso limitado</span>
        <h1>Seu perfil ainda não administra o site.</h1>
        <p>
          O acesso ao CMS é concedido pelo superadministrador. Seu usuário foi
          autenticado, mas não recebeu a função administrativa.
        </p>
        <Link href="/" className="button button--outline">
          Voltar ao site
        </Link>
      </div>
    );

  const counts = dashboard.data?.counts ?? {
    publishedPages: 0,
    drafts: 0,
    publications: 0,
    media: 0,
  };
  const pages = dashboard.data?.pages ?? [];

  const openNewPage = () => {
    setEditing(undefined);
    setPageTitle("Nova página");
    setPageSlug("nova-pagina");
    setPageExcerpt("");
    setPageText("");
    setActive("pages");
  };
  const openPage = (page: (typeof pages)[number]) => {
    setEditing(page.id);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageExcerpt(page.excerpt ?? "");
    const block = Array.isArray(page.blocks)
      ? (page.blocks.find(
          item => typeof item === "object" && item && "text" in item
        ) as { text?: string } | undefined)
      : undefined;
    setPageText(block?.text ?? "");
    setActive("pages");
  };
  const handleSavePage = (status: "draft" | "published") =>
    savePage.mutate({
      id: editing,
      title: pageTitle,
      slug: pageSlug,
      excerpt: pageExcerpt,
      status,
      seoTitle: pageTitle,
      seoDescription: pageExcerpt,
      blocks: [{ type: "text", title: pageTitle, text: pageText }],
    });
  const handleSettings = async () => {
    if (instagram)
      await updateSetting.mutateAsync({
        key: "instagram_url",
        value: instagram,
      });
    if (description)
      await updateSetting.mutateAsync({
        key: "site_description",
        value: description,
      });
  };

  return (
    <AdminShell active={active} onChange={setActive}>
      <div className="admin-content">
        {active === "dashboard" && (
          <>
            <div className="admin-heading">
              <div>
                <span className="eyebrow">Visão geral</span>
                <h2>Bom trabalho, {me.data.name?.split(" ")[0] ?? "admin"}.</h2>
                <p>
                  O conteúdo público e o CMS compartilham a mesma fonte de
                  dados.
                </p>
              </div>
              <button className="button button--primary" onClick={openNewPage}>
                <PenSquare size={16} /> Criar página
              </button>
            </div>
            <div className="admin-stat-grid">
              <div>
                <span className="eyebrow">Páginas publicadas</span>
                <strong>{counts.publishedPages}</strong>
                <small>
                  <CheckCircle2 size={13} /> Persistentes
                </small>
              </div>
              <div>
                <span className="eyebrow">Rascunhos</span>
                <strong>{counts.drafts}</strong>
                <small>
                  <PenSquare size={13} /> Em revisão
                </small>
              </div>
              <div>
                <span className="eyebrow">Publicações</span>
                <strong>{counts.publications}</strong>
                <small>
                  <BarChart3 size={13} /> No banco
                </small>
              </div>
              <div>
                <span className="eyebrow">Mídia indexada</span>
                <strong>{counts.media}</strong>
                <small>
                  <FileImage size={13} /> Storage
                </small>
              </div>
            </div>
            <div className="admin-columns">
              <div className="admin-card">
                <div className="admin-card__header">
                  <div>
                    <span className="eyebrow">Atividade editorial</span>
                    <h3>Páginas recentes</h3>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => setActive("pages")}
                  >
                    Ver páginas <ChevronRight size={15} />
                  </button>
                </div>
                {pages.slice(0, 5).map(page => (
                  <button
                    className="admin-list-row"
                    key={page.id}
                    onClick={() => openPage(page)}
                  >
                    <span className={`status-dot status-dot--${page.status}`} />
                    <span>
                      <b>{page.title}</b>
                      <small>/{page.slug}</small>
                    </span>
                    <span className="admin-row-status">
                      {page.status === "published"
                        ? "Publicado"
                        : page.status === "draft"
                          ? "Rascunho"
                          : "Arquivado"}
                    </span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
              <div className="admin-card admin-card--dark">
                <div className="admin-card__header">
                  <div>
                    <span className="eyebrow">Importação</span>
                    <h3>Fonte de dados</h3>
                  </div>
                  <FileSpreadsheet size={21} />
                </div>
                <p>
                  A planilha oficial foi analisada e o inventário inicial está
                  registrado para revisão.
                </p>
                <div className="import-summary">
                  <strong>
                    {dashboard.data?.imports[0]?.summary &&
                    typeof dashboard.data.imports[0].summary === "object" &&
                    "sheets" in dashboard.data.imports[0].summary
                      ? String(
                          (
                            dashboard.data.imports[0].summary as {
                              sheets: number;
                            }
                          ).sheets
                        )
                      : "8"}
                  </strong>
                  <span>abas preservadas</span>
                </div>
                <button
                  className="button button--light"
                  onClick={() => setActive("media")}
                >
                  Abrir biblioteca{" "}
                  <ArrowLeft size={15} className="rotate-180" />
                </button>
              </div>
            </div>
          </>
        )}
        {active === "pages" && (
          <div className="admin-editor">
            <div className="admin-heading">
              <div>
                <span className="eyebrow">Conteúdo / Páginas</span>
                <h2>{editing ? "Editar página" : "Criar página"}</h2>
                <p>Editor seguro por blocos. O conteúdo será salvo no banco.</p>
              </div>
              <button
                className="button button--outline"
                onClick={() => setActive("dashboard")}
              >
                <ArrowLeft size={15} /> Voltar
              </button>
            </div>
            <div className="editor-layout">
              <div className="editor-canvas">
                <label>
                  Título
                  <input
                    value={pageTitle}
                    onChange={event => setPageTitle(event.target.value)}
                  />
                </label>
                <label>
                  Slug
                  <input
                    value={pageSlug}
                    onChange={event => setPageSlug(event.target.value)}
                  />
                </label>
                <label>
                  Resumo
                  <textarea
                    rows={3}
                    value={pageExcerpt}
                    onChange={event => setPageExcerpt(event.target.value)}
                  />
                </label>
                <label>
                  Bloco de texto
                  <textarea
                    rows={12}
                    value={pageText}
                    onChange={event => setPageText(event.target.value)}
                    placeholder="Escreva o conteúdo desta seção..."
                  />
                </label>
                <div className="editor-actions">
                  <button
                    className="button button--outline"
                    onClick={() => handleSavePage("draft")}
                    disabled={savePage.isPending}
                  >
                    <Save size={15} /> Salvar rascunho
                  </button>
                  <button
                    className="button button--primary"
                    onClick={() => handleSavePage("published")}
                    disabled={savePage.isPending}
                  >
                    <CheckCircle2 size={15} /> Publicar
                  </button>
                </div>
              </div>
              <aside className="editor-sidebar">
                <span className="eyebrow">Páginas publicadas</span>
                {pages.map(page => (
                  <button onClick={() => openPage(page)} key={page.id}>
                    <span>{page.title}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </aside>
            </div>
          </div>
        )}
        {active === "appearance" && (
          <div className="admin-editor">
            <div className="admin-heading">
              <div>
                <span className="eyebrow">Configurações gerais</span>
                <h2>A identidade no controle.</h2>
                <p>
                  Alterações salvas aqui alimentam o site público por meio do
                  banco.
                </p>
              </div>
            </div>
            <div className="settings-grid">
              <div className="settings-preview">
                <img
                  src={settings.logo_url || OFFICIAL_LOGO}
                  alt="Logo institucional"
                />
                <span className="eyebrow">Logo institucional</span>
                <h3>Arquivo oficial preservado</h3>
                <p>
                  O campo de marca-d'água da desenvolvedora está preparado, mas
                  ainda não foi configurado.
                </p>
              </div>
              <div className="editor-canvas">
                <label>
                  Instagram oficial
                  <input
                    value={instagram}
                    onChange={event => setInstagram(event.target.value)}
                  />
                </label>
                <label>
                  Descrição padrão do site
                  <textarea
                    rows={5}
                    value={description}
                    onChange={event => setDescription(event.target.value)}
                  />
                </label>
                <button
                  className="button button--primary"
                  onClick={handleSettings}
                  disabled={updateSetting.isPending}
                >
                  <Save size={15} /> Salvar configurações
                </button>
              </div>
            </div>
          </div>
        )}
        {active === "media" && (
          <div className="admin-editor">
            <div className="admin-heading">
              <div>
                <span className="eyebrow">Biblioteca de mídia</span>
                <h2>Arquivos indexados.</h2>
                <p>
                  Os ativos oficiais estão em storage durável e vinculados aos
                  registros do CMS.
                </p>
              </div>
            </div>
            <div className="media-grid">
              {(dashboard.data?.media ?? []).map(asset => (
                <div className="media-card" key={asset.id}>
                  <div className="media-card__thumb">
                    <img
                      src={asset.storagePath}
                      alt={asset.altText ?? asset.title}
                    />
                  </div>
                  <b>{asset.title}</b>
                  <small>
                    {asset.folder ?? "sem pasta"} · {asset.mimeType}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
        {(active === "posts" || active === "users") && (
          <div className="admin-empty">
            <span className="eyebrow">Módulo preparado</span>
            <h2>
              {active === "posts" ? "Publicações" : "Usuários e permissões"}
            </h2>
            <p>
              O módulo está conectado à arquitetura do CMS e aguardando os
              próximos registros oficiais. As tabelas e permissões estão
              protegidas no servidor.
            </p>
            <button
              className="button button--outline"
              onClick={() => setActive("dashboard")}
            >
              Voltar ao dashboard
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
