import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createReview } from "../db";

const BOT_API_KEY = "pixel_secret_key_2026"; // You can change this or put it in .env

export const botRouter = router({
  submitReview: publicProcedure
    .input(z.object({
      apiKey: z.string(),
      authorName: z.string(),
      authorAvatar: z.string().optional().nullable(),
      content: z.string(),
      image: z.string().optional().nullable(),
      rating: z.number().min(1).max(5).default(5),
    }))
    .mutation(async ({ input }) => {
      if (input.apiKey !== BOT_API_KEY) {
        throw new Error("Unauthorized: Invalid API Key");
      }

      try {
        await createReview({
          discordMessageId: `bot_${Date.now()}`,
          discordUserId: "bot_direct",
          authorName: input.authorName,
          authorAvatar: input.authorAvatar,
          content: input.content,
          image: input.image,
          rating: input.rating,
          timestamp: new Date(),
        });
        return { success: true, message: "Review added successfully" };
      } catch (error) {
        console.error("Failed to add review from bot:", error);
        return { success: false, error: "Database error" };
      }
    }),
});
