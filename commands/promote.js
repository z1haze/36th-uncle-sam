const {getDividerRoles, getProcessingRole, getMemberRankRole, getRecruitRole, getMemberRole, getNextMemberRankRole, getMemberPlatoonRole} = require('../util/role');
const {isProcessing, isRecruit, updateNickname} = require('../util/user');

/**
 * Handle promotion of members through various stages. Examples Below
 *
 * PROCESSING -> RECRUIT
 * - Removes the processing role
 * - Adds the Recruit role
 * - Adds the RCT role
 * - Adds the "OTHER ROLES" divider role
 * - Set nickname of member
 *
 * RECRUIT -> MEMBER
 * - Remove the Recruit role
 * - Add Member role
 * - Remove current rank
 * - Add next rank
 * - Set nickname of member
 *
 * STANDARD MEMBER RANK ADVANCEMENT
 * - Remove current rank
 * - Add next rank
 * - Set nickname of member
 *
 * @param interaction
 * @returns {Promise<*>}
 */
module.exports = async (interaction) => {
    const senderRankRole = getMemberRankRole(interaction.member);

    // Basic check to prevent non members from attempting to execute this command
    if (!senderRankRole) {
        return interaction.reply({
            content  : 'You do not have permissions to execute this command',
            ephemeral: true
        });
    }

    const targetMember = interaction.options.getMember('member');

    if (!targetMember.manageable) {
        return interaction.reply({
            content  : `${targetMember} cannot be managed.`,
            ephemeral: true
        });
    }

    const targetIsProcessing = isProcessing(targetMember);
    const targetIsRecruit = isRecruit(targetMember);

    // PROCESSING -> RECRUIT
    if (targetIsProcessing) {
        return promoteToRecruit(interaction, targetMember)
            .then(async (rctRole) => {
                await updateNickname(targetMember);
                await logPromotion(interaction, targetMember);

                return interaction.reply({
                    content  : `${targetMember} has been promoted to ${rctRole.name}.`,
                    ephemeral: true
                });
            });
    }
    
    const targetNextRankRole = interaction.options.getRole('rank') || getNextMemberRankRole(targetMember);

    // Ensure the member is promotable (has a next rank to move to)
    if (!targetNextRankRole) {
        return interaction.reply({
            content  : 'This member cannot be promoted any further.',
            ephemeral: true
        });
    }

    // Ensure the command sender outranks the target member
    if (senderRankRole.position < targetNextRankRole.position) {
        return interaction.reply({
            content  : 'You cannot promote to a rank higher than your own.',
            ephemeral: true
        });
    }

    interaction.deferReply({ephemeral: true})
        .then(async () => {
            const targetCurrentRankRole = getMemberRankRole(targetMember);

            if (targetNextRankRole.position < targetCurrentRankRole.position) {
                return interaction.editReply('You cannot promote someone to a rank lower than their current rank!');
            }

            const dmChannel = await interaction.user.createDM();
            const instructionText = `Provide a reason for the promotion of ${targetMember}. Your verbiage should flow in the context of "because of [reason] and as such, has been promoted".`;
            await dmChannel.send(instructionText);

            const messageCollector = dmChannel.createMessageCollector({
                filter: (message) => (message.author.id === interaction.user.id)
            });

            /**
             * Flag that sets a state of 'proof reading' so the bot will ignore any additional messages sent to it in this mode.
             * For example, if they submit the reasons for promotion, and then happen to send another message, we just ignore it
             * and we wait for them to react to the previous proof reading message.
             * @type {boolean}
             */
            let proofing = false;

            messageCollector.on('collect', async (message) => {
                if (proofing) {
                    return;
                }

                const today = new Date();
                const promotionDate = today.getDate() + today.toLocaleString('default', {month: 'short'}).toUpperCase() + today.getFullYear();

                let responseText = 'The Command Staff of the 36th Engineer Regiment has reposed special trust and confidence in ' + targetMember.user.toString();
                responseText += ' because of ' + message.content + ' and as such, has been promoted from the rank of ' + targetCurrentRankRole.name + ' to ' + targetNextRankRole.name;
                responseText += ' , in accordance with tradition and with the approval of his peers, this day, ' + promotionDate;

                const responseMessage = await dmChannel.send('React with ✅ to accept or ❌ to make changes.\n\n> ' + responseText);

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
                                await promoteToMember(interaction, targetMember);
                            }

                            // add next rank, remove current rank
                            await targetMember.roles.remove(targetCurrentRankRole);
                            await targetMember.roles.add(targetNextRankRole);

                            await updateNickname(targetMember);
                            await logPromotion(interaction, targetMember);

                            break;
                        }

                        case '❌': {
                            reactionCollector.stop();
                            await reaction.message.delete();
                            await dmChannel.send(instructionText);
                            break;
                        }

                        default:
                            await dmChannel.send('Why would you do this? You\'re breakin my heart');
                    }

                    proofing = false;
                });
            });
        });
};

async function logPromotion (interaction, targetMember) {
    const newRank = getMemberRankRole(targetMember);
    const RANK_ROLE_IDS = process.env.RANK_ROLE_IDS.split(',');
    const prevRank = interaction.guild.roles.cache.get(RANK_ROLE_IDS[RANK_ROLE_IDS.indexOf(newRank.id) - 1]);
    const logChannel = interaction.guild.channels.cache.get(process.env.PROMOTION_LOG_OUTPUT_CHANNEL_ID);

    if (logChannel) {
        if (prevRank) {
            return logChannel.send(`${interaction.member} promoted ${targetMember} from ${prevRank.name} to ${newRank.name}`);
        } else {
            return logChannel.send(`${interaction.member} promoted ${targetMember} to ${newRank.name}`);
        }
    }
}

/**
 * Handle promoting a recruit to a member
 *
 * @param interaction
 * @param targetMember
 * @returns {Promise<*>}
 */
async function promoteToMember (interaction, targetMember) {
    const recruitRole = getRecruitRole(interaction.guild);

    // remove RECRUIT role
    await targetMember.roles.remove(recruitRole);
    const memberRole = getMemberRole(interaction.guild);

    // add MEMBER role
    return targetMember.roles.add(memberRole);
}

/**
 * Handles promoting a new member from in processing to recruit status
 *
 * @param interaction
 * @param targetMember
 * @returns {Promise<Role>}
 */
async function promoteToRecruit (interaction, targetMember) {
    const dividerRoles = getDividerRoles(interaction.guild);
    const otherRolesDividerRole = dividerRoles.find((role) => role.name.includes('OTHER ROLES'));

    // add OTHER ROLES divider role
    if (!targetMember.roles.cache.has(otherRolesDividerRole.id)) {
        await targetMember.roles.add(otherRolesDividerRole);
    }

    const RANK_ROLE_IDS = process.env.RANK_ROLE_IDS.split(',');
    const rctRole = interaction.guild.roles.cache.get(RANK_ROLE_IDS[0]);

    // add RECRUIT and RCT roles
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

    return rctRole;
}