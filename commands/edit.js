module.exports = {
    commands           : ['edit'],
    expectedArgs       : '<message-id> <content-id>',
    minArgs            : 2,
    requiredPermissions: ['ADMINISTRATOR'],
    requiredRoles      : ['797590222497120317', '797590310561251349', '797590393650413588'],
    callback           : (message, args, text) => {
        const messageId = args.shift();

        message.channel.messages.fetch(messageId)
            .then(async (msg) => {
                if (msg.author.id === msg.client.user.id) {
                    text = text.replace(messageId, '');

                    return msg.edit(text);
                }
            })
            .catch((e) => {
                message.author.send(e.message);
            })
            .then(() => {
                message.delete();
            });
    }
};