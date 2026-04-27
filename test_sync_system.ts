
import dotenv from "dotenv";
import { fetchDiscordReviews } from "./server/discord";
import { invokeLLM } from "./server/_core/llm";

dotenv.config();

const LOG_PREFIX = "[TEST-SYNC-DEBUG]";

async function runTest() {
    console.log(`${LOG_PREFIX} Starting Debug Test...`);
    console.log(`${LOG_PREFIX} Token exists: ${!!process.env.DISCORD_TOKEN}`);
    
    try {
        console.log(`${LOG_PREFIX} Fetching messages...`);
        const messages = await fetchDiscordReviews();
        console.log(`${LOG_PREFIX} Fetched ${messages.length} messages.`);

        if (messages.length === 0) {
            console.log(`${LOG_PREFIX} WARNING: No messages found in channel. Check channel ID and Bot permissions.`);
            return;
        }

        for (const m of messages.slice(0, 5)) {
            console.log(`\n--- Message ID: ${m.id} ---`);
            console.log(`Author: ${m.author.username}`);
            console.log(`Attachments: ${m.attachments?.length || 0}`);
            
            if (m.attachments && m.attachments.length > 0) {
                const imageUrl = m.attachments[0].url;
                console.log(`Image URL: ${imageUrl}`);
                
                if (imageUrl.toLowerCase().includes("line.png")) {
                    console.log(`Result: SKIPPED (Line separator)`);
                    continue;
                }

                console.log(`Result: TARGET (Attempting AI Extraction...)`);
                try {
                    const aiResult = await invokeLLM({
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: "Analyze this review image and extract: 1. The username. 2. The review text. 3. The star rating (1-5). Return JSON." },
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
                    console.log(`AI Response: ${aiResult.choices[0].message.content}`);
                } catch (e) {
                    console.error(`AI Error: ${e.message}`);
                }
            } else {
                console.log(`Result: SKIPPED (No attachment)`);
            }
        }
    } catch (error) {
        console.error(`${LOG_PREFIX} Critical Error:`, error);
    }
}

runTest();
