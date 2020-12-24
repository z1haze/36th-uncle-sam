require('dotenv').config();

const Discord = require('discord.js');

const bot = new Discord.Client();

bot.commands = new Discord.Collection();

const commands = require('./commands');

for (const key in commands) {
    bot.commands.set(commands[key].name, commands[key]);
}

const BOT_TOKEN = process.env.BOT_TOKEN;

bot.login(BOT_TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

// listen for commands
bot.on('message', msg => {
    const args = msg.content.split(/ +/);
    const command = args.shift().toLowerCase();

    if (!bot.commands.has(command)) {
        return;
    }

    try {
        bot.commands.get(command).execute(msg, args);
    } catch (err) {
        console.error(err);
        msg.reply('There was an error executing the command');
    }
});

bot.on('messageReactionAdd', () => {
    console.log('messageReactionAdd');
});

// raw event listeners
bot.on('raw', (event) => {
    if (event.t === 'MESSAGE_REACTION_ADD' || event.t === 'MESSAGE_REACTION_REMOVE' ) {
        console.log(event);
    }
});

