import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `sample-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Sample User ${userId}`,
    loginMethod: "manus",
    role: "user",
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

describe("likes", () => {
  it("should toggle like on article", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // First toggle should add like
    const result1 = await caller.likes.toggle({ articleId: 1 });
    expect(result1.liked).toBe(true);

    // Second toggle should remove like
    const result2 = await caller.likes.toggle({ articleId: 1 });
    expect(result2.liked).toBe(false);
  });

  it("should get like count for article", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);

    const result = await caller.likes.getCount({ articleId: 1 });
    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  it("should get user liked articles", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.likes.getUserLiked();
    expect(Array.isArray(result.likedArticleIds)).toBe(true);
  });
});
