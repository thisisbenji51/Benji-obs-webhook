#!/bin/bash

# === Konfiguration ===
API_KEY="rnd_Mtac37O3CUT1aGXsc8UDz1sVs0rv"
SERVICE_ID="srv-d254qnvgi27c73bmijqg"

# === Ngrok starten ===
echo "🚀 Starte ngrok TCP auf Port 4455..."
/opt/homebrew/bin/ngrok tcp 4455 > ngrok.log &
sleep 3

# === Warten bis ngrok-Adresse erscheint ===
NGROK_URL=""
echo "⏳ Suche ngrok-Adresse..."

for i in {1..10}; do
  NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -Eo 'tcp://[^\"]+')
  if [[ $NGROK_URL != "" ]]; then
    break
  fi
  sleep 1
done

if [[ $NGROK_URL == "" ]]; then
  echo "❌ Fehler: Konnte ngrok-Adresse nicht finden"
  exit 1
fi

# === TCP → WSS umwandeln ===
WSS_URL="wss://${NGROK_URL#tcp://}"
echo "🔗 Gefundene WebSocket-Adresse: $WSS_URL"

# === OBS_URL bei Render setzen ===
echo "🛠️ Aktualisiere OBS_URL bei Render..."
curl -s -X PATCH "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "[
    {\"key\":\"OBS_URL\", \"value\":\"$WSS_URL\"}
  ]" > /dev/null

# === Neu deployen ===
echo "🔄 Starte neuen Deploy bei Render..."
curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Accept: application/json" > /dev/null

echo "✅ Fertig! OBS_URL aktualisiert und Server neu gestartet."
