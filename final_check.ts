
import dotenv from "dotenv";
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const REVIEWS_CHANNEL = "1384289587718918365";

async function check() {
    console.log("Token:", DISCORD_TOKEN ? "Exists" : "MISSING");
    const res = await fetch(`https://discord.com/api/v10/channels/${REVIEWS_CHANNEL}/messages?limit=10`, {
        headers: { Authorization: `Bot ${DISCORD_TOKEN}` }
    });
    
    if (!res.ok) {
        console.log("Error:", await res.json());
    } else {
        const msgs = await res.json();
        console.log(`Found ${msgs.length} messages.`);
        msgs.forEach((m: any, i: number) => {
            console.log(`[${i}] Content: ${m.content.substring(0, 20)}... | Embeds: ${m.embeds.length} | Attachments: ${m.attachments.length}`);
        });
    }
}
check();
