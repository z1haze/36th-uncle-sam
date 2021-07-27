const {MessageEmbed} = require('discord.js');

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
                // get members of requested rank and stub out data for message
                const membersOfRank = message.guild.members.cache.filter((member) => member.roles.cache.has(rankRole.id))
                    .mapValues((member) => {
                        return {...member, dateOfRank: ''};
                    });

                // pull the audit log to try to get the dates (this is the only way to get this sort of information, and is limited by 90 days history, among other things)
                const auditLog = await message.guild.fetchAuditLogs({
                    type: 'MEMBER_ROLE_UPDATE'
                });

                auditLog.entries.each((entry) => {
                    const member = membersOfRank.get(entry.id);

                    if (member) {
                        member.dateOfRank = entry.createdAt;
                    }
                });
                    
                const embed = new MessageEmbed()
                    .setColor('#cd1c1c')
                    .setAuthor('Uncle Sam', 'https://thefighting36th.com/img/favicon-16x16.png', 'https://thefighting36th.com')
                    .setDescription(`Members of rank: ${rankRole.name}`)
                    .setThumbnail('https://thefighting36th.com/img/favicon-32x32.png')
                    .addFields(
                        { name: 'Members', value: [...membersOfRank.values()].join('\n'), inline: true },
                        {name: 'Date of Rank', value: [...membersOfRank.values().map((member) => member.dateOfRank).join('\n')], inline: true}
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