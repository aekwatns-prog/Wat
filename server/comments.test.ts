import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
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

describe("comments.list", () => {
  it("should return comments for a specific article", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.list({ articleId: 1 });

    expect(Array.isArray(result)).toBe(true);
    // All returned comments should belong to the specified article
    result.forEach((comment) => {
      expect(comment.articleId).toBe(1);
    });
  });

  it("should include author information", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comments.list({ articleId: 1 });

    result.forEach((comment) => {
      expect(comment).toHaveProperty("author");
    });
  });
});

describe("comments.create", () => {
  it("should allow authenticated users to create comments", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const commentData = {
      articleId: 1,
      content: "This is a test comment.",
    };

    const result = await caller.comments.create(commentData);

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should require authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const commentData = {
      articleId: 1,
      content: "This is a test comment.",
    };

    await expect(caller.comments.create(commentData)).rejects.toThrow();
  });

  it("should validate comment content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const commentData = {
      articleId: 1,
      content: "", // Empty content should fail
    };

    await expect(caller.comments.create(commentData)).rejects.toThrow();
  });
});

describe("comments.delete", () => {
  it("should require authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.comments.delete({ id: 1 })).rejects.toThrow();
  });

  it("should allow users to delete their own comments", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a comment
    const createResult = await caller.comments.create({
      articleId: 1,
      content: "Test comment to delete",
    });

    // Then delete it
    const deleteResult = await caller.comments.delete({ id: createResult.id });

    expect(deleteResult).toHaveProperty("success");
    expect(deleteResult.success).toBe(true);
  });
});
