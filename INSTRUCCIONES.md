# Instrucciones del Proyecto "Casi Casi"

Este archivo contiene las instrucciones para instalar y ejecutar el juego localmente.

## Prerrequisitos

Asegúrate de tener instalado lo siguiente:
- [Node.js](https://nodejs.org/) (que incluye npm)

## Pasos

1.  **Clonar el repositorio (si aplica)**
    Si descargaste el proyecto como un ZIP, descomprímelo.

2.  **Instalar dependencias**
    Abre una terminal en la carpeta raíz del proyecto y ejecuta el siguiente comando para instalar todas las librerías necesarias:
    ```bash
    npm install
    ```

3.  **Ejecutar el juego**
    Una vez instaladas las dependencias, puedes iniciar el juego con:
    ```bash
    npm start
    ```
    o utilizando el script ejecutable:
    ```bash
    ./start-game.sh
    ```

Esto abrirá automáticamente una pestaña en tu navegador web en `http://localhost:3000` con el juego en funcionamiento.


## Estructura del Proyecto

-   `public/`: Contiene los archivos estáticos (HTML, CSS, imágenes, etc.).
-   `src/`: Contiene el código fuente de la aplicación React.
    -   `components/`: Componentes reutilizables de React.
    -   `hooks/`: Hooks personalizados de React para la lógica del juego.
    -   `styles/`: Archivos CSS para los estilos de los componentes.
    -   `types/`: Definiciones de tipos de TypeScript.

## Notas Adicionales

-   El juego está diseñado para ser responsivo y debería funcionar bien en diferentes tamaños de pantalla.
-   Para detener el juego, presiona `Ctrl + C` en la terminal donde lo iniciaste.
-   **Personalización de Preguntas:**
    -   Puedes cargar tus propias preguntas en formato JSON utilizando la página secreta `/data`. Simplemente navega a `http://localhost:3000/data` en tu navegador.
    -   Esta página te permite analizar, depurar y cargar archivos JSON de preguntas.
    -   También puedes configurar una URL de preguntas por defecto creando un archivo `.env` en la raíz del proyecto con la línea `REACT_APP_QUESTIONS_URL=tu_url_aqui.json`.
-   **Avatares Personalizados:**
    -   El juego utiliza imágenes de la carpeta `public/img` para los avatares de los jugadores. Asegúrate de colocar tus imágenes (`.png`, `.jpg`, etc.) en esta carpeta y el selector de avatares en la pantalla de configuración las detectará.
-   **Flujo de Juego:**
    -   Las transiciones entre turnos y rondas son ahora manuales. Deberás hacer clic en los botones "Empezar Turno" o "Continuar" para avanzar.
    -   Los modos de juego Clásico y Más/Menos incluyen temporizadores visuales en el botón "OK" del Numpad para calcular bonus de tiempo.
    -   La tecla "Enter" funciona como atajo para confirmar acciones en todas las pantallas principales.