export async function syncDiscordReviews() {
  console.log("[PIXEL-DEBUG-SYSTEM] بدأت عملية المزامنة...");
  
  if (!process.env.DISCORD_TOKEN) {
    console.error("[PIXEL-DEBUG-SYSTEM] خطأ: DISCORD_TOKEN ناقص في إعدادات Railway!");
    return;
  }

  try {
    const channelId = "1384289587718918365";
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=20`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }
    );

    if (!response.ok) {
      console.error(`[PIXEL-DEBUG-SYSTEM] ديسكورد رفض الدخول. الكود: ${response.status}`);
      return;
    }

    const messages = await response.json();
    console.log(`[PIXEL-DEBUG-SYSTEM] تم العثور على ${messages.length} رسالة في القناة.`);
    
  } catch (error) {
    console.error("[PIXEL-DEBUG-SYSTEM] حدث خطأ في الاتصال:", error);
  }
}
