
// Using built-in fetch
import dotenv from "dotenv";

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const REVIEWS_CHANNEL = "1384289587718918365";
const PARTNERS_CHANNEL = "1400841587977621604";

async function debug() {
    console.log("Checking Discord Connection...");
    console.log("Token exists:", !!DISCORD_TOKEN);
    
    if (!DISCORD_TOKEN) return;

    const channels = [REVIEWS_CHANNEL, PARTNERS_CHANNEL];
    
    for (const channelId of channels) {
        console.log(`\n--- Testing Channel: ${channelId} ---`);
        try {
            const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=5`, {
                headers: { Authorization: `Bot ${DISCORD_TOKEN}` }
            });
            
            if (!res.ok) {
                const error = await res.json();
                console.error(`Error fetching channel ${channelId}:`, error);
                continue;
            }
            
            const messages = await res.json();
            console.log(`Successfully fetched ${messages.length} messages from ${channelId}`);
            if (messages.length > 0) {
                console.log("Sample Message Content:", messages[0].content || "No content (maybe embed)");
                if (messages[0].embeds?.length > 0) {
                    console.log("Sample Embed Title:", messages[0].embeds[0].title);
                }
            }
        } catch (err) {
            console.error(`Failed to fetch ${channelId}:`, err);
        }
    }
}

debug();
