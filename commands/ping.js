module.exports = (interaction) => {
    return interaction.reply({
        content  : 'Pong',
        ephemeral: true
    });
};