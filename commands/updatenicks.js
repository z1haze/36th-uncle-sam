const {updateNickname} = require('../util/user');

module.exports = (interaction) => {
    const onlineOnly = interaction.options.getBoolean('onlineonly');

    interaction.deferReply({ephemeral: true})
        .then(async () => {
            let members = null;

            if (onlineOnly) {
                members = interaction.guild.members.cache.filter((member) => member.presence?.status === 'online');
            } else {
                members = interaction.guild.members.cache;
            }

            const promises = [];
            
            members.each((member) => {
                if (member.manageable) {
                    promises.push(updateNickname(member));
                }
            });

            Promise.all(promises)
                .then(() => interaction.editReply(`Updated nicknames for ${promises.length} members.`));
        })
        .catch((e) => interaction.editReply(e.message));

};