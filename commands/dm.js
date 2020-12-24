module.exports = {
    name: '~dm',
    description: 'DM Roles/Members!',
    execute(msg) {
        const dmChannels = process.env.DM_BOT_CHANNELS.split(',');

        if ((msg.mentions.roles.size || msg.mentions.users.size) && dmChannels.indexOf(msg.channel.id) > -1) {
            const roles = msg.mentions.roles;
            const users = msg.mentions.users;
            const message = msg.content.split('--').pop();
            const members = new Set();

            users.forEach((user) => members.add(msg.guild.members.cache.get(user.id)));
            roles.forEach((role) => role.members.forEach((member) => members.add(member)));
            members.forEach((member) => member.send(message));
        }
    },
}