
import dotenv from "dotenv";
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const REVIEWS_CHANNEL_ID = "1384289587718918365";

async function inspect() {
    console.log("--- Inspecting Discord Reviews ---");
    console.log("Token:", DISCORD_TOKEN?.substring(0, 10) + "...");

    try {
        const url = `https://discord.com/api/v10/channels/${REVIEWS_CHANNEL_ID}/messages?limit=10`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("API Error:", err);
            return;
        }

        const messages = await response.json() as any[];
        console.log(`Found ${messages.length} messages.`);

        messages.forEach((m, i) => {
            console.log(`\n[Message ${i + 1}] ID: ${m.id}`);
            console.log(`Author: ${m.author.username} (${m.author.id})`);
            console.log(`Content: "${m.content}"`);
            console.log(`Attachments: ${m.attachments?.length || 0}`);
            if (m.attachments?.length > 0) {
                console.log(`First Attachment URL: ${m.attachments[0].url}`);
            }
            console.log(`Embeds: ${m.embeds?.length || 0}`);
            if (m.embeds?.length > 0) {
                console.log(`First Embed Description: ${m.embeds[0].description || "No description"}`);
                console.log(`First Embed Image: ${m.embeds[0].image?.url || "No image"}`);
            }
        });

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

inspect();
