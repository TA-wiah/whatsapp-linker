const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('../id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: cyber_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("maher-zubair-baileys");

// Function to remove the file or directory
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
};

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number; 

    // Main function for pairing process
    async function SHADOW_REAPER_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id); 

        try {
            // Initialize the Cyber_Tech object for WhatsApp linking
            let Pair_Code_By_cyber_Tech = cyber_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Chrome (Linux)", "", ""]
            });

            // Check if the phone is registered, and if not, request a pairing code
            if (!Pair_Code_By_cyber_Tech.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_cyber_Tech.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            // Save the credentials when updated
            Pair_Code_By_cyber_Tech.ev.on('creds.update', saveCreds);

            // Monitor the connection status
            Pair_Code_By_cyber_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(5000);

                    // Ensure the directory exists
                    const dirPath = `./temp/${id}`;
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                    }

                    // Ensure the creds.json file exists before reading
                    const credsFilePath = `./temp/${id}/creds.json`;
                    if (!fs.existsSync(credsFilePath)) {
                        console.error("creds.json file not found.");
                        return;
                    }

                    // Read the creds.json file
                    let data = fs.readFileSync(credsFilePath);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');

                    // Send the session ID to the user
                    const sessionId = makeid(17);
                    let session = await Pair_Code_By_cyber_Tech.sendMessage(Pair_Code_By_cyber_Tech.user.id, { text: sessionId });

                    // Get the current year dynamically
                    const currentYear = new Date().getFullYear();

                    let SHADOW_REAPER_MD_TEXT = `

┏━━━━━━━━━━━━━━
┃Cyber_Jay SESSION IS 
┃SUCCESSFULLY
┃CONNECTED ✅🔥
┗━━━━━━━━━━━━━━
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

                    // Send the information message to the user
                    await Pair_Code_By_cyber_Tech.sendMessage(Pair_Code_By_cyber_Tech.user.id, { text: SHADOW_REAPER_MD_TEXT, quoted: session });

                    await delay(100); // Wait for a moment
                    await Pair_Code_By_cyber_Tech.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000); 
                    SHADOW_REAPER_MD_PAIR_CODE(); 
                }
            });
        } catch (err) {
            console.log("service restarted");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }

    return await SHADOW_REAPER_MD_PAIR_CODE(); 
});

module.exports = router;
