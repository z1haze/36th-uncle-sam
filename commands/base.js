/**
 * Bot command prefix
 *
 * @type {string}
 */
const prefix = '~';

/**
 * All valid discord permissions
 *
 * @type {string[]}
 */
const permissions = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS'
];

/**
 * Ensures permission is valid
 *
 * @param perms
 */
const validatePermissions = (perms) => {
    for (const permission of perms) {
        if (!permissions.includes(permission)) {
            throw new Error(`Unknown permission: ${permission}`);
        }
    }
};

module.exports = (client, opts) => {
    const {
        expectedArgs = '',
        permissionError = 'You do not have permission to run this command.',
        minArgs = 0,
        maxArgs = null,
        requiredRoles = [],
        requiredPermissions = [],
        callback
    } = opts;

    const {commands} = opts;

    // eslint-disable-next-line no-console
    console.log(`Registering command: "${commands[0]}"`);

    // ensure required permissions are actual valid discord permissions
    if (requiredPermissions.length) {
        validatePermissions(requiredPermissions);
    }

    // listen for messages being sent in discord
    client.on('message', (message) => {
        const {member, content, guild} = message;

        for (const alias of commands) {
            if (content.toLowerCase().startsWith(`${prefix + alias.toLowerCase()}`)) {
                // check if user has correct permission
                let hasPermission = requiredPermissions.some((permission) => member.hasPermission(permission));

                // fallback to role check if they do not have the correct permission
                if (!hasPermission) {
                    hasPermission = requiredRoles.some((requiredRole) => {
                        const role = guild.roles.cache.find((role) => {
                            return role.name === requiredRole || role.id === requiredRole;
                        });
                        
                        return role.name.toLowerCase() === requiredRole.toLowerCase() || role.id === requiredRole;
                    });
                }

                if (!hasPermission) {
                    return message.reply(permissionError);
                }

                // pull the args from the raw command
                const args = content.split(/[ ]+/);

                // drop the command itself
                args.shift();

                // ensure command has correct number of args
                if (args.length < minArgs || (maxArgs && args.length > maxArgs)) {
                    return message.reply(`Incorrect syntax: Use ${prefix + alias} ${expectedArgs}`);
                }

                // execute the command
                callback(message, args, args.join(' '));
            }
        }
    });
};