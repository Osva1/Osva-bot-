const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializa la IA 
const genAI = new GoogleGenerativeAI("AIzaSyB1VqPVJiqz28XtkmHtPKNKftOotT9vDZ0");

async function iniciar() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const client = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" })
    });

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('Escanea este código QR con tu WhatsApp:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            // Extraemos el código de error para saber qué pasó
            const reason = lastDisconnect.error?.output?.statusCode;

            // Si el código dice que el usuario cerró sesión en su teléfono:
            if (reason === DisconnectReason.loggedOut) {
                console.log('📱 Se detectó cierre de sesión desde el celular. Limpiando archivos...');

                // Borra la carpeta de autenticación de forma segura y recursiva
                fs.rmSync('./auth_info_baileys', { recursive: true, force: true });

                console.log('🧹 Caché eliminada. Reiniciando el bot para un nuevo QR...');
                iniciar(); // Llama a iniciar de nuevo (creará una carpeta limpia)

            } else {
                // Si fue una caída de internet normal, solo reconecta sin borrar nada
                console.log('⚠️ Conexión interrumpida. Intentando reconectar...');
                iniciar();
            }

        } else if (connection === 'open') {
            console.log('✅ Conectado exitosamente :D');
        }
    });

    client.ev.on('creds.update', saveCreds);

    client.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";
        const prefix = '-';

        if (!texto.startsWith(prefix)) return;

        const args = texto.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        switch (command) {
            case 'ping':
                await client.sendMessage(msg.key.remoteJid, { text: '¡Pong! 🏓 El bot está al 100.' });
                break;

            // --- COMANDO PARA HACER STICKERS ---
            case 's':
            case 'sticker':
                try {
                    // Verifica si el mensaje es una imagen o si está respondiendo a una imagen
                    const isImage = msg.message.imageMessage;
                    const isQuotedImage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

                    if (!isImage && !isQuotedImage) {
                        await client.sendMessage(msg.key.remoteJid, { text: '📸 Manda una imagen con la leyenda !s o responde a una imagen con !s' });
                        return;
                    }

                    // Descarga la imagen
                    const messageType = isImage ? msg : { message: msg.message.extendedTextMessage.contextInfo.quotedMessage };
                    const buffer = await downloadMediaMessage(messageType, 'buffer', {}, { logger: pino({ level: 'silent' }) });

                    // Convierte la imagen a sticker
                    const sticker = new Sticker(buffer, {
                        pack: 'Osva-Bot', // Nombre del paquete
                        author: 'Osvaldo', // Creador
                        type: StickerTypes.FULL,
                        quality: 50
                    });

                    await client.sendMessage(msg.key.remoteJid, await sticker.toMessage());
                } catch (error) {
                    console.error(error);
                    await client.sendMessage(msg.key.remoteJid, { text: '❌ Hubo un error al crear el sticker.' });
                }
                break;

            // --- COMANDO PARA LA IA (GEMINI) ---
            case 'ia':
                try {
                    const prompt = args.join(" ");
                    if (!prompt) {
                        await client.sendMessage(msg.key.remoteJid, { text: '🤖 Dime, ¿de qué quieres hablar? Ejemplo: -ia Cuéntame un chiste.' });
                        return;
                    }

                    // Le avisa al usuario que está "pensando"
                    await client.sendMessage(msg.key.remoteJid, { text: 'Procesando...' });

                    // Llama a la IA
                    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                    const result = await model.generateContent(prompt);
                    const respuestaIA = result.response.text();

                    await client.sendMessage(msg.key.remoteJid, { text: respuestaIA });
                } catch (error) {
                    console.error(error);
                    await client.sendMessage(msg.key.remoteJid, { text: '❌ Mi cerebro de IA está desconectado en este momento.' });
                }
                break;

            default:
                await client.sendMessage(msg.key.remoteJid, { text: `Comando *!${command}* no reconocido.` });
                break;
        }
    });
}

iniciar().catch(err => console.log("unexpected error: " + err));