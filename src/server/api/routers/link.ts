import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import { Linkable, DiscordLink } from "~/utils/odm";

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
        // await db();
        // //start transaction
        // const session = await Linkable.startSession();
        // session.startTransaction();
        // try {
        //   const linkable = await Linkable.findOne({

        console.log("linking", ctx, input);
      } catch (error) {
        console.error(error);
        throw new Error("Failed to link");
      }
      throw new Error("Not implemented");
    }),
});
