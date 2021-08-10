![Logo](../img/logo.png "Logo")

**[↤ Overview](../README.md)**

```bash
/event [create]
```

This command facilitate create a scheduled event such as a game night or other. The event will be registered in a database,
and user attendance will be tracked via message reactions. After executing the `/event create` command, you will receive a
series of DMs that will help to build the data necessary for the event to be generated.

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