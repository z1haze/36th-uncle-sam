module.exports = {
    commands           : ['react'],
    expectedArgs       : '<message_id> <emoji>',
    minArgs            : 2,
    maxArgs            : 2,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message, args) => {
        const messageId = args[0];
        const emoji = args[1];

        message.channel.messages.fetch(messageId)
            .then((msg) => {
                msg.react(emoji);
            })
            .catch((e) => {
                message.author.send(e.message);
            });

        message.delete();
    }
};