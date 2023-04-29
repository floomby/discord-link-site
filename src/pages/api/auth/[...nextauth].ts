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
import mongoose from "mongoose";

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

            // start a transaction
            const session = await mongoose.startSession();
            session.startTransaction();
            const abort = async () => {
              await session.abortTransaction();
              await session.endSession();
            };
            try {
              const link = await Linkable.findOne({ csrfToken });

              if (!link) {
                return null;
              }

              const old = await ProviderLink.findOneAndUpdate(
                { provider: "ethereum", discordId: link.discordId },
                {
                  discordId: link.discordId,
                  providerId: address,
                  userId: null,
                  provider: "ethereum",
                  linkedAt: new Date(),
                },
                { upsert: true, session }
              );

              if (old?.providerId === address) {
                await session.commitTransaction();
                await session.endSession();
                return {
                  id: address,
                };
              }

              const other = await ProviderLink.findOne(
                {
                  provider: "ethereum",
                  // case insensitive
                  providerId: { $regex: new RegExp(`^${address}$`, "i") },
                  discordId: { $ne: link.discordId },
                },
                null,
                { session }
              );

              if (other) {
                await ProviderLink.deleteOne({ _id: other._id }, { session });
              }

              await session.commitTransaction();
              await session.endSession();

              if (other) {
                updateDiscordUser(other.discordId);
              }
              updateDiscordUser(link.discordId);
              return {
                id: address,
              };
            } catch (e) {
              console.error(e);
              await abort();
              return null;
            }
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
