const {confirm} = require('../util/dm');

module.exports = async (interaction) => {
    await interaction.deferReply({ephemeral: true});

    const outputChannel = interaction.channel;
    const dmChannel = await interaction.user.createDM();

    await dmChannel.send('Please provide me the message.');

    confirm(dmChannel, interaction.user)
        .then((content) => outputChannel.send(content))
        .then(() => interaction.editReply('Message echoed.'));
};