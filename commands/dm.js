const {Collection} = require('discord.js');

module.exports = (interaction) => {
    const message = interaction.options.get('message').value;
    const members = new Collection();

    for (let i = 1; i <= 5; i++) {
        const mention = interaction.options.get(`recipient${i}`);

        if (!mention) {
            continue;
        }

        if ('member' in mention) {
            members.set(mention.value, mention.member);
        } else if ('role' in mention) {
            mention.role.members.forEach((member) => {
                members.set(member.id, member);
            });
        }
    }

    const results = {
        promises: [],
        sent    : 0,
        blocked : 0
    };

    // deliver messages to each member
    members.forEach((member) => {
        results.promises.push(member.send(message)
            .then(() => results.sent++)
            .catch(async () => {
                await interaction.channel.send(`${member.user} did not receive the message (bot it probably blocked).`);
                results.blocked++;
            })
        );
    });

    return Promise.all(results.promises)
        .then(() => {
            let output = 'Message sending complete.\n';

            output += `> Sent to a total of ${results.sent} users\n`;

            if (results.blocked > 0) {
                output += '> ' + results.blocked + ' users did not receive a message:\n';
                output += '> - ' + results.blocked + ' blocked';
            }

            return interaction.reply(output);
        });
};