#!/bin/bash

echo "🚀 Iniciando la configuración de Osva-Bot..."

# Limpieza de instalaciones anteriores o sesiones caducadas
echo "🧹 Limpiando caché y sesiones antiguas..."
rm -rf node_modules package-lock.json auth_info_baileys

# Instalación de dependencias
echo "📦 Instalando dependencias de Node.js..."
npm install

echo "✅ Instalación completada. Para iniciar el bot, ejecuta: npm start o node FuckLove.js"