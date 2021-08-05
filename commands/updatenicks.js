const {setNickName} = require('../util/user');

module.exports = (interaction) => {
    const onlineOnly = interaction.options.getBoolean('onlineonly');

    interaction.defer({ephemeral: true})
        .then(async () => {
            let members = null;

            if (onlineOnly) {
                members = interaction.guild.members.cache.filter((member) => member.presence?.status === 'online');
            } else {
                members = interaction.guild.members.cache;
            }

            const promises = [];
            
            members.each((member) => promises.push(setNickName(member)));

            Promise.all(promises)
                .then(() => interaction.editReply(`Updated nicknames for ${members.size} members.`));
        })
        .catch((e) => interaction.editReply(e.message));

};