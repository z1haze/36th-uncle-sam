![Logo](../img/logo.png "Logo")

**[↤ Overview](../README.md)**

```bash
/react [messageid] [reaction] [remove]
```

This command will react to a message with a provided reaction/emoji. Both the messageid
and reaction arguments are mandatory fields. The remove argument is optional and will determine
whether or not the supplied reaction should be removed from the message, or added. Default value is false.
This command needs to be run from the channel from which the message resides in.

Example Usage:
---

React to a message with messageid 841872626037030926 with the thumbs up emoji

```bash
/react messageid: 841872626037030926 reaction: :thumbsup:
```

Remove thumbs up reaction from message with id 841872626037030926

```bash
/react messageid: 841872626037030926 reaction: :thumbsup: remove: True
```