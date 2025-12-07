import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ========== Categories ==========
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCategoryBySlug(input.slug);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          slug: z.string().min(1).max(100),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create categories" });
        }

        const categoryId = await db.createCategory(input);
        return { id: categoryId };
      }),
  }),

  // ========== Articles ==========
  articles: router({
    list: publicProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return await db.getPublishedArticles(input);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input, ctx }) => {
        const article = await db.getArticleBySlug(input.slug);
        
        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
        }

        // Track view
        if (article.status === "published") {
          await db.incrementArticleViews(article.id);
          await db.trackArticleView({
            articleId: article.id,
            userId: ctx.user?.id,
          });
        }

        return article;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getArticleById(input.id);
      }),

    myArticles: protectedProcedure.query(async ({ ctx }) => {
      return await db.getArticlesByAuthor(ctx.user.id, true);
    }),

    popular: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
      .query(async ({ input }) => {
        return await db.getPopularArticles(input.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(500),
          slug: z.string().min(1).max(500),
          excerpt: z.string().optional(),
          content: z.string().min(1),
          coverImageUrl: z.string().optional(),
          categoryId: z.number().optional(),
          status: z.enum(["draft", "published"]).default("draft"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const articleData = {
          ...input,
          authorId: ctx.user.id,
          publishedAt: input.status === "published" ? new Date() : undefined,
        };

        const articleId = await db.createArticle(articleData);
        return { id: articleId };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(500).optional(),
          slug: z.string().min(1).max(500).optional(),
          excerpt: z.string().optional(),
          content: z.string().min(1).optional(),
          coverImageUrl: z.string().optional(),
          categoryId: z.number().optional(),
          status: z.enum(["draft", "published"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;

        const article = await db.getArticleById(id);
        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
        }

        if (article.authorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own articles" });
        }

        // Set publishedAt when changing from draft to published
        const finalData: any = { ...updateData };
        if (updateData.status === "published" && article.status === "draft") {
          finalData.publishedAt = new Date();
        }

        await db.updateArticle(id, finalData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const article = await db.getArticleById(input.id);
        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
        }

        if (article.authorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own articles" });
        }

        await db.deleteArticle(input.id);
        return { success: true };
      }),
  }),

  // ========== Comments ==========
  comments: router({
    list: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommentsByArticleId(input.articleId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          articleId: z.number(),
          content: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const commentId = await db.createComment({
          ...input,
          authorId: ctx.user.id,
        });
        return { id: commentId };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteComment(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ========== User Profile ==========
  user: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255).optional(),
          bio: z.string().max(1000).optional(),
          avatarUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ========== Upload ==========
  upload: router({
    image: protectedProcedure
      .input(
        z.object({
          base64: z.string(),
          filename: z.string(),
          contentType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Convert base64 to buffer
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Generate unique filename
        const ext = input.filename.split(".").pop() || "jpg";
        const uniqueFilename = `${ctx.user.id}-${nanoid()}.${ext}`;
        const fileKey = `articles/${uniqueFilename}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.contentType);

        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
