module.exports = {
    commands           : ['clear', 'clearchannel'],
    expectedArgs       : '',
    minArgs            : 0,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message, args, text) => {
        let count;

        message.channel.messages.fetch()
            .then((messages) => {
                count = messages.size;

                return message.channel.bulkDelete(messages);
            })
            .then(() => {
                message.channel.send(`Deleted ${count} messages.`)
                    .then((message) => message.delete({
                        timeout: 5000
                    }));
            });
    }
};