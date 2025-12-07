import { Link } from "wouter";
import { Calendar, User as UserIcon, Eye } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImageUrl?: string | null;
    publishedAt?: Date | null;
    viewCount: number;
    author?: {
      name: string | null;
    } | null;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const publishDate = article.publishedAt
    ? format(new Date(article.publishedAt), "d MMMM yyyy", { locale: th })
    : null;

  if (featured) {
    return (
      <Link href={`/article/${article.slug}`}>
        <a className="block group">
          <div className="grid md:grid-cols-2 gap-8 items-center elegant-card">
            {/* Image */}
            {article.coverImageUrl && (
              <div className="magazine-image aspect-[4/3] md:aspect-[3/2]">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="space-y-4">
              {article.category && (
                <span className="label-caps text-accent">{article.category.name}</span>
              )}
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight group-hover:text-accent transition-colors">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="text-lg text-muted-foreground line-clamp-3">{article.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-sans">
                {article.author?.name && (
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {article.author.name}
                  </span>
                )}
                {publishDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {publishDate}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.viewCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`}>
      <a className="block group">
        <article className="elegant-card">
          {/* Image */}
          {article.coverImageUrl && (
            <div className="magazine-image aspect-[4/3] mb-4">
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="space-y-3">
            {article.category && (
              <span className="label-caps text-accent">{article.category.name}</span>
            )}
            <h3 className="font-display text-2xl font-bold leading-tight group-hover:text-accent transition-colors">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-muted-foreground line-clamp-2">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
              {article.author?.name && (
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {article.author.name}
                </span>
              )}
              {publishDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {publishDate}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.viewCount.toLocaleString()}
              </span>
            </div>
          </div>
        </article>
      </a>
    </Link>
  );
}
