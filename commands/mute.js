const giveRole = require('../util/give-role');

module.exports = {
    name: '~mute',
    description: 'Mute!',
    execute(msg) {
        if (msg.mentions.users.size) {
            const user = msg.mentions.users.first();

            try {
                giveRole(msg.guild, user, 'Muted');

                msg.channel.send(`${user.username} is now muted`);
            } catch (err) {
                console.error(err);

                msg.channel.send(`Error occurred while muting ${user.username}`);
            }
        }
    },
}