import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews } from "../db";
import { fetchDiscordReviews, syncReviewsFromDiscord, fetchDiscordPartners, getServerIconFromInvite } from "../discord";

// Track last sync time to prevent excessive syncing
let lastSyncTime = 0;
const SYNC_INTERVAL = 3600000; // 1 hour in milliseconds

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    try {
      // Auto-sync if interval has passed
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
          // Allow messages that have at least one of these
          return hasContent || hasEmbeds || hasAttachments;
        })
        .map(m => {
          let content = m.content || "";
          
          // If content is just a name with colon (like "Reviews:" or "Neon:"), 
          // and there's an embed, use embed description
          if (content.includes(":") && m.embeds && m.embeds.length > 0) {
             content = m.embeds[0].description || m.embeds[0].title || content;
          } else if (!content && m.embeds && m.embeds.length > 0) {
            content = m.embeds[0].description || m.embeds[0].title || "";
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

      return discordReviews;
    } catch (error) {
      console.error("Error in list reviews:", error);
      return [];
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
      const totalReviews = messages.length > 0 ? messages.length : 200;
      return {
        totalReviews: totalReviews,
        averageRating: 5.0,
        memberCount: 2000,
      };
    } catch {
      return { totalReviews: 200, averageRating: 5.0, memberCount: 2000 };
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
    const KICK_ICON = "https://kick.com/favicon.ico";
    const DISCORD_ICON = "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico";

    const manualClients = [
      { id: "m1", name: "TRG", username: "trg", avatar: null, serverIcon: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico", inviteLink: "https://discord.gg/trg", platform: 'discord' },
      { id: "m2", name: "D7MX", username: "d7mx", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/d7mx", platform: 'kick' },
      { id: "m3", name: "IAZUZ", username: "iazuz", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/iazuz", platform: 'kick' },
      { id: "m4", name: "IHIMO", username: "ihimo", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/ihimo", platform: 'kick' },
      { id: "m5", name: "II3LI", username: "ii3li", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/ii3li", platform: 'kick' },
      { id: "m6", name: "2MZX", username: "2mzx", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/2mzx", platform: 'kick' },
      { id: "m7", name: "L1T", username: "l1t", avatar: null, serverIcon: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico", inviteLink: "https://discord.gg/l1t", platform: 'discord' },
      { id: "m8", name: "VE", username: "ve", avatar: null, serverIcon: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico", inviteLink: "https://discord.gg/ve", platform: 'discord' },
      { id: "m9", name: "CMP", username: "cmp", avatar: null, serverIcon: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico", inviteLink: "https://discord.gg/CMP", platform: 'discord' },
      { id: "m10", name: "S1S", username: "s1s", avatar: null, serverIcon: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico", inviteLink: "https://discord.gg/s1s", platform: 'discord' },
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

  // New endpoint for hourly refresh
  hourlySync: publicProcedure.query(async () => {
    try {
      const now = Date.now();
      if (now - lastSyncTime > SYNC_INTERVAL) {
        lastSyncTime = now;
        const synced = await syncReviewsFromDiscord();
        return { success: true, synced, message: "Hourly sync completed" };
      }
      return { success: true, synced: 0, message: "Sync interval not reached yet" };
    } catch (error) {
      console.error("Failed to perform hourly sync:", error);
      return { success: false, error: "Failed to sync reviews" };
    }
  }),

  // New endpoint for Discord channel info
  getDiscordChannelInfo: publicProcedure.query(async () => {
    try {
      const DISCORD_API_BASE = "https://discord.com/api/v10";
      const REVIEWS_CHANNEL_ID = "1384289587718918365";
      const token = process.env.DISCORD_TOKEN;
      
      if (!token) {
        return { success: false, error: "Discord token not configured" };
      }

      const response = await fetch(
        `${DISCORD_API_BASE}/channels/${REVIEWS_CHANNEL_ID}`,
        {
          headers: {
            Authorization: `Bot ${token}`,
          },
        }
      );

      if (!response.ok) {
        return { success: false, error: "Failed to fetch channel info" };
      }

      const channelInfo = await response.json();
      return { success: true, data: channelInfo };
    } catch (error) {
      console.error("Error fetching Discord channel info:", error);
      return { success: false, error: "Failed to fetch channel info" };
    }
  }),
});
