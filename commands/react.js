module.exports = (interaction) => {
    const messageId = interaction.options.get('messageid');
    const reaction = interaction.options.get('reaction');
    const remove = interaction.options.get('remove');

    return interaction.channel.messages.fetch(messageId.value)
        .then((message) => {
            if (remove) {
                const existingReaction = message.reactions.cache.get(reaction.value);

                return existingReaction ? existingReaction.remove() : null;
            } else {
                return message.react(reaction.value);
            }
        })
        .then(() => {
            interaction.reply(`Reaction ${remove ? 'removed' : 'added'}.`);
            setTimeout(() => interaction.deleteReply(), 3000);
        })
        .catch((e) => interaction.reply({
            content  : e.message,
            ephemeral: true
        }));
};