// import NextAuth from "next-auth";
// import { authOptions } from "~/server/auth";

// export default NextAuth(authOptions);

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env.mjs";
import { authOptions } from "~/server/auth";
import { SiweMessage } from "siwe";
import { type NextApiRequest, type NextApiResponse } from "next";
import db from "~/utils/db";

import { Linkable, ProviderLink } from "~/utils/odm";
import { updateDiscordUser } from "~/utils/webhook";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}") as
              | string
              | Partial<SiweMessage>
          );

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: "www.social-link.xyz",
            nonce:
              (credentials as unknown as { csrfToken: string })?.csrfToken ||
              "",
          });

          if (result.success) {
            await db();
            // upsert the ethereum session with the address and csrfToken
            const csrfToken =
              (credentials as unknown as { csrfToken: string })?.csrfToken ||
              "";
            const address = siwe.address;

            const link = await Linkable.findOne({ csrfToken });

            if (!link) {
              return null;
            }

            const old = await ProviderLink.findOneAndUpdate(
              {
                $and: [
                  {
                    $or: [
                      { discordId: link.discordId },
                      { providerId: address },
                    ],
                  },
                  { provider: "ethereum" },
                ],
              },
              {
                discordId: link.discordId,
                providerId: address,
                userId: null,
                provider: "ethereum",
                linkedAt: new Date(),
              },
              { upsert: true }
            );

            if (old?.providerId !== address) {
              const oldDiscordId = old?.discordId;
              if (oldDiscordId && oldDiscordId !== link.discordId) {
                updateDiscordUser(oldDiscordId);
              }
              updateDiscordUser(link.discordId);
            }

            return {
              id: address,
            };
          }
          return null;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
  ];

  const isDefaultSignInPage =
    req.method === "GET" && req.query.nextauth?.includes("signin");

  // Hide log in with ethereum from the default sign in page (I need to fix this part anyways)
  if (isDefaultSignInPage) {
    providers.pop();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, {
    ...authOptions,
    providers: [...authOptions.providers, ...providers],
  });
}
