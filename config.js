require('dotenv').config()
const fs = require('fs');

// const SESSION_DATA = process.env.SESSION_DATA || fs.existsSync('session.json') ? fs.readFileSync(__dirname + '/session.json', { encoding: 'utf8' }) : '';
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '5416961842:AAGrCJZ-Xvmd6BxdojfRVDKhfg086FQ8h2Y';
const DB_URL = process.env.DB_URL || 'mongodb://satya:s4tya@cluster0-shard-00-00.rrqhs.mongodb.net:27017,cluster0-shard-00-01.rrqhs.mongodb.net:27017,cluster0-shard-00-02.rrqhs.mongodb.net:27017/utyfky?ml.uriVersion=1&ml.name=cluster0-shard-00-00.rrqhs.mongodb.net%3A27017&ml.order=0&authSource=admin&ml.defaultTimeout=30&replicaSet=atlas-axckjh-shard-0&ssl=true';

module.exports = { TG_BOT_TOKEN, DB_URL };