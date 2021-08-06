const {getMemberRankRole, getMemberSquadRole, getMemberCompanyRole} = require('./role');

module.exports = {
    isProcessing,
    isMember,
    isRecruit,
    updateNickname
};

/**
 * Set the nickname of a guildmember
 *
 * @param guildMember {GuildMember}
 * @returns {Promise<void>}
 */
async function updateNickname (guildMember) {
    guildMember = await guildMember.fetch(); // force update the member, this might not be necessary

    const memberIsHHC = isMemberHHC(guildMember);
    const memberIsCompanyLeadership = isMemberCompanyLeadership(guildMember);
    const memberIsPlatoonLeadership = isMemberPlatoonLeadership(guildMember);
    const memberIsInactive = isMemberInactive(guildMember);

    const memberRankRole = getMemberRankRole(guildMember);
    const memberSquadRole = getMemberSquadRole(guildMember);

    let nickname = guildMember.nickname || guildMember.user.username;
    let unitPart = '';

    /**
     * Extract the "unit information" from the existing nickname
     */

    if (memberIsHHC) {
        unitPart = '[HHC]';
    } else if (memberIsCompanyLeadership || memberIsPlatoonLeadership) {
        const unitMatch = guildMember.nickname.match(/^[A-Z]Co\./);

        if (unitMatch && unitMatch.length) {
            unitPart = unitMatch[0];
        }
    } else if (memberIsInactive) {
        unitPart = '[I CO]';
    } else {
        const unitMatch = guildMember.nickname.match(/^(\[[A-Z]{3}]|\d\/\d(\s[A-Z]Co\.?)?)/);

        if (unitMatch && unitMatch.length) {
            unitPart = unitMatch[0];
        }
    }

    if (unitPart.length) {
        nickname = nickname.replace(unitPart, '').trim();
    }

    /**
     * Extract the "rank information" from the existing nickname
     */

    const rankPart = nickname.match(/^\w{2,3}\./);

    if (rankPart && rankPart.length) {
        nickname = nickname.replace(rankPart[0], '').trim();
    }

    /**
     * By this point, we should be left with only the nickname of the member
     * Now we can build the parts up to recreate the nickname
     * Working from right to left, we build the nickname
     */

    if (
        !memberIsHHC
        && !memberIsCompanyLeadership
        && !memberIsPlatoonLeadership
        && !memberIsInactive
        && memberSquadRole
    ) {
        unitPart = `${memberSquadRole.name}.`;
    } else if (memberIsCompanyLeadership || memberIsPlatoonLeadership) {
        const memberCompanyRole = getMemberCompanyRole(guildMember);

        unitPart = `${memberCompanyRole.name.substr(0, 1)}Co.`;
    }

    if (memberRankRole) {
        nickname = `${memberRankRole.name}. ${nickname}`;
    }

    if (unitPart) {
        nickname = `${unitPart} ${nickname}`;
    }

    await guildMember.setNickname(nickname);
}

/**
 * Check if the guildMember is a unit member
 *
 * @param guildMember {GuildMember}
 * @returns {*}
 */
function isMember (guildMember) {
    return guildMember.roles.cache.has(process.env.MEMBER_ROLE_ID);
}

/**
 * Check if the guildMember is in processing
 *
 * @param guildMember {GuildMember}
 * @returns {*}
 */
function isProcessing (guildMember) {
    return guildMember.roles.cache.has(process.env.PROCESSING_ROLE_ID);
}

/**
 * Check if the guildMember is a recruit
 *
 * @param guildMember {GuildMember}
 * @returns {*}
 */
function isRecruit (guildMember) {
    return guildMember.roles.cache.has(process.env.RECRUIT_ROLE_ID);
}

/**
 * Check if the guildMember is HHC
 *
 * @param guildMember {GuildMember}
 * @returns {*}
 */
function isMemberHHC (guildMember) {
    const HHC_ROLE_IDS = process.env.HHC_ROLE_IDS.split(',');

    return HHC_ROLE_IDS.some((roleId) => guildMember.roles.cache.has(roleId));
}

/**
 * Check if the guildMember is Inactive
 *
 * @param guildMember {GuildMember}
 * @returns {*}
 */
function isMemberInactive (guildMember) {
    return guildMember.roles.cache.has(process.env.ITEM_CO_ROLE_ID);
}

/**
 * Check if the guildMember is in company leadership
 *
 * @param guildMember {GuildMember}
 * @returns {boolean}
 */
function isMemberCompanyLeadership (guildMember) {
    const COMPANY_LEADERSHIP_ROLE_IDS = process.env.COMPANY_LEADERSHIP_ROLE_IDS.split(',');

    return COMPANY_LEADERSHIP_ROLE_IDS.some((roleId) => guildMember.roles.cache.has(roleId));
}

/**
 * Check if the guildMember is in platoon leadership
 *
 * @param guildMember {GuildMember}
 * @returns {boolean}
 */
function isMemberPlatoonLeadership (guildMember) {
    const PLATOON_LEADERSHIP_ROLE_IDS = process.env.PLATOON_LEADERSHIP_ROLE_IDS.split(',');

    return PLATOON_LEADERSHIP_ROLE_IDS.some((roleId) => guildMember.roles.cache.has(roleId));
}