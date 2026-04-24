import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews } from "../db";
import { fetchDiscordReviews, syncReviewsFromDiscord, fetchDiscordPartners, getServerIconFromInvite } from "../discord";

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

  featuredClients: publicProcedure.query(async () => {
    const messages = await fetchDiscordPartners();
    const clients = [];

    for (const msg of messages) {
      // Extract Discord invite code from content
      const inviteMatch = msg.content.match(/discord\.gg\/([a-zA-Z0-9-]+)/) || msg.content.match(/discord\.com\/invite\/([a-zA-Z0-9-]+)/);
      
      if (inviteMatch) {
        const inviteCode = inviteMatch[1];
        const serverIcon = await getServerIconFromInvite(inviteCode);
        
        clients.push({
          id: msg.id,
          name: msg.author.username,
          username: msg.author.username,
          avatar: msg.author.avatar
            ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
            : null,
          serverIcon: serverIcon,
          inviteLink: `https://discord.gg/${inviteCode}`,
        });
      }
    }

    return clients;
  }),
});
