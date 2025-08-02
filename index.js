const { Telegraf } = require('telegraf');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Importar fetch para Node.js (versión 18+)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// --- CONFIGURACIÓN ---
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'rutifly-secret';

// Valida que el token esté presente
if (!BOT_TOKEN) {
    console.error('Error: La variable de entorno BOT_TOKEN es obligatoria.');
    process.exit(1);
}

// --- INICIALIZACIÓN ---
const bot = new Telegraf(BOT_TOKEN);
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Almacén en memoria para usuarios autorizados (en producción usar base de datos)
const authorizedUsers = new Set();
const userSettings = new Map(); // Configuraciones por usuario

// --- FUNCIONES UTILITARIAS ---
function saveMessageToLog(userId, message, type = 'text') {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId,
        type,
        message: type === 'text' ? message : `[${type.toUpperCase()}]`,
    };
    
    console.log('📝 Log:', logEntry);
    // Aquí podrías guardar en base de datos
}

function isAuthorizedUser(userId) {
    return authorizedUsers.has(userId.toString());
}

// --- MANEJO DE COMANDOS DEL BOT ---
bot.command('start', (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'Usuario';
    
    authorizedUsers.add(userId.toString());
    userSettings.set(userId.toString(), { notifications: true, language: 'es' });
    
    ctx.reply(`¡Hola ${username}! 🤖\n\nSoy el bot de notificaciones de RutiFly.\n\nComandos disponibles:\n/help - Ver ayuda\n/status - Estado de notificaciones\n/stop - Desactivar notificaciones\n/start - Reactivar notificaciones`);
    
    console.log(`✅ Usuario autorizado: ${userId} (${username})`);
});

bot.command('help', (ctx) => {
    ctx.reply(`📋 **Comandos disponibles:**\n\n` +
        `🔔 /start - Activar notificaciones\n` +
        `🔕 /stop - Desactivar notificaciones\n` +
        `📊 /status - Ver estado actual\n` +
        `❓ /help - Esta ayuda\n\n` +
        `💡 También puedes enviarme mensajes de texto, audio, video o imágenes y los reenviaré a la aplicación.`);
});

bot.command('status', (ctx) => {
    const userId = ctx.from.id.toString();
    const settings = userSettings.get(userId) || { notifications: true };
    
    const status = settings.notifications ? '🔔 Activadas' : '🔕 Desactivadas';
    ctx.reply(`📊 **Estado de notificaciones:**\n${status}\n\nTu ID: \`${userId}\``, { parse_mode: 'Markdown' });
});

bot.command('stop', (ctx) => {
    const userId = ctx.from.id.toString();
    const settings = userSettings.get(userId) || {};
    settings.notifications = false;
    userSettings.set(userId, settings);
    
    ctx.reply('🔕 Notificaciones desactivadas. Usa /start para reactivarlas.');
});

// --- MANEJO DE MENSAJES DE TEXTO ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const message = ctx.message.text;
    const username = ctx.from.username || 'Usuario';
    const firstName = ctx.from.first_name || '';
    const lastName = ctx.from.last_name || '';
    
    if (!isAuthorizedUser(userId)) {
        ctx.reply('❌ No estás autorizado. Usa /start para registrarte.');
        return;
    }
    
    saveMessageToLog(userId, message, 'text');
    
    // Enviar mensaje a n8n para procesamiento
    const messageData = {
        userId: userId.toString(),
        username: username,
        firstName: firstName,
        lastName: lastName,
        message: message,
        timestamp: new Date().toISOString(),
        type: 'text'
    };
    
    // Aquí puedes enviar a n8n o guardar en base de datos
    console.log(`📤 Mensaje de ${userId} (${username}): ${message}`);
    console.log('📊 Datos para n8n:', JSON.stringify(messageData, null, 2));
    
    // Opcional: Enviar a n8n webhook si está configurado
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
        fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-webhook-secret': WEBHOOK_SECRET
            },
            body: JSON.stringify(messageData)
        }).catch(error => {
            console.error('Error enviando a n8n:', error);
        });
    }
    
    ctx.reply('✅ Mensaje recibido y procesado.');
});

// --- MANEJO DE AUDIO ---
bot.on('voice', async (ctx) => {
    const userId = ctx.from.id;
    
    if (!isAuthorizedUser(userId)) {
        ctx.reply('❌ No estás autorizado. Usa /start para registrarte.');
        return;
    }
    
    try {
        const file = await ctx.telegram.getFile(ctx.message.voice.file_id);
        const filePath = file.file_path;
        
        saveMessageToLog(userId, `Audio: ${filePath}`, 'audio');
        
        ctx.reply('🎵 Audio recibido y procesado.');
        console.log(`🎵 Audio de ${userId}: ${filePath}`);
    } catch (error) {
        console.error('Error procesando audio:', error);
        ctx.reply('❌ Error procesando el audio.');
    }
});

// --- MANEJO DE VIDEO ---
bot.on('video', async (ctx) => {
    const userId = ctx.from.id;
    
    if (!isAuthorizedUser(userId)) {
        ctx.reply('❌ No estás autorizado. Usa /start para registrarte.');
        return;
    }
    
    try {
        const file = await ctx.telegram.getFile(ctx.message.video.file_id);
        const filePath = file.file_path;
        
        saveMessageToLog(userId, `Video: ${filePath}`, 'video');
        
        ctx.reply('🎥 Video recibido y procesado.');
        console.log(`🎥 Video de ${userId}: ${filePath}`);
    } catch (error) {
        console.error('Error procesando video:', error);
        ctx.reply('❌ Error procesando el video.');
    }
});

// --- MANEJO DE IMÁGENES ---
bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    
    if (!isAuthorizedUser(userId)) {
        ctx.reply('❌ No estás autorizado. Usa /start para registrarte.');
        return;
    }
    
    try {
        const photo = ctx.message.photo[ctx.message.photo.length - 1]; // La de mayor resolución
        const file = await ctx.telegram.getFile(photo.file_id);
        const filePath = file.file_path;
        
        saveMessageToLog(userId, `Imagen: ${filePath}`, 'photo');
        
        ctx.reply('📸 Imagen recibida y procesada.');
        console.log(`📸 Imagen de ${userId}: ${filePath}`);
    } catch (error) {
        console.error('Error procesando imagen:', error);
        ctx.reply('❌ Error procesando la imagen.');
    }
});

// --- WEBHOOKS PARA ENVIAR MENSAJES DESDE LA APLICACIÓN ---

// Webhook para recibir mensajes de usuarios (para n8n)
app.post('/webhook-incoming', (req, res) => {
    const secret = req.headers['x-webhook-secret'];
    
    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).send({ error: 'No autorizado' });
    }
    
    // Este endpoint será llamado por n8n para recibir mensajes
    // Los mensajes se envían automáticamente cuando los usuarios escriben al bot
    res.status(200).send({ 
        status: 'Webhook configurado correctamente',
        message: 'Los mensajes de usuarios se enviarán automáticamente a este endpoint'
    });
});

// Enviar mensaje de texto a múltiples usuarios
app.post('/send-text', (req, res) => {
    const { message, userIds = [], broadcast = false } = req.body;
    const secret = req.headers['x-webhook-secret'];
    
    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).send({ error: 'No autorizado' });
    }
    
    if (!message) {
        return res.status(400).send({ error: 'Mensaje requerido' });
    }
    
    const targets = broadcast ? Array.from(authorizedUsers) : userIds;
    const results = [];
    
    targets.forEach(userId => {
        if (isAuthorizedUser(userId)) {
            bot.telegram.sendMessage(userId, message)
                .then(() => {
                    results.push({ userId, status: 'success' });
                    console.log(`✅ Mensaje enviado a ${userId}`);
                })
                .catch(error => {
                    results.push({ userId, status: 'error', error: error.message });
                    console.error(`❌ Error enviando a ${userId}:`, error.message);
                });
        }
    });
    
    res.status(200).send({ 
        status: 'Procesando envío',
        targets: targets.length,
        results 
    });
});

// Enviar audio
app.post('/send-audio', (req, res) => {
    const { audioUrl, caption, userIds = [], broadcast = false } = req.body;
    const secret = req.headers['x-webhook-secret'];
    
    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).send({ error: 'No autorizado' });
    }
    
    if (!audioUrl) {
        return res.status(400).send({ error: 'URL de audio requerida' });
    }
    
    const targets = broadcast ? Array.from(authorizedUsers) : userIds;
    
    targets.forEach(userId => {
        if (isAuthorizedUser(userId)) {
            bot.telegram.sendAudio(userId, audioUrl, { caption })
                .then(() => console.log(`✅ Audio enviado a ${userId}`))
                .catch(error => console.error(`❌ Error enviando audio a ${userId}:`, error.message));
        }
    });
    
    res.status(200).send({ status: 'Audio enviado' });
});

// Enviar video
app.post('/send-video', (req, res) => {
    const { videoUrl, caption, userIds = [], broadcast = false } = req.body;
    const secret = req.headers['x-webhook-secret'];
    
    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).send({ error: 'No autorizado' });
    }
    
    if (!videoUrl) {
        return res.status(400).send({ error: 'URL de video requerida' });
    }
    
    const targets = broadcast ? Array.from(authorizedUsers) : userIds;
    
    targets.forEach(userId => {
        if (isAuthorizedUser(userId)) {
            bot.telegram.sendVideo(userId, videoUrl, { caption })
                .then(() => console.log(`✅ Video enviado a ${userId}`))
                .catch(error => console.error(`❌ Error enviando video a ${userId}:`, error.message));
        }
    });
    
    res.status(200).send({ status: 'Video enviado' });
});

// Enviar imagen
app.post('/send-photo', (req, res) => {
    const { photoUrl, caption, userIds = [], broadcast = false } = req.body;
    const secret = req.headers['x-webhook-secret'];
    
    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).send({ error: 'No autorizado' });
    }
    
    if (!photoUrl) {
        return res.status(400).send({ error: 'URL de imagen requerida' });
    }
    
    const targets = broadcast ? Array.from(authorizedUsers) : userIds;
    
    targets.forEach(userId => {
        if (isAuthorizedUser(userId)) {
            bot.telegram.sendPhoto(userId, photoUrl, { caption })
                .then(() => console.log(`✅ Imagen enviada a ${userId}`))
                .catch(error => console.error(`❌ Error enviando imagen a ${userId}:`, error.message));
        }
    });
    
    res.status(200).send({ status: 'Imagen enviada' });
});

// Endpoint para obtener usuarios autorizados
app.get('/users', (req, res) => {
    const secret = req.headers['x-webhook-secret'];
    
    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).send({ error: 'No autorizado' });
    }
    
    res.status(200).send({
        totalUsers: authorizedUsers.size,
        users: Array.from(authorizedUsers)
    });
});

// Endpoint de salud mejorado
app.get('/health', (req, res) => {
    res.status(200).send({ 
        status: 'ok',
        botStatus: 'running',
        authorizedUsers: authorizedUsers.size,
        uptime: process.uptime()
    });
});

// --- ARRANQUE DEL SERVIDOR Y BOT ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor web escuchando en http://localhost:${PORT}`);
    console.log(`📊 Endpoints disponibles:`);
    console.log(`   POST /send-text - Enviar mensaje de texto`);
    console.log(`   POST /send-audio - Enviar audio`);
    console.log(`   POST /send-video - Enviar video`);
    console.log(`   POST /send-photo - Enviar imagen`);
    console.log(`   GET /users - Listar usuarios autorizados`);
    console.log(`   GET /health - Estado del servidor`);
});

bot.launch(() => {
    console.log('🤖 Bot de Telegram iniciado y listo.');
    console.log('💡 Usuarios pueden iniciar el bot con /start');
});

// Manejo de señales para un apagado limpio
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 