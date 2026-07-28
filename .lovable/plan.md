# Redesign Premium — Design Only

Reinício visual completo. Nenhum backend, autenticação, Supabase, Stripe ou API será tocado. Apenas mock data e UI.

## Sistema visual

Tokens em `src/styles.css`:
- `--bg` #FCFBF8 (primário), `--bg-2` #F8F6F2, `--surface` #EFE8DC (uso pontual)
- `--ink` #2B2B2B, `--ink-2` #5F5B55
- `--gold` #B88A3B, `--sage` #78866B, `--blue` #5E7FA3
- Cards em branco puro (#FFFFFF) com borda 1px `oklch` neutra e sombra suave
- Radius: 14–20px. Serif: Playfair Display (apenas headlines curtas). Sans: Inter (UI e corpo)
- Dark mode refinado (não invertido cru): fundos `#141311 / #1B1A17`, gold levemente mais claro

Tom Apple/Notion: muito ar, tipografia grande, hierarquia clara, micro-animações discretas, zero decoração.

## Header (novo)

`src/components/site/Header.tsx` reescrito:
- Sticky, translúcido com blur, borda inferior 1px muito sutil
- Esquerda: BrandMark + wordmark
- Centro: Home · Features · Today's Journey · Collections · Pricing · About · Help
- Direita: LanguageSelector · DarkModeToggle · Sign in · Start Free (botão gold)
- Mobile: menu drawer com as mesmas seções
- Novo componente `DarkModeToggle` (persistência em localStorage, toggle `.dark` no `<html>`)

## Hero (novo)

Fora bookshelf/estoque. O produto é o herói.
- Split 40/60 no desktop, empilhado no mobile
- Eyebrow "Today's Journey" · Headline serif grande · Sub · 2 CTAs · 4 chips
- Direita: novo `AppPreview.tsx` — janela do app em tamanho real mostrando:
  - Barra superior falsa (dots + rota "today")
  - Cabeçalho da jornada (referência, dificuldade, idioma, cor de seleção)
  - Grid word search animado (reaproveita motor de animação do HeroMockup)
  - Coluna lateral com abas Scripture · Devotional · Reflection · Prayer
  - Barra de progresso e mini badges de status
- Fundo com gradientes muito sutis de gold/sage

O `HeroMockup` atual é substituído pelo `AppPreview` (mais rico e maior).

## Novas seções da landing (`src/routes/index.tsx` reescrito)

1. Hero
2. Product Overview — 4 pilares em cards brancos com ícones lucide neutros
3. How it Works — 3 passos com números serif grandes, linhas conectando
4. Journey Preview — cartão grande replicando o AppPreview em variação compacta
5. Collections — grid 3 colunas usando `CollectionCard` (mantido, refinado para card branco)
6. Personalization — dois-colunas: mock de settings (cor de seleção, dificuldade, tamanho de fonte, tema, idioma) com controles visuais reais (não funcionais além de estado local)
7. Journey Together Preview — cartão de "família/grupo" com avatares mock e progresso compartilhado, marcado "Coming soon"
8. Progress — dashboard mock (streak, journeys, passages, weekly chart em SVG inline)
9. Testimonials — 3 depoimentos em cards brancos, aspas serif
10. Pricing Preview — Free vs Premium (cards limpos, um destacado)
11. FAQ — accordion (shadcn) com 6 perguntas
12. Final CTA — headline serif + botão gold
13. Footer — reorganizado em 4 colunas

## Novos componentes

- `src/components/site/AppPreview.tsx` — hero product preview
- `src/components/site/DarkModeToggle.tsx`
- `src/components/site/FeatureCard.tsx`
- `src/components/site/StepCard.tsx`
- `src/components/site/TestimonialCard.tsx`
- `src/components/site/FAQ.tsx` (usa `@/components/ui/accordion`)
- `src/components/site/WeeklyChart.tsx` (SVG inline)
- `src/components/site/JourneyTogetherPreview.tsx`
- `src/components/site/PersonalizationPanel.tsx`

`HeroMockup.tsx` mantido no arquivo mas não usado pela landing (evita quebrar `today.tsx` se referenciar).

## i18n

`src/lib/i18n.tsx`: adicionar chaves para todas as novas seções em EN/PT/ES:
- nav.features, nav.help
- overview.*, howItWorks.*, journeyPreview.*, personalization.*, together.*, progress.*, testimonials.*, faq.q1..q6/a1..a6, final.*
- header.darkMode

Idioma padrão do produto: EN (mantida detecção do navegador com fallback EN e preferência salva).

## O que NÃO muda

- Rotas existentes além de `/` (today, collections, pricing, about, signin, etc.) — sem alterações nesta rodada
- Nenhuma lógica de negócio, nenhum backend
- Motor do word search e i18n mantidos (só extensões de dicionário e chaves)

## Entregável

Landing page premium completa, responsiva, com dark mode, header novo, hero com AppPreview grande e todas as 13 seções acima usando mock data. Pronto para revisão visual antes de estender ao restante do produto.
