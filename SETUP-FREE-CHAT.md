# 🚀 Configuración del Chat Libre RutiFly

## 📋 Resumen de lo que necesitas

1. **Bot de Telegram** - ✅ Ya implementado
2. **n8n Workflow** - FREE_CHAT para procesar mensajes
3. **Integración MCP** - Conectar bot con n8n

## 🔧 Paso 1: Configurar Variables de Entorno

### En tu bot (Railway/Heroku):
```env
BOT_TOKEN=tu_token_de_telegram
WEBHOOK_SECRET=tu_secret_seguro
N8N_WEBHOOK_URL=https://tu-n8n.railway.app/webhook/chat-libre
```

### En n8n:
```env
BOT_WEBHOOK_URL=https://tu-bot.railway.app
BOT_SECRET=tu_secret_seguro
```

## 🔧 Paso 2: Desplegar el Bot

### Opción A: Railway (Recomendado)
1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio `telegram-rutifly`
3. Configura las variables de entorno
4. El bot se desplegará automáticamente

### Opción B: Heroku
```bash
heroku create tu-bot-rutifly
heroku config:set BOT_TOKEN=tu_token
heroku config:set WEBHOOK_SECRET=tu_secret
heroku config:set N8N_WEBHOOK_URL=https://tu-n8n.railway.app/webhook/chat-libre
git push heroku main
```

## 🔧 Paso 3: Configurar n8n

### Opción A: n8n Cloud
1. Ve a [n8n.io](https://n8n.io)
2. Crea una cuenta
3. Importa el archivo `n8n-free-chat-workflow.json`
4. Configura las variables de entorno

### Opción B: n8n Local con Docker
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=password \
  -e BOT_WEBHOOK_URL=https://tu-bot.railway.app \
  -e BOT_SECRET=tu_secret_seguro \
  n8nio/n8n
```

## 🔧 Paso 4: Importar el Workflow FREE_CHAT

1. **Abre n8n** en tu navegador
2. **Crea un nuevo workflow**
3. **Importa** el archivo `n8n-free-chat-workflow.json`
4. **Activa el workflow**

## 🔧 Paso 5: Probar la Integración

### 1. Busca tu bot en Telegram
```
@tu_bot_rutifly
```

### 2. Envía `/start`
```
¡Hola Usuario! 🤖

Soy el bot de notificaciones de RutiFly.

Comandos disponibles:
/help - Ver ayuda
/status - Estado de notificaciones
/stop - Desactivar notificaciones
/start - Reactivar notificaciones
```

### 3. Envía un mensaje de prueba
```
Hola, necesito ayuda con mi pedido
```

### 4. Verifica en n8n
- Ve a la pestaña "Executions" en n8n
- Deberías ver la ejecución del workflow
- El mensaje se procesa y responde automáticamente

## 📊 Flujo de Funcionamiento

```
Usuario escribe → Bot recibe → Envía a n8n → n8n procesa → Responde al usuario
```

### Detalles técnicos:

1. **Usuario escribe** en Telegram
2. **Bot recibe** el mensaje (línea 86-101 en index.js)
3. **Bot envía** datos a n8n webhook
4. **n8n procesa** con el workflow FREE_CHAT
5. **n8n responde** usando el endpoint `/send-text`
6. **Usuario recibe** la respuesta en Telegram

## 🔍 Verificar que Funciona

### En los logs del bot:
```
📤 Mensaje de 123456789 (usuario): Hola, necesito ayuda
📊 Datos para n8n: {
  "userId": "123456789",
  "username": "usuario",
  "firstName": "Juan",
  "lastName": "Pérez",
  "message": "Hola, necesito ayuda",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "type": "text"
}
```

### En n8n:
- Ve a "Executions" → Deberías ver ejecuciones exitosas
- Ve a "Data" → Los datos del mensaje están disponibles

## 🛠️ Personalizar el Workflow

### Agregar más comandos:
1. **Edita el workflow** en n8n
2. **Agrega nodos "IF"** para nuevos comandos
3. **Crea respuestas personalizadas**

### Ejemplo: Comando `/tiendas`
```json
{
  "conditions": {
    "string": [
      {
        "value1": "{{$json.message}}",
        "operation": "contains",
        "value2": "/tiendas"
      }
    ]
  }
}
```

### Respuesta:
```json
{
  "message": "🏪 **Tiendas Disponibles**\n\n• 🍕 Pizza Express\n• 🍔 Burger House\n• 🥗 Healthy Food\n• 🍰 Sweet Dreams\n\n📍 Todas en San Juan de los Morros",
  "userIds": ["{{$json.userId}}"]
}
```

## 🔧 Solución de Problemas

### El bot no responde:
- Verifica `BOT_TOKEN` en variables de entorno
- Revisa logs del bot en Railway/Heroku
- Confirma que el bot esté activo

### n8n no recibe mensajes:
- Verifica `N8N_WEBHOOK_URL` en el bot
- Confirma que el workflow esté activo
- Revisa logs de n8n

### Mensajes no se envían:
- Verifica `BOT_WEBHOOK_URL` en n8n
- Confirma `BOT_SECRET` en ambos servicios
- Revisa que el usuario haya usado `/start`

## 📈 Escalabilidad

### Para manejar más usuarios:
1. **Base de datos**: Reemplazar almacén en memoria
2. **Colas**: Usar Redis para mensajes masivos
3. **Monitoreo**: Agregar métricas y alertas
4. **Backup**: Configurar respaldos automáticos

### Para más funcionalidades:
1. **IA**: Integrar ChatGPT para respuestas automáticas
2. **Multimedia**: Manejar fotos, videos, documentos
3. **Pagos**: Integrar pasarelas de pago
4. **Analytics**: Seguimiento de conversaciones

## ✅ Checklist de Configuración

- [ ] Bot desplegado en Railway/Heroku
- [ ] Variables de entorno configuradas
- [ ] n8n instalado y configurado
- [ ] Workflow FREE_CHAT importado y activo
- [ ] Usuario probó `/start` en Telegram
- [ ] Mensaje de prueba enviado y respondido
- [ ] Logs verificados en ambos servicios

¡Tu chat libre está listo! 🎉 