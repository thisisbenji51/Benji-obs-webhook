const express = require('express');
const OBSWebSocket = require('obs-websocket-js').OBSWebSocket;

const app = express();
const port = process.env.PORT || 3000;

const obs = new OBSWebSocket();

// Verbindung zu OBS WebSocket
const OBS_URL = process.env.OBS_URL || 'ws://127.0.0.1:4455';
const OBS_PASSWORD = process.env.OBS_PASSWORD || 'abNIjmBjvcGempaC';

obs.connect(OBS_URL, OBS_PASSWORD)
  .then(() => console.log('✅ OBS verbunden'))
  .catch(err => console.error('❌ Fehler bei OBS-Verbindung:', err));

// Szenenwechsel
app.get('/switch/:scene', async (req, res) => {
  const scene = req.params.scene;
  try {
    await obs.call('SetCurrentProgramScene', { sceneName: scene });
    res.send(`Szene gewechselt zu: ${scene}`);
  } catch (err) {
    console.error('❌ Fehler beim Szenenwechsel:', err);
    res.status(500).send('Fehler beim Szenenwechsel');
  }
});

// Server starten
app.listen(port, () => {
  console.log(`🚀 Server läuft auf Port ${port}`);
});
