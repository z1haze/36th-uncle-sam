const {getMemberRankRole, getPreviousMemberRankRole} = require('../util/role');
const {isMember, updateNickname} = require('../util/user');

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

    // only members can be demoted
    if (!isMember(targetMember)) {
        return interaction.reply({
            content: `${targetMember} is not a member, and cannot be demoted.`
        });
    }

    // current rank of target member
    const targetCurrentRankRole = getMemberRankRole(targetMember);

    // Ensure the command sender outranks the target member
    if (senderRankRole.position < targetCurrentRankRole.position) {
        return interaction.reply({
            content  : 'You cannot demote a member who outranks you.',
            ephemeral: true
        });
    }

    interaction.deferReply({ephemeral: true})
        .then(async () => {
            const targetPreviousRankRole = interaction.options.getRole('rank') || getPreviousMemberRankRole(targetMember);

            if (process.env.RANK_ROLE_IDS.indexOf(targetPreviousRankRole.id) === -1) {
                return interaction.reply({
                    content  : 'The role you selected is not a rank',
                    ephemeral: true
                });
            }

            if (targetPreviousRankRole.position > targetCurrentRankRole.position) {
                return interaction.editReply('You cannot demote someone to a rank higher than their current rank!');
            }

            const dmChannel = await interaction.user.createDM();

            await dmChannel.send(`Provide a reason for the demotion of ${targetMember}.`);

            const messageCollector = dmChannel.createMessageCollector({
                filter: (message) => (message.author.id === interaction.user.id)
            });

            messageCollector.on('collect', async (message) => {
                await targetMember.roles.remove(targetCurrentRankRole);
                await targetMember.roles.add(targetPreviousRankRole);

                await updateNickname(targetMember);
                const logChannel = interaction.guild.channels.cache.get(process.env.DEMOTION_LOG_OUTPUT_CHANNEL_ID);

                if (logChannel) {
                    await logChannel.send(`${interaction.member} demoted ${targetMember} from ${targetCurrentRankRole.name} to ${targetPreviousRankRole.name} for reason: ${message.content}`);
                }

                await dmChannel.delete();
                messageCollector.stop();

                await interaction.editReply(`${targetMember} has been demoted to ${targetPreviousRankRole.name}.`);
            });
        });
};