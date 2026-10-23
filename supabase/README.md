# Supabase — CMS independente da Newlog

A pasta `migrations/` contém o banco do CMS reconstruído fora do WordPress. Ela não executa plugins do WordPress: fornece equivalentes independentes para páginas, posts, editor por blocos, mídia, menus, SEO, categorias, tags, formulários, revisões, usuários, permissões, importação, equipes, ranking, jogadores, Copas e auditoria.

## Como conectar

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `migrations/0001_newlog_cms.sql`.
3. Crie um usuário em **Authentication > Users**.
4. Promova o usuário inicial executando, no SQL Editor:

```sql
update public.profiles
set role = 'superadmin'
where id = 'UUID_DO_USUARIO';
```

5. Cadastre `SUPABASE_URL` e `SUPABASE_ANON_KEY` como variáveis protegidas do ambiente. Esta integração não depende de `SUPABASE_SERVICE_ROLE_KEY`; as operações administrativas usam a sessão autenticada do usuário e as políticas RLS.

O arquivo SQL usa RLS para separar leitura pública de conteúdo publicado e edição administrativa autenticada. A senha fica exclusivamente no Supabase Auth; o CMS não salva senhas próprias.

A migração do conteúdo e das funções específicas do WordPress será feita depois que o backup do WordPress for fornecido (`.sql`, `.xml`, `wp-content`, tema e plugins).
