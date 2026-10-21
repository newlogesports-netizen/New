# Plano de implementação — Newlog Esportes

## Escopo aprovado

Construir um site institucional público e um CMS administrativo em `/admin` para a Newlog Esportes, usando a logo e os escudos fornecidos, além do histórico real da planilha `COPANEWLOG-HISTÓRIA.xlsx`. O site não é uma rede social nem um aplicativo de mensagens. O conteúdo oficial deve ter persistência no banco gerenciado; não haverá uso de localStorage como banco de dados.

## Abordagem de implementação

- Frontend React + TypeScript + Vite + Tailwind, com rotas públicas amigáveis (`/`, `/sobre`, `/historia`, `/times`, `/ranking`, `/copas`, `/jogadores`, `/noticias`) e `/admin` protegido pelo login OAuth já fornecido pelo starter.
- Backend Express + tRPC + Drizzle/MySQL, com tabelas aditivas para configurações, páginas, equipes, jogadores, competições, ranking, publicações e auditoria. A estrutura preserva a tabela `users` existente e concentra autorização no servidor.
- Biblioteca de mídia baseada nos ativos fornecidos e no endereço estável `/manus-storage/...`; os metadados de mídia ficam indexados no banco para futura expansão.
- Importação da planilha representada por dados normalizados e um fluxo de pré-visualização no painel; a origem, a aba e as inconsistências são registradas para revisão, sem alterar o XLSX original.
- Editor visual seguro por blocos JSON versionados para páginas administráveis, sem execução de HTML/JavaScript arbitrário.
- Rotas públicas com metadados básicos, `manus-routes.json`, links internos e textos reais da planilha.

## Direção visual

### Opções consideradas

1. **Editorial esportivo noturno** — 0,04: preto azulado, recortes de placar, tipografia forte e destaques em roxo elétrico.
2. **Arena institucional luminosa** — 0,07: fundo claro, cartões suaves e acentos roxos com sensação de federação esportiva.
3. **Broadcast de campeonato** — 0,08: blocos horizontais, números grandes, faixas de tabela e alto contraste.

### Escolha: Editorial esportivo noturno

- **Movimento:** direção de arte editorial esportiva contemporânea, com linguagem de transmissão e arquivo histórico.
- **Princípios:** contraste alto; informação em camadas; respeito documental aos dados; ritmo visual sem excesso de efeitos.
- **Filosofia de cor:** o azul-marinho quase preto cria uma noite de competição; o roxo da logo é a assinatura proprietária; branco quente melhora a leitura; amarelo-lima aparece apenas como marcador de destaque e status.
- **Paradigma de layout:** composição assimétrica com uma coluna de narrativa e uma faixa lateral de métricas; seções de página entram como capítulos, não como uma grade genérica de cards.
- **Motivos de assinatura:** linhas diagonais discretas inspiradas em quadra; etiquetas de edição; placares e rankings com números tabulares.
- **Interação:** filtros e tabs respondem com mudanças curtas de estado; ações administrativas sempre informam salvamento, erro ou conteúdo vazio.
- **Animação:** entrada suave por deslocamento vertical pequeno, hover com brilho de borda, sem autoplay ou movimento que prejudique acessibilidade.
- **Tipografia:** `Barlow Condensed` para títulos e números, `Manrope` para texto corrido e navegação. Fallbacks sans-serif são mantidos para ambientes sem carregamento externo.
- **Essência da marca:** a memória competitiva da comunidade Newlog organizada para acompanhar, reconhecer e continuar a história. Personalidade: competitiva, comunitária, documental.
- **Tom de voz:** direto, caloroso e factual. Exemplos: “A história é feita rodada a rodada.” e “Veja quem deixou sua marca nas Copas Newlog.”
- **Logo:** a marca oficial fornecida é sempre usada sem redesenho, distorção ou troca; fundos e espaçamentos respeitam sua transparência.
- **Cor proprietária:** roxo profundo aproximado da logo (`#0f0b5f`), aplicado como assinatura e não como preenchimento indiscriminado.

## Dados e materiais

- Logo institucional e escudos: `logo-newlog.zip`; preservados como arquivos originais e usados pelos nomes reais disponíveis.
- Dados esportivos: `COPANEWLOG-HISTÓRIA.xlsx`; nomes de abas, títulos, rankings, resultados e destaques serão tratados como fonte, com lacunas e inconsistências marcadas em vez de inventadas.
- Instagram oficial inicial: `https://www.instagram.com/newlogesports`, editável em configurações.
- Marca-d'água da desenvolvedora: não foi encontrada no pacote recebido; a configuração ficará preparada e a UI mostrará estado não configurado, sem inventar uma identificação.

## Estrutura de pastas

- `client/src/pages/`: páginas públicas e painel.
- `client/src/components/`: cabeçalho, rodapé, blocos, tabelas, cartões e layout administrativo.
- `client/src/data/`: dados demonstrativos/fonte normalizados e metadados de importação.
- `client/src/lib/`: helpers de rotas, formatação e tRPC.
- `server/`: procedures tRPC, consultas de banco, autenticação e autorização.
- `drizzle/`: schema e migrações SQL aditivas.
- `client/public/`: manifestos e manifesto de rotas; imagens grandes permanecem no storage.
- `docs/`: inventário da planilha, origem e pendências para revisão.

## Fluxo de entrega

1. Persistir o plano e a lista de resultados.
2. Enviar ativos para storage sem sobrescrever os originais.
3. Normalizar o conteúdo real da planilha e registrar pendências.
4. Implementar schema, procedures e seed idempotente.
5. Implementar o site público e o painel administrativo funcional.
6. Rodar diagnósticos, checagem, build e inspeção visual das rotas principais.
7. Criar checkpoint no Git canônico; publicação só ocorre com configuração explícita de publicação.
