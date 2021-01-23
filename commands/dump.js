module.exports = {
    commands           : ['dump'],
    expectedArgs       : '<message-id>',
    minArgs            : 1,
    requiredPermissions: ['ADMINISTRATOR'],
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