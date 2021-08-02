const {Collection} = require('discord.js');

const isMember = (guildMember) => {
    return guildMember.roles.cache.has(process.env.MEMBER_ROLE_ID);
};

const isProcessing = (guildMember) => {
    return guildMember.roles.cache.has(process.env.PROCESSING_ROLE_ID);
};

const isRecruit = (guildMember) => {
    return guildMember.roles.cache.has(process.env.RECRUIT_ROLE_ID);
};

const getProcessingRole = (guild) => {
    return guild.roles.cache.get(process.env.PROCESSING_ROLE_ID);
};

const getRecruitRole = (guild) => {
    return guild.roles.cache.get(process.env.RECRUIT_ROLE_ID);
};

const getMemberRole = (guild) => {
    return guild.roles.cache.get(process.env.MEMBER_ROLE_ID);
};

const getMemberRankRole = (guildMember) => {
    const RANK_ROLE_IDS = process.env.RANK_ROLE_IDS.split(',');

    for (let i = 0; i < RANK_ROLE_IDS.length; i++) {
        if (guildMember.roles.cache.has(RANK_ROLE_IDS[i])) {
            return guildMember.guild.roles.cache.get(RANK_ROLE_IDS[i]);
        }
    }
};

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

const getMemberPlatoonRole = (guildMember) => {
    const PLATOON_ROLE_DS = process.env.PLATOON_ROLE_IDS.split(',');

    for (let i = 0; i < PLATOON_ROLE_DS.length; i++) {
        if (guildMember.roles.cache.has(PLATOON_ROLE_DS[i])) {
            return guildMember.guild.roles.cache.get(PLATOON_ROLE_DS[i]);
        }
    }
};

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

module.exports = {
    isMember,
    isProcessing,
    isRecruit,
    getProcessingRole,
    getRecruitRole,
    getMemberRole,
    getMemberRankRole,
    getNextMemberRankRole,
    getMemberPlatoonRole,
    getDividerRoles
};