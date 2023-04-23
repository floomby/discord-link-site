import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import db from "~/utils/db";
import LinkUsers from "~/utils/odm";

export const linkRouter = createTRPCRouter({
  link: protectedProcedure
    .input(z.object({ csrfToken: z.string().length(64) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db();
        await LinkUsers.findOneAndUpdate(
          { csrfToken: input.csrfToken },
        );
        console.log("linking", ctx);
      } catch (error) {
        console.error(error);
        throw new Error("Failed to link");
      }
    }),
});
