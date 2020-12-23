module.exports = {
    name: '~ban',
    description: 'Ban!',
    execute(msg) {
        if (msg.mentions.users.size) {
            const user = msg.mentions.users.first();

            try {
                user.ban();
            } catch (err) {
                console.error(err);
                
                msg.channel.send(`Error occurred while banning ${user.username}`);
            }
        }
    },
}