module.exports = {
    commands           : ['dump'],
    expectedArgs       : '<message-id>',
    minArgs            : 1,
    requiredPermissions: ['ADMINISTRATOR'],
    requiredRoles      : ['797590222497120317', '797590310561251349', '797590393650413588'],
    callback           : (message, args, text) => {
        message.channel.messages.fetch(text)
            .then((msg) => {
                message.author.send('```\n' + msg.content + '\n```');
            })
            .catch((e) => {
                message.author.send(e.message);
            });

        message.delete();
    }
};