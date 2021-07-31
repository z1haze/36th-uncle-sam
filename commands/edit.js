module.exports = (interaction) => {
    const messageId = interaction.options.get('messageid').value;
    const content = interaction.options.get('message').value;

    interaction.channel.messages.fetch(messageId)
        .then(async (message) => {
            if (message.author.id === interaction.client.user.id) {
                await message.edit(content);

                interaction.reply('Message Edited.');
            } else {
                interaction.reply('Cannot edit message not authored by bot.');
            }
        })
        .catch((e) => interaction.reply(e.message))
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));
};