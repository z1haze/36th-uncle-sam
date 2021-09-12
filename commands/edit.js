const {confirm} = require('../util/dm');

module.exports = async (interaction) => {
    await interaction.deferReply({ephemeral: true});

    const messageId = interaction.options.get('messageid').value;
    const message = await interaction.channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
        return interaction.editReply('Message not found in current channel.');
    }

    // if the bot is not the message author, it cannot edit the message
    if (message.author.id !== interaction.client.user.id) {
        return interaction.editReply('I can only edit my own messages!');
    }

    const dmChannel = await interaction.user.createDM();
    await dmChannel.send('Please provide me the updated message.');

    confirm(dmChannel, interaction.user)
        .then((content) => message.edit(content))
        .then(() => interaction.editReply('Message updated.'));
};