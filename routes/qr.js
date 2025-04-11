const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const QRCode = require('qrcode');
const { makeid } = require('../id');
const { delay } = require('@whiskeysockets/baileys');
const {
  default: cyber_Tech,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@whiskeysockets/baileys');

const router = express.Router();

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return;
  fs.rmSync(FilePath, {
    recursive: true,
    force: true
  });
}

router.get('/', async (req, res) => {
  // Set up SSE (Server-Sent Events) headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const id = makeid();
  const tempPath = path.join(__dirname, '..', 'temp', id);
  const { state, saveCreds } = await useMultiFileAuthState(tempPath);

  const sock = cyber_Tech({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Desktop')
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      const qrDataUrl = await QRCode.toDataURL(qr);
      res.write(`data: ${qrDataUrl}\n\n`);
    }

    if (connection === 'open') {
      await delay(5000);
      const credsPath = path.join(tempPath, 'creds.json');
      const base64 = fs.existsSync(credsPath)
        ? Buffer.from(fs.readFileSync(credsPath)).toString('base64')
        : '';

      const sessionMessage = await sock.sendMessage(sock.user.id, { text: `*${base64}*` });

      const messageText = `
┏━━━━━━━━━━━━━━
┃SHADOW-REAPER-MD SESSION IS 
┃SUCCESSFULLY
┃CONNECTED ✅🔥
┗━━━━━━━━━━━━━━━
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❶ || Creator:🤓 CYBER_JAY 🤓
❷ || WhatsApp Channel:(https://whatsapp.com/channel/0029VafHRSWDzgTGeS2rGn3c)
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
┏━━━━━━━━━━━━━━
*_INSTRUCTIONS_*
• Copy the session to your bot folder.
• Run your bot.
┗━━━━━━━━━━━━━━
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
©*2024-to-${currentYear} Cyber_Jay*
_Don't Forget To Give A ⭐Star To My Repo_
_____________________________________`;

      await sock.sendMessage(sock.user.id, {
        text: messageText
      }, { quoted: sessionMessage });

      await sock.ws.close();
      removeFile(tempPath);
      res.end();
    } else if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
      await delay(5000);
      res.write(`data: RECONNECTING\n\n`);
    }
  });
});

module.exports = router;
