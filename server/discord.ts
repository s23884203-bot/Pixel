import { createReview, getReviewByDiscordId } from "./db";

export async function syncReviewsFromDiscord() {
  console.log("[PIXEL-DEBUG-SYSTEM] بدأت عملية المزامنة...");

  if (!process.env.DISCORD_TOKEN) {
    console.error("[PIXEL-DEBUG-SYSTEM] خطأ: DISCORD_TOKEN ناقص في إعدادات Railway!");
    return 0;
  }

  try {
    const channelId = "1384289587718918365";
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }
    );

    if (!response.ok) {
      console.error(`[PIXEL-DEBUG-SYSTEM] ديسكورد رفض الدخول. الكود: ${response.status}`);
      return 0;
    }

    const messages = await response.json();
    console.log(`[PIXEL-DEBUG-SYSTEM] تم العثور على ${messages.length} رسالة في القناة.`);

    let syncedCount = 0;
    for (const message of messages) {
      const existingReview = await getReviewByDiscordId(message.id);
      if (existingReview) {
        continue;
      }

      // تجاهل الرسائل التي لا تحتوي على تقييم
      if (!message.content || message.content.length < 10) {
        continue;
      }

      await createReview({
        discordMessageId: message.id,
        discordUserId: message.author.id,
        authorName: message.author.username,
        authorAvatar: message.author.avatar
          ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
          : null,
        content: message.content,
        rating: 5, // default rating
        timestamp: new Date(message.timestamp),
      });
      syncedCount++;
    }
    console.log(`[PIXEL-DEBUG-SYSTEM] تمت مزامنة ${syncedCount} تقييم جديد.`);
    return syncedCount;
  } catch (error) {
    console.error("[PIXEL-DEBUG-SYSTEM] حدث خطأ في الاتصال:", error);
    return 0;
  }
}

// I will keep the old function name as well to avoid breaking other parts of the app
export const syncDiscordReviews = syncReviewsFromDiscord;
