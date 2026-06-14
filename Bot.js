const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal'); 

async function iniciar () { 
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

        if(connection === 'close') {
            console.log('Conexión cerrada, intentando reconectar...');
            iniciar(); 
        } else if(connection === 'open') {
            console.log('Conectado exitosamente :D');
        }
    });

    client.ev.on('creds.update', saveCreds);

    client.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        if (!msg.message || msg.key.fromMe) return; 

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        const prefix = '!';

        if (!texto.startsWith(prefix)) return;

        const args = texto.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        switch (command) {
            case 'ping':
                await client.sendMessage(msg.key.remoteJid, { text: '¡Pong! 🏓 El bot está en línea y escuchando.' });
                break;
            
            case 'hola':
                await client.sendMessage(msg.key.remoteJid, { text: '¡Qué onda! Listo para trabajar.' });
                break;
            
            default:
                await client.sendMessage(msg.key.remoteJid, { text: `Comando *!${command}* no reconocido.` });
                break;
        }
    });
}

iniciar().catch(err => console.log("unexpected error: " + err));