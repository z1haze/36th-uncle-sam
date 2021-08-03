const {getMemberRankRole, getMemberSquadRole} = require('./role');

function isMemberHHC (guildMember) {
    const HHC_ROLE_IDS = process.env.HHC_ROLE_IDS.split(',');

    return HHC_ROLE_IDS.some((roleId) => guildMember.roles.cache.has(roleId));
}

module.exports = {
    isMemberHHC,
    setNickName: async (guildMember) => {
        guildMember = await guildMember.fetch(); // force update the member
        const rankRole = getMemberRankRole(guildMember);
        const squadRole = getMemberSquadRole(guildMember);
        const memberIsHHC = isMemberHHC(guildMember);

        // give a new nickname
        // example nickname: 2/1 SGT. PERSONS
        // example nickname: 2.1 BCo. SGT. PERSONS
        if (guildMember.nickname) {
            let nickname = guildMember.nickname;

            // examples:
            // 1/1
            // 1/1 DCo.
            // 1/1 DCo
            // [HHC]
            let unitPart = guildMember.nickname.match(/^(\[[A-Z]{3}]|\d\/\d(\s[A-Z]Co\.?)?)/);

            // extract the unit part
            if (unitPart && unitPart.length) {
                nickname = nickname.replace(unitPart[0], '').trim();
            }

            // eg SGT. or PVT. etc
            const rankPart = nickname.match(/^\w{3}\./);

            // extract the rank part
            if (rankPart && rankPart.length) {
                nickname = nickname.replace(rankPart[0], '').trim();
            }

            /**
             * By this point, we should be left with only the nickname of the member
             */

            if (memberIsHHC) {
                unitPart = '[HHC]';
            } else if (squadRole) {
                unitPart = squadRole.name + '.';
            }

            if (rankRole) {
                nickname = `${rankRole.name}. ${nickname}`;
            }

            if (unitPart) {
                nickname = `${unitPart} ${nickname}`;
            }

            await guildMember.setNickname(nickname);
        } else {
            let nickname = `${rankRole.name}. ${guildMember.user.username}`;

            if (squadRole) {
                nickname = `${squadRole.name}. ${nickname}`;
            }

            await guildMember.setNickname(nickname);
        }
    }
};