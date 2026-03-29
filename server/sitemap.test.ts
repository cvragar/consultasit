import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock getDb
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock drizzle schema
vi.mock("../drizzle/schema", () => ({
  specialCases: { name: "special_cases" },
  documents: { name: "documents" },
}));

import { getDb } from "./db";

describe("Sitemap Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export a sitemapRouter", async () => {
    const { sitemapRouter } = await import("./sitemap");
    expect(sitemapRouter).toBeDefined();
    expect(typeof sitemapRouter).toBe("function"); // Express Router is a function
  });

  it("should have GET /sitemap.xml route registered", async () => {
    const { sitemapRouter } = await import("./sitemap");
    // Express router stores routes in stack
    const routes = sitemapRouter.stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));
    
    const sitemapRoute = routes.find((r: any) => r.path === "/sitemap.xml");
    expect(sitemapRoute).toBeDefined();
    expect(sitemapRoute!.methods).toContain("get");
  });

  it("should generate valid XML with correct structure", async () => {
    // Mock db to return dates
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockResolvedValue([{ maxDate: "2026-03-28T10:00:00.000Z" }]),
    };
    (getDb as any).mockResolvedValue(mockDb);

    // Import and test the route handler
    const { sitemapRouter } = await import("./sitemap");
    
    // Create mock req/res
    const mockRes = {
      set: vi.fn().mockReturnThis(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    const mockReq = { originalUrl: "/sitemap.xml" };
    const mockNext = vi.fn();

    // Find the route handler
    const layer = sitemapRouter.stack.find(
      (l: any) => l.route && l.route.path === "/sitemap.xml"
    );
    const handler = layer?.route?.stack[0]?.handle;
    
    if (handler) {
      await handler(mockReq, mockRes, mockNext);
      
      // Should set XML content type
      expect(mockRes.set).toHaveBeenCalledWith(
        "Content-Type",
        "application/xml; charset=utf-8"
      );
      
      // Should send XML content
      const xmlContent = mockRes.send.mock.calls[0][0];
      expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xmlContent).toContain("<urlset");
      expect(xmlContent).toContain("https://consultesit.com/");
      expect(xmlContent).toContain("https://consultesit.com/casos-especials");
      expect(xmlContent).toContain("https://consultesit.com/documents");
      expect(xmlContent).toContain("https://consultesit.com/calculadora");
      expect(xmlContent).toContain("https://consultesit.com/reclamacions");
      expect(xmlContent).toContain("https://consultesit.com/novetats");
      expect(xmlContent).toContain('hreflang="ca"');
      expect(xmlContent).toContain('hreflang="es"');
      expect(xmlContent).toContain("<lastmod>");
      expect(xmlContent).toContain("<changefreq>");
      expect(xmlContent).toContain("<priority>");
    }
  });

  it("should handle database errors gracefully", async () => {
    (getDb as any).mockResolvedValue(null);

    const { sitemapRouter } = await import("./sitemap");
    
    const mockRes = {
      set: vi.fn().mockReturnThis(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    const mockReq = { originalUrl: "/sitemap.xml" };
    const mockNext = vi.fn();

    const layer = sitemapRouter.stack.find(
      (l: any) => l.route && l.route.path === "/sitemap.xml"
    );
    const handler = layer?.route?.stack[0]?.handle;
    
    if (handler) {
      await handler(mockReq, mockRes, mockNext);
      
      // Should return 500 error
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("Error generating sitemap");
    }
  });

  it("should include all 6 public routes", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockResolvedValue([{ maxDate: "2026-03-28T10:00:00.000Z" }]),
    };
    (getDb as any).mockResolvedValue(mockDb);

    const { sitemapRouter } = await import("./sitemap");
    
    const mockRes = {
      set: vi.fn().mockReturnThis(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    const mockReq = { originalUrl: "/sitemap.xml" };
    const mockNext = vi.fn();

    const layer = sitemapRouter.stack.find(
      (l: any) => l.route && l.route.path === "/sitemap.xml"
    );
    const handler = layer?.route?.stack[0]?.handle;
    
    if (handler) {
      await handler(mockReq, mockRes, mockNext);
      const xmlContent = mockRes.send.mock.calls[0][0];
      
      // Count <url> tags - should be exactly 6
      const urlCount = (xmlContent.match(/<url>/g) || []).length;
      expect(urlCount).toBe(6);
    }
  });

  it("should set cache headers for 1 hour", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockResolvedValue([{ maxDate: "2026-03-28T10:00:00.000Z" }]),
    };
    (getDb as any).mockResolvedValue(mockDb);

    const { sitemapRouter } = await import("./sitemap");
    
    const mockRes = {
      set: vi.fn().mockReturnThis(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    const mockReq = { originalUrl: "/sitemap.xml" };
    const mockNext = vi.fn();

    const layer = sitemapRouter.stack.find(
      (l: any) => l.route && l.route.path === "/sitemap.xml"
    );
    const handler = layer?.route?.stack[0]?.handle;
    
    if (handler) {
      await handler(mockReq, mockRes, mockNext);
      expect(mockRes.set).toHaveBeenCalledWith(
        "Cache-Control",
        "public, max-age=3600"
      );
    }
  });
});
