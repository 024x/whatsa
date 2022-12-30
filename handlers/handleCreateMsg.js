const help = require("../modules/help");
const { mute, unmute } = require('../modules/utils');
const config = require('../config');

const isImage = (msg) => msg.type == 'image' || (msg.type === 'document' && (msg.body.endsWith('.jpg') || msg.body.endsWith('.jpeg') || msg.body.endsWith('.png'))) ? true : false;

const handleCreateMsg = async (msg, client, MessageMedia) => {
    const isCmd = (key) => msg.body.startsWith(key);


}

module.exports = handleCreateMsg;