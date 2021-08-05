const {getMemberRankRole, getMemberSquadRole} = require('./role');

function isMemberHHC (guildMember) {
    const HHC_ROLE_IDS = process.env.HHC_ROLE_IDS.split(',');

    return HHC_ROLE_IDS.some((roleId) => guildMember.roles.cache.has(roleId));
}

function isMemberInactive (guildMember) {
    return guildMember.roles.cache.has(process.env.ITEM_CO_ROLE_ID);
}

module.exports = {
    isMemberHHC,
    isMemberInactive,
    setNickName: async (guildMember) => {
        guildMember = await guildMember.fetch(); // force update the member, this might not be necessary

        const rankRole = getMemberRankRole(guildMember);
        const squadRole = getMemberSquadRole(guildMember);
        const memberIsHHC = isMemberHHC(guildMember);
        const memberIsInactive = isMemberInactive(guildMember);

        // give a new nickname
        // example nickname: 2/1 SGT. PERSONS
        // example nickname: 2.1 BCo. SGT. PERSONS
        if (guildMember.nickname) {
            let nickname = guildMember.nickname;
            let unitPart = '';

            // extract the unit part
            if (memberIsHHC) {
                unitPart = '[HHC]';
                nickname = nickname.replace(unitPart, '').trim();
            } else if (memberIsInactive) {
                unitPart = '[I CO]';
                nickname = nickname.replace(unitPart, '').trim();
            } else {
                unitPart = guildMember.nickname.match(/^(\[[A-Z]{3}]|\d\/\d(\s[A-Z]Co\.?)?)/);

                if (unitPart && unitPart.length) {
                    nickname = nickname.replace(unitPart[0], '').trim();
                }
            }

            // extract the rank part
            // eg SGT. or PVT. etc
            const rankPart = nickname.match(/^\w{3}\./);

            if (rankPart && rankPart.length) {
                nickname = nickname.replace(rankPart[0], '').trim();
            }

            /**
             * By this point, we should be left with only the nickname of the member
             */

            if (!memberIsHHC && !memberIsInactive && squadRole) {
                unitPart = squadRole.name + '.';
            }

            // add rank to nick
            if (rankRole) {
                nickname = `${rankRole.name}. ${nickname}`;
            }

            // add unit to nick
            if (unitPart) {
                nickname = `${unitPart} ${nickname}`;
            }

            await guildMember.setNickname(nickname)
                .catch((e) => console.log(`${guildMember.nickname} - ${nickname} - ${e.message}`));
        } else {
            let nickname = guildMember.user.username;

            if (rankRole) {
                nickname = `${rankRole.name}. ${nickname}`;
            }

            if (memberIsHHC) {
                nickname = `[HHC] ${nickname}`;
            } else if (squadRole) {
                nickname = `${squadRole.name}. ${nickname}`;
            }

            await guildMember.setNickname(nickname)
                .catch((e) => console.log(`${guildMember.nickname} - ${nickname} - ${e.message}`));
        }
    }
};