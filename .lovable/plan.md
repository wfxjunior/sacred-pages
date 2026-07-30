## Objetivo

Fechar as duas lacunas do relatório: **(1)** o banco está com metade do schema faltando e **(2)** as telas do usuário ainda usam dados fictícios. Nada de redesign — a identidade visual atual fica intacta.

## Estado atual

- Banco: 14 tabelas (identidade + conteúdo). **Zero coleções, zero jornadas** cadastradas.
- Faltam ~24 tabelas: puzzle, progresso, gamificação, favoritos, auditoria, daily journeys.
- Admin (12 rotas) já usa repositórios reais, mas 4 telas consultam tabelas inexistentes.
- App do usuário: 100% mock.

## Etapa 1 — Completar o banco

Aplicar o conteúdo das migrations `0005`–`0009` em blocos aprovados por você, com dois ajustes obrigatórios:

- Adicionar `GRANT` em toda tabela nova (hoje quase nenhuma tem — sem isso o app recebe erro de permissão mesmo com RLS correta).
- Confirmar a substituição destrutiva de `journey_puzzle_settings` por `puzzle_templates` (tabela hoje vazia, então não há perda de dados).

Ordem: puzzle domain → progresso/gamificação → correção de auditoria de daily journeys → índices de FK → perfil a partir dos metadados do Google. Depois: rodar o linter de segurança e corrigir o que aparecer.

## Etapa 2 — Conteúdo inicial real

Semear via migration: 3 coleções com jornadas completas (traduções EN/PT/ES, palavras, devocional, oração, referência bíblica, template de puzzle) e as definições de marcos (`milestone_definitions` + traduções). Sem isso o app conectado aparece vazio.

## Etapa 3 — Destravar o admin

Validar as 12 rotas do admin contra o schema completo: Collections, Journeys, Words, Translations, Review, Calendar, Templates, Media, Audit. Corrigir divergências entre `src/lib/content/*` e as colunas reais.

## Etapa 4 — Conectar o app do usuário

Trocar mocks por dados reais, tela por tela, mantendo o visual:

- `/collections` e `/collections/$slug` → catálogo publicado
- `/today` → daily journey + puzzle real com salvamento de progresso
- caça-palavras (`WordSearch`) → `puzzle_instances` / `puzzle_progress` / eventos
- reflexão e oração → `user_reflections`, `user_prayers`
- `/progress`, `/my-journey` → `journey_progress`, `consistency_days`, marcos
- `/favorites` → tabela `favorites`
- `/profile`, `/settings` → `profiles` + `user_preferences`
- `/notifications` e `/together` → ficam em modo demonstração (não há schema para eles); sinalizo isso explicitamente em vez de fingir que funcionam.

Estados de carregamento, erro e vazio em cada rota, sem quebrar SSR.

## Detalhes técnicos

- Leituras públicas por server function com chave publishable + políticas `TO anon` restritas; leituras do usuário via `requireSupabaseAuth`.
- Rotas autenticadas movidas/gated conforme o padrão `_authenticated`, sem duplicar `/`.
- Regra de acesso "primeira jornada grátis" aplicada no servidor, não no cliente.
- `bun vitest run` (a suíte de testes de `lib/journey` e `lib/puzzle` já existe) + typecheck ao final de cada etapa.

## Fora do escopo

Redesign visual, novos módulos (moderação de família, notificações push, pagamentos).
