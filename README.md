# Osva-Bot 🤖

Un bot de WhatsApp ligero y personalizable, construido con Node.js y la moderna arquitectura Multi-Device a través de la librería `@whiskeysockets/baileys`. 

## ⚙️ Requisitos Previos

Antes de ejecutar este bot, asegúrate de tener instalado:
* **Node.js** (Versión 16 o superior recomendada).
* **Git** (Para clonar el repositorio).
* Una cuenta de WhatsApp activa en tu dispositivo móvil.

## 🚀 Instalación

1. Clona este repositorio en tu máquina local:
   ```bash
   git clone [https://github.com/Osva1/Osva-bot-.git](https://github.com/Osva1/Osva-bot-.git)
   cd Osva-bot-

2. Ejecuta el script instalación
#  npm install

3. listo ejecuta: 
# npm start


La terminal generará un código QR.

Abre WhatsApp en tu celular, ve a Dispositivos Vinculados y selecciona Vincular un dispositivo.

Escanea el código QR de la terminal.

Cuando veas el mensaje "Conectado exitosamente :D", el bot estará en línea.

🛠️ Comandos Disponibles
El bot utiliza el prefijo ! para escuchar instrucciones. Actualmente soporta:

!ping: Responde para verificar que el bot está en línea y funcionando.

!hola: Envía un saludo de confirmación.

🔒 Seguridad
El archivo de sesión se guarda automáticamente en el directorio local auth_info_baileys/. Nunca subas esta carpeta a tu repositorio, ya que contiene tus credenciales de acceso de WhatsApp.