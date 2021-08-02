const {getDividerRoles, getProcessingRole, isProcessing, isRecruit, getMemberRankRole, getRecruitRole, getMemberRole, getNextMemberRankRole, getMemberPlatoonRole} = require('../util/role');
const {setNickName} = require('../util/user');

module.exports = async (interaction) => {
    // rank of sender
    const senderRankRole = getMemberRankRole(interaction.member);

    if (!senderRankRole) {
        return interaction.reply({
            content  : 'You do not have permissions to execute this command',
            ephemeral: true
        });
    }

    const targetMember = await interaction.options.get('member').member;
    const targetIsProcessing = isProcessing(targetMember);
    const targetIsRecruit = isRecruit(targetMember);

    // PROCESSING -> RECRUIT
    if (targetIsProcessing) {
        const dividerRoles = getDividerRoles(interaction.guild);
        const otherRolesDividerRole = dividerRoles.find((role) => role.name.includes('OTHER ROLES'));

        // add OTHER ROLES divider role
        if (!targetMember.roles.cache.has(otherRolesDividerRole.id)) {
            await targetMember.roles.add(otherRolesDividerRole);
        }

        const RANK_ROLE_IDS = process.env.RANK_ROLE_IDS.split(',');
        const rctRole = interaction.guild.roles.cache.get(RANK_ROLE_IDS[0]);

        // add RECRUIT role
        if (!targetMember.roles.cache.has(process.env.RECRUIT_ROLE_ID)) {
            const recruitRole = getRecruitRole(interaction.guild);
            await targetMember.roles.add(recruitRole);
            await targetMember.roles.add(rctRole);
        }

        // remove PROCESSING role
        if (targetMember.roles.cache.has(process.env.PROCESSING_ROLE_ID)) {
            const processingRole = getProcessingRole(interaction.guild);
            await targetMember.roles.remove(processingRole);
        }

        await setNickName(targetMember);

        return interaction.reply({
            content  : `${targetMember} has been promoted to ${rctRole.name}.`,
            ephemeral: true
        });
    }

    const targetRankRole = getMemberRankRole(targetMember);
    const targetNextRankRole = getNextMemberRankRole(targetMember);

    // make sure there is another rank to promote the member to
    if (!targetNextRankRole) {
        return interaction.reply({
            content  : 'This member cannot be promoted any further.',
            ephemeral: true
        });
    }

    // a member should only be able to promote someone who is lower ranked than they are
    if (senderRankRole.position < targetNextRankRole.position) {
        return interaction.reply({
            content  : 'You cannot promote to a rank higher than your own.',
            ephemeral: true
        });
    }

    interaction.defer({ephemeral: true})
        .then(async () => {
            const dmChannel = await interaction.user.createDM();
            const instructionText = `Provide a reason for the promotion of ${targetMember}. Your verbiage should flow in the context of "because of [reason] and as such, has been promoted".`;
            await dmChannel.send(instructionText);

            const messageCollector = dmChannel.createMessageCollector({
                filter: (message) => (message.author.id === interaction.user.id)
            });

            messageCollector.on('collect', async (message) => {
                const today = new Date();
                const promotionDate = today.getDate() + today.toLocaleString('default', {month: 'short'}).toUpperCase() + today.getFullYear();

                let responseText = 'The Command Staff of the 36th Engineer Regiment has reposed special trust and confidence in ' + targetMember.user.toString();
                responseText += ' because of ' + message.content + ' and as such, has been promoted from the rank of ' + targetRankRole.name + ' to ' + targetNextRankRole.name;
                responseText += ' , in accordance with tradition and with the approval of his peers, this day, ' + promotionDate;

                const responseMessage = await dmChannel.send('React with 👍 to accept or 👎 to make changes.\n\n> ' + responseText);

                await responseMessage.react('👍');
                await responseMessage.react('👎');

                const reactionCollector = responseMessage.createReactionCollector({
                    filter: (reaction, user) => user.id === interaction.user.id
                });

                reactionCollector.on('collect', async (reaction) => {
                    switch (reaction.emoji.toString()) {
                        case '👍': {
                            reactionCollector.stop();

                            const PROMOTION_OUTPUT_CHANNEL_ID = process.env.PROMOTION_OUTPUT_CHANNEL_ID;
                            const promotionOutputChannel = interaction.guild.channels.cache.get(PROMOTION_OUTPUT_CHANNEL_ID);
                            const targetPlatoonRole = getMemberPlatoonRole(targetMember);
                            const tag = targetPlatoonRole ? '<@&' + targetPlatoonRole.id + '>' : '@everyone';

                            responseText = tag + ',\n\n' + responseText;

                            await promotionOutputChannel.send(responseText);
                            await interaction.editReply(`${targetMember} has been promoted to ${targetNextRankRole.name}.`);
                            await dmChannel.send('The promotion has been completed.');

                            await dmChannel.delete();
                            messageCollector.stop();

                            // RECRUIT -> MEMBER
                            if (targetIsRecruit) {
                                // remove recruit role
                                const recruitRole = getRecruitRole(interaction.guild);
                                await targetMember.roles.remove(recruitRole);

                                // add member role
                                const memberRole = getMemberRole(interaction.guild);
                                await targetMember.roles.add(memberRole);
                            }

                            // add next rank, remove current rank
                            await targetMember.roles.remove(targetRankRole);
                            await targetMember.roles.add(targetNextRankRole);
                            await setNickName(targetMember);

                            break;
                        }

                        case '👎': {
                            reactionCollector.stop();

                            await dmChannel.send(instructionText);
                            break;
                        }

                        default:
                            await dmChannel.send('Why would you do this? You\'re breakin my heart');
                    }
                });
            });
        });
};