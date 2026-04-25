import "dotenv/config";
import { createReview, getReviewByDiscordId } from "./server/db";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const REVIEWS_CHANNEL_ID = "1384289587718918365";

async function migrate() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("DISCORD_TOKEN not found");
    return;
  }

  console.log("Starting deep migration of reviews...");
  let allMessages: any[] = [];
  let lastId: string | null = null;
  
  // Fetch up to 1000 messages to find all reviews
  for (let i = 0; i < 10; i++) {
    const url = `${DISCORD_API_BASE}/channels/${REVIEWS_CHANNEL_ID}/messages?limit=100${lastId ? `&before=${lastId}` : ""}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bot ${token}` },
    });
    
    if (!response.ok) break;
    const messages = await response.json() as any[];
    if (messages.length === 0) break;
    
    allMessages = [...allMessages, ...messages];
    lastId = messages[messages.length - 1].id;
    console.log(`Fetched ${allMessages.length} messages so far...`);
    if (messages.length < 100) break;
  }

  let syncedCount = 0;
  for (const msg of allMessages) {
    const image = msg.attachments?.[0]?.url || msg.embeds?.[0]?.image?.url;
    if (image) {
      const existing = await getReviewByDiscordId(msg.id);
      if (!existing) {
        await createReview({
          discordMessageId: msg.id,
          discordUserId: msg.author.id,
          authorName: msg.author.username,
          authorAvatar: msg.author.avatar ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png` : null,
          content: "",
          image: image,
          rating: 5,
          timestamp: new Date(msg.timestamp),
        });
        syncedCount++;
      }
    }
  }

  console.log(`Migration complete! Synced ${syncedCount} new reviews.`);
  process.exit(0);
}

migrate().catch(console.error);
