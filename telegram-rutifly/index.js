const { Telegraf } = require('telegraf');
const express = require('express');

// --- CONFIGURACIÓN ---
// Carga los secretos desde las variables de entorno para seguridad.
const BOT_TOKEN = process.env.BOT_TOKEN;
const USER_ID = process.env.USER_ID;
const PORT = process.env.PORT || 3000;

// Valida que las variables de entorno estén presentes
if (!BOT_TOKEN || !USER_ID) {
    console.error('Error: Las variables de entorno BOT_TOKEN y USER_ID son obligatorias.');
    process.exit(1); // Detiene la aplicación si faltan secretos
}

// --- INICIALIZACIÓN ---
const bot = new Telegraf(BOT_TOKEN);
const app = express();

// Middleware para que Express pueda parsear cuerpos de petición en formato JSON
app.use(express.json());

// --- LÓGICA DEL WEBHOOK ---
// Define el endpoint que recibirá las notificaciones de n8n.
app.post('/notificar', (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ error: 'El cuerpo de la petición debe contener un campo "message".' });
    }

    // Usa el método de la librería Telegraf para enviar el mensaje al User ID especificado.
    bot.telegram.sendMessage(USER_ID, message)
        .then(() => {
            console.log(`Mensaje reenviado exitosamente al User ID: ${USER_ID}`);
            res.status(200).send({ status: 'Mensaje reenviado con éxito.' });
        })
        .catch((error) => {
            console.error('Error al enviar el mensaje a través de Telegram:', error);
            res.status(500).send({ error: 'Error interno al procesar el mensaje.' });
        });
});

// Endpoint de salud para verificar que el servidor está vivo.
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok' });
});

// --- ARRANQUE DEL SERVIDOR Y BOT ---
app.listen(PORT, () => {
    console.log(`Servidor web escuchando en http://localhost:${PORT}`);
});

bot.launch(() => {
    console.log('Bot de Telegram iniciado y listo.');
});

// Manejo de señales para un apagado limpio
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 