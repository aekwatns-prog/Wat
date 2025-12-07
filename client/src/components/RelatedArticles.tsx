import { trpc } from '@/lib/trpc';
import ArticleCard from './ArticleCard';
import { Loader2 } from 'lucide-react';

interface RelatedArticlesProps {
  articleId: number;
  limit?: number;
}

export default function RelatedArticles({ articleId, limit = 3 }: RelatedArticlesProps) {
  const { data: relatedArticles, isLoading } = trpc.related.getByArticleId.useQuery({
    articleId,
    limit,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900">บทความที่เกี่ยวข้อง</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
