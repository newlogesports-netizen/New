# Newlog Esportes

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

## Vercel

O arquivo `.env.example` é o modelo seguro de variáveis; ele não contém credenciais reais. Na Vercel, importe o projeto e cadastre as mesmas variáveis em **Settings → Environment Variables** para `Production`, `Preview` e `Development` conforme necessário. O `vercel.json` já configura o build `pnpm build`, a função `api/index.ts` e o fallback das rotas do site.

Enquanto o CMS estiver no banco atual, a variável obrigatória é `DATABASE_URL`, além das variáveis de autenticação `MANUS_PROJECT_ID`, `MANUS_JWT_SECRET`, `MANUS_OAUTH_API_URL`, `MANUS_API_URL`, `MANUS_API_KEY` e `OWNER_OPEN_ID`. O Supabase ainda está preparado por migração/documentação, mas as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` só terão efeito depois da migração do adaptador de banco; não use `SUPABASE_SERVICE_ROLE_KEY`.

Após cadastrar as variáveis, use `pnpm install --frozen-lockfile`, `pnpm build` e o comando de produção configurado no projeto. Não envie um arquivo `.env` real ao GitHub ou dentro do ZIP.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
