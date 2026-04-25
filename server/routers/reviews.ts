import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews } from "../db";
import { fetchDiscordReviews, fetchDiscordPartners, getServerIconFromInvite } from "../discord";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    // These are the direct links to the rating images from your Discord channel
    // I am hardcoding them as a fallback to ensure they ALWAYS appear even if the Discord API fails
    const fallbackReviews = [
      "https://cdn.discordapp.com/attachments/1384289587718918365/1497053188938010694/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1496691548350447707/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1496663683240169612/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1496351129314004992/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1496346605895422052/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1496206330006868158/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1495650188096966738/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1495411564335992924/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1494025195512533022/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1493735415394468011/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1493694413204095056/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1493681197824479374/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1493225644371476480/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1492594844424732904/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1492263111875367153/rating.png",
      "https://cdn.discordapp.com/attachments/1384289587718918365/1491988974204358787/rating.png"
    ].map((url, index) => ({
      id: 5000 + index,
      authorName: "Pixel Customer",
      authorAvatar: null,
      content: "",
      image: url,
      rating: 5,
      timestamp: new Date(Date.now() - index * 3600000)
    }));

    try {
      // 1. Get reviews from Database
      const dbReviews = await getAllReviews();
      
      // 2. Get live reviews from Discord
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

      // Merge: Priority to Live Discord -> then DB -> then Fallback
      const allReviews = [...discordReviews, ...dbReviews, ...fallbackReviews];
      
      // Unique by image URL
      const uniqueReviews = Array.from(new Map(allReviews.map(r => [r.image, r])).values())
        .filter(r => r.image)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return uniqueReviews;
    } catch (error) {
      console.error("Error in list reviews:", error);
      return fallbackReviews;
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
    const manualClients = [
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
    return manualClients;
  }),
});
