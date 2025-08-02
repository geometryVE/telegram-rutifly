# Bot Reenviador de Telegram para n8n

Este proyecto es un simple pero robusto bot de Telegram construido con Node.js, Express y Telegraf. Su propósito es recibir un mensaje a través de un webhook y reenviarlo a un usuario de Telegram específico.

## Características

- **Servidor Express:** Expone un endpoint HTTP para recibir webhooks.
- **Integración con Telegraf:** Envía mensajes de forma segura usando la API de Telegram.
- **Listo para Despliegue:** Configurado para usar variables de entorno, ideal para plataformas como Railway, Heroku o Render.

## Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd n8n-telegram-forwarder
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   BOT_TOKEN=TU_TOKEN_SECRETO_DE_TELEGRAM
   USER_ID=TU_ID_NUMERICO_DE_TELEGRAM
   ```

4. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   El servidor estará corriendo en `http://localhost:3000`.

## Endpoint de la API

- **`POST /notificar`**: Endpoint principal para recibir mensajes.
  - **Cuerpo de la petición (JSON):**
    ```json
    {
      "message": "Este es el contenido del mensaje a reenviar."
    }
    ```

- **`GET /health`**: Endpoint de chequeo para verificar que el servicio está activo.

## Despliegue

Este proyecto está listo para ser desplegado en servicios como Railway. Simplemente conecta tu repositorio de GitHub y establece las variables de entorno `BOT_TOKEN` y `USER_ID` en la configuración del servicio. 