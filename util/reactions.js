const {giveRole, takeRole} = require('./roles');

/**
 * Utility method to fetch generic data that is used in multiple methods
 *
 * @param client
 * @param event
 * @returns {Promise<{guild: Holds, channel: *, message: *}>}
 */
const getStandardData = async (client, event) => {
    // get the guild from which the event originated
    const guild = client.guilds.cache.get(event.d.guild_id);

    // get the channel from build the message originated
    const channel = guild.channels.cache.get(event.d.channel_id);

    let messageId;

    switch (event.t) {
        case 'MESSAGE_CREATE':
        case 'MESSAGE_UPDATE':
            messageId = event.d.id;
            break;
        default:
            messageId = event.d.message_id;
    }

    // pull the message that was reacted to
    const message = await channel.messages.fetch(messageId);

    return {
        guild,
        channel,
        message
    };
};

/**
 * Parses a single message line for an emoji/role pair
 *
 * @param line
 * @param message
 * @returns {[*, *]}
 */
const translateLine = (line, message) => {
    let currentEmoji = line[1];
    const roleId = line[2];

    // parse ascii emojis to get their name
    if (currentEmoji.startsWith('<:')) {
        currentEmoji = currentEmoji.match(/<:(.+?):/)[1];
    }

    const role = message.guild.roles.cache.get(roleId);

    if (!role) {
        throw new Error(`Role not found matching id: ${roleId}`);
    }

    return [currentEmoji, role];
};

/**
 * Parses a message
 *
 * @param message into translated lines of emoji/role, as well
 * as a map containing an emoji/role pairs that need to be removed
 * after an edit was made
 *
 * @returns {{}}
 */
const translateMessage = (message) => {
    const lines = [...message.content.matchAll(/>* *([^ \n]+) [^\n]*-[^\n]*<@&([0-9]+)>/g)];
    const translations = new Map();
    const remove = new Map();

    // add emoji/role translations for the current message
    for (const line of lines) {
        const [currentEmoji, role] = translateLine(line, message);
        translations.set(currentEmoji, role);
    }

    // track previously edited message for dropped emoji/role pairs so we can un-assign them from users
    if (message.edits.length > 1) {
        const lines = [...message.edits[1].content.matchAll(/>* *([^ \n]+) [^\n]*-[^\n]*<@&([0-9]+)>/g)];

        for (const line of lines) {
            const [currentEmoji, role] = translateLine(line, message);

            if (!translations.has(currentEmoji)) {
                remove.set(currentEmoji, role);
            }
        }
    }

    return {
        lines,
        translations,
        remove
    };
};

/**
 * Handle user reaction event for role bot actions
 *
 * @param client
 * @param event
 * @returns {Promise<void>}
 */
const handleUserReaction = async (client, event) => {
    const {guild, message} = await getStandardData(client, event);
    const emoji = event.d.emoji.name;
    const {translations} = translateMessage(message);

    if (translations.has(emoji)) {
        const role = translations.get(emoji);

        if (event.t === 'MESSAGE_REACTION_ADD') {
            await giveRole(guild, {id: event.d.user_id}, role.name);
        } else if (event.t === 'MESSAGE_REACTION_REMOVE') {
            await takeRole(guild, {id: event.d.user_id}, role.name);
        }
    }
};

/**
 * Processes a message to setup with correct emojis
 *
 * @param message
 * @returns {Promise<void>}
 */
const processMessage = (client, message) => {
    const {lines, remove} = translateMessage(message);

    // add reactions based on the message content
    for (const line of lines) {
        const [, emoji] = line;

        message.react(emoji);
    }

    // remove any reactions that should not be
    if (remove && remove.size) {
        for (const [, reaction] of message.reactions.cache) {
            loop:
            for (const [emoji, role] of remove) {
                if (reaction.emoji.name === emoji) {
                    for (const [id] of reaction.users.cache) {
                        takeRole(message.guild, {id}, role.name);
                        reaction.remove();
                    }

                    break loop;
                }
            }
        }
    }

    // TODO: test code remove
    // await message.reactions.removeAll();
};

/**
 * Initialize the bot for role assignment functionality
 *
 * @param client
 * @returns {Promise<void>}
 */
const initRoleReactions = async function (client) {
    const ROLE_BOT_CHANNELS = process.env.ROLE_BOT_CHANNELS.split(',');

    // loop through each role channel and init reactions on each message
    for (const id of ROLE_BOT_CHANNELS) {
        const channel = client.channels.cache.get(id);

        if (!channel) {
            throw new Error(`Channel not found matching id: ${id}`);
        }

        for (const [, message] of await channel.messages.fetch()) {
            processMessage(client, message);
        }
    }

    client.on('raw', async (event) => {
        if (event.t === 'MESSAGE_REACTION_ADD' || event.t === 'MESSAGE_REACTION_REMOVE' ) {
            if (process.env.ROLE_BOT_CHANNELS.indexOf(event.d.channel_id) > -1) {
                handleUserReaction(client, event);
            }

            return;
        }

        if (event.t === 'MESSAGE_CREATE' || event.t === 'MESSAGE_UPDATE') {
            const {message} = await getStandardData(client, event);

            processMessage(client, message);
        }
    });
};

module.exports = {
    handleUserReaction,
    initRoleReactions
};