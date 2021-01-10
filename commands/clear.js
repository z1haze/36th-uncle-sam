module.exports = {
    commands           : ['clear', 'clearchannel'],
    expectedArgs       : '',
    minArgs            : 0,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : (message, args, text) => {
        const deleteOld = args.length === 1 && args[0] === 'all';

        let totalMessageCount;

        message.channel.messages.fetch()
            .then((messages) => {
                totalMessageCount = messages.size;

                message.channel.bulkDelete(messages, !deleteOld)
                    .then((messages) => {
                        totalMessageCount = messages.size;
                    })
                    .catch(() => {
                        if (deleteOld) {
                            const promises = [];

                            messages.forEach((message) => {
                                promises.push(message.delete());
                            });

                            return Promise.all(promises);
                        }
                    })
                    .then(() => {
                        message.channel.send(`Deleted ${totalMessageCount} messages.`)
                            .then((message) => message.delete({
                                timeout: 5000
                            }));
                    });
            });
    }
};