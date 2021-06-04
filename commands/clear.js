module.exports = {
    commands           : ['clear', 'clearchannel'],
    expectedArgs       : '',
    minArgs            : 0,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message) => {
        message.channel.messages.fetch()
            .then((messages) => message.channel.bulkDelete(messages, true))
            .then(({size}) => {
                message.channel.send(`Deleted ${size} messages.`)
                    .then((message) => message.delete({
                        timeout: 5000
                    }));
            });
    }
};