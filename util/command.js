const commandData = require('../commands.json');

module.exports = {
    registerCommands: async (commandManager) => {
        await commandManager.fetch();
        await commandManager.set(commandData.commands);

        commandManager.client.on('interactionCreate', async (interaction) => {
            if (interaction.isCommand()) {
                switch (interaction.commandName) {
                    case 'ping':
                        return require('../commands/ping')(interaction);
                    case 'clear':
                        return require('../commands/clear')(interaction);
                    case 'reaction':
                        return require('../commands/reaction')(interaction);
                    case 'dm':
                        return require('../commands/dm')(interaction);
                    case 'dump':
                        return require('../commands/dump')(interaction);
                    case 'echo':
                        return require('../commands/echo')(interaction);
                    case 'edit':
                        return require('../commands/edit')(interaction);
                    case 'promote':
                        return require('../commands/promote')(interaction);
                    case 'transfer':
                        return require('../commands/transfer')(interaction);
                    case 'query':
                        return require('../commands/query')(interaction);
                    case 'stats':
                        return require('../commands/stats')(interaction);
                }
            }
        });
    }
};