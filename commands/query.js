const {Collection, MessageEmbed} = require('discord.js');
const {isInactive} = require('../util/user');
const monthNames = ['JAN', 'FED', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

module.exports = async (interaction) => {
    const channel = interaction.guild.channels.cache.get(process.env.QUERY_OUTPUT_CHANNEL_ID);

    if (!channel) {
        return interaction.reply({
            content  : 'Query output channel does not exist!',
            ephemeral: true
        });
    }

    interaction.deferReply({ephemeral: true})
        .then(async () => {
            const subCommand = interaction.options.getSubcommand();

            switch (subCommand) {
                case 'rank': {
                    const rankRole = interaction.options.getRole('role');
                    let membersWithRank = interaction.guild.members.cache.filter((member) => member.roles.cache.has(rankRole.id) && !isInactive(member));

                    // 2500 for now is the magic number
                    (await getLotsOfAuditLogs(interaction.guild,'MEMBER_ROLE_UPDATE', Number(process.env.QUERY_RANK_LIMIT)))
                        .filter((logEntry) => logEntry.changes.some((change) => change.key === '$add') && logEntry.targetType === 'USER')
                        .each((logEntry) => {
                            const member = membersWithRank.get(logEntry.target.id);

                            if (!member) {
                                return;
                            }

                            // we only care about entries that added roles
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

                    membersWithRank = membersWithRank.sort((memberA, memberB) => {
                        if (!memberA.dateOfRank || !memberB.dateOfRank) {
                            return -1;
                        }

                        return memberA.dateOfRank - memberB.dateOfRank;
                    });

                    const embed = new MessageEmbed()
                        .setColor('#cd1c1c')
                        .setAuthor('Uncle Sam', 'https://thefighting36th.com/img/favicon-16x16.png', 'https://thefighting36th.com')
                        .setDescription(`Query by rank: ${rankRole.name}`)
                        .setThumbnail('https://thefighting36th.com/img/favicon-32x32.png')
                        .addFields(
                            {
                                name  : 'Members',
                                value : [...membersWithRank.values()].map((member) => member.displayName).join('\n'),
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

                    await channel.send({embeds: [embed]});

                    return interaction.editReply('Query complete.');
                }

                default:
                    return interaction.reply({
                        content  : `Unknown subcommand: ${subCommand}`,
                        ephemeral: true
                    });
            }
        });
};

/**
 * Recursively fetch audit log entries, 100 at a time to bypass the rate limit
 * set by the discord api.
 *
 * @param guild
 * @param type
 * @param limit
 * @returns {Promise<Collection<unknown, unknown>>}
 */
async function getLotsOfAuditLogs (guild, type, limit = 100) {
    let result = new Collection();
    let lastId;

    const options = {limit: 100};

    if (type) {
        options.type = type;
    }

    while (true) {
        if (lastId) {
            options.before = lastId;
        }

        const currentResult = (await guild.fetchAuditLogs(options)).entries;

        lastId = currentResult.last().id;
        result = result.concat(currentResult);

        if (currentResult.size !== 100 || result.size >= limit) {
            break;
        }
    }

    return result;
}