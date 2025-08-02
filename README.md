# 🤖 Bot de Telegram para RutiFly

Bot escalable de Telegram que permite comunicación bidireccional entre la aplicación RutiFly y usuarios de Telegram.

## ✨ Características

- **Comunicación bidireccional**: Recibe y envía mensajes
- **Múltiples tipos de contenido**: Texto, audio, video, imágenes
- **Múltiples usuarios**: Envía a usuarios específicos o broadcast
- **Sistema de autorización**: Solo usuarios registrados pueden usar el bot
- **Webhooks seguros**: Autenticación con secret key
- **Logging**: Registro de todas las interacciones

## 🚀 Instalación

1. **Clona el repositorio**
```bash
git clone <tu-repositorio>
cd telegram-rutifly
```

2. **Instala dependencias**
```bash
npm install
```

3. **Configura variables de entorno**
Crea un archivo `.env` con:
```env
BOT_TOKEN=TU_TOKEN_SECRETO_DE_TELEGRAM
WEBHOOK_SECRET=tu-secret-para-webhooks
PORT=3000
```

4. **Inicia el bot**
```bash
npm start
```

## 📱 Cómo usar el bot

### Para usuarios de Telegram:

1. **Busca tu bot** en Telegram (ej: `@tu_bot_rutifly`)
2. **Envía `/start`** para registrarte
3. **Usa los comandos disponibles**:
   - `/start` - Activar notificaciones
   - `/stop` - Desactivar notificaciones  
   - `/status` - Ver tu ID y estado
   - `/help` - Ver ayuda

4. **Envía contenido**:
   - Texto: Escribe cualquier mensaje
   - Audio: Envía mensaje de voz
   - Video: Envía video
   - Imágenes: Envía foto

### Para la aplicación RutiFly:

#### Enviar mensaje de texto:
```bash
curl -X POST http://localhost:3000/send-text \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: tu-secret-para-webhooks" \
  -d '{
    "message": "¡Nuevo pedido recibido!",
    "userIds": ["123456789", "987654321"]
  }'
```

#### Enviar a todos los usuarios (broadcast):
```bash
curl -X POST http://localhost:3000/send-text \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: tu-secret-para-webhooks" \
  -d '{
    "message": "Mantenimiento programado",
    "broadcast": true
  }'
```

#### Enviar audio:
```bash
curl -X POST http://localhost:3000/send-audio \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: tu-secret-para-webhooks" \
  -d '{
    "audioUrl": "https://ejemplo.com/audio.mp3",
    "caption": "Notificación de audio",
    "userIds": ["123456789"]
  }'
```

#### Enviar video:
```bash
curl -X POST http://localhost:3000/send-video \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: tu-secret-para-webhooks" \
  -d '{
    "videoUrl": "https://ejemplo.com/video.mp4",
    "caption": "Tutorial de la app",
    "userIds": ["123456789"]
  }'
```

#### Enviar imagen:
```bash
curl -X POST http://localhost:3000/send-photo \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: tu-secret-para-webhooks" \
  -d '{
    "photoUrl": "https://ejemplo.com/imagen.jpg",
    "caption": "Nueva promoción",
    "userIds": ["123456789"]
  }'
```

## 🔧 Endpoints disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/send-text` | Enviar mensaje de texto |
| `POST` | `/send-audio` | Enviar archivo de audio |
| `POST` | `/send-video` | Enviar archivo de video |
| `POST` | `/send-photo` | Enviar imagen |
| `GET` | `/users` | Listar usuarios autorizados |
| `GET` | `/health` | Estado del servidor |

## 🔐 Seguridad

- **Autenticación**: Todos los webhooks requieren `x-webhook-secret`
- **Autorización**: Solo usuarios que usan `/start` pueden recibir mensajes
- **Validación**: Todos los inputs son validados
- **Logging**: Todas las interacciones se registran

## 📊 Casos de uso para RutiFly

### Notificaciones automáticas:
- Nuevos pedidos recibidos
- Cambios de estado de pedidos
- Confirmaciones de entrega
- Alertas de sistema

### Comunicación con usuarios:
- Soporte al cliente
- Encuestas de satisfacción
- Promociones especiales
- Mantenimiento programado

### Comunicación con riders:
- Nuevas órdenes disponibles
- Actualizaciones de ubicación
- Alertas de seguridad
- Recordatorios de capacitación

## 🚀 Despliegue

### Railway (Recomendado):
1. Conecta tu repositorio a Railway
2. Configura las variables de entorno
3. El bot se desplegará automáticamente

### Heroku:
1. Crea una app en Heroku
2. Conecta tu repositorio
3. Configura las variables de entorno
4. Despliega

### VPS:
1. Clona en tu servidor
2. Instala Node.js
3. Configura PM2 para mantener el bot activo
4. Configura nginx como proxy reverso

## 🔄 Escalabilidad

Para hacer el bot más escalable:

1. **Base de datos**: Reemplazar el almacén en memoria con PostgreSQL/MongoDB
2. **Colas de mensajes**: Usar Redis para manejar envíos masivos
3. **Webhooks**: Implementar retry automático para mensajes fallidos
4. **Monitoreo**: Agregar métricas y alertas
5. **Rate limiting**: Limitar envíos por usuario

## 🔗 Integración con n8n

### ¿Qué es n8n?
n8n es una plataforma de automatización que permite crear flujos de trabajo (workflows) conectando diferentes servicios y APIs.

### Cómo integrar el bot con n8n:

#### 1. **Configurar n8n Webhook**
En n8n, crea un nuevo workflow y agrega un nodo "Webhook":
- **Método**: POST
- **Path**: `/webhook-n8n`
- **Autenticación**: Header `x-webhook-secret`

#### 2. **Flujo básico de notificaciones**
```
[Webhook] → [Procesar datos] → [Enviar a Telegram] → [Respuesta]
```

#### 3. **Ejemplos de workflows para RutiFly:**

##### **Workflow: Notificación de nuevo pedido**
```json
{
  "trigger": "webhook",
  "nodes": [
    {
      "type": "webhook",
      "path": "/nuevo-pedido",
      "method": "POST"
    },
    {
      "type": "httpRequest",
      "url": "https://tu-bot.railway.app/send-text",
      "method": "POST",
      "headers": {
        "x-webhook-secret": "tu-secret",
        "Content-Type": "application/json"
      },
      "body": {
        "message": "🆕 Nuevo pedido #{{$json.orderId}}\n📍 {{$json.address}}\n💰 ${{$json.total}}",
        "userIds": ["{{$json.riderId}}"]
      }
    }
  ]
}
```

##### **Workflow: Cambio de estado de pedido**
```json
{
  "trigger": "webhook",
  "nodes": [
    {
      "type": "webhook",
      "path": "/cambio-estado",
      "method": "POST"
    },
    {
      "type": "switch",
      "conditions": [
        {
          "condition": "{{$json.status === 'preparando'}}",
          "message": "👨‍🍳 Tu pedido está siendo preparado"
        },
        {
          "condition": "{{$json.status === 'en_camino'}}",
          "message": "🚚 Tu pedido está en camino"
        },
        {
          "condition": "{{$json.status === 'entregado'}}",
          "message": "✅ Tu pedido ha sido entregado"
        }
      ]
    },
    {
      "type": "httpRequest",
      "url": "https://tu-bot.railway.app/send-text",
      "method": "POST",
      "headers": {
        "x-webhook-secret": "tu-secret",
        "Content-Type": "application/json"
      },
      "body": {
        "message": "{{$json.message}}\n📦 Pedido #{{$json.orderId}}",
        "userIds": ["{{$json.clientId}}"]
      }
    }
  ]
}
```

##### **Workflow: Broadcast de promociones**
```json
{
  "trigger": "schedule",
  "schedule": "0 12 * * 1" // Lunes a las 12:00
},
{
  "type": "httpRequest",
  "url": "https://tu-bot.railway.app/send-photo",
  "method": "POST",
  "headers": {
    "x-webhook-secret": "tu-secret",
    "Content-Type": "application/json"
  },
  "body": {
    "photoUrl": "https://rutifly.com/promocion-semanal.jpg",
    "caption": "🔥 ¡Oferta semanal!\n\n20% de descuento en todos los pedidos\n\nCódigo: SEMANA20",
    "broadcast": true
  }
}
```

#### 4. **Configuración en n8n:**

1. **Instala n8n** (local o en la nube)
2. **Crea un nuevo workflow**
3. **Agrega nodos HTTP Request** para conectar con tu bot
4. **Configura triggers** (webhook, schedule, etc.)
5. **Prueba el flujo**

#### 5. **Variables de entorno en n8n:**
```env
BOT_WEBHOOK_URL=https://tu-bot.railway.app
BOT_SECRET=tu-secret-para-webhooks
```

#### 6. **Casos de uso avanzados:**

- **Notificaciones automáticas** cuando se crean pedidos
- **Recordatorios** para riders sobre órdenes pendientes
- **Encuestas** automáticas después de entregas
- **Alertas** cuando hay problemas técnicos
- **Reportes** diarios/semanales enviados por Telegram

### Ventajas de usar n8n:
- **Visual**: Creas workflows arrastrando nodos
- **Flexible**: Conecta con cualquier API
- **Escalable**: Maneja múltiples flujos simultáneos
- **Monitoreo**: Ve el estado de cada ejecución
- **Retry**: Reintentos automáticos en caso de fallo

## 🐛 Troubleshooting

### El bot no responde:
- Verifica que `BOT_TOKEN` sea correcto
- Revisa los logs del servidor
- Asegúrate de que el bot esté iniciado

### Los webhooks fallan:
- Verifica que `x-webhook-secret` sea correcto
- Revisa el formato JSON del body
- Confirma que las URLs de archivos sean accesibles

### Usuarios no reciben mensajes:
- Verifica que el usuario haya usado `/start`
- Confirma que el `userIds` sea correcto
- Revisa si el usuario bloqueó el bot 