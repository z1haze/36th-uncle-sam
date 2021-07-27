const {MessageEmbed} = require('discord.js');

const monthNames = ['JAN', 'FED', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

module.exports = {
    commands           : ['query'],
    expectedArgs       : '<query_of> <search>',
    minArgs            : 2,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : async (message, args) => {
        // ~query rank RCT

        if (args[0] === 'rank') {
            const rankRole = message.mentions.roles.first();

            if (rankRole) {
                const membersWithRank = message.guild.members.cache.filter((member) => member.roles.cache.has(rankRole.id));

                const auditLogs = (await message.guild.fetchAuditLogs({
                    limit: 2000,
                    type : 'MEMBER_ROLE_UPDATE'
                })).entries.filter((logEntry) =>
                    logEntry.changes.some((change) => change.key === '$add') && logEntry.targetType === 'USER');

                // iterate over the audit log, trying to match audit entries with our member collection
                auditLogs.each((logEntry) => {
                    const member = membersWithRank.get(logEntry.target.id);

                    if (!member) {
                        return;
                    }

                    const addChanges = logEntry.changes.filter((change) => change.key === '$add');

                    if (addChanges.length) {
                        // iterate over the changes
                        addChanges.some((change) => {
                            if (change.new instanceof Array) {
                                // iterate over the new changes
                                return change.new.some((newChange) => {
                                    if (newChange.id === rankRole.id) {
                                        member.dateOfRank = logEntry.createdAt;

                                        return true;
                                    }
                                });
                            }
                        });
                    }
                });

                const embed = new MessageEmbed()
                    .setColor('#cd1c1c')
                    .setAuthor('Uncle Sam', 'https://thefighting36th.com/img/favicon-16x16.png', 'https://thefighting36th.com')
                    .setDescription(`Query by rank: ${rankRole.name}`)
                    .setThumbnail('https://thefighting36th.com/img/favicon-32x32.png')
                    .addFields(
                        {
                            name  : 'Members',
                            value : [...membersWithRank.values()].join('\n'),
                            inline: true
                        },
                        {
                            name : 'Date of Rank',
                            value: [...membersWithRank.values()].map((member) => {
                                if (member.dateOfRank) {
                                    return member.dateOfRank.getDate() + monthNames[member.dateOfRank.getMonth()] + member.dateOfRank.getFullYear();
                                }

                                return '\u200B';
                            }).join('\n'),
                            inline: true
                        }
                    )
                    .setTimestamp()
                    .setFooter('Brought to you by Uncle Sam', 'https://thefighting36th.com/img/favicon-16x16.png');

                const outputChannel = message.guild.channels.cache.get(process.env.PROMOTION_LIST_CHANNEL_ID);

                if (outputChannel) {
                    await outputChannel.send(embed);
                }
            }
        }
    }
};