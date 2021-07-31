![Logo](../img/logo.png "Logo")

**[↤ Overview](../README.md)**

```bash
/dm [message] [@mention1] [@recipient2] [@recipient3] [@recipient4] [@recipient5]
```

Sends a direct message to all members of the specified mentions via direct mention or role mention.
The list is unique and will not include duplicate users, regardless of which roles are mentioned.
Only the first mention is required, you may tag up to 5 unique mentions.

Example Usage:
---

Send a DM to all members of the `@Special Peeps` role

```bash
/dm message: This is a message to special peeps mention1: @Special Peeps
```