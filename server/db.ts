import { eq, desc, and, like, or, sql, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, InsertCategory, articles, InsertArticle, comments, InsertComment, articleViews, InsertArticleView, likes, InsertLike } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "bio", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; avatarUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
}

// ========== Categories ==========

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(categories).values(data);
  return Number(result[0].insertId);
}

// ========== Articles ==========

export async function createArticle(data: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(articles).values(data);
  return Number(result[0].insertId);
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      article: articles,
      author: users,
      category: categories,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (result.length === 0) return undefined;

  return {
    ...result[0].article,
    author: result[0].author,
    category: result[0].category,
  };
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      article: articles,
      author: users,
      category: categories,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  if (result.length === 0) return undefined;

  return {
    ...result[0].article,
    author: result[0].author,
    category: result[0].category,
  };
}

export async function getPublishedArticles(params?: {
  categoryId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { categoryId, search, limit = 20, offset = 0 } = params || {};

  let query = db
    .select({
      article: articles,
      author: users,
      category: categories,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.status, "published"))
    .$dynamic();

  if (categoryId) {
    query = query.where(eq(articles.categoryId, categoryId));
  }

  if (search) {
    query = query.where(
      or(
        like(articles.title, `%${search}%`),
        like(articles.excerpt, `%${search}%`)
      )
    );
  }

  const result = await query
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  return result.map((row) => ({
    ...row.article,
    author: row.author,
    category: row.category,
  }));
}

export async function getArticlesByAuthor(authorId: number, includesDrafts = false) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      article: articles,
      author: users,
      category: categories,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.authorId, authorId))
    .$dynamic();

  if (!includesDrafts) {
    query = query.where(eq(articles.status, "published"));
  }

  const result = await query.orderBy(desc(articles.createdAt));

  return result.map((row) => ({
    ...row.article,
    author: row.author,
    category: row.category,
  }));
}

export async function updateArticle(id: number, data: Partial<InsertArticle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(articles).set(data).where(eq(articles.id, id));
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(articles).where(eq(articles.id, id));
}

export async function incrementArticleViews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, id));
}

// ========== Comments ==========

export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(comments).values(data);
  return Number(result[0].insertId);
}

export async function getCommentsByArticleId(articleId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      comment: comments,
      author: users,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.articleId, articleId))
    .orderBy(desc(comments.createdAt));

  return result.map((row) => ({
    ...row.comment,
    author: row.author,
  }));
}

export async function deleteComment(id: number, authorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(comments).where(and(eq(comments.id, id), eq(comments.authorId, authorId)));
}

// ========== Article Views ==========

export async function trackArticleView(data: InsertArticleView) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(articleViews).values(data);
}

export async function getPopularArticles(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      article: articles,
      author: users,
      category: categories,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.viewCount))
    .limit(limit);

  return result.map((row) => ({
    ...row.article,
    author: row.author,
    category: row.category,
  }));
}

// ========== Likes ==========

export async function toggleArticleLike(articleId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingLike = await db
    .select()
    .from(likes)
    .where(and(eq(likes.articleId, articleId), eq(likes.userId, userId)))
    .limit(1);

  if (existingLike.length > 0) {
    await db
      .delete(likes)
      .where(and(eq(likes.articleId, articleId), eq(likes.userId, userId)));
    return false;
  } else {
    await db.insert(likes).values({ articleId, userId });
    return true;
  }
}

export async function getArticleLikeCount(articleId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(likes)
    .where(eq(likes.articleId, articleId));

  return Number(result[0]?.count) || 0;
}

export async function getUserLikedArticles(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ articleId: likes.articleId })
    .from(likes)
    .where(eq(likes.userId, userId));

  return result.map((row) => row.articleId);
}

export async function getRelatedArticles(articleId: number, limit = 5) {
  const db = await getDb();
  if (!db) return [];

  const article = await db
    .select({ categoryId: articles.categoryId })
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article[0]?.categoryId) return [];

  const result = await db
    .select({
      article: articles,
      author: users,
      category: categories,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      and(
        eq(articles.categoryId, article[0].categoryId),
        sql`${articles.id} != ${articleId}`,
        eq(articles.status, "published")
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  return result.map((row) => ({
    ...row.article,
    author: row.author,
    category: row.category,
  }));
}
