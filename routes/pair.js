const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { makeid } = require('../id');
const {
  default: cyber_Tech,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore
} = require('maher-zubair-baileys');

const router = express.Router();

function removeFile(FilePath) {
  if (fs.existsSync(FilePath)) {
    fs.rmSync(FilePath, { recursive: true, force: true });
  }
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  if (!num) return res.send({ error: 'Phone number required' });

  const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);

  try {
    const sock = cyber_Tech({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
      },
      printQRInTerminal: false,
      logger: pino({ level: 'fatal' }),
      browser: ['Chrome', 'Ubuntu', '22']
    });

    if (!sock.authState.creds.registered) {
      await delay(1500);
      num = num.replace(/[^0-9]/g, '');
      const code = await sock.requestPairingCode(num);
      if (!res.headersSent) res.send({ code });
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection }) => {
      if (connection === 'open') {
        const sessionId = makeid();

        // 1. Send the session ID first
        const sent = await sock.sendMessage(sock.user.id, {
          text: `*${sessionId}*`
        });

        // 2. Tag it afterwards
        await sock.sendMessage(sock.user.id, {
          text: `📌 Above is your session from Cyber_Jay`,
          quoted: sent
        });

        // 3. SHADOW-REAPER-MD info block
        const infoMsg = `
┏━━━━━━━━━━━━━━ 
┃SHADOW-REAPER-MD SESSION IS 
┃SUCCESSFULLY
┃CONNECTED ✅🔥
┗━━━━━━━━━━━━━━━
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❶ || Creator = 🤓 CYBER_JAY 🤓
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❷ || WhattsApp Channel = https://whatsapp.com/channel/0029VafHRSWDzgTGeS2rGn3c
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
Please Follow My Support Channel
Wanna talk to me?👉 https://t.me/billy 👈
                 🙅🏽‍♂️ https://wa.me/M2BKBKULFC5QP1 🙅🏽‍♂️
▬▬▬▬▬▬▬▬▬▬▬▬▬▬

©*2025-to-date Cyber_Jay*

_Don't Forget To Give A ⭐Star To My Repo_
_____________________________________
        `;

        await delay(500);
        await sock.sendMessage(sock.user.id, { text: infoMsg });

        await delay(500);
        await sock.ws.close();
        removeFile(`./temp/${id}`);
      }
    });
  } catch (err) {
    console.log('Restarting due to error');
    removeFile(`./temp/${id}`);
    if (!res.headersSent) res.send({ error: 'Service Unavailable' });
  }
});

module.exports = router;
