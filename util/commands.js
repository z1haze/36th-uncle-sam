const path = require('path');
const fs = require('fs');

module.exports = {
    initCommands: (client, commandsPath) => {
        const baseFile = 'base.js';
        const baseCommand = require(path.resolve(commandsPath, baseFile));
        const commands = new Set();

        const readCommands = (dir) => {
            const files = fs.readdirSync(dir);

            files.forEach((file) => {
                commands.add(file.substr(0, file.lastIndexOf('.')));
            });

            for (const file of files) {
                const stat = fs.lstatSync(path.join(dir, file));

                if (stat.isDirectory()) {
                    readCommands(path.join(dir, file));
                } else if (file !== baseFile) {
                    const opts = require(path.join(dir, file));

                    baseCommand(client, opts);
                }
            }
        };

        // setup all commands
        readCommands(commandsPath);

        commands.delete('base');

        return commands;
    }
};