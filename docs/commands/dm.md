![Logo](../img/logo.png "Logo")

**[↤ Overview](../README.md)**

```bash
~dm @ROLE/@USER [MORE @ROLES/@USERS...] -- MESSAGE
```

Sends a direct message to all members of the specified mentions via direct mention or role mention.
The list is unique and will not include duplicates a user is found multiple times based on mentions.
Mentions [Roles/Users] are separated by a single space, and must be actual mnetions, not just strings.
The double dash (`--`) between the mentions list and message is mandataory 

Example Usage:
---

Send a DM to all members of the `@Baker Company` role

```bash
~dm @Baker Company -- Please remember to submit your Debriefs before COB today
```