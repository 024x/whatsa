const qrcode = require("qrcode-terminal");
const fs = require("fs");
require("dotenv").config();
var QRCode = require("qrcode");
const { Client, MessageMedia, LocalAuth, ClientInfo } = require("whatsapp-web.js");
const { Telegraf } = require("telegraf");
const config = require("./config");
const alive = require('./modules/alive');
const handleMessage = require("./handlers/handleMessage");
const handleCreateMsg = require("./handlers/handleCreateMsg");
const handleTgBot = require("./handlers/handleTgbot");
const { saveSessionToDb, getSession } = require("./handlers/handleSession");
const { default: axios } = require("axios");

let [status, sessionInDb, qrCount] = ['saved', false, 0];
const tgbot = new Telegraf(config.TG_BOT_TOKEN);


const client = new Client({ // Create client.
  authStrategy: new LocalAuth({
    dataPath: './WWebJS'
  }),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});
const initClient = () => {
  client.options.puppeteer.userDataDir = null;
  return client.initialize();
}

getSession(initClient);

// Set bot commands. 
client.on("qr", async (qr) => {
  qrCount++;
  await console.log("Kindly check your telegram bot for QR Code.");
  await QRCode.toFile("qr.png", qr);
  await tgbot.telegram.sendPhoto(
    1089528685, { source: "qr.png" }, { caption: "Scan it in within 20 seconds...." }
  );
  await qrcode.generate(qr, { small: true });
  setTimeout(() => {
    console.log("Didn't found any response, exiting...");
    return
  }, 90 * 1000);
});

client.on("authenticated", (session) => { // Take action when user Authenticated successfully.
  console.log("Authenticated successfully.");
  if (fs.existsSync('qr.png')) fs.unlinkSync('qr.png');
});

client.on("logout", () => { // Take action when user logout.
  console.log("Looks like you've been logged out. Please generate session again.");
  whatsGramDrive.delete('session.zip');
});


client.on("auth_failure", reason => { // If failed to log in.
  const message = 'Failed to authenticate the client. Please fill env var again or generate session.json again. Generating session data again...';
  console.log(message);
  tgbot.telegram.sendMessage(1089528685, message,
    { disable_notification: true })
  whatsGramDrive.delete('session.zip');
  initClient();
})

client.on("ready", async () => { // Take actin when client is ready.
  const message = "Successfully logged in. Ready to rock!";
  if (qrCount == 0 && sessionInDb) status = 'saved';
  if (status != 'saved') {
    await client.destroy();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await saveSessionToDb();
    await new Promise(resolve => setTimeout(resolve, 1000));
    status = 'saved';
    client.options.puppeteer.userDataDir = null;
    initClient();
    return
  } else {
    console.log(message);
    tgbot.telegram.sendMessage(1089528685, message, { disable_notification: true });
    if (fs.existsSync("qr.png")) fs.unlinkSync("qr.png");
  }
});

// Telegram Bot
tgbot.start(ctx => ctx.replyWithMarkdown(`Hey **${ctx.message.from.first_name}**, Welcome! \n`,
  {
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [[{ text: 'Satya App', url: 'https://app.satyendra.in' }],
      ]
    }
  }
));
tgbot.command('start', ctx => { // Donate Command
  ctx.replyWithMarkdown('Hi',
    {
      disable_web_page_preview: true,

    })
});
const restart = async (ctx) => {
  if (ctx) await ctx.replyWithMarkdown('Restarting...', { disable_notification: true })
  else tgbot.telegram.sendMessage(1089528685, 'Restarting...', { disable_notification: true })
  await client.destroy();
  await initClient();
}
tgbot.command('restart', ctx => restart(ctx)); // Restart WhatsApp Client using TG Bot.
//setInterval(() => restart(), 1000 * 60 * 60 * 12); // Auto restart WhatsApp client every 12 hours.

tgbot.on("message", (ctx) => { // Listen TG Bot messages and take action
  handleTgBot(ctx, client, MessageMedia);
});

client.on("message", async (message) => { // Listen incoming WhatsApp messages and take action
  if ((message.body).startsWith('otp_')) {
    const username = message.body.split('_')[1];
    const res = await axios.get('https://backend.app.satyendra.in/otp?username=' + username + '&number=+' + message.from.split('@')[0]);
    console.log(res.data['message']);
    message.reply(res.data['message']);
  }



 // handleMessage(message, 1089528685, tgbot, client);
});

client.on('message_create', async (msg) => { // Listen outgoing WhatsApp messages and take action
  if (msg.body == "!alive") { // Alive command
    msg.delete(true)
    const aliveMsgData = await alive();
    client.sendMessage(msg.to, new MessageMedia(aliveMsgData.mimetype, aliveMsgData.data, aliveMsgData.filename), { caption: aliveMsgData.startMessage })
  } else {
    handleCreateMsg(msg, client, MessageMedia);
  }
})

client.on("disconnect", (issue) => {
  console.log("WhatsApp has been disconnected due to" + issue + ". Please restart .");
});

tgbot.launch(); // Initialize Telegram Bot