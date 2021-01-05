const {giveRole, takeRole} = require('./roles');

/**
 * Handle user reaction event for role bot actions
 *
 * @param client
 * @param event
 * @returns {Promise<void>}
 */
const handleUserReaction = async (client, event) => {
    // get the guild from which the event originated
    const guild = client.guilds.cache.get(event.d.guild_id);

    // get the channel from build the message originated
    const channel = guild.channels.cache.get(event.d.channel_id);

    // pull the message that was reacted to
    const message = await channel.messages.fetch(event.d.message_id);

    // parse the message and find emoji matches
    const content = message.content;
    const pattern = />\s*([^ \n]+) [^\n]*-[^\n]*<@&([0-9]+)>/g;
    const matches = content.matchAll(pattern);

    // grab the emoji that was clicked
    const expectedEmoji = event.d.emoji.id;

    // iterate over emoji matches and find the correct one
    for (const match of matches) {
        if (match.length === 3) {
            const actualEmoji = match[1].match(/<:.*:(.*)>/)[1];

            if (actualEmoji !== expectedEmoji) {
                continue;
            }

            const role = message.guild.roles.cache.get(match[2]);

            if (role) {
                if (event.t === 'MESSAGE_REACTION_ADD') {
                    giveRole(guild, {id: event.d.user_id}, role.name);
                } else if (event.t === 'MESSAGE_REACTION_REMOVE') {
                    takeRole(guild, {id: event.d.user_id}, role.name);
                }
            }
        }
    }
};

const initRoleReactions = async function (client) {
    client.on('raw', (event) => {
        if (event.t === 'MESSAGE_REACTION_ADD' || event.t === 'MESSAGE_REACTION_REMOVE' ) {
            if (process.env.ROLE_BOT_CHANNELS.indexOf(event.d.channel_id) > -1) {
                return handleUserReaction(client, event);
            }
        }
    });

    const ROLE_BOT_CHANNELS = process.env.ROLE_BOT_CHANNELS.split(',');

    // loop through each role selection channel
    for (const id of ROLE_BOT_CHANNELS) {
        const channel = client.channels.cache.get(id);

        if (!channel) {
            throw new Error(`Channel not found matching id: ${id}`);
        }

        const messages = await channel.messages.fetch();

        for (const [, message] of messages) {
            const emojis = message.content.match(/<:\w+:(\d+)>/g);
            const reactions = message.reactions.cache;

            // TODO: test code remove
            // for (const [, reaction] of reactions) {
            //     await reaction.remove();
            // }

            for (let emoji of emojis) {
                const id = emoji.match(/<:\w+:(\d+)>/)[1];

                emoji = message.guild.emojis.cache.get(id);

                if (!reactions.get(id)) {
                    message.react(emoji);
                }
            }
        }
    }
};

module.exports = {
    handleUserReaction,
    initRoleReactions
};