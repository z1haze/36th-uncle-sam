![Logo](../img/logo.png "Logo")

**[↤ Overview](../README.md)**

```bash
/clear [timeframe] [limit] [@user]
```

This command will clear messages in the channel from which the command runs. All arguments to this
command are optional. By default, without any arguments, 100 messages for the current channel will be cleared.
This bot does have the API limitation enforced by Discord that will not allow deleted of messages more than so many
days old. I think its 2 weeks.

Example Usage:
---

Clear the last 100 messages in the current channel

```bash
/clear
```

Clear the last 2 hours and 30 minutes of messages in the current channel

```bash
/clear timeframe: 2h30m
```

Clear the last clear the last 5 messages sent by @someone in the current channel

```bash
/clear limit: 5 user: @someone
```

Clear the last 250 messages in the current channel

```bash
/clear limit: 250
```