module.exports = {
    commands    : ['ping'],
    expectedArgs: '',
    minArgs     : 0,
    callback    : (message, args, text) => {
        return message.reply('Pong!');
    }
};