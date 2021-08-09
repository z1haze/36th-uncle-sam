const {getMessages} = require('../util/message');
const {getTimePast} = require('../util/date');

module.exports = async (interaction) => {
    const timeframe = interaction.options.get('timeframe');
    const limit = interaction.options.get('limit');
    const user = interaction.options.get('user');

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