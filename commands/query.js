const {MessageEmbed} = require('discord.js');

module.exports = {
    commands           : ['query'],
    expectedArgs       : '<query_of> <role_name>',
    minArgs            : 2,
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : async (message, args) => {
        if (message.channel.type === 'dm') {
            // ~query rank RCT
            
            if (args[0] === 'rank') {
                const rankRole = message.mentions.roles.first();
                
                if (rankRole) {
                    const membersOfRank = message.guild.members.cache.filter((member) => member.roles.has(rankRole));
                    
                    const embed = new MessageEmbed()
                        .setColor('#cd1c1c')
                        .setTitle('Member Result')
                        .setURL('https://thefighting36th.com')
                        .setAuthor('Uncle Sam', 'https://thefighting36th.com/img/favicon-16x16.png', 'https://thefighting36th.com')
                        .setDescription(`Members of rank: ${rankRole.name}`)
                        .setThumbnail('https://thefighting36th.com/img/favicon-32x32.png')
                        .addFields(
                            { name: 'Members', value: [...membersOfRank.values()].join('\n'), inline: true }
                        )
                        .setTimestamp()
                        .setFooter('Brought to you by Uncle Sam', 'https://thefighting36th.com/img/favicon-16x16.png');

                    await message.author.send(embed);
                }
            }
        }
    }
};