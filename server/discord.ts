import { ENV } from "./_core/env";

const DISCORD_API_BASE = "https://discord.com/api/v10";
const GUILD_ID = "1195454002284990614";
const REVIEWS_CHANNEL_ID = "1384289587718918365";
const PARTNERS_CHANNEL_ID = "1400841587977621604";

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

interface DiscordMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  timestamp: string;
  embeds: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    thumbnail?: {
      url: string;
    };
  }>;
}

export async function validateDiscordToken(): Promise<{
  success: boolean;
  user?: DiscordUser;
  error?: string;
}> {
  try {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      return { success: false, error: "DISCORD_TOKEN not set" };
    }

    const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      return { success: false, error: `Discord API error: ${response.status}` };
    }

    const user = (await response.json()) as DiscordUser;
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchDiscordReviews(): Promise<DiscordMessage[]> {
  try {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error("DISCORD_TOKEN not set");
    }

    const response = await fetch(
      `${DISCORD_API_BASE}/channels/${REVIEWS_CHANNEL_ID}/messages?limit=100`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const messages = (await response.json()) as DiscordMessage[];
    return messages;
  } catch (error) {
    console.error("Error fetching Discord reviews:", error);
    return [];
  }
}

export async function getChannelInfo() {
  try {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error("DISCORD_TOKEN not set");
    }

    const response = await fetch(`${DISCORD_API_BASE}/channels/${REVIEWS_CHANNEL_ID}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch channel info: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching channel info:", error);
    return null;
  }
}

export async function fetchDiscordPartners(): Promise<DiscordMessage[]> {
  try {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error("DISCORD_TOKEN not set");
    }

    const response = await fetch(
      `${DISCORD_API_BASE}/channels/${PARTNERS_CHANNEL_ID}/messages?limit=100`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch partners: ${response.status}`);
    }

    const messages = (await response.json()) as DiscordMessage[];
    return messages;
  } catch (error) {
    console.error("Error fetching Discord partners:", error);
    return [];
  }
}

export async function getServerIconFromInvite(inviteCode: string): Promise<string | null> {
  try {
    const token = process.env.DISCORD_TOKEN;
    if (!token) return null;

    const response = await fetch(
      `${DISCORD_API_BASE}/invites/${inviteCode}?with_counts=true`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as any;
    if (data.guild && data.guild.icon) {
      return `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`;
    }
    return null;
  } catch (error) {
    console.error("Error getting server icon:", error);
    return null;
  }
}

export async function syncReviewsFromDiscord(): Promise<number> {
  try {
    const { createReview, getReviewByDiscordId } = await import("./db");
    const messages = await fetchDiscordReviews();
    let synced = 0;

    for (const message of messages) {
      const existing = await getReviewByDiscordId(message.id);
      let content = message.content || "";
      if (message.embeds && message.embeds.length > 0) {
        content = message.embeds[0].description || message.embeds[0].title || content;
      }
      
      if (!existing && content.trim().length > 0) {
        await createReview({
          discordMessageId: message.id,
          discordUserId: message.author.id,
          authorName: message.author.username,
          authorAvatar: message.author.avatar
            ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
            : null,
          content: content,
          rating: 5,
          timestamp: new Date(message.timestamp),
        });
        synced++;
      }
    }

    return synced;
  } catch (error) {
    console.error("Error syncing reviews:", error);
    return 0;
  }
}
