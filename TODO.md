# TODO — Newlog Esportes

## 1. Identidade e conteúdo oficial

- [x] Usar a logo institucional recebida como identidade principal, preservando proporção, transparência e arquivo original.
- [x] Usar os escudos recebidos sem redesenhar, distorcer, substituir ou inventar equipes.
- [x] Manter o Instagram oficial `https://www.instagram.com/newlogesports` editável pelo painel.
- [x] Não apresentar dados demonstrativos como oficiais; registrar no inventário qualquer lacuna, duplicação ou inconsistência da planilha.
- [x] Deixar a configuração da marca-d'água da desenvolvedora pronta, mostrando-a apenas quando um arquivo oficial for fornecido.

## 2. Site público responsivo

- [x] Entregar cabeçalho, navegação, destaque, apresentação institucional, histórico, modalidades/dados disponíveis, times, ranking, Copas, jogadores, notícias quando existirem, links sociais e rodapé.
- [x] Implementar rotas amigáveis para as páginas públicas e manter `manus-routes.json` sincronizado.
- [x] Garantir responsividade em celular, tablet e desktop, contraste, navegação por teclado, textos alternativos e estados de carregamento, erro e vazio.
- [x] Exibir rankings, resultados e históricos somente a partir da planilha e dos materiais fornecidos.

## 3. Painel administrativo e autenticação

- [x] Proteger `/admin` com autenticação real do starter e autorização no servidor.
- [x] Exibir dashboard com contagens e atividade consultadas do banco, sem números inventados.
- [ ] Permitir administrar páginas, publicações, mídia, menus, aparência, configurações e equipes por meio de módulos reais.
- [x] Implementar perfis e permissões no servidor, sem permitir que dados do navegador promovam um usuário.
- [ ] Permitir editar o Instagram, SEO, logo, favicon, cores, cabeçalho, rodapé e marca-d'água quando configurada. (Instagram e descrição estão funcionais; os demais campos permanecem preparados.)

## 4. Editor visual seguro

- [x] Armazenar páginas em blocos JSON versionados e validados.
- [ ] Permitir adicionar, remover, reordenar, editar, salvar rascunho, pré-visualizar e publicar blocos sem aceitar JavaScript ou HTML arbitrário. (Salvar rascunho/publicar e allow-list estão funcionais; composição visual avançada permanece aberta.)
- [ ] Suportar título, texto, imagem, galeria, banner, botão, colunas, vídeo permitido, lista, cards, equipes, notícias, eventos, redes sociais, separador, espaçamento e fundo.

## 5. Dados, importação e persistência

- [ ] Modelar tabelas relacionais para configurações, páginas, versões, blocos, publicações, mídia, menus, equipes, jogadores, competições, ranking, importações e auditoria.
- [x] Manter migrações aditivas, documentadas e reproduzíveis; não apagar tabelas existentes.
- [ ] Registrar aba, coluna, origem e pendências da planilha e preparar pré-visualização de importação com validação e idempotência. (Inventário, origem e seed idempotente estão prontos; a UI de pré-visualização ainda está aberta.)
- [x] Fazer o conteúdo publicado persistir no banco gerenciado; localStorage não substitui o banco.
- [x] Indexar ativos no storage e impedir exclusão acidental de mídia usada.

## 6. Qualidade e entrega

- [x] Configurar diagnósticos TypeScript antes da primeira implementação.
- [x] Executar `pnpm check`, `pnpm test` e `pnpm build`, corrigindo erros acionáveis.
- [x] Verificar as rotas públicas principais e o painel em Preview; manter URLs de navegador relativas.
- [ ] Registrar checkpoint no Git canônico quando o conjunto entregue estiver consistente.
