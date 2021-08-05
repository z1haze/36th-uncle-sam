const {setNickName} = require('../util/user');

module.exports = (interaction) => {
    const onlineOnly = interaction.options.getBoolean('onlineonly');

    interaction.defer({ephemeral: true})
        .then(async () => {
            await interaction.guild.members.fetch();

            let members = null;

            if (onlineOnly) {
                members = interaction.guild.members.cache.filter((member) => member.presence.status === 'online');
            } else {
                members = interaction.guild.members.cache;
            }

            const promises = [];
            
            members.each((member) => promises.push(setNickName(member)));

            Promise.all(promises)
                .then(() => interaction.editReply(`Updated nicknames for ${members.size()}`));
        })
        .catch((e) => interaction.editReply(e.message));

};