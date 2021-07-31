module.exports = (interaction) => {
    const messageId = interaction.options.get('messageid').value;

    interaction.channel.messages.fetch(messageId)
        .then((message) => interaction.user.send('```\n' + message.content + '\n```'))
        .then(() => interaction.reply('Message content delivered via DM.'))
        .catch((e) => interaction.reply(e.message));

    setTimeout(() => interaction.deleteReply(), 3000);
};