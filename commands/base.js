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

/**
 * Convert a string of various formats to an array
 *
 * @param str
 * @returns {*[]|*}
 */
const strToArr = (str) => {
    let delimiter;

    if (str.indexOf(', ') > -1) {
        delimiter = ', ';
    } else if (str.indexOf(',') > -1) {
        delimiter = ',';
    } else if (str.indexOf(' ') > -1) {
        delimiter = ' ';
    }

    if (delimiter) {
        return str.split(delimiter);
    } else {
        return [str];
    }
};

module.exports = (client, opts) => {
    const {
        expectedArgs = '',
        permissionError = 'You do not have permission to run this command.',
        minArgs = 0,
        maxArgs = null,
        requiredRoles = [],
        callback
    } = opts;

    let {commands, requiredPermissions = []} = opts;

    // convert commands to array
    if (typeof commands === 'string') {
        commands = strToArr(commands);
    }

    // eslint-disable-next-line no-console
    console.log(`Registering command: "${commands[0]}"`);

    // validate permissions
    if (requiredPermissions.length) {
        if (typeof requiredPermissions === 'string') {
            requiredPermissions = strToArr(requiredPermissions);
        }

        validatePermissions(requiredPermissions);
    }

    // command listener
    client.on('message', (message) => {
        const {member, content, guild} = message;

        for (const alias of commands) {
            if (content.toLowerCase().startsWith(`${prefix + alias.toLowerCase()}`)) {
                // command runs

                // checks user has permission
                for (const permission of requiredPermissions) {
                    if (!member.hasPermission(permission)) {
                        return message.reply(permissionError);
                    }
                }

                // checks user has required role
                for (const requiredRole of requiredRoles) {
                    const role = guild.roles.cache.find((role) => {
                        return role.name === requiredRole || role.id === requiredRole;
                    });

                    if (!role || !member.roles.cache.has(role.id)) {
                        return message.reply(`You require the '${requiredRole}' role to run this command`);
                    }
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