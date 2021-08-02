require('dotenv').config();

const {Client} = require('discord.js');
const {registerCommands} = require('./util/command');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// require('./util/sentry').init();

const client = new Client({
    intents : ['GUILDS', 'GUILD_MEMBERS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS'],
    partials: ['CHANNEL']
});

client.on('ready', async () => {
    // eslint-disable-next-line no-console
    console.info(`Logged in as ${client.user.tag}!`);

    const guild = client.guilds.cache.get(GUILD_ID);

    // update caches
    await guild.members.fetch();
    await guild.roles.fetch();
    await guild.channels.fetch();

    const commandManager = guild.commands;

    // setup commands
    await registerCommands(commandManager);
});

client.login(BOT_TOKEN);