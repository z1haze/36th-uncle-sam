module.exports = (interaction) => {
    const messageId = interaction.options.get('messageid');
    const reaction = interaction.options.get('reaction');

    return interaction.channel.messages.fetch(messageId.value)
        .then((message) => message.react(reaction.value))
        .then(() => {
            interaction.reply('Reaction added.');
            setTimeout(() => interaction.deleteReply(), 2000);
        })
        .catch((e) => interaction.reply({
            content  : e.message,
            ephemeral: true
        }));
};