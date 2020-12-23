module.exports = (guild, user, roleName) => {
    const role = guild.roles.cache.find((role) => role.name === roleName);

    if (role) {
        const member = guild.members.cache.get(user.id);

        member.roles.remove(role);
    }
};