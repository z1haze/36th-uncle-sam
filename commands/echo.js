module.exports = async (interaction) => {
    await interaction.deferReply({ephemeral: true});

    const outputChannel = interaction.channel;
    const dmChannel = await interaction.user.createDM();

    await dmChannel.send({
        content: 'What do you want to send?'
    });

    const messageCollector = dmChannel.createMessageCollector({
        filter: (message) => (message.author.id === interaction.user.id)
    });

    let proofing = false;

    messageCollector.on('collect', async (message) => {
        if (proofing) {
            return;
        }
        
        const responseMessage = await dmChannel.send('React with ✅ to accept or ❌ to make changes.\n\n> ' + message.content);

        await responseMessage.react('✅');
        await responseMessage.react('❌');

        proofing = true;

        const reactionCollector = responseMessage.createReactionCollector({
            filter: (reaction, user) => user.id === interaction.user.id
        });

        reactionCollector.on('collect', async (reaction) => {
            switch (reaction.emoji.toString()) {
                case '✅': {
                    reactionCollector.stop();
                    messageCollector.stop();

                    await dmChannel.delete();
                    await outputChannel.send(message.content);

                    return interaction.editReply('Message echoed.');
                }

                case '❌': {
                    reactionCollector.stop();

                    await reaction.message.delete();
                    await dmChannel.send({
                        content: 'Let\'s try again. What do you want to send?'
                    });

                    break;
                }

                default:
                    await dmChannel.send('Why would you do this? You\'re breakin my heart');
            }

            proofing = false;
        });
    });
};