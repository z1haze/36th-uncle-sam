![Logo](docs/img/logo.png "Logo")

Uncle Sam Bot
---

> A discord utility bot performing in-app related discord tasks

What It Does
---

- [x] DM Users/Roles

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

#### Commands

* [`~dm`](docs/commands/dm.md) - Send DM's to users and/or roles
* [`~echo`](docs/commands/echo.md) - Send messages via the bot
* [`~image`](docs/commands/echo.md) - Send image attachments via the bot
* [`~dump`](docs/commands/dump.md) - DM the sender with the content of a message
* `~ping` - Check if bot is online

#### Configuration

#### `.env`

```
BOT_TOKEN=
DM_BOT_CHANNELS=
ROLE_BOT_CHANNELS=
```
