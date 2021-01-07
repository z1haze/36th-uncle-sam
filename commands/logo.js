module.exports = {
    commands           : ['logo'],
    expectedArgs       : '',
    minArgs            : 0,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message) => {
        const fs = require('fs');
        const path = require('path');
        const {MessageAttachment} = require('discord.js');

        const image = fs.readFileSync(path.resolve('docs/img/logo-hd.png'));
        const attachment = new MessageAttachment(image);

        message.channel.send('', attachment);
        message.delete();
    }
};