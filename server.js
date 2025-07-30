
const OBSWebSocket = require('obs-websocket-js').OBSWebSocket;
const port = 3000;

const obs = new OBSWebSocket();

obs.connect('ws://127.0.0.1:4455', 'abNIjmBjvcGempaC') // <- Hier dein OBS-Passwort!
  .then(() => console.log('OBS verbunden'))
  .catch(console.error);

app.get('/switch/:scene', async (req, res) => {
  const scene = req.params.scene;
  try {
    await obs.call('SetCurrentProgramScene', { sceneName: scene });
    res.send(`Szene gewechselt zu: ${scene}`);
  } catch (err) {
    res.status(500).send('Fehler beim Szenenwechsel');
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// === Konfiguration ===
// Diese Werte später bei Render als Umgebungsvariablen eintragen
const OBS_URL = process.env.OBS_URL;
const OBS_PASSWORD = process.env.OBS_PASSWORD;
const SECRET_KEY = 'ben123'; // Schutzschlüssel für Trigger-URLs

const obs = new OBSWebSocket();

(async () => {
  try {
    await obs.connect(OBS_URL, OBS_PASSWORD);
    console.log('✅ Verbunden mit OBS');
  } catch (err) {
    console.error('❌ Fehler beim Verbinden mit OBS:', err);
  }
})();

// === Middleware ===
app.use((req, res, next) => {
  const userKey = req.query.key;
  if (SECRET_KEY && userKey !== SECRET_KEY) {
    return res.status(403).send('❌ Ungültiger Zugriffsschlüssel');
  }
  next();
});

// === Trigger: Szenenwechsel ===
app.get('/switch/:scene', async (req, res) => {
  const scene = req.params.scene;
  try {
    await obs.call('SetCurrentProgramScene', { sceneName: scene });
    res.send(`✅ Szene gewechselt zu: ${scene}`);
  } catch (err) {
    res.status(500).send('❌ Fehler beim Szenenwechsel');
  }
});

// === Trigger: Quelle einblenden ===
app.get('/show/:source', async (req, res) => {
  const source = req.params.source;
  try {
    await obs.call('SetSceneItemEnabled', {
      sceneName: await getCurrentScene(),
      sceneItemId: await getSceneItemId(source),
      sceneItemEnabled: true,
    });
    res.send(`✅ Quelle eingeblendet: ${source}`);
  } catch (err) {
    res.status(500).send('❌ Fehler beim Einblenden');
  }
});

// === Trigger: Quelle ausblenden ===
app.get('/hide/:source', async (req, res) => {
  const source = req.params.source;
  try {
    await obs.call('SetSceneItemEnabled', {
      sceneName: await getCurrentScene(),
      sceneItemId: await getSceneItemId(source),
      sceneItemEnabled: false,
    });
    res.send(`✅ Quelle ausgeblendet: ${source}`);
  } catch (err) {
    res.status(500).send('❌ Fehler beim Ausblenden');
  }
});

// === Hilfsfunktionen ===
async function getCurrentScene() {
  const res = await obs.call('GetCurrentProgramScene');
  return res.currentProgramSceneName;
}

async function getSceneItemId(sourceName) {
  const sceneName = await getCurrentScene();
  const res = await obs.call('GetSceneItemList', { sceneName });
  const item = res.sceneItems.find(i => i.sourceName === sourceName);
  if (!item) throw new Error('Quelle nicht gefunden');
  return item.sceneItemId;
}

// === Server starten ===
app.listen(port, () => {
  console.log(`🚀 Server läuft auf Port ${port}`);
});
