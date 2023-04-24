import mongoose from "mongoose";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Linkable, DiscordLink } from "~/utils/odm";

type ContextUser = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
};

// REFACTOR ME: This should be implemented in the trpc middleware
const recoverAccount = async (user: ContextUser) => {
  try {
    await db();
    const dbUser = await mongoose.connection.db.collection("users").findOne({
      name: user.name,
      email: user.email,
      image: user.image,
    });
    if (!dbUser) {
      throw new Error("User not found");
    }
    const account = await mongoose.connection.db
      .collection("accounts")
      .findOne({
        userId: dbUser._id,
      });
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to recover account");
  }
};

export const linkRouter = createTRPCRouter({
  linkData: publicProcedure
    .input(z.string().length(64).optional())
    .query(async ({ input }) => {
      if (!input) {
        return { linkable: false };
      }
      try {
        await db();
        const linkable = await Linkable.findOne({
          csrfToken: input,
        });
        if (!linkable) {
          return { linkable: false };
        }
        // get the current providers linked
        const providers = [];

        const discordLink = await DiscordLink.findOne({
          address: linkable.address,
        });
        if (discordLink) {
          const user = await mongoose.connection.db.collection("users").findOne({
            _id: discordLink.userId,
          });
          if (!user) {
            throw new Error("User not found");
          }
          providers.push({
            id: "discord",
            name: user.name ?? "",
            image: user.image ?? "",
          });
        }
        return { linkable: true, address: linkable.address, linked: providers };
      } catch (error) {
        console.error(error);
        throw new Error("Unable to query linkablity status");
      }
    }),

  linkDiscord: protectedProcedure
    .input(z.object({ csrfToken: z.string().length(64) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db();

        const account = await recoverAccount(ctx.session.user);

        // TODO Make this a transaction
        // const session = await mongoose.startSession();
        // session.startTransaction();

        const linkable = await Linkable.findOne({
          csrfToken: input.csrfToken,
        });

        if (!linkable) {
          throw new Error("Invalid CSRF token");
        }

        await DiscordLink.findOneAndUpdate(
          {
            $or: [
              { address: linkable.address },
              { discordId: account.providerAccountId },
            ],
          },
          {
            address: linkable.address,
            discordId: account.providerAccountId,
            userId: account.userId,
          },
          { upsert: true }
        );
        return;
      } catch (error) {
        // console.error(error);
        throw new Error("Failed to link");
      }
    }),
});
