import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews } from "../db";
import { fetchDiscordReviews, syncReviewsFromDiscord, fetchDiscordPartners } from "../discord";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    return getAllReviews();
  }),

  sync: publicProcedure.mutation(async () => {
    try {
      const synced = await syncReviewsFromDiscord();
      return { success: true, count: synced };
    } catch (error) {
      console.error("Failed to sync reviews:", error);
      return { success: false, error: "Failed to sync reviews" };
    }
  }),

  getStats: publicProcedure.query(async () => {
    const reviews = await getAllReviews();
    const totalReviews = reviews.length;
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      memberCount: 2000,
    };
  }),

  partners: publicProcedure.query(async () => {
    const messages = await fetchDiscordPartners();
    return messages
      .filter(m => m.content && m.content.trim().length > 0)
      .map(m => ({
        id: m.id,
        name: m.author.username,
        description: m.content,
        image: m.author.avatar
          ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
          : null,
        link: null,
      }));
  }),
});
