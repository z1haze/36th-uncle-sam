module.exports = (interaction) => {
    const messageId = interaction.options.get('messageid').value;
    const content = interaction.options.get('message').value;

    interaction.channel.messages.fetch(messageId)
        .then(async (message) => {
            if (message.author.id === interaction.client.user.id) {
                await message.edit(content);

                return 'Message Edited.';
            } else {
                return 'Cannot edit message not authored by bot.';
            }
        })
        .catch((e) => e.message)
        .then((content) => {
            return interaction.reply({
                content,
                ephemeral: true
            });
        });
};