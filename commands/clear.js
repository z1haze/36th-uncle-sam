const {getMessages} = require('../util/message');
const {getTimeAgo} = require('../util/date');

module.exports = async (interaction) => {
    const timeframe = interaction.options.get('timeframe');
    const limit = interaction.options.get('limit');
    const user = interaction.options.get('user');

    const opts = {};

    // if timeframe is a string
    if (timeframe && isNaN(timeframe.value)) {
        opts.afterDate = getTimeAgo(timeframe.value);
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
            if (deletedSize !== size) {
                return interaction.reply(`Deleted ${deletedSize} of ${size} messages. Some messages were too old to delete automatically.`);
            } else {
                return interaction.reply(`Deleted ${deletedSize} messages.`);
            }
        });
};