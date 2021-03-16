module.exports = {
    commands           : ['echo'],
    expectedArgs       : '<content>',
    minArgs            : 1,
    requiredPermissions: ['ADMINISTRATOR'],
    requiredRoles      : ['797590222497120317', '797590310561251349', '797590393650413588'],
    callback           : (message, args, text) => {
        message.channel.send(text);
        message.delete();
    }
};