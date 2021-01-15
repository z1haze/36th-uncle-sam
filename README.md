![Logo](docs/img/logo.png "Logo")

Uncle Sam Bot
---

> A discord utility bot performing in-app related discord tasks

What It Does
---

- [x] DM Users/Roles
- [x] Send messages to channel as Bot
- [x] Edit messages sent via the Bot
- [x] Dump full contents of a message to you in a DM
- [x] Image attachment via URL
- [x] Clear last 14 days of messages from the current channel
- [x] Render player stats for bfv

Usage Overview
---

#### Commands

* [`~dm`](docs/commands/dm.md) - Send DM's to users and/or roles
* [`~dump`](docs/commands/dump.md) - DM the sender with the content of a message
* [`~echo`](docs/commands/echo.md) - Send messages via the bot
* [`~edit`](docs/commands/edit.md) - Edit a bot message with new content
* [`~image`](docs/commands/echo.md) - Send image attachments via the bot
* [`~bfvstats`](docs/commands/bfvstats.md) - Get BFV stats for a player
* `~clear` - Clear last 14 days of messages from the current channel
* `~ping` - Check if bot is online

#### Configuration

#### `.env`

```
BOT_TOKEN=<bot_token>
DM_BOT_CHANNELS=<channel_id>,<channel_id>
BFV_STATS_CHANNELS=<channel_id>,<channel_id>
```
