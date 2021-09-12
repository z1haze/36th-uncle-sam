const knex = require('../db/knex');

module.exports = async (guild) => {
    const dbMembers = await knex.select().table('discord_members');
    const usersToDelete = new Set();
    const dbMembersMap = new Map();

    dbMembers.forEach((row) => {
        usersToDelete.add(row.discord_user_id);
        dbMembersMap.set(row.discord_user_id, row);
    });

    guild.members.cache.each(async (guildMember) => {
        // if the user exists in the database
        // track any updates, and remove them from the usersToDelete Set
        if (dbMembersMap.has(guildMember.user.id)) {
            usersToDelete.delete(guildMember.user.id);

            // update if anything changed?
        } else {
            // if they do not exist in the database, insert a new row
            await knex('discord_members').insert([{discord_user_id: guildMember.user.id, discord_username: guildMember.user.username}]);

            console.log(`Inserting new member ${guildMember.user.id} - ${guildMember.user.username}`);
        }
    });

    // delete all users who still exist in the usersToDelete because we never saw them while iterating over the live results
    if (usersToDelete.size > 0) {
        await knex('discord_members')
            .delete()
            .whereIn('discord_user_id', Array.from(usersToDelete));
    }
};