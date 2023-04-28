// Utilities to call the bot webhooks

import { env } from "~/env.mjs";

const updateDiscordUser = (id: string) => {
  fetch(`${env.BOT_WEBHOOK_URI}/discord`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
    }),
  })
    .then((res) => {
      if (res?.status !== 200) {
        console.error(res);
      }
    })
    .catch(console.error);
};

export { updateDiscordUser };
