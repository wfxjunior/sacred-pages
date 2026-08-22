# Sensação de app nativo no celular

O app já tem barra inferior, PWA e sidebar no desktop. O que falta é o "acabamento" que separa um site responsivo de um app de empresa grande: transições, feedback tátil, gestos e telas que nunca "piscam".

## 1. Shell de app de verdade
- Cabeçalho mobile fixo e compacto (56px) que encolhe/some ao rolar para baixo e reaparece ao subir.
- Barra inferior com fundo translúcido (blur), ícone ativo animado (escala + ponto indicador) e respeito total à safe area do iPhone.
- Nada de scroll da página inteira: o conteúdo rola dentro da área central, header e tab bar ficam parados.

## 2. Transições entre telas
- Fade + leve slide ao trocar de rota (200ms), direção coerente com a navegação.
- Ao abrir uma coleção ou jornada, o card cresce para a tela (transição de detalhe), em vez de recarregar.

## 3. Estados sem "flash"
- Skeletons no estilo do papel/linho em vez de spinners.
- Pull-to-refresh próprio no /my-journey e /today (sem recarregar o navegador).
- Estados vazios e offline com ilustração e uma ação clara.

## 4. Feedback tátil e microinterações
- Vibração curta (Haptics API) ao encontrar palavra, concluir jornada e trocar de aba.
- Botões com resposta de toque imediata (escala 0.97) e alvos mínimos de 44px.
- Toasts posicionados acima da tab bar, com gesto de arrastar para dispensar.

## 5. Gestos
- Modais e o devocional viram bottom sheets arrastáveis (puxar para baixo fecha).
- Swipe horizontal para navegar entre dias no /today.

## 6. Detalhes de PWA
- Splash screen e ícones maskable corretos para iOS e Android.
- Banner discreto "Adicionar à tela de início" só depois da primeira jornada concluída.
- Barra de status com a cor da tela atual (theme-color dinâmico por tema claro/escuro).

## Notas técnicas
- Transições com `framer-motion` (`AnimatePresence` na `AppShell`) — sem tocar nas rotas em si.
- Bottom sheet e pull-to-refresh implementados sobre os componentes existentes (`ShareModal`, `DevotionalDock`) para não duplicar lógica.
- Haptics via `navigator.vibrate` com verificação de suporte, respeitando a preferência de acessibilidade "reduzir movimento".
- Nenhuma mudança em regras de negócio, dados ou identidade visual: paleta, tipografia e texturas permanecem iguais.
