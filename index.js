require('dotenv').config();

const {Client} = require('discord.js');
const {registerCommands} = require('./util/command');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// require('./util/sentry').init();

const client = new Client({
    intents: ['GUILDS']
});

client.on('ready', async () => {
    // eslint-disable-next-line no-console
    console.info(`Logged in as ${client.user.tag}!`);

    const commandManager = client.guilds.cache.get(GUILD_ID).commands;

    await registerCommands(commandManager);
});

client.login(BOT_TOKEN);