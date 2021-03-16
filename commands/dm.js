module.exports = {
    commands     : ['dm'],
    expectedArgs : '<role1> <role2> ... -- attention users, this is a test',
    minArgs      : 2,
    requiredRoles: ['Member'],
    callback     : (message) => {
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

        const results = {
            promises: [],
            sent    : 0,
            blocked : 0
        };

        // deliver messages to each member
        for (const member of members) {
            results.promises.push(member.send(content)
                .then(() => results.sent++)
                .catch(async () => {
                    await message.channel.send(`${member.user} did not receive the message (bot was blocked).`);
                    results.blocked++;
                })
            );
        }

        Promise.all(results.promises)
            .then(() => {
                let output = 'Message sending complete.\n';

                output += `Sent to a total of ${results.sent} users\n`;

                if (results.blocked > 0) {
                    output += '> ' + results.blocked + ' users did not receive a message:\n';
                    output += '> - ' + results.blocked + ' blocked';
                }

                message.channel.send(output);
            });
    }
};