import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function Home() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ limit: 6 });
  const { data: popularArticles } = trpc.articles.popular.useQuery({ limit: 3 });

  const featuredArticle = articles?.[0];
  const recentArticles = articles?.slice(1) || [];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section with Background Image */}
      <section className="section-spacing border-b border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="/hero-cover.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight text-balance">
              เรื่องราวที่สร้างแรงบันดาลใจ
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-serif">
              แพลตฟอร์มสำหรับผู้ที่ชื่นชอบการเขียนและการอ่านบทความคุณภาพ
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/articles">
                <Button size="lg" className="font-sans">
                  สำรวจบทความ
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="section-spacing border-b border-border/30">
          <div className="container">
            <div className="mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">บทความเด่น</h2>
              <div className="w-24 h-1 bg-accent"></div>
            </div>
            <ArticleCard article={featuredArticle} featured />
          </div>
        </section>
      )}

      {/* Recent Articles Grid */}
      {recentArticles.length > 0 && (
        <section className="section-spacing border-b border-border/30">
          <div className="container">
            <div className="mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">บทความล่าสุด</h2>
              <div className="w-24 h-1 bg-accent"></div>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted aspect-[4/3] mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted w-20"></div>
                      <div className="h-8 bg-muted w-full"></div>
                      <div className="h-4 bg-muted w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <Link href="/articles">
                <Button variant="outline" size="lg" className="font-sans">
                  ดูบทความทั้งหมด
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Articles Sidebar */}
      {popularArticles && popularArticles.length > 0 && (
        <section className="section-spacing">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-accent" />
                <h2 className="font-display text-2xl md:text-3xl font-bold">บทความยอดนิยม</h2>
              </div>
              <div className="space-y-6">
                {popularArticles.map((article, index) => (
                  <Link key={article.id} href={`/article/${article.slug}`}>
                    <a className="flex gap-4 group">
                      <span className="font-display text-4xl font-bold text-muted-foreground/30 group-hover:text-accent transition-colors">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold mb-1 group-hover:text-accent transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-sans">
                          {article.viewCount.toLocaleString()} ครั้งดู
                        </p>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="container">
          <div className="text-center">
            <h3 className="font-display text-2xl font-bold mb-2">My Article</h3>
            <p className="text-sm text-muted-foreground font-sans">
              แพลตฟอร์มบล็อกสำหรับผู้สร้างสรรค์เนื้อหาคุณภาพ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
