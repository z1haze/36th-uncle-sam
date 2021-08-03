const {getMemberRankRole, getMemberSquadRole} = require('./role');

module.exports = {
    setNickName: async (guildMember) => {
        guildMember = await guildMember.fetch(); // force update the member
        const rankRole = getMemberRankRole(guildMember);
        const squadRole = getMemberSquadRole(guildMember);

        // give a new nickname
        // example nickname: 2/1 SGT. PERSONS
        // example nickname: 2.1 BCo. SGT. PERSONS
        if (guildMember.nickname) {
            let nickname = guildMember.nickname;

            // extract the unit identifiers from their current nick, eg [HHC] or 2/1, or 2.1 BCo., etc
            let unitPart = guildMember.nickname.match(/^(\[[A-Z]{3}]|\d\/\d(\s[A-Z]Co\.?)?)/);

            // extract the unit part
            if (unitPart.length) {
                unitPart = unitPart[0];
                nickname = nickname.replace(unitPart, '').trim();
            }

            // eg SGT. or PVT. etc
            let rankPart = nickname.match(/^\w{3}\./);

            // extract the rank part
            if (rankPart.length) {
                rankPart = rankPart[0];
                nickname = nickname.replace(rankPart, '').trim();
            }

            /**
             * By this point, we should be left with only the name of the person
             */

            const squadRole = getMemberSquadRole(guildMember);

            // if they are assigned to a squad, that should be their unit part
            if (squadRole) {
                unitPart = squadRole.name + '.';
            }

            await guildMember.setNickname(`${unitPart} ${rankRole.name}. ${nickname}`);
        } else {
            let nick = `${rankRole.name}. ${guildMember.user.username}`;

            if (squadRole) {
                nick = `${squadRole.name}. ${nick}`;
            }

            await guildMember.setNickname(nick);
        }
    }
};