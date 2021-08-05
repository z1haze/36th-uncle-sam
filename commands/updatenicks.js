const {setNickName} = require('../util/user');

module.exports = (interaction) => {
    const onlineOnly = interaction.options.getBoolean('onlineonly');

    let members = null;

    if (onlineOnly) {
        members = interaction.guild.members.filter((member) => member.presence.status === 'online');
    } else {
        members = interaction.guild.members;
    }

    const promises = [];

    interaction.defer({ephemeral: true})
        .then(() => {
            members.each((member) => promises.push(setNickName(member)));

            Promise.all(promises)
                .then(() => interaction.editReply(`Updated nicknames for ${members.size()}`));
        })
        .catch((e) => interaction.editReply(e.message));
};