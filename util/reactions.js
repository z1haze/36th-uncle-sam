const {giveRole, takeRole} = require('./roles');
const {getEventData} = require('./events');

/**
 * Utility method to fetch generic data that is used in multiple methods
 *
 * @param client
 * @param event
 * @returns {Promise<{guild: Holds, channel: *, message: *}>}
 */
// const getStandardData = async (client, event) => {
//     // get the guild from which the event originated
//     const guild = client.guilds.cache.get(event.d.guild_id);
//
//     // get the channel from build the message originated
//     const channel = guild.channels.cache.get(event.d.channel_id);
//
//     let messageId;
//
//     switch (event.t) {
//         case 'MESSAGE_CREATE':
//         case 'MESSAGE_UPDATE':
//             messageId = event.d.id;
//             break;
//         default:
//             messageId = event.d.message_id;
//     }
//
//     // pull the message that was reacted to
//     const message = await channel.messages.fetch(messageId);
//
//     return {
//         guild,
//         channel,
//         message
//     };
// };

/**
 * Parses a single message line for an emoji/role pair
 *
 * @param line {RegExpMatchArray}
 * @param message {Message}
 * @returns {[String, Role]}
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
 * Parse a message and extract emoji/role sets
 *
 * @param message {Message}
 * @param oldMessage
 * @returns {{toRemove: Set<String>, translations: Map<String, Role>, lines: IterableIterator<RegExpMatchArray>}}
 */
const translateMessage = (message, oldMessage) => {
    const lines = [...message.content.matchAll(/>* *([^ \n]+) [^\n]*-[^\n]*<@&([0-9]+)>/g)];
    const translations = new Map();
    const toRemove = new Set();

    /**
     * Find emoji/role pairs for each line in the message
     */
    for (const line of lines) {
        const [currentEmoji, role] = translateLine(line, message);

        translations.set(currentEmoji, role);
    }

    /**
     * Check the previous message (if edited) and keep track of any emoji/roles that were removed
     */
    if (oldMessage) {
        const lines = oldMessage.content.matchAll(/>* *([^ \n]+) [^\n]*-[^\n]*<@&([0-9]+)>/g);

        for (const line of lines) {
            const [currentEmoji] = translateLine(line, message);

            if (!translations.has(currentEmoji)) {
                toRemove.add(currentEmoji);
            }
        }
    }

    return {
        lines,
        translations,
        toRemove
    };
};

const handleWelcomeReaction = async (guild, channel, member, remove) => {
    const welcomeChannels = process.env.WELCOME_CHANNELS.split(',');
    const step = welcomeChannels.indexOf(channel.id);

    const nextRole = guild.roles.cache.find((role) => role.name === `New-${step + 1}`);
    const prevRole = guild.roles.cache.find((role) => role.name === `New-${step}`);

    if (step === 0 && remove) {
        const rolesToRemove = guild.roles.cache.filter((role) => role.name.startsWith('New-'));
        rolesToRemove.each((role) => member.roles.remove(role));

        return;
    }

    if (remove) {
        if (nextRole) {
            member.roles.remove(nextRole);
        }

        member.roles.add(prevRole);
    } else {
        if (prevRole) {
            member.roles.remove(prevRole);
        }

        if (nextRole) {
            member.roles.add(nextRole);
        } else {
            const guestRole = guild.roles.cache.get(process.env.GUEST_ROLE);
            member.roles.add(guestRole);
        }
    }
};

/**
 * Handle user reaction event for role bot actions
 *
 * @param guild
 * @param member
 * @param message
 * @param emoji
 * @param remove
 */
const handleUserReaction = (guild, member, message, emoji, remove = false) => {
    const {translations} = translateMessage(message);

    if (translations.has(emoji.name)) {
        const role = translations.get(emoji.name);

        if (remove) {
            takeRole(guild, member, role.name);
        } else {
            giveRole(guild, member, role.name);
        }
    }
};

/**
 * Processes a message to setup with correct emojis
 *
 * @param message {Message} the message object
 * @param oldMessage {Message} optional message object passed during edit message
 */
const processMessage = (message, oldMessage = null) => {
    const {lines, toRemove} = translateMessage(message, oldMessage);

    // add reactions based on the message content
    for (const line of lines) {
        const [, emoji] = line;

        message.react(emoji)
            .catch((e) => console.error(e.message)); // eslint-disable-line no-console
    }

    // remove any reactions that should not be
    if (toRemove.size > 0) {
        for (const [, reaction] of message.reactions.cache) {
            if (toRemove.has(reaction.emoji.name)) {
                reaction.remove()
                    .catch((e) => console.error(e.message)); // eslint-disable-line no-console
            }
        }
    }
};

/**
 * Initialize the bot for role assignment functionality
 *
 * @param client
 * @param commands
 */
const initRoleReactions = function (client, commands) {
    const ROLE_BOT_CHANNELS = process.env.ROLE_BOT_CHANNELS.split(',');
    const WELCOME_CHANNELS = process.env.WELCOME_CHANNELS.split(',');

    /**
     * Setup bot for ROLE Selection channels
     */
    for (const id of ROLE_BOT_CHANNELS) {
        const channel = client.channels.cache.get(id);

        if (!channel) {
            throw new Error(`Channel not found matching id: ${id}`);
        }

        channel.messages.fetch()
            .then((messages) => {
                for (const [, message] of messages) {
                    processMessage(message);
                    // message.reactions.removeAll();
                }
            });
    }

    for (const id of WELCOME_CHANNELS) {
        const channel = client.channels.cache.get(id);

        if (!channel) {
            throw new Error(`Channel not found matching id: ${id}`);
        }

        channel.messages.fetch()
            .then((messages) => {

                for (const [, message] of messages) {
                    const emoji = message.guild.emojis.cache.find((emoji) => emoji.name === '36th');

                    if (emoji && message.content.indexOf(emoji.id) > -1) {
                        message.react(emoji);
                    }
                }
            });
    }

    /**
     * Handle new messages
     */
    client.on('message', (message) => {
        if (!message.guild) {
            return;
        }

        const firstArg = message.content.substr(1, message.content.indexOf(' ') - 1);

        // if the message is a command, we do not handle it here
        if (commands.has(firstArg)) {
            return;
        }

        if (process.env.ROLE_BOT_CHANNELS.indexOf(message.channel.id) > -1) {
            processMessage(message);
        }
    });

    /**
     * Handle message updates
     */
    client.on('messageUpdate', (oldMessage, newMessage) => {
        if (!newMessage.guild) {
            return;
        }

        if (process.env.ROLE_BOT_CHANNELS.indexOf(newMessage.channel.id) > -1) {
            processMessage(newMessage, oldMessage);
        }
    });

    /**
     * messageReactionAdd and messageReactionRemove only fire on cached messages,
     * so we use the raw event
     */
    client.on('raw', async (event) => {
        if (event.t === 'MESSAGE_REACTION_ADD' || event.t === 'MESSAGE_REACTION_REMOVE') {
            // without a guild id we do nothing
            if (!event.d.guild_id) {
                return;
            }

            if (process.env.WELCOME_CHANNELS.indexOf(event.d.channel_id) > -1) {
                const {guild, channel, member} = await getEventData(client,event);

                handleWelcomeReaction(guild, channel, member, event.t === 'MESSAGE_REACTION_REMOVE');

                return;
            }

            // ensure the event is firing from the appropriate channel
            if (process.env.ROLE_BOT_CHANNELS.indexOf(event.d.channel_id) > -1) {
                // fetch relevant information from the event
                const {guild, member, message, emoji} = await getEventData(client, event);

                if (!member.user.bot) {
                    handleUserReaction(guild, member, message, emoji, event.t === 'MESSAGE_REACTION_REMOVE');
                }
            }
        }
    });
};

module.exports = {
    handleUserReaction,
    initRoleReactions
};