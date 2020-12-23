module.exports = {
    name: '~dm',
    description: 'DM Roles!',
    execute(msg) {
        const roles = msg.mentions.roles
        const message = msg.content.split('--').pop();

        roles.forEach((role) => {
            role.members.forEach((member) => member.send(message));
        })
    },
}