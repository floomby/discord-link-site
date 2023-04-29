/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import mongoose from "mongoose";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider, { GithubEmail } from "next-auth/providers/github";
import { env } from "~/env.mjs";
import db from "~/utils/db";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      // id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }

  // interface JWT {
  //   provider?: string;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user, token }) => {
      // console.log("session callback", session, user, token);
      return {
        ...session,
        user: {
          ...session.user,
        },
      };
    },
  },

  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        if (profile.avatar === null) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          name: profile.username,
          email: `${profile.email}-discord`,
          image: profile.image_url,
        };
      },
    }),
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: `${profile.email}-google`,
          image: profile.picture,
        };
      },
    }),
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      userinfo: {
        url: "https://api.github.com/user",
        async request({ client, tokens }) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const profile = await client.userinfo(tokens.access_token!);

          if (!profile.email) {
            // If the user does not have a public email, get another via the GitHub API
            // See https://docs.github.com/en/rest/users/emails#list-public-email-addresses-for-the-authenticated-user
            const res = await fetch("https://api.github.com/user/emails", {
              headers: { Authorization: `token ${tokens.access_token}` },
            });

            if (res.ok) {
              const emails: GithubEmail[] = await res.json();
              profile.email = (
                emails.find((e) => e.primary) ?? emails[0]!
              ).email;
            }
          }

          profile.email = `${profile.email}-github`;

          return profile;
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  adapter: MongoDBAdapter(
    (async () => {
      await db();
      return mongoose.connection.getClient();
    })()
  ),
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
