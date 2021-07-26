module.exports = {
    commands           : ['promote'],
    expectedArgs       : '<member> <reason>',
    minArgs            : 2,
    requiredRoles      : ['797590310561251349', '733212028721954827', '797590222497120317'],
    requiredPermissions: ['ADMINISTRATOR'],
    callback           : async (message, args, text) => {
        // ensure command was sent from an allowed channel
        if (process.env.PROMOTIONS_CHANNEL_ID !== message.channel.id) {
            return message.reply('Not allowed in this channel');
        }

        // get the member who is being promoted
        const member = message.mentions.members.first();

        // get a list of all rank role ids
        const RANK_IDS = process.env.RANK_IDS.split(',');

        let nextRank = null;

        // get the member's current rank and next rank
        const currentRank = member.roles.cache.find((role) => {
            if (RANK_IDS.includes(role.id)) {
                const nextIndex = RANK_IDS.indexOf(role.id) + 1;
                const nextRankId = RANK_IDS[nextIndex];

                if (nextIndex < RANK_IDS.length) {
                    nextRank = message.guild.roles.cache.get(nextRankId);
                }

                return role;
            }
        });

        // if we were not able to find their rank based on their current roles list
        if (!currentRank) {
            return message.reply(`Unable to find current rank for ${member.nickname || member.user.username}`);
        }

        // if we didnt find the 'next rank' we assume there isn't one
        if (!nextRank) {
            return message.reply(`There is no higher rank to promote ${member.nickname || member.user.username}`);
        }

        // get a list of all platoon role ids
        const PLATOON_IDS = process.env.PLATOON_IDS.split(',');

        // find the member's platoon to it can be mentioned
        const platoon = member.roles.cache.find((role) => PLATOON_IDS.includes(role.id));

        if (!platoon) {
            return message.reply(`Unable to find platoon for ${member.nickname || member.user.username}`);
        }

        // give a new nickname
        // example nickname: 2/1 SGT. PERSONS
        if (member.nickname) {
            const nickParts = member.nickname.split(' ');

            let unitPart = '';
            let namePart = '';

            for (let i = 0; i < nickParts.length; i++) {
                // search for the unit part of their nickname, eg 2/1 or [HHC], etc
                if (nickParts[i].match(/^(\d\/\d|\[\w+])$/) && !unitPart) {
                    unitPart = nickParts[i] + ' ';
                }

                // regardless if we found a unit part or not, we should continue on from this iteration
                if (i === 0) {
                    continue;
                }

                // assuming the next iterator is iteration i=1 (second index)

                // search for the rank part of their nickname (if it exists) so it can be excluded when updating their nickname
                // eg SGT. or PVT. etc
                if (nickParts[i].match(/^(\w|\/){2,3}\.$/)) {
                    namePart = nickParts.slice(i + 1).join(' ');
                } else {
                    // if we dont find a match to the
                    namePart = nickParts.slice(i).join(' ');
                }

                break;
            }

            await member.setNickname(`${unitPart + nextRank.name}. ${namePart}`);
        } else {
            await member.setNickname(`${nextRank.name}. ${member.user.username}`);
        }

        if (currentRank.name === 'RCT') {
            const recruitRank = member.roles.cache.find((role) => role.name === 'Recruit');
            const memberRank = message.guild.roles.cache.find((role) => role.name === 'Member');

            await member.roles.add(memberRank);
            await member.roles.remove(recruitRank);
        }

        await member.roles.add(nextRank);
        await member.roles.remove(currentRank);

        const today = new Date();
        const promotionDate = today.getDate() + today.toLocaleString('default', {month: 'short'}).toUpperCase() + today.getFullYear();

        text = text.split(' ');
        text.shift();
        text = text.join(' ');

        let output = '<@&' + platoon.id + '>,\n\n';

        output += 'The Command Staff of the 36th Engineer Regiment has reposed special trust and confidence in ' + member.user.toString();
        output += ' because of ' + text + ' and as such, has been promoted from the rank of ' + currentRank.name + ' to ' + nextRank.name;
        output += ' , in accordance with tradition and with the approval of his peers, this day, ' + promotionDate;

        const channel = message.guild.channels.cache.get(process.env.PROMOTIONS_CHANNEL_ID);

        if (!channel) {
            throw new Error(`Channel ${process.env.PROMOTIONS_CHANNEL_ID} does not exist!`);
        }

        const logChannel = message.guild.channels.cache.get(process.env.PROMOTION_LOG_CHANNEL_ID);

        if (logChannel) {
            await logChannel.send(`${message.author.toString()} promoted ${member.user.toString()} from ${currentRank.name} to ${nextRank.name}`);
        }

        await message.delete();
        await channel.send(output);
    }
};