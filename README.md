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
- [x] Clear chat messages
- [x] Render player stats for bfv
- [x] Promote members to their next rank

Usage Overview
---

#### Commands

* `/ping` - Check if bot is online
* [`/clear`](docs/commands/clear.md) - Clear messages from the current channel
* [`/reaction`](docs/commands/reaction.md) - Add or remove bot reactions to a message
* [`/dm`](docs/commands/dm.md) - Send DM's to users and/or roles
* [`/dump`](docs/commands/dump.md) - DM the sender with the content of a message
* [`/echo`](docs/commands/echo.md) - Send messages via the bot
* [`/edit`](docs/commands/edit.md) - Edit a bot message with new content
* [`~image`](docs/commands/echo.md) - Send image attachments via the bot
* [`~bfvstats`](docs/commands/bfvstats.md) - Get BFV stats for a player
* [`~promote`](docs/commands/promote.md) - Handles promoting a member to the next rank

#### Configuration

#### `.env`

```
NODE_ENV=
SENTRY_DSN=
BOT_TOKEN=
DM_BOT_CHANNELS=
BFV_STATS_CHANNELS=
```
