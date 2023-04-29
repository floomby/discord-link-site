/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import mongoose, { HydratedDocument } from "mongoose";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Linkable, ProviderLink } from "~/utils/odm";
import { updateDiscordUser } from "~/utils/webhook";

type ContextUser = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
};
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
    return null;
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
        // console.log("Checking linkability of", input, linkable);
        if (!linkable) {
          return { linkable: false };
        }
        // get the current providers linked
        const providers = [];

        const using = ["discord", "twitter", "google", "ethereum", "github"];

        const links = await ProviderLink.find({
          discordId: linkable.discordId,
          provider: { $in: using },
        });

        for (const link of links) {
          if (link.provider === "ethereum") {
            providers.push({
              id: "ethereum",
              name: link.providerId,
              image: "",
              revokedAt: null,
            });
          } else {
            if (link.revokedAt) {
              providers.push({
                id: link.provider,
                name: "",
                image: "",
                revokedAt: link.revokedAt ?? null,
              });
            } else {
              const user = await mongoose.connection.db
                .collection("users")
                .findOne({
                  _id: link.userId,
                });
              if (!user) {
                throw new Error("User not found");
              }
              providers.push({
                id: link.provider,
                name: user.name ?? "",
                image: user.image ?? "",
                revokedAt: link.revokedAt ?? null,
              });
            }
          }
        }

        return { linkable: true, linked: providers };
      } catch (error) {
        console.error(error);
        throw new Error("Unable to query linkablity status");
      }
    }),

  link: protectedProcedure
    .input(z.object({ csrfToken: z.string().length(64) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const account = await recoverAccount(ctx.session.user);

        if (!account) {
          await Linkable.deleteOne({ csrfToken: input.csrfToken });
          throw new Error("Unable to recover account");
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        const abort = async () => {
          await session.abortTransaction();
          await session.endSession();
        };
        try {
          let discordId = "";

          if (account.provider === "discord") {
            await Linkable.findOneAndUpdate(
              {
                $or: [
                  { discordId: account.providerAccountId },
                  { csrfToken: input.csrfToken },
                ],
              },
              {
                discordId: account.providerAccountId,
                csrfToken: input.csrfToken,
              },
              { upsert: true, session }
            );

            discordId = account.providerAccountId;
            updateDiscordUser(discordId);

            await session.commitTransaction();
            await session.endSession();

            return account.provider as string;
          } else {
            const linkable = await Linkable.findOne(
              {
                csrfToken: input.csrfToken,
              },
              null,
              { session }
            );

            if (!linkable) {
              throw new Error("Invalid CSRF token");
            }

            discordId = linkable.discordId;
          }

          const old = await ProviderLink.findOneAndUpdate(
            { provider: account.provider, discordId },
            {
              discordId,
              providerId: account.providerAccountId,
              userId: account.userId,
              provider: account.provider,
              linkedAt: new Date(),
              revokedAt: null,
            },
            { upsert: true, session }
          );

          if (old?.providerId === account.providerAccountId) {
            await session.commitTransaction();
            await session.endSession();
            return account.provider as string;
          }

          const other = await ProviderLink.findOne(
            {
              provider: account.provider,
              providerId: account.providerAccountId,
              discordId: { $ne: discordId },
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
          updateDiscordUser(discordId);

          return account.provider as string;
        } catch (error) {
          await abort();
          throw error;
        }
      } catch (error) {
        console.error(error);
        throw new Error("Failed to link");
      }
    }),
});
