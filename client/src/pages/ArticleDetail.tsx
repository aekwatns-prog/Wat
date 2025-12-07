import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Calendar, User as UserIcon, Eye, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Link, useRoute } from "wouter";
import { Streamdown } from "streamdown";
import CommentSection from "@/components/CommentSection";
import AudioPlayer from "@/components/AudioPlayer";
import LikeButton from "@/components/LikeButton";
import RelatedArticles from "@/components/RelatedArticles";

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug || "";

  const { data: article, isLoading, error } = trpc.articles.getBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="section-spacing">
          <div className="container max-w-4xl">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-muted w-3/4"></div>
              <div className="h-64 bg-muted"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted"></div>
                <div className="h-4 bg-muted"></div>
                <div className="h-4 bg-muted w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="section-spacing">
          <div className="container max-w-4xl text-center">
            <h1 className="font-display text-4xl font-bold mb-4">ไม่พบบทความ</h1>
            <p className="text-muted-foreground mb-8">บทความที่คุณกำลังมองหาอาจถูกลบหรือไม่มีอยู่</p>
            <Link href="/articles">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับไปหน้าบทความ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const publishDate = article.publishedAt
    ? format(new Date(article.publishedAt), "d MMMM yyyy", { locale: th })
    : null;

  return (
    <div className="min-h-screen">
      <Navigation />

      <article className="section-spacing">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Link href="/articles">
            <Button variant="ghost" className="mb-8 font-sans">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
          </Link>

          {/* Category */}
          {article.category && (
            <div className="mb-6">
              <span className="label-caps text-accent">{article.category.name}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-8 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-12 pb-8 border-b border-border/30">
            {article.author && (
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans text-sm">{article.author.name}</span>
              </div>
            )}
            {publishDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-sans text-sm">{publishDate}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <span className="font-sans text-sm">{article.viewCount.toLocaleString()} ครั้งดู</span>
            </div>
          </div>

          {/* Cover Image */}
          {article.coverImageUrl && (
            <div className="magazine-image aspect-video mb-12">
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <div className="mb-8">
              <p className="text-xl text-muted-foreground italic border-l-4 border-accent pl-6">
                {article.excerpt}
              </p>
            </div>
          )}

          {/* Audio Player */}
          <div className="mb-12">
            <AudioPlayer text={article.content} title={article.title} />
          </div>

          {/* Content */}
          <div className="article-content mb-16">
            <Streamdown>{article.content}</Streamdown>
          </div>

          {/* Like Button */}
          <div className="border-t border-border/30 pt-8 mb-8">
            <LikeButton articleId={article.id} />
          </div>

          {/* Author Info */}
          {article.author && (
            <div className="border-t border-border/30 pt-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-sans text-sm text-muted-foreground mb-1">เขียนโดย</p>
                  <h3 className="font-display text-2xl font-bold">{article.author.name}</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles */}
      <section className="section-spacing border-t border-border/30">
        <div className="container max-w-4xl">
          <RelatedArticles articleId={article.id} limit={3} />
        </div>
      </section>

      {/* Comments Section */}
      <section className="border-t border-border/30 py-16">
        <div className="container max-w-4xl">
          <CommentSection articleId={article.id} />
        </div>
      </section>
    </div>
  );
}
