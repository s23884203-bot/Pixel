import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews } from "../db";
import { fetchDiscordReviews, syncReviewsFromDiscord, fetchDiscordPartners, getServerIconFromInvite } from "../discord";

// Track last sync time to prevent excessive syncing
let lastSyncTime = 0;
const SYNC_INTERVAL = 3600000; // 1 hour in milliseconds

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    // Official Rating Images provided by the user
    const officialRatingImages = [
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
    ];

    const manualReviews = officialRatingImages.map((url, index) => ({
      id: 2000 + index,
      authorName: "Customer",
      authorAvatar: null,
      content: "تقييم Pixel Design",
      image: url,
      rating: 5,
      timestamp: new Date(Date.now() - index * 3600000) // Spaced out by hour
    }));

    try {
      const now = Date.now();
      if (now - lastSyncTime > SYNC_INTERVAL) {
        lastSyncTime = now;
        await syncReviewsFromDiscord();
      }

      const messages = await fetchDiscordReviews();
      
      const discordReviews = messages
        .filter(m => {
          const hasContent = m.content && m.content.trim().length > 0;
          const hasEmbeds = m.embeds && m.embeds.length > 0;
          const hasAttachments = m.attachments && m.attachments.length > 0;
          return hasContent || hasEmbeds || hasAttachments;
        })
        .map(m => {
          let content = m.content || "";
          if (m.embeds && m.embeds.length > 0) {
            content = m.embeds[0].description || m.embeds[0].title || content;
          }
          
          if (!content.trim() && m.attachments && m.attachments.length > 0) {
            content = "تقييم Pixel Design";
          }

          let image = null;
          if (m.attachments && m.attachments.length > 0) {
            image = m.attachments[0].url;
          } else if (m.embeds && m.embeds.length > 0 && m.embeds[0].image) {
            image = m.embeds[0].image.url;
          }

          return {
            id: parseInt(m.id.slice(-8)) || Math.floor(Math.random() * 1000000),
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: m.author.username,
            authorAvatar: m.author.avatar
              ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
              : null,
            content: content.trim() || "تقييم Pixel Design",
            image: image,
            rating: 5,
            timestamp: new Date(m.timestamp),
          };
        });

      // Filter out discord reviews that might be duplicates of our official ones
      const filteredDiscord = discordReviews.filter(dr => !officialRatingImages.includes(dr.image || ""));

      return [...manualReviews, ...filteredDiscord];
    } catch (error) {
      console.error("Error in list reviews:", error);
      return manualReviews;
    }
  }),

  sync: publicProcedure.mutation(async () => {
    try {
      lastSyncTime = Date.now();
      const synced = await syncReviewsFromDiscord();
      return { success: true, count: synced };
    } catch (error) {
      console.error("Failed to sync reviews:", error);
      return { success: false, error: "Failed to sync reviews" };
    }
  }),

  getStats: publicProcedure.query(async () => {
    try {
      const messages = await fetchDiscordReviews();
      const totalReviews = messages.length > 0 ? (messages.length + 16) : 216;
      return {
        totalReviews: totalReviews,
        averageRating: 5.0,
        memberCount: 2000,
      };
    } catch {
      return { totalReviews: 216, averageRating: 5.0, memberCount: 2000 };
    }
  }),

  partners: publicProcedure.query(async () => {
    try {
      const messages = await fetchDiscordPartners();
      return messages
        .filter(m => (m.content && m.content.trim().length > 0) || (m.embeds && m.embeds.length > 0))
        .map(m => {
          let description = m.content || "";
          let name = m.author.username;
          let image = m.author.avatar
            ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
            : null;

          if (m.embeds && m.embeds.length > 0) {
            const embed = m.embeds[0];
            description = embed.description || embed.title || description;
            if (embed.title) name = embed.title;
            if (embed.thumbnail?.url) image = embed.thumbnail.url;
          }

          return {
            id: m.id,
            name: name,
            description: description,
            image: image,
            link: null,
          };
        });
    } catch (error) {
      console.error("Error fetching partners:", error);
      return [];
    }
  }),

  featuredClients: publicProcedure.query(async () => {
    const DISCORD_ICON = "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico";

    const manualClients = [
      { id: "m1", name: "TRG", username: "trg", avatar: null, serverIcon: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico", inviteLink: "https://discord.gg/trg", platform: 'discord' },
      { id: "m2", name: "D7MX", username: "d7mx", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/d7mx", platform: 'kick' },
      { id: "m3", name: "IAZUZ", username: "iazuz", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/iazuz", platform: 'kick' },
      { id: "m4", name: "IHIMO", username: "ihimo", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/ihimo", platform: 'kick' },
      { id: "m5", name: "II3LI", username: "ii3li", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/ii3li", platform: 'kick' },
      { id: "m6", name: "2MZX", username: "2mzx", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/2mzx", platform: 'kick' },
      { id: "m7", name: "L1T", username: "l1t", avatar: null, serverIcon: "https://discord.gg/l1t", platform: 'discord' },
      { id: "m8", name: "VE", username: "ve", avatar: null, serverIcon: "https://discord.gg/ve", platform: 'discord' },
      { id: "m9", name: "CMP", username: "cmp", avatar: null, serverIcon: "https://discord.gg/CMP", platform: 'discord' },
      { id: "m10", name: "S1S", username: "s1s", avatar: null, serverIcon: "https://discord.gg/s1s", platform: 'discord' },
    ];

    try {
      const messages = await fetchDiscordPartners();
      const discordClients = [];

      for (const msg of messages) {
        const fullText = (msg.content || "") + JSON.stringify(msg.embeds || []);
        const inviteMatch = fullText.match(/discord\.(gg|com\/invite)\/([a-zA-Z0-9-]+)/);
        
        if (inviteMatch) {
          const inviteCode = inviteMatch[2];
          const serverIcon = await getServerIconFromInvite(inviteCode);
          
          let displayName = msg.author.username;
          let displayAvatar = msg.author.avatar
            ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
            : null;

          if (msg.embeds && msg.embeds.length > 0) {
            const embed = msg.embeds[0];
            if (embed.title) displayName = embed.title;
            if (embed.thumbnail?.url) displayAvatar = embed.thumbnail.url;
          }
          
          discordClients.push({
            id: msg.id,
            name: displayName,
            username: msg.author.username,
            avatar: displayAvatar,
            serverIcon: serverIcon || DISCORD_ICON,
            inviteLink: `https://discord.gg/${inviteCode}`,
            platform: 'discord',
          });
        }
      }

      return [...manualClients, ...discordClients];
    } catch (error) {
      console.error("Error fetching featured clients:", error);
      return manualClients;
    }
  }),
});
