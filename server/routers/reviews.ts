import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews } from "../db";
import { fetchDiscordReviews, fetchDiscordPartners, getServerIconFromInvite } from "../discord";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    try {
      // 1. Fetch ALL historical reviews from Discord (Up to 1000 messages)
      const messages = await fetchDiscordReviews();
      
      const discordReviews = messages
        .filter(m => (m.attachments && m.attachments.length > 0) || (m.embeds && m.embeds.length > 0))
        .map(m => {
          let content = m.content || "";
          if (m.embeds && m.embeds.length > 0) {
            content = m.embeds[0].description || m.embeds[0].title || content;
          }
          
          let image = null;
          if (m.attachments && m.attachments.length > 0) {
            image = m.attachments[0].url;
          } else if (m.embeds && m.embeds.length > 0 && m.embeds[0].image) {
            image = m.embeds[0].image.url;
          }

          if (!content.trim() || content.toLowerCase().includes("rating.png")) {
            content = "";
          }

          return {
            id: parseInt(m.id.slice(-8)) || Math.floor(Math.random() * 1000000),
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: m.author.username,
            authorAvatar: m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null,
            content: content.trim(),
            image: image,
            rating: 5,
            timestamp: new Date(m.timestamp),
          };
        })
        .filter(r => r.image);

      // 2. Fallback to Database if Discord fetch is empty (though fetchDiscordReviews is now robust)
      const dbReviews = await getAllReviews();
      
      // Merge: Live Discord (Fresh URLs) takes priority
      const allReviews = [...discordReviews, ...dbReviews];
      
      // Unique by image URL or discordMessageId to prevent duplicates
      const uniqueReviews = Array.from(new Map(allReviews.map(r => [r.image || r.discordMessageId, r])).values())
        .filter(r => r.image)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return uniqueReviews;
    } catch (error) {
      console.error("Error in list reviews:", error);
      const dbReviews = await getAllReviews();
      return dbReviews.filter(r => r.image).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }),

  getStats: publicProcedure.query(async () => {
    return {
      totalReviews: 200,
      averageRating: 5.0,
      memberCount: 2000,
    };
  }),

  partners: publicProcedure.query(async () => {
    try {
      const messages = await fetchDiscordPartners();
      return messages
        .filter(m => (m.content && m.content.trim().length > 0) || (m.embeds && m.embeds.length > 0))
        .map(m => {
          let description = m.content || "";
          let name = m.author.username;
          let image = m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null;
          if (m.embeds && m.embeds.length > 0) {
            const embed = m.embeds[0];
            description = embed.description || embed.title || description;
            if (embed.title) name = embed.title;
            if (embed.thumbnail?.url) image = embed.thumbnail.url;
          }
          return { id: m.id, name, description, image, link: null };
        });
    } catch (error) {
      console.error("Error fetching partners:", error);
      return [];
    }
  }),

  featuredClients: publicProcedure.query(async () => {
    const DISCORD_ICON = "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico";
    return [
      { id: "m1", name: "TRG", username: "trg", avatar: null, serverIcon: DISCORD_ICON, inviteLink: "https://discord.gg/trg", platform: 'discord' },
      { id: "m2", name: "D7MX", username: "d7mx", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/d7mx", platform: 'kick' },
      { id: "m3", name: "IAZUZ", username: "iazuz", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/iazuz", platform: 'kick' },
      { id: "m4", name: "IHIMO", username: "ihimo", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/ihimo", platform: 'kick' },
      { id: "m5", name: "II3LI", username: "ii3li", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/ii3li", platform: 'kick' },
      { id: "m6", name: "2MZX", username: "2mzx", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/2mzx", platform: 'kick' },
      { id: "m7", name: "L1T", username: "l1t", avatar: null, serverIcon: DISCORD_ICON, inviteLink: "https://discord.gg/l1t", platform: 'discord' },
      { id: "m8", name: "VE", username: "ve", avatar: null, serverIcon: DISCORD_ICON, inviteLink: "https://discord.gg/ve", platform: 'discord' },
      { id: "m9", name: "CMP", username: "cmp", avatar: null, serverIcon: DISCORD_ICON, inviteLink: "https://discord.gg/CMP", platform: 'discord' },
      { id: "m10", name: "S1S", username: "s1s", avatar: null, serverIcon: DISCORD_ICON, inviteLink: "https://discord.gg/s1s", platform: 'discord' },
    ];
  }),
});
