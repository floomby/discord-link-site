<p align="center">
   <br/>
   <a href="https://social-link.xyz" target="_blank"><img width="150px" src="https://social-link.xyz/social-link-1024.png" /></a>
   <h3 align="center">Social Link</h3>
</p>

## Overview

Verify your social media and ethereum accounts for the Social Link discord bot.

### Get the bot

[Invite the bot](https://discord.com/api/oauth2/authorize?client_id=1099405375624728597&permissions=2415921152&scope=bot)

[Link your accounts here](https://social-link.xyz)

### Commands

- `/setrole` - sets the verification role to assign (make sure that the bot has a higher role than the verification role)
- `/displayrole` - displays the verification role for the server
- `/sync` - re-syncs every user on the server. This is only here if something goes wrong and hopefully shouldn't be needed
- `/setproviders` - sets the verification providers for the server in the form of `<provider>,<provider>,...`
- `/listproviders` - lists the verification providers for the server
- `/supportedproviders` - lists the supported verification providers

### Notes

- Currently the bot checks if the user has revoked their twitter application access (every 20 minutes, subject to change in the future) and if so, it will remove their verified role if the server requires twitter verification.
- Revoking google verification is not currently implemented.
- The source for the bot is [located here](https://github.com/floomby/discord-link-bot).
