module.exports = {
    commands           : ['image'],
    expectedArgs       : '<image-url>',
    minArgs            : 1,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message, args, text) => {
        const {MessageAttachment} = require('discord.js');
        const attachment = new MessageAttachment(text);

        message.channel.send('', attachment);
        message.delete();
    }
};