const {setNickName} = require('../util/user');

module.exports = async (interaction) => {
    const member = interaction.options.getMember('member');
    const nickname = interaction.options.get('nickname');

    return interaction.defer({ephemeral: true})
        .then(async () => {
            await member.setNickname(nickname.value);
            await setNickName(member);

            return interaction.editReply(`${member}'s nickname has been updated.`);
        });
};