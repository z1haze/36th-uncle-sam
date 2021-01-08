module.exports = {
    commands           : ['edit'],
    expectedArgs       : '<message-id> <content-id>',
    minArgs            : 2,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message, args, text) => {
        const messageId = args.shift();

        message.channel.messages.fetch(messageId)
            .then((msg) => {
                text = text.replace(messageId, '');

                msg.edit(text);
            })
            .catch((e) => {
                message.author.send(e.message);
            });

        message.delete();
    }
};