module.exports = {
    name: '~kick',
    description: 'Kick!',
    execute(msg) {
        if (msg.mentions.users.size) {
            const user = msg.mentions.users.first();

            try {
                user.kick();
            } catch (err) {
                console.error(err);

                msg.channel.send(`Error occurred while kicking ${user.username}`);
            }
        }
    },
}