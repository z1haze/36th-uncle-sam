const getEventData = async (client, event) => {
    const result = {};

    switch (event.t) {
        case 'MESSAGE_REACTION_ADD':
        case 'MESSAGE_REACTION_REMOVE':
            result.guild = client.guilds.cache.get(event.d.guild_id);
            result.channel = result.guild.channels.cache.get(event.d.channel_id);
            result.member = result.guild.members.cache.get(event.d.user_id);
            result.message = await result.channel.messages.fetch(event.d.message_id);
            result.emoji = event.d.emoji;
            break;
        default:
            result.guild = client.guilds.cache.get(event.guild_id);
            result.channel = result.guild.channels.get(event.d.channel_id);
    }

    return result;
};

module.exports = {
    getEventData
};