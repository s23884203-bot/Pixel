import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews, createReview, getReviewByDiscordId } from "../db";
import { detectFeaturedClientPlatform, fetchDiscordReviews, fetchDiscordPartners, resolveFeaturedClientIcon } from "../discord";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    try {
      // 1. Fetch live from Discord (Fresh URLs)
      const messages = await fetchDiscordReviews();
      
      const discordReviews = messages
        .filter(m => m.attachments && m.attachments.length > 0)
        .map(m => {
          const image = m.attachments[0].url;
          // Filter out lines or non-rating images if possible, but keep all for now as requested
          if (image.includes("Pixel_Design_lein") || image.includes("line.png")) return null;

          return {
            id: parseInt(m.id.slice(-8)) || Math.floor(Math.random() * 1000000),
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: m.author.global_name || m.author.username,
            authorAvatar: m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null,
            content: "",
            image: image,
            rating: 5,
            timestamp: new Date(m.timestamp),
          };
        })
        .filter(r => r !== null);

      // 2. Get from DB
      const dbReviews = await getAllReviews();
      
      // Merge and unique by discordMessageId or image
      // We prioritize Discord live data for the same message ID to get fresh URLs
      const reviewsMap = new Map();
      
      // Add DB reviews first
      dbReviews.forEach(r => {
        if (r.discordMessageId) reviewsMap.set(r.discordMessageId, r);
        else if (r.image) reviewsMap.set(r.image, r);
      });
      
      // Overwrite/Add with fresh Discord reviews
      discordReviews.forEach(r => {
        reviewsMap.set(r.discordMessageId, r);
      });

      const uniqueReviews = Array.from(reviewsMap.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return uniqueReviews;
    } catch (error) {
      console.error("Error in list reviews:", error);
      return await getAllReviews();
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
    const clients = [
      { id: "m1", name: "Triggers", username: "Triggers", inviteLink: "https://discord.gg/trg" },
      { id: "m2", name: "D7MX", username: "D7MX", inviteLink: "https://kick.com/d7mx" },
      { id: "m3", name: "LosTown Cfw", username: "LosTown Cfw", inviteLink: "https://discord.gg/l1t" },
      { id: "m4", name: "iAzuz", username: "iAzuz", inviteLink: "https://kick.com/iazuz" },
      { id: "m5", name: "ShotFire", username: "ShotFire", inviteLink: "https://discord.gg/sff" },
      { id: "m6", name: "iHIMO", username: "iHIMO", inviteLink: "https://kick.com/ihimo" },
      { id: "m7", name: "𝐕𝐄𝐋𝐕𝐄𝐓 𝐑𝐏", username: "𝐕𝐄𝐋𝐕𝐄𝐓 𝐑𝐏", inviteLink: "https://discord.gg/ve" },
      { id: "m8", name: "ii3li", username: "ii3li", inviteLink: "https://kick.com/ii3li" },
      { id: "m94", name: "Champion PVP", username: "Champion PVP", inviteLink: "https://discord.gg/CMP" },
      { id: "m10", name: "2mzx", username: "2mzx", inviteLink: "https://kick.com/2mzx" },
      { id: "m11", name: "Street Fight", username: "Street Fight", inviteLink: "https://discord.gg/s1s" },
      { id: "m12", name: "ShotFire", username: "ShotFire", inviteLink: "https://discord.gg/sff" },
    ];

    return await Promise.all(
      clients.map(async client => {
        const platform = detectFeaturedClientPlatform(client.inviteLink);
        const serverIcon = await resolveFeaturedClientIcon(client.inviteLink, platform);

        return {
          ...client,
          avatar: serverIcon,
          serverIcon,
          platform,
        };
      })
    );
  }),
});
