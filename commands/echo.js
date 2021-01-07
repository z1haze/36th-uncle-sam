module.exports = {
    commands           : ['echo'],
    expectedArgs       : '',
    minArgs            : 0,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message, args, text) => {
        if (text.length) {
            message.channel.send(text);
        }

        message.delete();
    }
};