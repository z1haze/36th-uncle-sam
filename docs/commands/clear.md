![Logo](../img/logo.png "Logo")

**[↤ Overview](../README.md)**

```bash
~clear [all]
```

Request to the bot to clear messages in the current channel. By default with no arguments, the bot will only delete messages
within the last 2 weeks. If you want the bot to delete all messages for a channel, even older than too weeks, 
pass the `all` flag. Be aware the all messages deletion takes significantly longer and will delete messages in batches.

The bot will send a message to the channel with a message count of deleted messages. The message will self-delete
after 5 seconds.

Example Usage:
---

```bash
~clear
~clear all
```