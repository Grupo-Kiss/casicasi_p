# CasiCasi DB Manager

Una sencilla aplicación web para gestionar, manipular y exportar datos desde un archivo CSV.

## Características

-   **Visualización de Datos:** Muestra los datos de tu archivo CSV en una tabla interactiva.
-   **Gestión de Registros (CRUD):** Permite añadir, editar y eliminar registros.
-   **Exportación a JSON:** Exporta los datos actuales a un archivo JSON, ideal para usar en juegos como CasiCasi.
-   **Paginación:** Muestra 25 registros por página para facilitar la navegación en grandes conjuntos de datos.

## Configuración y Ejecución

Sigue estos pasos para poner en marcha la aplicación:

### Prerrequisitos

Necesitas tener instalado Python (versión 3.7 o superior) y `pip` (el gestor de paquetes de Python).

### Pasos

1.  **Descarga el Proyecto:**
    Clona o descarga este repositorio en tu máquina local.

2.  **Instala las Dependencias:**
    Abre una terminal en el directorio raíz del proyecto (donde se encuentra `requirements.txt`) y ejecuta:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Prepara tu Archivo CSV:**
    Asegúrate de que tu archivo de datos CSV, `db_25_casicasi - casicasi2.csv`, esté ubicado en el mismo directorio que `app.py`.
    **Orden de Columnas Requerido:** El archivo CSV debe tener las columnas en el siguiente orden exacto:
    `ID, activa, categoria, pregunta, respuesta, rango_max, rango_min, informacion, fuente`

4.  **Ejecuta la Aplicación Flask:**
    En la misma terminal, ejecuta:
    ```bash
    python app.py
    ```
    Esto iniciará el servidor web de Flask.

    Si no puedes abrir tu aplicación de Python con el comando python app.py, aquí hay algunas cosas que puedes verificar:

Instalación de Python:

Asegúrate de que Python está instalado en tu sistema. Puedes verificarlo ejecutando python --version o python3 --version en la terminal.
Ubicación del archivo:

Asegúrate de estar en el directorio correcto donde se encuentra app.py. Usa el comando cd para navegar al directorio correcto.
Comando correcto:

Dependiendo de tu sistema y la instalación, puede que necesites usar python3 app.py en lugar de python app.py.

6.  **Accede a la Aplicación:**
    Abre tu navegador web y navega a la siguiente dirección:
    ```
    http://127.0.0.1:5000/
    ```
    Deberías ver la interfaz de la aplicación con tus datos cargados.

## Consideraciones y Limitaciones Importantes

-   **Persistencia de Datos:** Actualmente, todos los cambios (añadir, editar, eliminar) se realizan solo en la memoria de la aplicación. Esto significa que si reinicias el servidor de Flask, todos los cambios que hayas hecho se perderán y los datos volverán a su estado original del archivo CSV. Para una persistencia real, la aplicación necesitaría implementar una escritura de vuelta al archivo CSV o integrar una base de datos.

-   **Operaciones CRUD con Paginación:** Las operaciones de edición y eliminación (`PUT` y `DELETE`) utilizan el índice del registro dentro del DataFrame completo. Con la paginación, el índice que se muestra en el frontend es relativo a la página actual. Para una robustez completa en estas operaciones, se recomienda encarecidamente que cada registro en tu archivo CSV tenga un **ID único** (por ejemplo, una columna `id`) que el backend pueda utilizar para identificar y manipular registros específicos, independientemente de su posición en la paginación.

-   **Manejo de Errores:** Se ha implementado un manejo básico de errores para evitar caídas de la aplicación, pero para una aplicación de producción, se requeriría una validación de entrada más exhaustiva y una retroalimentación más amigable para el usuario.
