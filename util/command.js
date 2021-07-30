module.exports = {
    registerCommands: async (commandManager) => {
        await commandManager.fetch();

        await commandManager.set([
            {
                name       : 'ping',
                description: 'Bot, are you alive?'
            },
            {
                name       : 'clear',
                description: 'Delete messages in the current channel',
                options    : [
                    {
                        type       : 'STRING',
                        name       : 'timeframe',
                        description: 'How far back to clear the chat - <1h30m10s>',
                        required   : false
                    },
                    {
                        type       : 'NUMBER',
                        name       : 'limit',
                        description: 'At most, how many messages should be deleted - <100>'
                    },
                    {
                        type       : 'MENTIONABLE',
                        name       : 'user',
                        description: 'Tag a specific user who\'s messages you wish to filter to - <@someone>',
                        required   : false
                    }
                ]
            },
            {
                name       : 'react',
                description: 'Bot, react to this post!',
                options    : [
                    {
                        type       : 'STRING',
                        name       : 'messageid',
                        description: 'The id of the message the bot will react to',
                        required   : true
                    },
                    {
                        type       : 'STRING',
                        name       : 'reaction',
                        description: 'The emoji that the bot will react with',
                        required   : true
                    }
                ]
            },
        ]);

        commandManager.client.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) {
                switch (interaction.commandName) {
                    case 'ping':
                        return require('../commands/ping')(interaction);
                    case 'clear':
                        return require('../commands/clear')(interaction);
                    case 'react':
                        return require('../commands/react')(interaction);
                }
            }
        });
    }
};