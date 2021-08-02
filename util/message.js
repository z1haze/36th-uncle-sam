const {Collection} = require('discord.js');

module.exports = {
    getMessages: async (channel, {limit = 100, ...opts}) => {
        let messages = new Collection();
        let lastId; // the id of the last message returned from the current iteration
        let finish = false; // a flag that designates when to stop fetching messages
        const options = {limit: 100}; // default query for fetch the max of 100 elements

        while (true) {
            // only fetch messages before the last fetched message
            if (lastId) {
                options.before = lastId;
            }

            let currentResult = await channel.messages.fetch(options);
            const last = currentResult.last();

            lastId = last.id;

            if (opts.afterDate) {
                const messageTimestamp = last.editedTimestamp || last.createdTimestamp;
                const afterTimestamp = opts.afterDate.valueOf();

                if (messageTimestamp < afterTimestamp) {
                    currentResult = currentResult.filter((message) => (message.editedTimestamp || message.createdTimestamp) > afterTimestamp);
                    finish = true;
                }
            }

            if (currentResult.size !== 100 || messages.size >= limit) {
                const totalSize = messages.size;
                let counter = 0;

                currentResult = currentResult.filter(() => {
                    counter++;

                    return totalSize + counter + 1 <= limit;
                });

                finish = true;
            }

            messages = messages.concat(currentResult);

            if (finish) {
                break;
            }
        }

        return messages;
    }
};