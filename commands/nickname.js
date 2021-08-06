const {updateNickname} = require('../util/user');

module.exports = async (interaction) => {
    const member = interaction.options.getMember('member');
    const nickname = interaction.options.get('nickname');

    if (!member.manageable) {
        return interaction.reply({
            content  : `${member} cannot be managed.`,
            ephemeral: true
        });
    }

    return interaction.deferReply({ephemeral: true})
        .then(async () => {
            return member.setNickname(nickname.value)
                .then(() => updateNickname(member))
                .then(() => interaction.editReply(`${member}'s nickname has been updated.`))
                .catch((e) => interaction.editReply(e.message));
        });
};