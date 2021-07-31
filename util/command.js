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
                }
            }
        });
    }
};