module.exports = {
    commands    : ['dm'],
    expectedArgs: '<role1> <role2> ... -- attention users, this is a test',
    minArgs     : 2,
    callback    : (message) => {
        const dmChannels = process.env.DM_BOT_CHANNELS.split(',');

        if (
            (message.mentions.roles.size || message.mentions.users.size) &&
            dmChannels.indexOf(message.channel.id) === -1
        ) {
            return message.reply('DM Bot does not have access to this channel');
        }

        const content = message.content.split('--').pop();
        const members = new Set();

        // add each user which was mentioned
        message.mentions.users.forEach((user) => members.add(message.guild.members.cache.get(user.id)));

        // add each user from each role that was mentioned
        message.mentions.roles.forEach((role) => {
            role.members.forEach((member) => {
                members.add(member);
            });
        });

        // deliver messages to each member
        for (const member of members) {
            member.send(content);
        }
    }
};