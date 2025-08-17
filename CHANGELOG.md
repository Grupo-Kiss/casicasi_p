# Historial de Cambios

## [0.2.0] - 2025-08-16

### Agregado
- Gestión de Fuente de Datos:
  - Soporte para fuente de datos configurable mediante variable de entorno (`REACT_APP_QUESTIONS_URL`).
  - Nueva página `/data` para carga, análisis y depuración de archivos JSON de preguntas.
  - Lógica de depuración de datos con coerción de tipos y filtrado de registros inválidos.
  - Visualización de estadísticas detalladas (total, válidos, corregidos, inválidos, por categoría) en la página de carga de datos.
- UI/UX:
  - Layout apaisado consistente (max-width: 800px) y centrado para `SetupScreen`, `GameScreen`, `AnswerResult`, `GameStats`, y `TurnSwitcher`.
  - Footer global con información de copyright y cantidad de registros de juego.
  - Selector de avatares en `SetupScreen` utilizando imágenes locales de la carpeta `public/img`.
  - Visualización de avatares en `TurnSwitcher` y `GameStats`.
  - Eliminación del cursor parpadeante en todos los campos de entrada.
- Flujo de Juego:
  - Temporizador de 30 segundos en el botón OK del Numpad para el modo Clásico (para cálculo de bonus).
  - Temporizador de 10 segundos por intento en el botón OK del Numpad para el modo Más/Menos.
  - La tecla Enter ahora envía la respuesta/acción en todas las pantallas relevantes.
  - El campo de entrada de respuesta se enfoca automáticamente al inicio de cada turno/pregunta.

### Cambiado
- `GameScreen`:
  - Reorganización completa del layout a dos columnas: información (pregunta, marcador) a la izquierda, interacción (input, numpad) a la derecha.
  - Pregunta destacada con `<h1>` y negrita.
  - Información de ronda movida a la columna izquierda.
  - Eliminación de la puntuación parcial de la pantalla de juego.
- `AnswerResult`:
  - Reorganización del layout a dos columnas.
- `GameStats`:
  - Reorganización del layout a dos columnas para la sección de resultados.
  - Alineación de encabezados de tabla para mayor consistencia.
- `TurnSwitcher`:
  - Transición manual (sin temporizador automático).
  - Botón "Empezar Turno" centrado y con estética coherente.
- `Numpad`:
  - Reordenamiento de botones de la última fila a "Delete", "0", "OK".
  - Adaptación del temporizador visual para ser configurable (30s o 10s).
- Modo Más/Menos:
  - Lógica de intentos (`plusminusGuessesLeft`) ahora aleatoria (entre 2 y 12).
  - Dinámica de pistas y fin de ronda ajustada.
- Modo Clásico:
  - Eliminación de la "Pregunta Comodín" (ronda especial de Más/Menos al final).

### Corregido
- Bug: Doble clic en el botón OK del Numpad (implementación de debounce y limpieza de temporizadores).
- Bug: Pantalla `AnswerResult` se quedaba atascada (añadido botón "Continuar").
- Bug: Modo Más/Menos iniciaba en la Ronda 2.
- Errores de compilación relacionados con la eliminación/reintroducción de props de temporizador.
- Problemas de centrado y alineación en `TurnSwitcher` y `GameStats`.

## [Sin Lanzar]

### Agregado
- Pruebas unitarias y de integración para el componente principal `App`.
- Comentarios en español al código para explicar la lógica.

### Cambiado
- Refactorización de los hooks para que sean más modulares y fáciles de mantener.

### Corregido
- Varios errores relacionados con el flujo del juego, incluyendo que el juego se quedaba atascado después de la primera ronda y en la pantalla de cambio de turno.
