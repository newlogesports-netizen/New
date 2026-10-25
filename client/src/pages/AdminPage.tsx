import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileImage,
  FileSpreadsheet,
  GripVertical,
  Inbox,
  LayoutDashboard,
  LogIn,
  Mail,
  List,
  Menu as MenuIcon,
  PenSquare,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { requestAdminMagicLink } from "@/lib/supabase";
import { OFFICIAL_LOGO } from "@shared/newlogData";

const adminSections = [
  ["Dashboard", "dashboard", LayoutDashboard],
  ["Páginas", "pages", BookOpen],
  ["Publicações", "posts", PenSquare],
  ["Mídia", "media", FileImage],
  ["Menus", "menus", List],
  ["Formulários", "forms", Inbox],
  ["Aparência", "appearance", Settings2],
  ["Usuários", "users", Users],
] as const;

type Section = (typeof adminSections)[number][1];

type EditorBlockType =
  | "text" | "hero" | "heading" | "image" | "gallery" | "banner" | "button"
  | "columns" | "video" | "list" | "cards" | "teams" | "news" | "events"
  | "social" | "separator" | "spacer" | "section";

type EditorBlock = {
  id: string;
  type: EditorBlockType;
  title?: string;
  text?: string;
  imageUrl?: string;
  href?: string;
};

const blockOptions: [EditorBlockType, string][] = [
  ["heading", "Título"],
  ["text", "Texto"],
  ["hero", "Hero"],
  ["image", "Imagem"],
  ["gallery", "Galeria"],
  ["button", "Botão"],
  ["teams", "Times"],
  ["news", "Notícias"],
  ["events", "Eventos"],
  ["separator", "Separador"],
];

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
  const [email, setEmail] = useState(
    import.meta.env.VITE_ADMIN_EMAIL || "newlogesports@gmail.com"
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setSending(true);
    setError("");
    try {
      await requestAdminMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o link.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__mark">
        <img src={OFFICIAL_LOGO} alt="Newlog Esportes" />
      </div>
      <span className="eyebrow">Área restrita</span>
      <h1>O arquivo por trás do site.</h1>
      <p>
        Entre com a conta autorizada do Supabase para editar páginas,
        configurações e conteúdo publicado.
      </p>
      <label className="admin-login__field">
        <Mail size={16} />
        <input
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
        />
      </label>
      <button className="button button--primary" onClick={handleLogin} disabled={sending || !email.includes("@")}>
        <LogIn size={16} /> {sending ? "Enviando…" : "Enviar link de acesso"}
      </button>
      {sent && <p className="admin-login__success">Link enviado. Confira o e-mail para entrar.</p>}
      {error && <p className="admin-login__error">{error}</p>}
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
  const [pageBlockType, setPageBlockType] = useState("text");
  const [pageBlockImage, setPageBlockImage] = useState("");
  const [pageBlockHref, setPageBlockHref] = useState("");
  const [pageBlocks, setPageBlocks] = useState<EditorBlock[]>([
    { id: "block-1", type: "text", title: "", text: "" },
  ]);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("block-1");
  const [postEditing, setPostEditing] = useState<number | undefined>();
  const [postTitle, setPostTitle] = useState("Nova publicação");
  const [postSlug, setPostSlug] = useState("nova-publicacao");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postContent, setPostContent] = useState("");
  const [instagram, setInstagram] = useState("");
  const [description, setDescription] = useState("");
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#15156b");
  const [accentColor, setAccentColor] = useState("#8fbce8");
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
  const savePublication = trpc.admin.savePublication.useMutation({
    onSuccess: () => {
      toast.success("Publicação salva no banco de dados.");
      dashboard.refetch();
      setActive("posts");
    },
    onError: error => toast.error(error.message),
  });
  const usersQuery = trpc.admin.users.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const modulesQuery = trpc.admin.modules.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
  });
  const [menuName, setMenuName] = useState("Menu principal");
  const [menuItems, setMenuItems] = useState(
    "Início | /\nHistória | /historia\nRanking | /ranking"
  );
  const [formName, setFormName] = useState("Contato");
  const [formSlug, setFormSlug] = useState("contato");
  const [formFields, setFormFields] = useState(
    "Nome | text\nE-mail | email\nMensagem | textarea"
  );
  const saveMenu = trpc.admin.saveMenu.useMutation({
    onSuccess: () => {
      toast.success("Menu salvo no banco de dados.");
      modulesQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });
  const saveForm = trpc.admin.saveForm.useMutation({
    onSuccess: () => {
      toast.success("Formulário salvo no banco de dados.");
      modulesQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const registerMedia = trpc.admin.registerMedia.useMutation({
    onSuccess: () => {
      toast.success("Mídia indexada no banco.");
      setMediaTitle("");
      setMediaUrl("");
      setMediaAlt("");
      dashboard.refetch();
    },
    onError: error => toast.error(error.message),
  });
  const uploadMedia = trpc.admin.uploadMedia.useMutation({
    onSuccess: () => {
      toast.success("Arquivo enviado e persistido.");
      dashboard.refetch();
    },
    onError: error => toast.error(error.message),
  });
  const [importPreview, setImportPreview] = useState<{
    sheets: number;
    totalRows: number;
    sheetsDetail: Array<{
      name: string;
      columns: string[];
      rowCount: number;
      sample: unknown[];
    }>;
  } | null>(null);
  const [pendingImport, setPendingImport] = useState<{ fileName: string; base64: string } | null>(null);
  const previewWorkbook = trpc.admin.previewWorkbook.useMutation({
    onSuccess: data => {
      setImportPreview(data);
      toast.success("Pré-visualização gerada. Revise antes de importar.");
    },
    onError: error => toast.error(error.message),
  });
  const confirmWorkbook = trpc.admin.confirmWorkbook.useMutation({
    onSuccess: data => {
      toast.success(`${data.rankingTeams} equipes e dados de jogadores importados.`);
      setPendingImport(null);
      setImportPreview(null);
      dashboard.refetch();
    },
    onError: error => toast.error(error.message),
  });
  const settings = snapshot.data?.settings ?? {};
  useEffect(() => {
    if (settings.instagram_url && !instagram)
      setInstagram(settings.instagram_url);
    if (settings.site_description && !description)
      setDescription(settings.site_description);
    if (settings.site_name && !siteName) setSiteName(settings.site_name);
    if (settings.logo_url && !logoUrl) setLogoUrl(settings.logo_url);
    if (settings.primary_color) setPrimaryColor(settings.primary_color);
    if (settings.accent_color) setAccentColor(settings.accent_color);
  }, [
    settings.instagram_url,
    settings.site_description,
    settings.site_name,
    settings.logo_url,
    settings.primary_color,
    settings.accent_color,
  ]);

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
    setPageBlockType("text");
    setPageBlockImage("");
    setPageBlockHref("");
    const firstBlockId = `block-${Date.now()}`;
    setPageBlocks([{ id: firstBlockId, type: "text", title: "", text: "" }]);
    setSelectedBlockId(firstBlockId);
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
        ) as
          | {
              type?: string;
              text?: string;
              imageUrl?: string;
              href?: string;
            }
          | undefined)
      : undefined;
    setPageText(block?.text ?? "");
    setPageBlockType(typeof block?.type === "string" ? block.type : "text");
    setPageBlockImage(
      typeof block?.imageUrl === "string" ? block.imageUrl : ""
    );
    setPageBlockHref(typeof block?.href === "string" ? block.href : "");
    const nextBlocks =
      Array.isArray(page.blocks) && page.blocks.length
        ? page.blocks.map((item, index) => {
            const value = item as Record<string, unknown>;
            return {
              id: `block-${page.id}-${index}`,
              type: (typeof value.type === "string" ? value.type : "text") as EditorBlockType,
              title: typeof value.title === "string" ? value.title : "",
              text: typeof value.text === "string" ? value.text : "",
              imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : "",
              href: typeof value.href === "string" ? value.href : "",
            };
        })
        : [{ id: `block-${page.id}-0`, type: "text" as EditorBlockType, title: page.title, text: "" }];
    setPageBlocks(nextBlocks);
    setSelectedBlockId(nextBlocks[0]?.id ?? null);
    setActive("pages");
  };
  const moveBlock = (fromId: string, toId: string) => {
    setPageBlocks(current => {
      const from = current.findIndex(block => block.id === fromId);
      const to = current.findIndex(block => block.id === toId);
      if (from < 0 || to < 0 || from === to) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };
  const addBlock = (type = pageBlockType as EditorBlockType) => {
    const block = { id: `block-${Date.now()}`, type, title: "", text: "" };
    setPageBlocks(current => [...current, block]);
    setSelectedBlockId(block.id);
  };
  const updateBlock = (id: string | null, patch: Partial<EditorBlock>) => {
    if (!id) return;
    setPageBlocks(current => current.map(block => block.id === id ? { ...block, ...patch } : block));
  };
  const removeBlock = (id: string) => {
    setPageBlocks(current => current.filter(block => block.id !== id));
    setSelectedBlockId(current => current === id ? null : current);
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
      blocks: pageBlocks.length
        ? pageBlocks
        : [{ type: pageBlockType as EditorBlockType, title: pageTitle, text: pageText, imageUrl: pageBlockImage || undefined, href: pageBlockHref || undefined }],
    });
  const handleSettings = async () => {
    if (siteName)
      await updateSetting.mutateAsync({ key: "site_name", value: siteName });
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
    if (logoUrl)
      await updateSetting.mutateAsync({ key: "logo_url", value: logoUrl });
    if (primaryColor)
      await updateSetting.mutateAsync({
        key: "primary_color",
        value: primaryColor,
      });
    if (accentColor)
      await updateSetting.mutateAsync({
        key: "accent_color",
        value: accentColor,
      });
  };
  const handleMediaFile = (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
      toast.error("Escolha uma imagem PNG, JPEG, WebP ou GIF.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64Data = result.split(",")[1] ?? "";
      setMediaTitle(current => current || file.name);
      uploadMedia.mutate({
        title: mediaTitle || file.name,
        mimeType: file.type as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
        base64Data,
        altText: mediaAlt || undefined,
      });
    };
    reader.readAsDataURL(file);
  };
  const openNewPost = () => {
    setPostEditing(undefined);
    setPostTitle("Nova publicação");
    setPostSlug("nova-publicacao");
    setPostExcerpt("");
    setPostContent("");
    setActive("posts");
  };
  const openPost = (
    post: NonNullable<typeof dashboard.data>["publications"][number]
  ) => {
    setPostEditing(post.id);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostExcerpt(post.excerpt ?? "");
    setPostContent(post.content ?? "");
    setActive("posts");
  };
  const handleSavePost = (status: "draft" | "published") =>
    savePublication.mutate({
      id: postEditing,
      title: postTitle,
      slug: postSlug,
      excerpt: postExcerpt,
      content: postContent,
      status,
    });
  const handleSaveMenu = () =>
    saveMenu.mutate({
      name: menuName,
      location: "primary",
      status: "published",
      items: menuItems
        .split("\n")
        .map(line => line.split("|").map(value => value.trim()))
        .filter(parts => parts.length === 2 && parts[0] && parts[1])
        .map(([label, href]) => ({ label, href })),
    });
  const handleSaveForm = () =>
    saveForm.mutate({
      name: formName,
      slug: formSlug,
      active: true,
      fields: formFields
        .split("\n")
        .map(line => line.split("|").map(value => value.trim()))
        .filter(parts => parts.length === 2 && parts[0] && parts[1])
        .map(([label, type]) => ({
          name: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          label,
          type: ["text", "email", "textarea", "tel"].includes(type)
            ? (type as "text" | "email" | "textarea" | "tel")
            : "text",
        })),
    });

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
                <label className="import-file-input">
                  Pré-visualizar outra planilha
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={event => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = String(reader.result ?? "");
                        const base64 = result.split(",")[1] ?? "";
                        setPendingImport({ fileName: file.name, base64 });
                        previewWorkbook.mutate({ fileName: file.name, base64 });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {importPreview && (
                  <div className="import-preview">
                    <strong>
                      {importPreview.sheets} abas · {importPreview.totalRows}{" "}
                      linhas
                    </strong>
                    {importPreview.sheetsDetail.map(sheet => (
                      <small key={sheet.name}>
                        {sheet.name}: {sheet.rowCount} linhas ·{" "}
                        {sheet.columns.join(", ")}
                      </small>
                    ))}
                    <button
                      className="button button--primary"
                      disabled={!pendingImport || confirmWorkbook.isPending}
                      onClick={() => pendingImport && confirmWorkbook.mutate(pendingImport)}
                    >
                      {confirmWorkbook.isPending ? "Importando..." : "Confirmar e importar dados"}
                    </button>
                  </div>
                )}
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
            <div className="wp-editor">
              <div className="wp-editor__bar">
                <div className="wp-editor__tabs"><button className="is-active">Editor visual</button><button>Configurações</button></div>
                <div className="wp-editor__bar-actions"><span className="wp-save-state">Rascunho não salvo</span><button className="button button--outline" onClick={() => handleSavePage("draft")}><Save size={14} /> Salvar</button><button className="button button--primary" onClick={() => handleSavePage("published")}><CheckCircle2 size={14} /> Publicar</button></div>
              </div>
              <div className="wp-editor__body">
                <aside className="wp-block-library">
                  <div className="wp-panel-title"><span>Inserir bloco</span><small>Arraste ou clique</small></div>
                  <div className="wp-block-library__grid">
                    {blockOptions.map(([type, label]) => <button key={type} onClick={() => addBlock(type)}><span className={`wp-block-icon wp-block-icon--${type}`}>{type === "text" ? "T" : type === "image" ? "▧" : type === "button" ? "↗" : type === "separator" ? "—" : "+"}</span>{label}</button>)}
                  </div>
                  <div className="wp-library-help"><strong>Como editar</strong><span>Selecione um bloco no canvas. Arraste pelo ícone para reorganizar. Edite os detalhes no painel da direita.</span></div>
                </aside>
                <main className="wp-canvas-wrap">
                  <div className="wp-canvas-toolbar"><label>Título da página<input value={pageTitle} onChange={event => setPageTitle(event.target.value)} /></label><button title="Pré-visualizar">◉ Visualizar</button></div>
                  <div className="wp-canvas-page">
                    <input className="wp-page-title" value={pageTitle} onChange={event => setPageTitle(event.target.value)} placeholder="Adicionar título" />
                    <textarea className="wp-page-excerpt" rows={2} value={pageExcerpt} onChange={event => setPageExcerpt(event.target.value)} placeholder="Escreva uma descrição curta para esta página..." />
                    <div className="wp-block-stack">
                      {pageBlocks.map((block, index) => {
                        const label = blockOptions.find(item => item[0] === block.type)?.[1] ?? block.type;
                        return <div key={block.id} className={`wp-block-card ${selectedBlockId === block.id ? "is-selected" : ""}`} onClick={() => setSelectedBlockId(block.id)} draggable onDragStart={() => setDraggedBlockId(block.id)} onDragOver={event => event.preventDefault()} onDrop={() => { if (draggedBlockId) moveBlock(draggedBlockId, block.id); setDraggedBlockId(null); }}>
                          <div className="wp-block-card__handle"><GripVertical size={16} /><span>{index + 1} · {label}</span><button onClick={event => { event.stopPropagation(); removeBlock(block.id); }} aria-label="Excluir bloco"><Trash2 size={14} /></button></div>
                          <div className={`wp-block-preview wp-block-preview--${block.type}`}>
                            {block.type === "heading" ? <h2>{block.title || "Título da seção"}</h2> : block.type === "image" ? <>{block.imageUrl ? <img src={block.imageUrl} alt={block.title || "Imagem"} /> : <div className="wp-empty-media">▧<span>Selecione uma imagem no painel</span></div>}</> : block.type === "separator" ? <hr /> : block.type === "button" ? <button className="button button--primary">{block.title || "Texto do botão"}</button> : block.type === "hero" ? <div className="wp-hero-preview"><span className="eyebrow">NEWLOG ESPORTES</span><h2>{block.title || "A história é feita rodada a rodada."}</h2><p>{block.text || "Uma seção de destaque para abrir a página."}</p></div> : <><strong>{block.title || label}</strong><p>{block.text || "Clique para editar este conteúdo."}</p></>}
                          </div>
                        </div>;
                      })}
                    </div>
                    <button className="wp-add-block" onClick={() => addBlock()}><span>+</span> Adicionar bloco</button>
                  </div>
                </main>
                <aside className="wp-inspector">
                  <div className="wp-panel-title"><span>Configurar bloco</span><small>{selectedBlockId ? "Bloco selecionado" : "Selecione um bloco"}</small></div>
                  {(() => { const selected = pageBlocks.find(block => block.id === selectedBlockId); if (!selected) return <div className="wp-inspector-empty">Clique em qualquer bloco do canvas para editar título, texto, imagem e link.</div>; return <div className="wp-inspector-form"><label>Tipo<select value={selected.type} onChange={event => updateBlock(selected.id, { type: event.target.value as EditorBlockType })}>{blockOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Título<input value={selected.title ?? ""} onChange={event => updateBlock(selected.id, { title: event.target.value })} placeholder="Título do bloco" /></label><label>Texto<textarea rows={7} value={selected.text ?? ""} onChange={event => updateBlock(selected.id, { text: event.target.value })} placeholder="Conteúdo do bloco" /></label><label>Imagem<input value={selected.imageUrl ?? ""} onChange={event => updateBlock(selected.id, { imageUrl: event.target.value })} placeholder="/assets/newlog/..." /></label><label>Link<input value={selected.href ?? ""} onChange={event => updateBlock(selected.id, { href: event.target.value })} placeholder="https://..." /></label><button className="wp-delete-block" onClick={() => removeBlock(selected.id)}><Trash2 size={14} /> Excluir este bloco</button></div>; })()}
                </aside>
              </div>
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
                  Nome do site
                  <input
                    value={siteName}
                    onChange={event => setSiteName(event.target.value)}
                  />
                </label>
                <label>
                  URL da logo institucional
                  <input
                    value={logoUrl}
                    onChange={event => setLogoUrl(event.target.value)}
                  />
                </label>
                <label>
                  Cor principal
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={event => setPrimaryColor(event.target.value)}
                  />
                </label>
                <label>
                  Cor de destaque
                  <input
                    type="color"
                    value={accentColor}
                    onChange={event => setAccentColor(event.target.value)}
                  />
                </label>
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
            <div className="editor-canvas media-register">
              <label>
                Título do arquivo
                <input
                  value={mediaTitle}
                  onChange={event => setMediaTitle(event.target.value)}
                  placeholder="Foto da equipe"
                />
              </label>
              <label>
                URL pública do arquivo
                <input
                  value={mediaUrl}
                  onChange={event => setMediaUrl(event.target.value)}
                  placeholder="https://..."
                />
              </label>
              <label>
                Texto alternativo
                <input
                  value={mediaAlt}
                  onChange={event => setMediaAlt(event.target.value)}
                />
              </label>
              <label>
                Upload direto (imagem até 45 KB)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={event => handleMediaFile(event.target.files?.[0])}
                  disabled={uploadMedia.isPending}
                />
              </label>
              <button
                className="button button--primary"
                onClick={() =>
                  registerMedia.mutate({
                    title: mediaTitle,
                    storagePath: mediaUrl,
                    mimeType: "image/*",
                    altText: mediaAlt,
                  })
                }
                disabled={registerMedia.isPending || !mediaTitle || !mediaUrl}
              >
                <Save size={15} /> Indexar mídia
              </button>
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
        {active === "menus" && (
          <div className="admin-editor">
            <div className="admin-heading">
              <div>
                <span className="eyebrow">Navegação</span>
                <h2>Menus do site.</h2>
                <p>Edite os links do menu principal sem alterar o código.</p>
              </div>
            </div>
            <div className="editor-canvas">
              <label>
                Nome do menu
                <input
                  value={menuName}
                  onChange={event => setMenuName(event.target.value)}
                />
              </label>
              <label>
                Itens — um por linha no formato <code>Texto | /rota</code>
                <textarea
                  rows={8}
                  value={menuItems}
                  onChange={event => setMenuItems(event.target.value)}
                />
              </label>
              <button
                className="button button--primary"
                onClick={handleSaveMenu}
                disabled={saveMenu.isPending}
              >
                <Save size={15} /> Salvar menu
              </button>
              <small>
                {modulesQuery.data?.menus.length ?? 0} menu(s) salvo(s)
              </small>
            </div>
          </div>
        )}
        {active === "forms" && (
          <div className="admin-editor">
            <div className="admin-heading">
              <div>
                <span className="eyebrow">Conversão</span>
                <h2>Formulários.</h2>
                <p>
                  Crie formulários simples para contato e futuras captações.
                </p>
              </div>
            </div>
            <div className="editor-canvas">
              <label>
                Nome
                <input
                  value={formName}
                  onChange={event => setFormName(event.target.value)}
                />
              </label>
              <label>
                Slug
                <input
                  value={formSlug}
                  onChange={event => setFormSlug(event.target.value)}
                />
              </label>
              <label>
                Campos — um por linha no formato <code>Rótulo | tipo</code>
                <textarea
                  rows={8}
                  value={formFields}
                  onChange={event => setFormFields(event.target.value)}
                />
              </label>
              <button
                className="button button--primary"
                onClick={handleSaveForm}
                disabled={saveForm.isPending}
              >
                <Save size={15} /> Salvar formulário
              </button>
              <small>
                {modulesQuery.data?.forms.length ?? 0} formulário(s) salvo(s)
              </small>
              <div className="submission-list">
                <span className="eyebrow">Mensagens recebidas</span>
                {(modulesQuery.data?.submissions ?? [])
                  .slice(0, 8)
                  .map(submission => (
                    <div className="submission-row" key={submission.id}>
                      <b>#{submission.id}</b>
                      <span>
                        {new Date(submission.createdAt).toLocaleString("pt-BR")}
                      </span>
                      <small>{JSON.stringify(submission.data)}</small>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
        {active === "posts" && (
          <div className="admin-editor">
            <div className="admin-heading">
              <div>
                <span className="eyebrow">Conteúdo / Publicações</span>
                <h2>{postEditing ? "Editar publicação" : "Nova publicação"}</h2>
                <p>
                  Crie notícias e atualizações com rascunho e publicação
                  controlada.
                </p>
              </div>
              <button className="button button--outline" onClick={openNewPost}>
                <PenSquare size={15} /> Nova publicação
              </button>
            </div>
            <div className="editor-layout">
              <div className="editor-canvas">
                <label>
                  Título
                  <input
                    value={postTitle}
                    onChange={event => setPostTitle(event.target.value)}
                  />
                </label>
                <label>
                  Slug
                  <input
                    value={postSlug}
                    onChange={event => setPostSlug(event.target.value)}
                  />
                </label>
                <label>
                  Resumo
                  <textarea
                    rows={3}
                    value={postExcerpt}
                    onChange={event => setPostExcerpt(event.target.value)}
                  />
                </label>
                <label>
                  Conteúdo
                  <textarea
                    rows={14}
                    value={postContent}
                    onChange={event => setPostContent(event.target.value)}
                    placeholder="Escreva a publicação..."
                  />
                </label>
                <div className="editor-actions">
                  <button
                    className="button button--outline"
                    onClick={() => handleSavePost("draft")}
                    disabled={savePublication.isPending}
                  >
                    <Save size={15} /> Salvar rascunho
                  </button>
                  <button
                    className="button button--primary"
                    onClick={() => handleSavePost("published")}
                    disabled={savePublication.isPending}
                  >
                    <CheckCircle2 size={15} /> Publicar
                  </button>
                </div>
              </div>
              <aside className="editor-sidebar">
                <span className="eyebrow">Publicações existentes</span>
                {(dashboard.data?.publications ?? []).map(post => (
                  <button onClick={() => openPost(post)} key={post.id}>
                    <span>{post.title}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </aside>
            </div>
          </div>
        )}
        {active === "users" && (
          <div className="admin-empty">
            <span className="eyebrow">Acesso e permissões</span>
            <h2>Usuários do CMS.</h2>
            <p>
              Contas autenticadas e seus papéis administrativos, consultados
              diretamente do banco.
            </p>
            <div className="admin-user-list">
              {(usersQuery.data ?? []).map(user => (
                <div className="admin-user-row" key={user.id}>
                  <strong>{user.name || "Usuário sem nome"}</strong>
                  <span>{user.email || "sem e-mail"}</span>
                  <b>{user.role}</b>
                </div>
              ))}
            </div>
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
