import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews, createReview, getReviewByDiscordId } from "../db";
import { fetchDiscordReviews, fetchDiscordPartners } from "../discord";
import { invokeLLM } from "../_core/llm";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    const LOG_PREFIX = "[PIXEL-SYNC-SYSTEM]";
    console.log(`${LOG_PREFIX} >>> Starting Legendary Sync Process...`);
    
    try {
      // 1. Fresh Fetch from Discord
      console.log(`${LOG_PREFIX} Fetching latest messages from Discord channel 1384289587718918365...`);
      const messages = await fetchDiscordReviews();
      console.log(`${LOG_PREFIX} Successfully fetched ${messages.length} messages.`);
      
      // 2. Get existing reviews from DB
      const dbReviews = await getAllReviews();
      const dbMap = new Map(dbReviews.map(r => [r.discordMessageId, r]));
      console.log(`${LOG_PREFIX} Current database contains ${dbReviews.length} reviews.`);

      const finalReviews = [];
      let newProcessedCount = 0;
      let skippedCount = 0;
      
      for (const m of messages) {
        // Validation: Must have attachments
        if (!m.attachments || m.attachments.length === 0) {
          skippedCount++;
          continue;
        }
        
        const imageUrl = m.attachments[0].url;
        
        // Validation: Skip separators (line.png)
        if (imageUrl.toLowerCase().includes("line.png") || imageUrl.toLowerCase().includes("pixel_design_lein")) {
          skippedCount++;
          continue;
        }

        // Check if already in DB
        if (dbMap.has(m.id)) {
          const existing = dbMap.get(m.id)!;
          // Update image URL (Discord URLs are temporary)
          existing.image = imageUrl;
          finalReviews.push(existing);
          continue;
        }

        // NEW REVIEW DETECTED!
        console.log(`${LOG_PREFIX} [NEW REVIEW] Found unregistered review! ID: ${m.id}.`);
        console.log(`${LOG_PREFIX} [AI-OCR] Starting intelligent extraction from image: ${imageUrl}`);
        newProcessedCount++;

        try {
          const aiResult = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Analyze this review image and extract: 1. The username of the person who wrote the review. 2. The exact text content of the review. 3. The star rating (1 to 5). Return the result strictly as a JSON object." },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ],
            outputSchema: {
              name: "extract_review_data",
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

          let content = aiResult.choices[0].message.content as string;
          // Clean up markdown if present
          if (content.includes("```json")) {
            content = content.split("```json")[1].split("```")[0].trim();
          } else if (content.includes("```")) {
            content = content.split("```")[1].split("```")[0].trim();
          }
          
          const extracted = JSON.parse(content);
          console.log(`${LOG_PREFIX} [AI-SUCCESS] Extracted for ${m.id}: User="${extracted.username}", Rating=${extracted.rating || extracted.star_rating} stars.`);
          
          const newReview = {
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: extracted.username || m.author.global_name || m.author.username,
            authorAvatar: m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null,
            content: extracted.content || extracted.review_text || "تقييم Pixel Design",
            image: imageUrl,
            rating: extracted.rating || extracted.star_rating || 5,
            timestamp: new Date(m.timestamp),
          };

          // Save to DB
          await createReview(newReview);
          finalReviews.push(newReview);
          console.log(`${LOG_PREFIX} [DB-SAVE] Review ${m.id} successfully saved to database.`);
        } catch (aiError) {
          console.error(`${LOG_PREFIX} [AI-ERROR] Failed to process image for ${m.id}:`, aiError);
          // Fallback
          const fallback = {
            discordMessageId: m.id,
            discordUserId: m.author.id,
            authorName: m.author.global_name || m.author.username,
            authorAvatar: m.author.avatar ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png` : null,
            content: "تقييم جديد (جاري المعالجة)",
            image: imageUrl,
            rating: 5,
            timestamp: new Date(m.timestamp),
          };
          finalReviews.push(fallback);
        }
      }

      // Final merge with DB to ensure full history
      const finalMap = new Map();
      dbReviews.forEach(r => finalMap.set(r.discordMessageId, r));
      finalReviews.forEach(r => finalMap.set(r.discordMessageId, r));

      const result = Array.from(finalMap.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      console.log(`${LOG_PREFIX} >>> Sync Process Finished!`);
      console.log(`${LOG_PREFIX} Summary: Total Displayed=${result.length}, New Processed=${newProcessedCount}, Skipped=${skippedCount}.`);
      
      return result;
        
    } catch (error) {
      console.error(`${LOG_PREFIX} [CRITICAL-ERROR] Sync failed:`, error);
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
