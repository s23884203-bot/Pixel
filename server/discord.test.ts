import { describe, expect, it } from "vitest";
import { validateDiscordToken } from "./discord";

describe("Discord Integration", () => {
  it("validates Discord token by fetching user info", async () => {
    const result = await validateDiscordToken();
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.id).toBeDefined();
  });
});
