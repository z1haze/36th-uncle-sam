module.exports = async (interaction) => {
    await interaction.channel.send(interaction.options.get('message').value);
    await interaction.reply('Done!');

    return interaction.deleteReply();
};