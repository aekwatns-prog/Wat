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

describe("categories.list", () => {
  it("should return all categories for public users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.list();

    expect(Array.isArray(result)).toBe(true);
    // Categories should have required fields
    result.forEach((category) => {
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("slug");
    });
  });
});

describe("categories.getBySlug", () => {
  it("should return a category by slug", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // First get all categories
    const categories = await caller.categories.list();
    
    if (categories.length > 0) {
      const firstCategory = categories[0];
      const result = await caller.categories.getBySlug({ slug: firstCategory.slug });

      expect(result).toBeDefined();
      expect(result?.slug).toBe(firstCategory.slug);
    }
  });

  it("should return undefined for non-existent slug", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.getBySlug({ slug: "non-existent-slug-12345" });

    expect(result).toBeUndefined();
  });
});

describe("categories.create", () => {
  it("should allow admins to create categories", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const timestamp = Date.now();
    const categoryData = {
      name: "Test Category " + timestamp,
      slug: "test-category-" + timestamp,
      description: "A test category",
    };

    const result = await caller.categories.create(categoryData);

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should prevent non-admin users from creating categories", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const categoryData = {
      name: "Test Category",
      slug: "test-category",
      description: "A test category",
    };

    await expect(caller.categories.create(categoryData)).rejects.toThrow();
  });

  it("should require authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const categoryData = {
      name: "Test Category",
      slug: "test-category",
      description: "A test category",
    };

    await expect(caller.categories.create(categoryData)).rejects.toThrow();
  });
});
