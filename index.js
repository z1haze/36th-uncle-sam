require('dotenv').config();
require('./util/sentry').init();

const {Client} = require('discord.js');
const {registerCommands} = require('./util/command');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
    intents : ['GUILDS', 'GUILD_PRESENCES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGE_REACTIONS', 'GUILD_EMOJIS_AND_STICKERS'],
    partials: ['CHANNEL']
});

client.on('ready', async () => {
    // eslint-disable-next-line no-console
    console.info(`Logged in as ${client.user.tag}!`);

    const guild = client.guilds.cache.get(GUILD_ID);

    if (!guild) {
        throw new Error(`Incorrect guild id: ${GUILD_ID}`);
    }

    // update caches
    await guild.members.fetch();
    await guild.roles.fetch();
    await guild.channels.fetch();

    // setup commands
    await registerCommands(guild.commands);
});

client.login(BOT_TOKEN);