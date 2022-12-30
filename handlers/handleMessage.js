const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
var path = require('path');
const config = require('../config')
var TG_OWNER_ID = 1089528685;
const handleMessage = async (message, TG_OWNER_ID, tgbot, client) => {

    const getMediaInfo = (msg) => {
        switch (msg.type) {
            case 'image': return { fileName: 'image.png', tgFunc: tgbot.telegram.sendPhoto.bind(tgbot.telegram) }; break;
            case 'video': return { fileName: 'video.mp4', tgFunc: tgbot.telegram.sendVideo.bind(tgbot.telegram) }; break;
            case 'audio': return { fileName: 'audio.m4a', tgFunc: tgbot.telegram.sendAudio.bind(tgbot.telegram) }; break;
            case 'ptt': return { fileName: 'voice.ogg', tgFunc: tgbot.telegram.sendVoice.bind(tgbot.telegram) }; break;
            default: return { fileName: msg.body, tgFunc: tgbot.telegram.sendDocument.bind(tgbot.telegram) }; break;
        }
    }

    const chat = await message.getChat();
    const chatName = chat.name || (await client.getChatById(message?.author)).name;
    const contact = await message.getContact();
    let name = contact.name || contact.pushname || message?._data?.notifyName;
    const chatId = message.author || message.from;
    const contactNumber = chatId.split('@')[0];
    const msgId = message?.id?.id;


    const tgMessage = `${chat.isGroup ? `${chatName} | <a href="https://wa.me/${contactNumber}?chat_id=${chatId}&message_id=${msgId}">${name}</a>`
        : `<a href="https://wa.me/${contactNumber}?chat_id=${chatId}&message_id=${msgId}"><b>${chatName}</b></a> ${message?.isStatus ? 'Added new status' : ''}`
        }. \n${message.body ? `\n${message.body}` : ""}`;

    if (message.hasMedia && !chat.isMuted) {
        await message.downloadMedia().then(async (data) => {
            const mediaInfo = await getMediaInfo(message);
            const messageData = {
                document: { source: path.join(__dirname, '../', mediaInfo.fileName) },
                options: { caption: tgMessage, disable_web_page_preview: true, parse_mode: "HTML" }
            }
            fs.writeFile(mediaInfo.fileName, data.data, "base64", (err) =>
                err ? console.error(err)
                    : mediaInfo.tgFunc(TG_OWNER_ID, messageData.document, messageData.options)
                        .then(() => { fs.unlinkSync(path.join(__dirname, '../', mediaInfo.fileName)) })
            );
        });
    } else if (!message.from.includes("status") && !chat.isMuted) {
        tgbot.telegram.sendMessage(TG_OWNER_ID, tgMessage,
            { parse_mode: "HTML", disable_web_page_preview: true, disable_notification: chat.isMuted });
    }

}

// const handleMessage = async (message , TG_OWNER_ID , tgbot) => {
//     const sendImg = tgbot.telegram.sendPhoto;
//     sendImg(TG_OWNER_ID, {source: path.join(__dirname, '../code.png')})
// }

module.exports = handleMessage;
