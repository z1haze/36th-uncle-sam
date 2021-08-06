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

    let nickname = guildMember.user.username;

    if (guildMember.nickname) {
        nickname = guildMember.nickname.match(/^(\d\/\d\s)?(\[(HHC|I\sCO)]\s)?([A-Z]Co\.\s)?(([A-z]|[1-2]){2,3}\.\s)?(.+)/).pop();
    }

    /**
     * Working from right to left, we add the nickname additions back in
     */

    // add the member's rank
    if (memberRankRole) {
        nickname = `${memberRankRole.name}. ${nickname}`;
    }

    // add the member's unit identifier
    if (memberIsInactive) {
        nickname = `[I CO] ${nickname}`;
    } else if (memberIsHHC) {
        nickname = `[HHC] ${nickname}`;
    } else if (memberIsCompanyLeadership || memberIsPlatoonLeadership) {
        const memberCompanyRole = getMemberCompanyRole(guildMember);

        nickname = `${memberCompanyRole.name.substr(0, 1)}Co. ${nickname}`;
    } else if (memberSquadRole) {
        nickname = `${memberSquadRole.name}. ${nickname}`;
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