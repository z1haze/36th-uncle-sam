module.exports = {
    commands           : ['echo'],
    expectedArgs       : '<content>',
    minArgs            : 1,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message, args, text) => {
        message.channel.send(text);
        message.delete();
    }
};