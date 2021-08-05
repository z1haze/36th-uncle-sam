const {Collection} = require('discord.js');

/**
 * Fetch all divider roles as a collection
 *
 * @param guild
 * @returns {Collection<String, Role>}
 */
const getDividerRoles = (guild) => {
    const DIVIDER_ROLE_IDS = process.env.DIVIDER_ROLE_IDS.split(',');
    const dividerRoles = new Collection();

    DIVIDER_ROLE_IDS.forEach((roleId) => {
        const role = guild.roles.cache.get(roleId);

        if (role) {
            dividerRoles.set(roleId, role);
        }
    });

    return dividerRoles;
};

/**
 * Get a specific divider role
 *
 * @param guild {Guild}
 * @param identifier {String}
 * @returns {Role|null}
 */
const getDividerRole = (guild, identifier) => {
    const dividerRoles = getDividerRoles(guild);

    return dividerRoles.find((role) => role.name.includes(identifier));
};

/**
 * Helper to get the in processing role
 *
 * @param guild {Guild}
 * @returns {*}
 */
const getProcessingRole = (guild) => {
    return guild.roles.cache.get(process.env.PROCESSING_ROLE_ID);
};

/**
 * Helper to get the recruit role
 *
 * @param guild {Guild}
 * @returns {*}
 */
const getRecruitRole = (guild) => {
    return guild.roles.cache.get(process.env.RECRUIT_ROLE_ID);
};

/**
 * Helper to get the member role
 *
 * @param guild {Guild}
 * @returns {*}
 */
const getMemberRole = (guild) => {
    return guild.roles.cache.get(process.env.MEMBER_ROLE_ID);
};

/**
 * Helper to get the members current rank role
 *
 * @param guildMember {GuildMember}
 * @returns {Role|null}
 */
const getMemberRankRole = (guildMember) => {
    const RANK_ROLE_IDS = process.env.RANK_ROLE_IDS.split(',');

    for (let i = 0; i < RANK_ROLE_IDS.length; i++) {
        if (guildMember.roles.cache.has(RANK_ROLE_IDS[i])) {
            return guildMember.guild.roles.cache.get(RANK_ROLE_IDS[i]);
        }
    }

    return null;
};

/**
 * Helper to get the next role rank for a unit member
 *
 * @param guildMember {GuildMember}
 * @returns {Role|null}
 */
const getNextMemberRankRole = (guildMember) => {
    const currentRankRole = getMemberRankRole(guildMember);
    const RANK_ROLE_IDS = process.env.RANK_ROLE_IDS.split(',');

    try {
        const nextRankRoleId = RANK_ROLE_IDS[RANK_ROLE_IDS.indexOf(currentRankRole.id) + 1];

        return guildMember.guild.roles.cache.get(nextRankRoleId);
    } catch (e) {
        return null;
    }
};

/**
 * This method checks to see if a role has a position between
 * the dividerRole and the next divider role
 *
 * @param guild {Guild}
 * @param role {Role}
 * @param identifier {String}
 * @returns {boolean}
 */
const isRoleWithinGroup = (guild, role, identifier) => {
    if (!role) {
        return false;
    }

    if (role.name.includes('\u{2063}')) {
        return false;
    }

    const dividerRoles = getDividerRoles(guild);

    // sort roles from top to bottom
    const sortedRoles = guild.roles.cache
        .sort((roleA, roleB) => roleB.position - roleA.position);

    let topLimit;
    let bottomLimit;

    sortedRoles
        .some((role) => {
            if (role.name.includes(identifier) && dividerRoles.has(role.id)) {
                topLimit = role.position;

                return sortedRoles.some((role) => {
                    // this condition will find the next divider role
                    if (role.position < topLimit && dividerRoles.has(role.id)) {
                        bottomLimit = role.position;

                        return true;
                    }
                });
            }
        });

    /**
     * This will make sure that the role we are checking lies between the
     * divider role for the provided identifier, and the next divider role,
     * for example if we are checking a company, we should check that the role
     * sits within the company divider role, and the platoon divider role
     * (because the platoon divider role is the next divider after company)
     */
    return (role.position > bottomLimit && role.position < topLimit);
};

/**
 * Helper to check if a role is a valid company role
 *
 * @param guild {Guild}
 * @param role {Role}
 * @returns {boolean}
 */
const isValidCompanyRole = (guild, role) => {
    return isRoleWithinGroup(guild, role, 'COMPANY');
};

/**
 * Helper to check if a role is a valid platoon role
 *
 * @param guild {Guild}
 * @param role {Role}
 * @returns {boolean}
 */
const isValidPlatoonRole = (guild, role) => {
    return isRoleWithinGroup(guild, role, 'PLATOON');
};

/**
 * Helper to check if a role is a valid squad role
 *
 * @param guild {Guild}
 * @param role {Role}
 * @returns {boolean}
 */
const isValidSquadRole = (guild, role) => {
    return isRoleWithinGroup(guild, role, 'SQUAD');
};

const getVerifiedRole = (guildMember, identifier) => {
    const dividerRoles = getDividerRoles(guildMember.guild);
    let foundDivider = false;

    const role = guildMember.roles.cache
        .sort((roleA, roleB) => roleB.position - roleA.position)
        .find((role) => {
            if (foundDivider) {
                return role;
            }

            // if the current role is the PLATOON divider, the next iteration should be the platoon role
            if (dividerRoles.has(role.id) && role.name.includes(identifier)) {
                foundDivider = true;
            }
        });

    let isValid = false;

    switch (identifier) {
        case 'COMPANY':
            isValid = isValidCompanyRole(guildMember.guild, role);
            break;
        case 'PLATOON':
            isValid = isValidPlatoonRole(guildMember.guild, role);
            break;
        case 'SQUAD':
            isValid = isValidSquadRole(guildMember.guild, role);
    }

    return isValid
        ? role :
        null;
};

/**
 * Get a unit member's company role
 *
 * @param guildMember {GuildMember}
 * @returns {Role|null}
 */
const getMemberCompanyRole = (guildMember) => {
    return getVerifiedRole(guildMember, 'COMPANY');
};

/**
 * Get a unit member's platoon role
 *
 * @param guildMember {GuildMember}
 * @returns {Role|null}
 */
const getMemberPlatoonRole = (guildMember) => {
    return getVerifiedRole(guildMember, 'PLATOON');
};

/**
 * Get a unit member's squad role
 *
 * @param guildMember {GuildMember}
 * @returns {Role|null}
 */
const getMemberSquadRole = (guildMember) => {
    return getVerifiedRole(guildMember, 'SQUAD');
};

/**
 * Check if the guildMember is a unit member
 *
 * @param guildMember {GuildMember}
 * @returns {*}
 */
const isMember = (guildMember) => {
    return guildMember.roles.cache.has(process.env.MEMBER_ROLE_ID);
};

/**
 * Check if the guildMember is in processing
 *
 * @param guildMember {GuildMember}
 * @returns {*}
 */
const isProcessing = (guildMember) => {
    return guildMember.roles.cache.has(process.env.PROCESSING_ROLE_ID);
};

/**
 * Check if the guildMember is a recruit
 *
 * @param guildMember {GuildMember}
 * @returns {*}
 */
const isRecruit = (guildMember) => {
    return guildMember.roles.cache.has(process.env.RECRUIT_ROLE_ID);
};

module.exports = {
    getDividerRoles,
    getDividerRole,
    getProcessingRole,
    getRecruitRole,
    getMemberRole,
    getMemberRankRole,
    getNextMemberRankRole,
    getMemberCompanyRole,
    getMemberPlatoonRole,
    getMemberSquadRole,
    isValidCompanyRole,
    isValidPlatoonRole,
    isValidSquadRole,
    isMember,
    isProcessing,
    isRecruit
};