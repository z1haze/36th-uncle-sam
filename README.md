![Logo](docs/img/logo.png "Logo")

Uncle Sam Bot
---

> A discord utility bot performing in-app related discord tasks

What It Does
---

- [x] Adds custom channel flow for new users, enforcing new users reaction to welcome messages and read through a series of pages
- [x] Role Assignment Messages (emoji/role selection)
- [x] DM Users/Roles
- [x] Send messages Bot
- [x] Edit Bot Messages
- [x] Request Bot DM message content to you
- [x] Image attachment via URL
- [x] Clear messages from a channel
- [x] Render player stats for bfv

Usage Overview
---

#### Role Assignment Messages (RAM)
This bot will also handle role assignments for channels listed in the `ROLE_BOT_CHANNELS`.
The example below shows how to properly format a message so that the bot will understand.
Keep note that the (`>`) and single dash (`-`) are mandatory characters

##### Example

```
** List of the Side-Game Channels **
> These are the games that aren't official 36th games, but still have 36th members playing them.

To access a channel, __react to this post__ with the corresponding emoji
> :eso: #eso - @Elder Scrolls Online
> :squad: #squad - @Squad
> :postscriptum: #post-scriptum - @Post Scriptum
```

#### User Welcome Flows
This bot handles forced channel flows for new users, such as making them read through a series of gated channels
before gaining access to the main body of the server. Welcome channels will be configured in the env file under `WELCOME_CHANNELS`.
Roles need to be created for each welcome channel in the following format: `New-#`, for example, `New-1`, `New-2`, etc. One for each welcome channel.
A `guest` role should be configured in the env file under `GUEST_ROLE`. This is the role that will be assigned to a user after completing all welcome channels.

#### Commands

* [`~clear`](docs/commands/clear.md) - Clear messages from the current channel
* [`~dm`](docs/commands/dm.md) - Send DM's to users and/or roles
* [`~dump`](docs/commands/dump.md) - DM the sender with the content of a message
* [`~echo`](docs/commands/echo.md) - Send messages via the bot
* [`~edit`](docs/commands/edit.md) - Edit a bot message with new content
* [`~image`](docs/commands/echo.md) - Send image attachments via the bot
* [`~bfvstats`](docs/commands/bfvstats.md) - Get BFV stats for a player
* `~ping` - Check if bot is online

#### Configuration

#### `.env`

```
BOT_TOKEN=
DM_BOT_CHANNELS=
ROLE_BOT_CHANNELS=
WELCOME_CHANNELS=
GUEST_ROLE=
```
