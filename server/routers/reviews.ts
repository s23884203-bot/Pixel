import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews } from "../db";
import { fetchDiscordReviews, syncReviewsFromDiscord, fetchDiscordPartners, getServerIconFromInvite } from "../discord";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    const dbReviews = await getAllReviews();
    
    // Fallback to live discord fetch if DB is empty or unavailable
    const messages = await fetchDiscordReviews();
    const discordReviews = messages
      .filter(m => (m.content && m.content.trim().length > 0) || (m.embeds && m.embeds.length > 0))
      .map(m => {
        let content = m.content || "";
        if (m.embeds && m.embeds.length > 0) {
          content = m.embeds[0].description || m.embeds[0].title || content;
        }
        let image = null;
        if (m.attachments && m.attachments.length > 0) {
          image = m.attachments[0].url;
        }

        return {
          id: parseInt(m.id.slice(-8)),
          discordMessageId: m.id,
          discordUserId: m.author.id,
          authorName: m.author.username,
          authorAvatar: m.author.avatar
            ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
            : null,
          content: content,
          image: image,
          rating: 5,
          timestamp: new Date(m.timestamp),
        };
      });

    // Combine and prioritize DB if available
    if (dbReviews.length > 0) return dbReviews;
    return discordReviews;
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
      .filter(m => {
        const hasContent = m.content && m.content.trim().length > 0;
        const hasEmbeds = m.embeds && m.embeds.length > 0;
        // Filter out messages that look like "featured clients" (contain invite links)
        return (hasContent || hasEmbeds);
      })
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
          if (embed.fields && embed.fields.length > 0) {
            description += "\n" + embed.fields.map(f => `${f.name}: ${f.value}`).join("\n");
          }
        }

        return {
          id: m.id,
          name: name,
          description: description,
          image: image,
          link: null,
        };
      });
  }),

  featuredClients: publicProcedure.query(async () => {
    const manualClients = [
      { id: "m1", name: "TRG", username: "trg", avatar: null, serverIcon: null, inviteLink: "https://discord.gg/trg" },
      { id: "m2", name: "D7MX", username: "d7mx", avatar: null, serverIcon: null, inviteLink: "https://kick.com/d7mx" },
      { id: "m3", name: "IAZUZ", username: "iazuz", avatar: null, serverIcon: null, inviteLink: "https://kick.com/iazuz" },
      { id: "m4", name: "IHIMO", username: "ihimo", avatar: null, serverIcon: null, inviteLink: "https://kick.com/ihimo" },
      { id: "m5", name: "II3LI", username: "ii3li", avatar: null, serverIcon: null, inviteLink: "https://kick.com/ii3li" },
      { id: "m6", name: "2MZX", username: "2mzx", avatar: null, serverIcon: null, inviteLink: "https://kick.com/2mzx" },
      { id: "m7", name: "L1T", username: "l1t", avatar: null, serverIcon: null, inviteLink: "https://discord.gg/l1t" },
      { id: "m8", name: "VE", username: "ve", avatar: null, serverIcon: null, inviteLink: "https://discord.gg/ve" },
      { id: "m9", name: "CMP", username: "cmp", avatar: null, serverIcon: null, inviteLink: "https://discord.gg/CMP" },
      { id: "m10", name: "S1S", username: "s1s", avatar: null, serverIcon: null, inviteLink: "https://discord.gg/s1s" },
    ];

    const messages = await fetchDiscordPartners();
    const discordClients = [];

    for (const msg of messages) {
      const fullText = msg.content + JSON.stringify(msg.embeds);
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
          serverIcon: serverIcon,
          inviteLink: `https://discord.gg/${inviteCode}`,
        });
      }
    }

    return [...manualClients, ...discordClients];
  }),
});
