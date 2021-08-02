const {getDividerRoles, getProcessingRole, isProcessing, isRecruit, getMemberRankRole, getRecruitRole, getMemberRole, getNextMemberRankRole, getMemberPlatoonRole} = require('../util/role');

const setNickName = async (guildMember) => {
    guildMember = await guildMember.fetch(); // force update the member
    const rankRole = getMemberRankRole(guildMember);

    // give a new nickname
    // example nickname: 2/1 SGT. PERSONS
    if (guildMember.nickname) {
        const nickParts = guildMember.nickname.split(' ');

        let unitPart = '';
        let namePart = '';

        for (let i = 0; i < nickParts.length; i++) {
            // search for the unit part of their nickname, eg 2/1 or [HHC], etc
            if (nickParts[i].match(/^(\d\/\d|\[\w+])$/) && !unitPart) {
                unitPart = nickParts[i] + ' ';
            }

            // regardless if we found a unit part or not, we should continue on from this iteration
            if (i === 0) {
                continue;
            }

            // assuming the next iterator is iteration i=1 (second index)

            // search for the rank part of their nickname (if it exists) so it can be excluded when updating their nickname
            // eg SGT. or PVT. etc
            if (nickParts[i].match(/^(\w|\/){2,3}\.$/)) {
                namePart = nickParts.slice(i + 1).join(' ');
            } else {
                // if we dont find a match to the
                namePart = nickParts.slice(i).join(' ');
            }

            break;
        }

        await guildMember.setNickname(`${unitPart + rankRole.name}. ${namePart}`);
    } else {
        await guildMember.setNickname(`${rankRole.name}. ${guildMember.user.username}`);
    }
};

module.exports = async (interaction) => {
    const RANK_ROLE_IDS = process.env.RANK_ROLE_IDS.split(',');
    const targetMember = await interaction.options.get('member').member;

    const targetIsProcessing = isProcessing(targetMember);
    const targetIsRecruit = isRecruit(targetMember);

    // handle moving guild member from processing status to recruit status
    if (targetIsProcessing) {
        const dividerRoles = getDividerRoles(interaction.guild);
        const OTHER_ROLES_DIVIDER_ROLE = dividerRoles.find((role) => role.name.includes('OTHER ROLES'));

        // add OTHER ROLES divider role
        if (!targetMember.roles.cache.has(OTHER_ROLES_DIVIDER_ROLE.id)) {
            await targetMember.roles.add(OTHER_ROLES_DIVIDER_ROLE);
        }

        // add RECRUIT role
        if (!targetMember.roles.cache.has(process.env.RECRUIT_ROLE_ID)) {
            const recruitRole = getRecruitRole(interaction.guild);
            await targetMember.roles.add(recruitRole);
        }

        // add RCT role
        if (!targetMember.roles.cache.has(RANK_ROLE_IDS[0])) {
            const rctRole = interaction.guild.roles.cache.get(RANK_ROLE_IDS[0]);
            await targetMember.roles.add(rctRole);
            await targetMember.setNickname(`${rctRole.name}. ${targetMember.displayName}`);
        }

        // remove PROCESSING role
        if (targetMember.roles.cache.has(process.env.PROCESSING_ROLE_ID)) {
            const processingRole = getProcessingRole(interaction.guild);
            await targetMember.roles.remove(processingRole);
        }

        // send reply
        return interaction.reply({
            content  : `${targetMember} has been promoted to RCT.`,
            ephemeral: true
        });
    }

    // rank of the promoter
    const senderRankRole = getMemberRankRole(interaction.member);

    // rank of the member being promoted
    const targetRankRole = getMemberRankRole(targetMember);

    // the rank the target is being promoted to
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

    // add next rank, remove current rank
    await targetMember.roles.remove(targetRankRole);
    await targetMember.roles.add(targetNextRankRole);

    // handle moving guild member from recruit to member
    if (targetIsRecruit) {
        // remove recruit role
        const recruitRole = getRecruitRole(interaction.guild);
        await targetMember.roles.remove(recruitRole);

        // add member role
        const memberRole = getMemberRole(interaction.guild);
        await targetMember.roles.add(memberRole);

        // send reply
        return interaction.reply({
            content  : `${targetMember} has been promoted to ${targetNextRankRole.name}.`,
            ephemeral: true
        });
    }

    // update nickname
    await setNickName(targetMember);

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

                            if (targetPlatoonRole) {
                                responseText = '<@&' + targetPlatoonRole.id + '>,\n\n' + responseText;
                            }

                            await promotionOutputChannel.send(responseText);
                            await interaction.editReply(`${targetMember} has been promoted to ${targetNextRankRole.name}.`);
                            await dmChannel.send('The promotion has been completed.');

                            await dmChannel.delete();
                            messageCollector.stop();

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