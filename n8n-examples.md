# 🔗 Ejemplos de Workflows n8n para RutiFly

## 📋 Workflow 1: Notificación de Nuevo Pedido

### Descripción
Envía una notificación automática a riders cuando se crea un nuevo pedido.

### Configuración en n8n:

#### Paso 1: Webhook Trigger
```json
{
  "name": "Nuevo Pedido Webhook",
  "type": "webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "nuevo-pedido",
    "authentication": "headerAuth",
    "headerName": "x-webhook-secret",
    "headerValue": "{{$env.BOT_SECRET}}"
  }
}
```

#### Paso 2: Procesar Datos
```json
{
  "name": "Procesar Pedido",
  "type": "set",
  "parameters": {
    "values": {
      "orderId": "{{$json.orderId}}",
      "clientName": "{{$json.clientName}}",
      "address": "{{$json.deliveryAddress}}",
      "total": "{{$json.total}}",
      "items": "{{$json.items}}",
      "riderId": "{{$json.assignedRiderId}}"
    }
  }
}
```

#### Paso 3: Enviar a Telegram
```json
{
  "name": "Notificar Rider",
  "type": "httpRequest",
  "parameters": {
    "url": "{{$env.BOT_WEBHOOK_URL}}/send-text",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "x-webhook-secret": "{{$env.BOT_SECRET}}"
    },
    "body": {
      "message": "🆕 **Nuevo Pedido Asignado**\n\n📦 Pedido: #{{$json.orderId}}\n👤 Cliente: {{$json.clientName}}\n📍 Dirección: {{$json.address}}\n💰 Total: ${{$json.total}}\n\n⏰ Tiempo estimado: 30-45 min",
      "userIds": ["{{$json.riderId}}"]
    }
  }
}
```

## 📋 Workflow 2: Cambio de Estado de Pedido

### Descripción
Notifica al cliente cuando cambia el estado de su pedido.

### Configuración:

#### Paso 1: Webhook Trigger
```json
{
  "name": "Cambio Estado Webhook",
  "type": "webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "cambio-estado",
    "authentication": "headerAuth",
    "headerName": "x-webhook-secret",
    "headerValue": "{{$env.BOT_SECRET}}"
  }
}
```

#### Paso 2: Switch Node (Condiciones)
```json
{
  "name": "Determinar Mensaje",
  "type": "switch",
  "parameters": {
    "rules": {
      "rules": [
        {
          "conditions": {
            "string": [
              {
                "value1": "{{$json.status}}",
                "operation": "equals",
                "value2": "confirmado"
              }
            ]
          },
          "output": {
            "message": "✅ **Pedido Confirmado**\n\nTu pedido #{{$json.orderId}} ha sido confirmado y está siendo preparado.\n⏰ Tiempo estimado: 25-35 minutos"
          }
        },
        {
          "conditions": {
            "string": [
              {
                "value1": "{{$json.status}}",
                "operation": "equals",
                "value2": "preparando"
              }
            ]
          },
          "output": {
            "message": "👨‍🍳 **Pedido en Preparación**\n\nTu pedido #{{$json.orderId}} está siendo preparado en la cocina.\n⏰ Tiempo restante: 15-20 minutos"
          }
        },
        {
          "conditions": {
            "string": [
              {
                "value1": "{{$json.status}}",
                "operation": "equals",
                "value2": "en_camino"
              }
            ]
          },
          "output": {
            "message": "🚚 **Pedido en Camino**\n\nTu pedido #{{$json.orderId}} está siendo entregado.\n👤 Rider: {{$json.riderName}}\n📱 Tel: {{$json.riderPhone}}\n⏰ Llegada estimada: 10-15 minutos"
          }
        },
        {
          "conditions": {
            "string": [
              {
                "value1": "{{$json.status}}",
                "operation": "equals",
                "value2": "entregado"
              }
            ]
          },
          "output": {
            "message": "🎉 **¡Pedido Entregado!**\n\nTu pedido #{{$json.orderId}} ha sido entregado exitosamente.\n\n⭐ ¿Cómo fue tu experiencia? Responde con una calificación del 1-5"
          }
        }
      ]
    }
  }
}
```

#### Paso 3: Enviar Notificación
```json
{
  "name": "Notificar Cliente",
  "type": "httpRequest",
  "parameters": {
    "url": "{{$env.BOT_WEBHOOK_URL}}/send-text",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "x-webhook-secret": "{{$env.BOT_SECRET}}"
    },
    "body": {
      "message": "{{$json.message}}",
      "userIds": ["{{$json.clientId}}"]
    }
  }
}
```

## 📋 Workflow 3: Promociones Automáticas

### Descripción
Envía promociones semanales a todos los usuarios registrados.

### Configuración:

#### Paso 1: Schedule Trigger
```json
{
  "name": "Promoción Semanal",
  "type": "schedule",
  "parameters": {
    "rule": {
      "hour": 12,
      "minute": 0,
      "weekday": 1
    }
  }
}
```

#### Paso 2: Enviar Promoción
```json
{
  "name": "Enviar Promoción",
  "type": "httpRequest",
  "parameters": {
    "url": "{{$env.BOT_WEBHOOK_URL}}/send-photo",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "x-webhook-secret": "{{$env.BOT_SECRET}}"
    },
    "body": {
      "photoUrl": "https://rutifly.com/promociones/semana-actual.jpg",
      "caption": "🔥 **¡Oferta Semanal RutiFly!**\n\n🎯 20% de descuento en todos los pedidos\n📅 Válido hasta el domingo\n💳 Código: SEMANA20\n\n🚀 ¡Ordena ahora y ahorra!",
      "broadcast": true
    }
  }
}
```

## 📋 Workflow 4: Encuesta de Satisfacción

### Descripción
Envía encuestas automáticas después de entregas exitosas.

### Configuración:

#### Paso 1: Webhook Trigger
```json
{
  "name": "Encuesta Webhook",
  "type": "webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "encuesta-satisfaccion",
    "authentication": "headerAuth",
    "headerName": "x-webhook-secret",
    "headerValue": "{{$env.BOT_SECRET}}"
  }
}
```

#### Paso 2: Enviar Encuesta
```json
{
  "name": "Enviar Encuesta",
  "type": "httpRequest",
  "parameters": {
    "url": "{{$env.BOT_WEBHOOK_URL}}/send-text",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "x-webhook-secret": "{{$env.BOT_SECRET}}"
    },
    "body": {
      "message": "📊 **Encuesta de Satisfacción**\n\n¡Gracias por usar RutiFly!\n\n¿Cómo calificarías tu experiencia?\n\n1️⃣ ⭐ Muy mala\n2️⃣ ⭐⭐ Mala\n3️⃣ ⭐⭐⭐ Regular\n4️⃣ ⭐⭐⭐⭐ Buena\n5️⃣ ⭐⭐⭐⭐⭐ Excelente\n\nResponde con el número correspondiente.",
      "userIds": ["{{$json.clientId}}"]
    }
  }
}
```

## 📋 Workflow 5: Alertas de Sistema

### Descripción
Notifica a administradores sobre problemas técnicos.

### Configuración:

#### Paso 1: Webhook Trigger
```json
{
  "name": "Alerta Sistema Webhook",
  "type": "webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "alerta-sistema",
    "authentication": "headerAuth",
    "headerName": "x-webhook-secret",
    "headerValue": "{{$env.BOT_SECRET}}"
  }
}
```

#### Paso 2: Enviar Alerta
```json
{
  "name": "Enviar Alerta",
  "type": "httpRequest",
  "parameters": {
    "url": "{{$env.BOT_WEBHOOK_URL}}/send-text",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "x-webhook-secret": "{{$env.BOT_SECRET}}"
    },
    "body": {
      "message": "🚨 **Alerta de Sistema**\n\n⚠️ {{$json.alertType}}\n📝 {{$json.description}}\n🕐 {{$json.timestamp}}\n🔗 {{$json.dashboardUrl}}",
      "userIds": ["{{$json.adminIds}}"]
    }
  }
}
```

## 🔧 Variables de Entorno en n8n

Configura estas variables en tu instancia de n8n:

```env
BOT_WEBHOOK_URL=https://tu-bot.railway.app
BOT_SECRET=tu-secret-para-webhooks
RUTIFLY_API_URL=https://tu-api-rutifly.com
RUTIFLY_API_KEY=tu-api-key
```

## 📊 Monitoreo de Workflows

### Métricas importantes:
- **Tasa de éxito**: % de mensajes enviados correctamente
- **Tiempo de respuesta**: Latencia entre trigger y envío
- **Errores**: Fallos en webhooks o envíos
- **Usuarios activos**: Cantidad de usuarios que reciben mensajes

### Logs recomendados:
- Timestamp de cada ejecución
- Datos del pedido/evento
- Usuario destinatario
- Estado del envío (éxito/error)
- Tiempo de procesamiento

## 🚀 Despliegue de n8n

### Opción 1: n8n Cloud
1. Ve a [n8n.io](https://n8n.io)
2. Crea una cuenta
3. Importa los workflows
4. Configura las variables de entorno

### Opción 2: Docker
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=password \
  n8nio/n8n
```

### Opción 3: Railway
1. Conecta tu repositorio con n8n
2. Configura las variables de entorno
3. Despliega automáticamente 