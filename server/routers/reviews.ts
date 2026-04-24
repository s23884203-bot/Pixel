import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews } from "../db";
import { fetchDiscordReviews, syncReviewsFromDiscord, fetchDiscordPartners, getServerIconFromInvite } from "../discord";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    const dbReviews = await getAllReviews();
    if (dbReviews.length > 0) return dbReviews;
    
    // Fallback to live discord fetch if DB is empty or unavailable
    const messages = await fetchDiscordReviews();
    return messages.map(m => ({
      id: parseInt(m.id.slice(-8)), // temporary numeric id
      discordMessageId: m.id,
      discordUserId: m.author.id,
      authorName: m.author.username,
      authorAvatar: m.author.avatar
        ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
        : null,
      content: m.content,
      rating: 5,
      timestamp: new Date(m.timestamp),
    }));
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
    let reviewsList = await getAllReviews();
    if (reviewsList.length === 0) {
      const messages = await fetchDiscordReviews();
      reviewsList = messages.map(m => ({ rating: 5 })) as any;
    }
    
    const totalReviews = reviewsList.length;
    const averageRating =
      reviewsList.length > 0
        ? reviewsList.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsList.length
        : 0;

    return {
      totalReviews: totalReviews || 200,
      averageRating: Math.round(averageRating * 10) / 10 || 5.0,
      memberCount: 2000,
    };
  }),

  partners: publicProcedure.query(async () => {
    const messages = await fetchDiscordPartners();
    return messages
      .filter(m => (m.content && m.content.trim().length > 0) || (m.embeds && m.embeds.length > 0))
      .map(m => {
        let description = m.content || "";
        if (m.embeds && m.embeds.length > 0) {
          description = m.embeds[0].description || m.embeds[0].title || description;
        }
        return {
          id: m.id,
          name: m.author.username,
          description: description,
          image: m.author.avatar
            ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
            : null,
          link: null,
        };
      });
  }),

  featuredClients: publicProcedure.query(async () => {
    const messages = await fetchDiscordPartners();
    const clients = [];

    for (const msg of messages) {
      // Extract Discord invite code from content or embeds
      const fullText = msg.content + (msg.embeds?.map(e => (e.description || "") + (e.title || "")).join(" ") || "");
      const inviteMatch = fullText.match(/discord\.gg\/([a-zA-Z0-9-]+)/) || fullText.match(/discord\.com\/invite\/([a-zA-Z0-9-]+)/);
      
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
