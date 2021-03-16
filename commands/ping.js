module.exports = {
    commands     : ['ping'],
    expectedArgs : '',
    minArgs      : 0,
    requiredRoles: ['Member'],
    callback     : (message, args, text) => {
        return message.reply('Pong!');
    }
};