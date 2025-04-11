const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { default: cyber_Tech, useMultiFileAuthState, makeCacheableSignalKeyStore, delay } = require('maher-zubair-baileys');
const { makeid } = require('../id');
const { Boom } = require('@hapi/boom');

const router = express.Router();

router.get('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  const id = makeid();
  const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);

  const sock = cyber_Tech({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
    },
    logger: pino({ level: 'fatal' }),
    browser: ['Chrome', 'Ubuntu', '22']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;

    if (qr) {
      res.write(`data:${await toDataURL(qr)}\n\n`);
    }

    if (connection === 'open') {
      const sessionId = makeid();
      const sent = await sock.sendMessage(sock.user.id, { text: `*${sessionId}*` });
      await sock.sendMessage(sock.user.id, {
        text: `📌 Above is your session from Cyber_Jay`,
        quoted: sent
      });

      await delay(500);
      await sock.sendMessage(sock.user.id, {
        text: `
┏━━━━━━━━━━━━━━ 
┃SHADOW-REAPER-MD SESSION IS 
┃SUCCESSFULLY
┃CONNECTED ✅🔥
┗━━━━━━━━━━━━━━━
❶ || Creator = 🤓 CYBER_JAY 🤓
❷ || WhattsApp Channel = https://whatsapp.com/channel/0029VafHRSWDzgTGeS2rGn3c
Please Follow My Support Channel
Wanna talk to me?👉 https://t.me/billy 👈
🙅🏽‍♂️ https://wa.me/M2BKBKULFC5QP1 🙅🏽‍♂️
©*2025-to-date Cyber_Jay*
_Don't Forget To Give A ⭐Star To My Repo_
_____________________________________
        `
      });

      await sock.ws.close();
      fs.rmSync(`./temp/${id}`, { recursive: true, force: true });
      res.end();
    }
  });
});

function toDataURL(text) {
  const QRCode = require('qrcode');
  return QRCode.toDataURL(text);
}

module.exports = router;
