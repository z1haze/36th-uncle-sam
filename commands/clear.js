const {getMessages} = require('../util/message');
const {getTimePast} = require('../util/date');

/**
 * Clear messages from the current channel
 *
 * @param interaction
 * @returns {Promise<*>}
 */
module.exports = async (interaction) => {
    const timeframe = interaction.options.get('timeframe');
    const limit = interaction.options.get('limit');
    const user = interaction.options.get('user');

    if (!timeframe && !limit) {
        return interaction.reply({
            ephemeral: true,
            content  : 'Either timeframe or limit must be used!'
        });
    }

    const opts = {};

    // if timeframe is a string
    if (timeframe && isNaN(timeframe.value)) {
        opts.afterDate = getTimePast(timeframe.value);
    }

    // if limit is a number
    if (limit && !isNaN(limit.value)) {
        opts.limit = limit.value;
    }

    let messages = await getMessages(interaction.channel, opts);

    // optionally filter the messages
    if (user) {
        messages = messages.filter((message) => message.author.id === user.value);
    }

    const size = messages.size;

    interaction.channel.bulkDelete(messages, true)
        .then(({size: deletedSize}) => {
            const content = deletedSize !== size
                ? `Deleted ${deletedSize} of ${size} messages. Some messages were too old to delete automatically.`
                : `Deleted ${deletedSize} messages.`;

            return interaction.reply({
                content,
                ephemeral: true
            });
        });
};