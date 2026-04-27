import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews, createReview, getReviewByDiscordId } from "../db";
import { fetchDiscordReviews, fetchDiscordPartners } from "../discord";
import { invokeLLM } from "../_core/llm";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    const LOG_PREFIX = "[PIXEL-SYNC]";
    console.log(`${LOG_PREFIX} Starting fresh sync from Discord...`);
    
    try {
      // 1. Fetch live from Discord (Refresh)
      const messages = await fetchDiscordReviews();
      console.log(`${LOG_PREFIX} Fetched ${messages.length} messages from Discord.`);
      
      // 2. Get existing reviews from DB
      const dbReviews = await getAllReviews();
      const dbMap = new Map(dbReviews.map(r => [r.discordMessageId, r]));
      console.log(`${LOG_PREFIX} Found ${dbReviews.length} reviews in database.`);

      const finalReviews = [];
      let newProcessedCount = 0;
      
      for (const m of messages) {
        // Skip if no attachments
        if (!m.attachments || m.attachments.length === 0) {
          continue;
        }
        
        const imageUrl = m.attachments[0].url;
        
        // Skip separators
        if (imageUrl.toLowerCase().includes("line.png") || imageUrl.toLowerCase().includes("pixel_design_lein")) {
          continue;
        }

        // Check if already processed
        if (dbMap.has(m.id)) {
          const existing = dbMap.get(m.id)!;
          // Always update image URL as Discord URLs expire
          existing.image = imageUrl;
          finalReviews.push(existing);
          continue;
        }

        // NEW REVIEW DETECTED!
        console.log(`${LOG_PREFIX} New review detected! ID: ${m.id}. Starting AI extraction...`);
        newProcessedCount++;

        try {
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
          console.log(`${LOG_PREFIX} AI Extraction successful for ${m.id}: User=${extracted.username}, Rating=${extracted.rating}`);
          
          const newReview = {
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: extracted.username || m.author.global_name || m.author.username,
            authorAvatar: m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null,
            content: extracted.content || "تقييم Pixel Design",
            image: imageUrl,
            rating: extracted.rating || 5,
            timestamp: new Date(m.timestamp),
          };

          // Save to DB
          await createReview(newReview);
          finalReviews.push(newReview);
          console.log(`${LOG_PREFIX} Saved new review ${m.id} to database.`);
        } catch (aiError) {
          console.error(`${LOG_PREFIX} AI Analysis failed for ${m.id}:`, aiError);
          // Fallback
          const fallbackReview = {
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: m.author.global_name || m.author.username,
            authorAvatar: m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null,
            content: "تقييم جديد (جاري المعالجة)",
            image: imageUrl,
            rating: 5,
            timestamp: new Date(m.timestamp),
          };
          finalReviews.push(fallbackReview);
        }
      }

      // Final merge to ensure we don't miss anything from DB that might not be in the latest 100 Discord messages
      const finalMap = new Map();
      dbReviews.forEach(r => finalMap.set(r.discordMessageId, r));
      finalReviews.forEach(r => finalMap.set(r.discordMessageId, r));

      const result = Array.from(finalMap.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      console.log(`${LOG_PREFIX} Sync complete. Total reviews to display: ${result.length}. New processed: ${newProcessedCount}`);
      return result;
        
    } catch (error) {
      console.error(`${LOG_PREFIX} Critical error in sync:`, error);
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
"ve", avatar: null, serverIcon: DISCORD_ICON, inviteLink: "https://discord.gg/ve", platform: 'discord' },
      { id: "m9", name: "CMP", username: "cmp", avatar: null, serverIcon: DISCORD_ICON, inviteLink: "https://discord.gg/CMP", platform: 'discord' },
      { id: "m10", name: "S1S", username: "s1s", avatar: null, serverIcon: DISCORD_ICON, inviteLink: "https://discord.gg/s1s", platform: 'discord' },
    ];
  }),
});
