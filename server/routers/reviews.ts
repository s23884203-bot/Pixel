import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getAllReviews, createReview } from "../db";
import { fetchDiscordReviews, fetchDiscordPartners } from "../discord";
import { invokeLLM } from "../_core/llm";

export const reviewsRouter = router({
  list: publicProcedure.query(async () => {
    const LOG_PREFIX = "[PIXEL-DEBUG-SYSTEM]";
    console.log(`${LOG_PREFIX} >>> STARTING SYNC PROCESS <<<`);
    
    try {
      // 1. Get DB reviews
      const dbReviews = await getAllReviews();
      console.log(`${LOG_PREFIX} Found ${dbReviews.length} reviews in Database.`);
      const dbMap = new Map(dbReviews.map(r => [r.discordMessageId, r]));

      // 2. Fetch from Discord
      console.log(`${LOG_PREFIX} Fetching from Discord channel 1384289587718918365...`);
      const messages = await fetchDiscordReviews();
      console.log(`${LOG_PREFIX} Discord returned ${messages.length} messages.`);
      
      const finalReviews = [];
      let newProcessedCount = 0;
      
      for (const m of messages) {
        console.log(`${LOG_PREFIX} Checking Message ID: ${m.id} | Author: ${m.author.username}`);
        
        if (!m.attachments || m.attachments.length === 0) {
          console.log(`${LOG_PREFIX} Message ${m.id} skipped: No attachments.`);
          continue;
        }
        
        const imageUrl = m.attachments[0].url;
        console.log(`${LOG_PREFIX} Message ${m.id} has attachment: ${imageUrl}`);

        if (imageUrl.toLowerCase().includes("line.png") || imageUrl.toLowerCase().includes("pixel_design_lein")) {
          console.log(`${LOG_PREFIX} Message ${m.id} skipped: It's a separator line.`);
          continue;
        }

        if (dbMap.has(m.id)) {
          console.log(`${LOG_PREFIX} Message ${m.id} already in DB. Updating URL.`);
          const existing = dbMap.get(m.id)!;
          existing.image = imageUrl;
          finalReviews.push(existing);
          continue;
        }

        // NEW REVIEW DETECTED
        console.log(`${LOG_PREFIX} !!! NEW REVIEW DETECTED !!! ID: ${m.id}`);
        newProcessedCount++;
        
        try {
          console.log(`${LOG_PREFIX} Calling AI to analyze image for ${m.id}...`);
          const aiResult = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Extract: 1. Username, 2. Review Text, 3. Rating (1-5). Return JSON." },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              }
            ],
            outputSchema: {
              name: "extract",
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

          let aiContent = aiResult.choices[0].message.content as string;
          console.log(`${LOG_PREFIX} AI Raw Response for ${m.id}: ${aiContent}`);

          if (aiContent.includes("```json")) aiContent = aiContent.split("```json")[1].split("```")[0].trim();
          else if (aiContent.includes("```")) aiContent = aiContent.split("```")[1].split("```")[0].trim();
          
          const extracted = JSON.parse(aiContent);
          console.log(`${LOG_PREFIX} AI Parsed for ${m.id}:`, extracted);

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

          await createReview(newReview);
          finalReviews.push(newReview);
          console.log(`${LOG_PREFIX} Successfully saved new review ${m.id} to DB.`);
        } catch (e) {
          console.error(`${LOG_PREFIX} ERROR processing ${m.id} with AI:`, e);
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

      // Merge and sort
      const finalMap = new Map();
      dbReviews.forEach(r => finalMap.set(r.discordMessageId, r));
      finalReviews.forEach(r => finalMap.set(r.discordMessageId, r));

      const result = Array.from(finalMap.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      console.log(`${LOG_PREFIX} >>> SYNC FINISHED. Total: ${result.length} | New: ${newProcessedCount} <<<`);
      return result;
        
    } catch (error) {
      console.error(`${LOG_PREFIX} CRITICAL ERROR in sync:`, error);
      return await getAllReviews();
    }
  }),

  getStats: publicProcedure.query(async () => {
    return { totalReviews: 200, averageRating: 5.0, memberCount: 2000 };
  }),

  partners: publicProcedure.query(async () => {
    try {
      const messages = await fetchDiscordPartners();
      return messages.map(m => {
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
    } catch (e) { return []; }
  }),

  featuredClients: publicProcedure.query(async () => {
    const ICON = "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico";
    return [
      { id: "m1", name: "TRG", username: "trg", avatar: null, serverIcon: ICON, inviteLink: "https://discord.gg/trg", platform: 'discord' },
      { id: "m2", name: "D7MX", username: "d7mx", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/d7mx", platform: 'kick' },
      { id: "m3", name: "IAZUZ", username: "iazuz", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/iazuz", platform: 'kick' },
      { id: "m4", name: "IHIMO", username: "ihimo", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/ihimo", platform: 'kick' },
      { id: "m5", name: "II3LI", username: "ii3li", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/ii3li", platform: 'kick' },
      { id: "m6", name: "2MZX", username: "2mzx", avatar: null, serverIcon: "https://kick.com/favicon.ico", inviteLink: "https://kick.com/2mzx", platform: 'kick' },
      { id: "m7", name: "L1T", username: "l1t", avatar: null, serverIcon: ICON, inviteLink: "https://discord.gg/l1t", platform: 'discord' },
      { id: "m8", name: "VE", username: "ve", avatar: null, serverIcon: ICON, inviteLink: "https://discord.gg/ve", platform: 'discord' },
      { id: "m9", name: "CMP", username: "cmp", avatar: null, serverIcon: ICON, inviteLink: "https://discord.gg/CMP", platform: 'discord' },
      { id: "m10", name: "S1S", username: "s1s", avatar: null, serverIcon: ICON, inviteLink: "https://discord.gg/s1s", platform: 'discord' },
    ];
  }),
});
