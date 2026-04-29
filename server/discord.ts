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
    global_name?: string | null;
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
    image?: {
      url: string;
    };
  }>;
  attachments: Array<{
    url: string;
    proxy_url: string;
    content_type?: string;
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

export async function fetchDiscordReviews(limit = 100): Promise<DiscordMessage[]> {
  try {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error("DISCORD_TOKEN not set");
    }

    let allMessages: DiscordMessage[] = [];
    let lastId: string | null = null;
    
    // Fetch multiple pages to get more than 100 reviews
    for (let i = 0; i < 10; i++) { // Fetch up to 1000 messages for full history
        const url = `${DISCORD_API_BASE}/channels/${REVIEWS_CHANNEL_ID}/messages?limit=100${lastId ? `&before=${lastId}` : ''}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bot ${token}`,
            },
        });

        if (!response.ok) break;

        const messages = (await response.json()) as DiscordMessage[];
        if (messages.length === 0) break;

        allMessages = [...allMessages, ...messages];
        lastId = messages[messages.length - 1].id;
        if (messages.length < 100) break;
    }

    return allMessages;
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

export type FeaturedClientPlatform = "discord" | "kick";

const DISCORD_FALLBACK_ICON = "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico";
const KICK_FALLBACK_ICON = "https://kick.com/favicon.ico";
const CLIENT_ICON_CACHE_TTL = 1000 * 60 * 60 * 6;
const clientIconCache = new Map<string, { icon: string | null; cachedAt: number }>();

function getCachedClientIcon(cacheKey: string): string | null | undefined {
  const cached = clientIconCache.get(cacheKey);
  if (!cached) return undefined;

  if (Date.now() - cached.cachedAt > CLIENT_ICON_CACHE_TTL) {
    clientIconCache.delete(cacheKey);
    return undefined;
  }

  return cached.icon;
}

function setCachedClientIcon(cacheKey: string, icon: string | null) {
  clientIconCache.set(cacheKey, { icon, cachedAt: Date.now() });
}

export function detectFeaturedClientPlatform(link: string): FeaturedClientPlatform {
  const normalized = link.toLowerCase();
  if (normalized.includes("kick.com")) return "kick";
  return "discord";
}

export function extractDiscordInviteCode(link: string): string | null {
  const trimmed = link.trim();
  const withoutQuery = trimmed.split(/[?#]/)[0];
  const match = withoutQuery.match(/(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)([a-zA-Z0-9-]+)/i);

  if (match?.[1]) return match[1];

  if (/^[a-zA-Z0-9-]+$/.test(trimmed)) return trimmed;

  return null;
}

function extractKickChannelName(link: string): string | null {
  try {
    const url = new URL(link);
    if (!url.hostname.toLowerCase().includes("kick.com")) return null;

    const [channel] = url.pathname.split("/").filter(Boolean);
    return channel || null;
  } catch {
    const match = link.match(/kick\.com\/([^/?#]+)/i);
    return match?.[1] || null;
  }
}

function extractMetaImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].replace(/&amp;/g, "&");
  }

  return null;
}

async function getKickAvatarFromLink(link: string): Promise<string | null> {
  const channelName = extractKickChannelName(link);
  if (!channelName) return null;

  const cacheKey = `kick:${channelName.toLowerCase()}`;
  const cached = getCachedClientIcon(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const response = await fetch(`https://kick.com/${channelName}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 PixelDesignBot/1.0 (+https://salla.sa/pixel.design)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      setCachedClientIcon(cacheKey, null);
      return null;
    }

    const html = await response.text();
    const image = extractMetaImage(html);
    setCachedClientIcon(cacheKey, image);
    return image;
  } catch (error) {
    console.error(`Error resolving Kick avatar for ${link}:`, error);
    setCachedClientIcon(cacheKey, null);
    return null;
  }
}

export function getFeaturedClientFallbackIcon(platform: FeaturedClientPlatform) {
  return platform === "kick" ? KICK_FALLBACK_ICON : DISCORD_FALLBACK_ICON;
}

export async function resolveFeaturedClientIcon(link: string, platform = detectFeaturedClientPlatform(link)): Promise<string> {
  const cacheKey = `${platform}:${link.toLowerCase()}`;
  const cached = getCachedClientIcon(cacheKey);
  if (cached !== undefined) return cached || getFeaturedClientFallbackIcon(platform);

  let icon: string | null = null;

  if (platform === "discord") {
    const inviteCode = extractDiscordInviteCode(link);
    icon = inviteCode ? await getServerIconFromInvite(inviteCode) : null;
  } else {
    icon = await getKickAvatarFromLink(link);
  }

  setCachedClientIcon(cacheKey, icon);
  return icon || getFeaturedClientFallbackIcon(platform);
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
      
      // If no content but has attachments, it's still a review
      const hasAttachments = message.attachments && message.attachments.length > 0;
      
      if (!existing && (content.trim().length > 0 || hasAttachments)) {
        await createReview({
          discordMessageId: message.id,
          discordUserId: message.author.id,
          authorName: message.author.username,
          authorAvatar: message.author.avatar
            ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
            : null,
          content: content.trim() || "تقييم Pixel Design",
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
