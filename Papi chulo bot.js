const { WAConnection } = require('@adiwajshing/baileys');
const fs = require('fs');

async function iniciar () { 
        const client = new WAConnection()

        client.logger.level = 'warn'

        client.on('qr', () => {
        })

        fs.existsSync('./Osvapapi.json') && client.loadAuthInfo('./Osvapapi.json')

        client.on('connecting', () => {
        console.log('Conectando')
        })

        client.on('open', () => {
        console.log('Conectado perfectamente ahora eres un papi chulo')
        })
        await client.connect({timeoutMs: 30*1000})
        fs.writeFileSync('./Osvapapi.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))
        }

iniciar ()
.catch (err => console.log("unexpected error: " + err))
