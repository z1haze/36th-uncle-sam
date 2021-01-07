/**
 * Get a divider role for a particular role
 *
 * @param guild
 * @param role
 * @returns {any}
 */
const getDividerRole = (guild, role) => {
    let found = false;

    // if the role stops with a
    if (role.name.charCodeAt(0) === 8291) {
        return;
    }

    // get roles based on position
    const roles = Array.from(guild.roles.cache.values())
        .sort((a, b) => a.rawPosition - b.rawPosition);

    // find the first divider role that contains the role passed in
    for (const currentRole of roles) {
        if (currentRole === role) {
            found = true;
        } else if (currentRole.name.charCodeAt(0) === 8291 && found) {
            return currentRole;
        }
    }
};

/**
 * Give a role to a member
 *
 * @param guild
 * @param user
 * @param roleName
 */
const giveRole = async (guild, user, roleName) => {
    const role = guild.roles.cache.find((role) => role.name === roleName);

    if (role) {
        const member = guild.members.cache.get(user.id);

        const dividerRole = getDividerRole(guild, role);
        const memberHasDividerRole = !!member.roles.cache.get(dividerRole.id);

        if (!memberHasDividerRole) {
            member.roles.add(dividerRole);
        }

        member.roles.add(role);
    }
};

/**
 * Get all divider roles for a member
 *
 * @param guild
 * @param member
 * @param ignore
 * @returns {Map<any, any>}
 */
const getMemberDividerRoles = (guild, member, ignore = []) => {
    const dividerRoles = new Map();
    const roles = Array.from(member.roles.cache.values());

    for (const role of roles) {
        const found = ignore.findIndex((r) => r.id === role.id) > -1;

        if (found) {
            continue;
        }

        const dividerRole = getDividerRole(guild, role);

        if (dividerRole) {
            dividerRoles.set(dividerRole.id, dividerRole);
        }
    }

    return dividerRoles;
};

/**
 * Remove a role from a member
 *
 * @param guild
 * @param user
 * @param roleName
 */
const takeRole = async (guild, user, roleName) => {
    const role = guild.roles.cache.find((role) => role.name === roleName);

    if (role) {
        const member = guild.members.cache.get(user.id);

        await member.roles.remove(role);

        const memberDividerRoles = getMemberDividerRoles(guild, member, [role]);
        const dividerRole = getDividerRole(guild, role);

        if (!memberDividerRoles.get(dividerRole.id)) {
            member.roles.remove(dividerRole);
        }
    }
};

module.exports = {
    giveRole,
    takeRole,
    getDividerRole
};