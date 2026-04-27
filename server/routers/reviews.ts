import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews, createReview, getReviewByDiscordId } from "../db";
import { fetchDiscordReviews, fetchDiscordPartners } from "../discord";
import { invokeLLM } from "../_core/llm";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    try {
      // 1. Fetch live from Discord
      const messages = await fetchDiscordReviews();
      
      // 2. Get existing reviews from DB to avoid re-processing
      const dbReviews = await getAllReviews();
      const dbMap = new Map(dbReviews.map(r => [r.discordMessageId, r]));

      const discordReviews = [];
      
      for (const m of messages) {
        if (!m.attachments || m.attachments.length === 0) continue;
        
        const imageUrl = m.attachments[0].url;
        if (imageUrl.toLowerCase().includes("line.png") || imageUrl.toLowerCase().includes("pixel_design_lein")) continue;

        // If already in DB and has content, use it
        if (dbMap.has(m.id)) {
          const existing = dbMap.get(m.id)!;
          // Update image URL just in case it expired
          existing.image = imageUrl;
          discordReviews.push(existing);
          continue;
        }

        // If not in DB, use AI to extract info from image
        try {
          console.log(`Analyzing image for review ${m.id}...`);
          const aiResult = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Extract the following information from this review image: 1. Username of the reviewer, 2. The review text/content, 3. Star rating (number 1-5). Return as JSON." },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ],
            outputSchema: {
              name: "extract_review",
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  content: { type: "string" },
                  rating: { type: "number" }
                },
                required: ["username", "content", "rating"]
              }
            }
          });

          const extracted = JSON.parse(aiResult.choices[0].message.content as string);
          
          const newReview = {
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: extracted.username || m.author.global_name || m.author.username,
            authorAvatar: m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null,
            content: extracted.content || "",
            image: imageUrl,
            rating: extracted.rating || 5,
            timestamp: new Date(m.timestamp),
          };

          // Save to DB so we don't call AI again for this message
          await createReview(newReview);
          discordReviews.push(newReview);
        } catch (aiError) {
          console.error(`AI Analysis failed for ${m.id}:`, aiError);
          // Fallback to basic info if AI fails
          discordReviews.push({
            id: parseInt(m.id.slice(-8)) || Math.floor(Math.random() * 1000000),
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: m.author.global_name || m.author.username,
            authorAvatar: m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null,
            content: "",
            image: imageUrl,
            rating: 5,
            timestamp: new Date(m.timestamp),
          });
        }
      }

      // Merge and unique
      const reviewsMap = new Map();
      dbReviews.forEach(r => {
        if (r.discordMessageId) reviewsMap.set(r.discordMessageId, r);
      });
      discordReviews.forEach(r => {
        reviewsMap.set(r.discordMessageId, r);
      });

      return Array.from(reviewsMap.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
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
