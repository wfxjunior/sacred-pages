Objetivo: transformar a hero da landing page em uma composição clara, editorial e premium onde o caça-palavras é o protagonista visual — reforçando imediatamente o propósito do produto.

O que será feito:

1. Nova estrutura da hero
   - Remover a imagem de fundo atmosférica e o degradê escuro.
   - Usar fundo no tom warm ivory (#FCFBF8) com textura sutil opcional (ruído ou grain de 2-3%).
   - Layout em duas colunas no desktop: texto à esquerda, grade de caça-palavras como ilustração à direita.
   - No mobile: empilhar verticalmente — título, subtítulo, CTA e grade logo abaixo, ocupando a largura segura.

2. Grade de caça-palavras como ilustração
   - Criar componente ilustrativo `HeroWordGrid` (estático, sem interação, apenas visual).
   - Grade 10x10 ou 12x12 com letras em tom profundo suave (#2B2B2B / 35-50% opacity).
   - Destacar 3-4 palavras em destaque com as cores de identidade: Sage (#78866B), Blue (#5E7FA3) e Gold (#B88A3B).
   - Incluir linhas finas de "encontrado" sobre as palavras, como no mockup do HeroMockup.
   - Aplicar sombra suave e bordas arredondadas para dar profundidade de cartão editorial.

3. Tipografia monumental
   - Título principal "Jornadas da Palavra" em fonte serif, muito grande, peso médio, leading apertado.
   - Subtítulo em sans-serif, cor mais suave, largura máxima confortável para leitura.
   - Mantém o versículo de assinatura (Salmos 119:105) com filete dourado, posicionado abaixo do subtítulo.

4. CTAs e chips
   - Botão primário "Start your journey" com fundo escuro (#2B2B2B) e texto claro.
   - Botão secundário "See how it works" como outline sutil.
   - Chips mantidos abaixo dos CTAs, agora em cores escuras sobre fundo claro.
   - Garantir tap targets mínimos de 48px no mobile.

5. Responsividade e breakpoints
   - Desktop: 2 colunas, grade grande (40-45% da largura), texto com espaçamento generoso.
   - Tablet: grade reduzida proporcionalmente, texto centralizado ou alinhado à esquerda.
   - Mobile: texto centralizado, grade em largura total com margens seguras, sem quebras de layout.

6. Transição para seções seguintes
   - Adicionar divisor sutil ou mudança de background entre hero e a próxima seção (Journey Preview / Product Overview) para evitar contraste brusco.
   - Ajustar o header para funcionar bem sobre fundo claro: logo escuro, navegação escura, estado transparente sólido ao scroll.

7. Localização e acessibilidade
   - Reutilizar chaves de tradução existentes (`hero.*`), ajustando apenas a chave de subtítulo se necessário.
   - Garantir contraste mínimo WCAG AA para texto e elementos interativos.
   - Preservar a animação de entrada suave e respeitar `prefers-reduced-motion`.

8. Arquivos envolvidos
   - `src/routes/index.tsx` — hero redesenhada.
   - `src/components/site/HeroWordGrid.tsx` — novo componente ilustrativo (criar).
   - `src/styles.css` — ajustes de tokens se necessário para fundo claro e sombras sutis.
   - `src/components/site/Header.tsx` — ajuste de cor para fundo claro.

Critério de conclusão: a hero deve comunicar instantaneamente "caça-palavras bíblico" através da grade ilustrativa, manter a elegância premium e funcionar perfeitamente de mobile a desktop sem scroll horizontal.