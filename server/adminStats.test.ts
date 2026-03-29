import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getAdminStats: vi.fn(),
}));

import { getAdminStats } from "./db";

describe("getAdminStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return totals, charts, topUsers and recentConversations", async () => {
    const mockStats = {
      totals: {
        documents: 12,
        specialCases: 26,
        users: 5,
        conversations: 30,
        messages: 150,
      },
      messagesPerDay: [
        { date: "2026-03-28", count: 10 },
        { date: "2026-03-29", count: 5 },
      ],
      conversationsPerDay: [
        { date: "2026-03-28", count: 3 },
      ],
      usersPerDay: [
        { date: "2026-03-29", count: 1 },
      ],
      topUsers: [
        { userId: 1, userName: "Dr. Test", messageCount: 50, conversationCount: 10 },
      ],
      recentConversations: [
        { id: 1, title: "Consulta IT", userName: "Dr. Test", createdAt: new Date() },
      ],
    };

    (getAdminStats as ReturnType<typeof vi.fn>).mockResolvedValue(mockStats);

    const result = await getAdminStats();

    expect(result).toBeDefined();
    expect(result.totals).toBeDefined();
    expect(result.totals.documents).toBe(12);
    expect(result.totals.specialCases).toBe(26);
    expect(result.totals.users).toBe(5);
    expect(result.totals.conversations).toBe(30);
    expect(result.totals.messages).toBe(150);
    expect(result.messagesPerDay).toHaveLength(2);
    expect(result.conversationsPerDay).toHaveLength(1);
    expect(result.usersPerDay).toHaveLength(1);
    expect(result.topUsers).toHaveLength(1);
    expect(result.topUsers[0].userName).toBe("Dr. Test");
    expect(result.recentConversations).toHaveLength(1);
  });

  it("should handle empty database gracefully", async () => {
    const emptyStats = {
      totals: {
        documents: 0,
        specialCases: 0,
        users: 0,
        conversations: 0,
        messages: 0,
      },
      messagesPerDay: [],
      conversationsPerDay: [],
      usersPerDay: [],
      topUsers: [],
      recentConversations: [],
    };

    (getAdminStats as ReturnType<typeof vi.fn>).mockResolvedValue(emptyStats);

    const result = await getAdminStats();

    expect(result.totals.documents).toBe(0);
    expect(result.totals.messages).toBe(0);
    expect(result.messagesPerDay).toHaveLength(0);
    expect(result.topUsers).toHaveLength(0);
    expect(result.recentConversations).toHaveLength(0);
  });

  it("should throw when database is unavailable", async () => {
    (getAdminStats as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Database not initialized")
    );

    await expect(getAdminStats()).rejects.toThrow("Database not initialized");
  });
});
