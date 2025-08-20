# Análisis del Código y Sugerencias de Mejora (Milestone Gemini)

A continuación se presenta un análisis del código del juego con hallazgos y sugerencias de mejora, divididos por categorías.

### Calidad del Código y Mantenibilidad

1.  **Hooks "Divinos" (God Hooks):** El hook `useGameOrchestrator` es muy grande y centraliza casi toda la lógica y el estado del juego. Esto lo hace difícil de leer, mantener y depurar.
    *   **Sugerencia:** Dividir `useGameOrchestrator` en hooks más pequeños y con responsabilidades únicas. Por ejemplo, un `useGameSettings` para el modo y número de rondas, y un `useRoundManager` para la lógica de avanzar rondas y jugadores.

2.  **"Prop Drilling" Excesivo:** El componente `App.tsx` actúa como un intermediario que recibe una gran cantidad de propiedades de `useGameOrchestrator` y las pasa hacia abajo a los componentes de cada pantalla.
    *   **Sugerencia:** Crear un `GameContext` para proveer el estado y las funciones a los componentes que lo necesiten directamente, sin pasar por intermediarios. Ya usas este patrón con `QuestionsContext`, por lo que sería consistente aplicarlo aquí también. Esto simplificaría `App.tsx` enormemente.

3.  **Valores "Mágicos" (Hardcoded):** Hay muchos valores codificados directamente en la lógica, como la puntuación por acierto (`150`), la duración de los temporizadores (`30`, `10`), etc.
    *   **Sugerencia:** Centralizar estos valores en un objeto o archivo de constantes (ej. `src/constants/gameConfig.ts`). Esto facilitaría enormemente balancear y ajustar las reglas del juego en el futuro.

4.  **Seguridad de Tipos (TypeScript):** El tipo `resultType` que se pasa a `onRoundEnd` es `keyof Player`, lo que teóricamente permitiría pasar propiedades no deseadas como `'name'` o `'score'`.
    *   **Sugerencia:** Crear un tipo más específico como `type HitType = 'exactHits' | 'correctHits' | 'wrongHits';` para hacer las funciones más explícitas y seguras.

### CSS y Estilos

1.  **Código CSS Duplicado:** Hay mucho código repetido para los contenedores principales de cada pantalla (el estilo de "tarjeta" blanca con sombra y bordes redondeados). Se repite en `.setup-container`, `.game-screen`, `.answer-result-card`, etc.
    *   **Sugerencia:** Crear una clase de CSS reutilizable, como `.card-container`, y aplicarla a todos estos componentes para reducir la duplicación y mantener la consistencia visual.

2.  **Uso de Variables CSS:** El proyecto usa bien las variables CSS en `global.css`, pero algunos colores siguen estando codificados directamente en otros archivos (ej. el rojo del botón de borrar en `Numpad.css`).
    *   **Sugerencia:** Mover todos los colores a las variables en `:root` en `global.css` para centralizar el tema y facilitar cambios de diseño.

3.  **Centrado con Posición Absoluta:** Varias pantallas usan `position: absolute` y `transform` para centrarse. Esto funciona, pero un layout basado en Flexbox o Grid a nivel superior (en `App.tsx`) sería más robusto y moderno, simplificando el CSS de cada componente individual.

### Experiencia de Usuario (UX/UI)

1.  **Feedback en Numpad:** Como parte de la depuración, eliminamos los efectos `hover` de los botones del Numpad.
    *   **Sugerencia:** Una vez que estemos 100% seguros de que el bug de los clics está resuelto, deberíamos restaurar estos efectos. Los botones que no reaccionan al pasar el mouse por encima se sienten "muertos" y poco responsivos.
