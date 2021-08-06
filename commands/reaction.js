module.exports = (interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const messageId = interaction.options.get('messageid');
    const reaction = interaction.options.get('reaction');

    return interaction.channel.messages.fetch(messageId.value)
        .then((message) => {
            switch (subCommand) {
                case 'remove': {
                    const existingReaction = message.reactions.cache.get(reaction.value);

                    return existingReaction ? existingReaction.remove() : null;
                }

                default:
                    return message.react(reaction.value);
            }
        })
        .then(() => {
            interaction.reply(`Reaction ${subCommand === 'remove' ? 'removed' : 'added'}.`);
            setTimeout(() => interaction.deleteReply(), 3000);
        })
        .catch((e) => interaction.reply({
            content  : e.message,
            ephemeral: true
        }));
};