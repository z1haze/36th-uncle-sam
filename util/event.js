const getDb = require('./db');

/**
 * Watch an event for changes (reactions)
 *
 * @param message
 */
function watchEvent (message) {
    const rc = message.createReactionCollector({
        filter : (reaction, user) => user.id !== reaction.message.author.id,
        dispose: true
    });

    rc.on('collect', (reaction, user) => {
        reaction.users.remove(user.id)
            .then(() => {
                processEventReaction(message, user, reaction.emoji.name);
                message.edit({embeds: [message.embeds[0]]});
            });
    });
}

/**
 * Setup watchers on all events (on bot start)
 *
 * @param guild {Guild}
 */
function watchEvents (guild) {
    getDb().then((db) => {
        db.each('SELECT * FROM events', (err, row) => {
            if (err) {
                throw err;
            }

            // only register watchers on active events
            if (new Date().getTime() >= Number(row.event_ending)) {
                return;
            }

            guild.channels.fetch(row.channel_id)
                .then((channel) => {
                    channel.messages.fetch(row.message_id)
                        .then((message) => {
                            watchEvent(message);
                        });
                });

        }, () => {
            // eslint-disable-next-line no-console
            console.log('Event watchers setup complete.');
        });
    });
}

/**
 *
 * @param message {Message}
 * @param user {User}
 * @param emoji {String}
 */
function processEventReaction (message, user, emoji) {
    const embed = message.embeds[0];
    const fields = embed.fields;

    // iterate over the fields
    // check if the user already exists in the field
    // and if the fieldIndex matches the current field index, remove the user and be done

    for (let i = 1; i < fields.length; i++) {
        const field = fields[i];

        // get the people mentioned in this field
        const mentions = field.value === '-'
            ? []
            : field.value.split('\n');

        // see if the user is in this field
        const mentionIndex = mentions.findIndex((mention) => {
            return mention.includes(`${user}`);
        });

        // if this is the column the user reacted to,
        // and their name is in the list for this column
        // we need to treat this as removing them from the event
        if (mentionIndex > -1) {
            mentions.splice(mentionIndex, 1);
        } else if (field.name.includes(emoji)) {
            mentions.push(user);
        }

        if (mentions.length > 0) {
            field.value = mentions.join('\n');
        } else {
            field.value = '-';
        }
    }

    embed.setFields(fields);
}

module.exports = {
    watchEvent,
    watchEvents
};