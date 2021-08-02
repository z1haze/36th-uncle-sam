const {getMemberRankRole} = require('./role');

module.exports = {
    setNickName: async (guildMember) => {
        guildMember = await guildMember.fetch(); // force update the member
        const rankRole = getMemberRankRole(guildMember);

        // give a new nickname
        // example nickname: 2/1 SGT. PERSONS
        if (guildMember.nickname) {
            const nickParts = guildMember.nickname.split(' ');

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

            await guildMember.setNickname(`${unitPart + rankRole.name}. ${namePart}`);
        } else {
            await guildMember.setNickname(`${rankRole.name}. ${guildMember.user.username}`);
        }
    }
};