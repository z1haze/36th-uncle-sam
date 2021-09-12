module.exports = {
    confirm
};

/**
 * Using a DM channel, allow a user to send a message, and confirm its format before resolving
 *
 * @param dmChannel
 * @param user
 * @returns {Promise<void>}
 */
async function confirm (dmChannel, user) {
    return new Promise((resolve) => {
        // start collecting messages in the dm channel
        const messageCollector = dmChannel.createMessageCollector({
            filter: (message) => (message.author.id === user.id)
        });

        // this flag determines we are in a 'proofreading' phase, meaning the user sent the message, and we sent it back to them so they can determine if the message is good to go or not
        let proofing = false;

        messageCollector.on('collect', async (message) => {
            if (proofing) {
                return;
            }

            const responseMessage = await dmChannel.send('React with ✅ to accept or ❌ to make changes.\n\n' + message.content);

            await responseMessage.react('✅');
            await responseMessage.react('❌');

            proofing = true;

            const reactionCollector = responseMessage.createReactionCollector({
                filter: (reaction, u) => u.id === user.id
            });

            reactionCollector.on('collect', async (reaction) => {
                switch (reaction.emoji.toString()) {
                    case '✅': {
                        reactionCollector.stop();
                        messageCollector.stop();

                        await dmChannel.send('All done!');
                        await dmChannel.delete();

                        return resolve(message.content);
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
    });
}