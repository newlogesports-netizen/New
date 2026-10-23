# Supabase — CMS independente da Newlog

A pasta `migrations/` contém o banco do CMS criado do zero. O projeto não executa WordPress nem plugins: fornece recursos independentes para páginas, posts, editor por blocos, mídia, menus, SEO, categorias, tags, formulários, revisões, usuários, permissões, importação, equipes, ranking, jogadores, Copas e auditoria.

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

O conteúdo inicial da Newlog é alimentado pelos materiais oficiais enviados para este projeto: logo, escudos, fotos e planilha histórica. Não existe etapa de migração de WordPress.
