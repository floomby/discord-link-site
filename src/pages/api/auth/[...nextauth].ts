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

import { Linkable } from "~/utils/odm";

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
          const nextAuthUrl = new URL(env.NEXTAUTH_URL);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce:
              (credentials as unknown as { csrfToken: string })?.csrfToken ||
              "",
          });

          if (result.success) {
            await db();
            // upsert the link user with the csrf token
            await Linkable.findOneAndUpdate(
              { address: siwe.address },
              {
                csrfToken:
                  (credentials as unknown as { csrfToken: string })
                    ?.csrfToken || "",
                createdAt: new Date(),
              },
              { upsert: true }
            );

            return {
              id: siwe.address,
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

  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth?.includes("signin");

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, {
    ...authOptions,
    providers: [...authOptions.providers, ...providers],
  });
}
