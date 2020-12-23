const takeRole = require('../util/take-role');

module.exports = {
    name: '~unmute',
    description: 'Unmute!',
    execute(msg) {
        if (msg.mentions.users.size) {
            const user = msg.mentions.users.first();

            try {
                takeRole(msg.guild, user, 'Muted');

                msg.channel.send(`${user.username} is now unmuted`);
            } catch (err) {
                console.error(err);

                msg.channel.send(`Error occurred while unmuting ${user.username}`);
            }
        }
    },
}