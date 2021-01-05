require('dotenv').config();

const path = require('path');
const Discord = require('discord.js');
const {initCommands} = require('./util/commands');
const {initRoleReactions} = require('./util/reactions');

const BOT_TOKEN = process.env.BOT_TOKEN;
const client = new Discord.Client();

client.on('ready', async () => {
    // eslint-disable-next-line no-console
    console.info(`Logged in as ${client.user.tag}!`);

    // setup commands
    initCommands(client, path.resolve('./commands'))
        .then(() => console.log('Commands initialized')); // eslint-disable-line no-console

    // init role bot actions
    initRoleReactions(client)
        .then(() => console.log('Reactions initialized')); // eslint-disable-line no-console

});

client.login(BOT_TOKEN);