import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    bio: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("articles.list", () => {
  it("should return published articles for public users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.list({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
    // All returned articles should be published
    result.forEach((article) => {
      expect(article.status).toBe("published");
    });
  });

  it("should filter articles by category", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.list({ categoryId: 1, limit: 10 });

    expect(Array.isArray(result)).toBe(true);
    // All returned articles should belong to the specified category
    result.forEach((article) => {
      expect(article.categoryId).toBe(1);
    });
  });
});

describe("articles.create", () => {
  it("should allow authenticated users to create draft articles", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const articleData = {
      title: "Test Article",
      slug: "test-article-" + Date.now(),
      content: "This is a test article content.",
      status: "draft" as const,
    };

    const result = await caller.articles.create(articleData);

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should require authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articleData = {
      title: "Test Article",
      slug: "test-article",
      content: "This is a test article content.",
      status: "draft" as const,
    };

    await expect(caller.articles.create(articleData)).rejects.toThrow();
  });
});

describe("articles.myArticles", () => {
  it("should return articles for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.myArticles();

    expect(Array.isArray(result)).toBe(true);
    // All returned articles should belong to the authenticated user
    result.forEach((article) => {
      expect(article.authorId).toBe(ctx.user!.id);
    });
  });

  it("should require authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.articles.myArticles()).rejects.toThrow();
  });
});

describe("articles.popular", () => {
  it("should return popular articles sorted by view count", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.articles.popular({ limit: 5 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);

    // Check if sorted by view count (descending)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].viewCount).toBeGreaterThanOrEqual(result[i + 1].viewCount);
    }
  });
});
