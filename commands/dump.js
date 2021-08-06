module.exports = (interaction) => {
    const messageId = interaction.options.get('messageid').value;

    interaction.channel.messages.fetch(messageId)
        .then((message) => interaction.user.send('```\n' + message.content + '\n```'))
        .then(() => 'Message content delivered via DM.')
        .catch((e) => e.message)
        .then((content) => interaction.reply({content, ephemeral: true}));
};