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
  linkable: publicProcedure
    .input(z.string().length(64).optional())
    .query(async ({ input }) => {
      if (!input) {
        return false;
      }
      try {
        await db();
        const linkable = await Linkable.findOne({
          csrfToken: input,
        });
        return !!linkable;
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
