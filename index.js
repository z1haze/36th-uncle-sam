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
    const commands = initCommands(client, path.resolve('./commands'));

    // eslint-disable-next-line no-console
    console.log('Commands initialized');

    // init role bot actions
    initRoleReactions(client, commands);

    // eslint-disable-next-line no-console
    console.log('Reactions initialized');
});

client.login(BOT_TOKEN);