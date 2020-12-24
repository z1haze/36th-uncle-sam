module.exports = {
    name: '~dm',
    description: 'DM Roles/Members!',
    async execute(msg) {
        const dmChannels = process.env.DM_BOT_CHANNELS.split(',');

        if ((msg.mentions.roles.size || msg.mentions.users.size) && dmChannels.indexOf(msg.channel.id) > -1) {
            const message = msg.content.split('--').pop();
            const members = new Set();

            // add each user which was mentioned
            msg.mentions.users.forEach((user) => members.add(msg.guild.members.cache.get(user.id)));

            // add each user from each role that was mentioned
            msg.mentions.roles.forEach((role) => {
                role.members.forEach((member) => {
                    members.add(member);
                })
            });

            // deliver messages to each member
            for (const member of members) {
                member.send(message);
            }
        }
    },
}