import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { PenSquare, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function MyArticles() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: articles, isLoading } = trpc.articles.myArticles.useQuery();
  const deleteMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      utils.articles.myArticles.invalidate();
      toast.success("ลบบทความสำเร็จ");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาดในการลบบทความ");
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, authLoading]);

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="section-spacing">
          <div className="container max-w-6xl">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted w-1/3"></div>
              <div className="h-32 bg-muted"></div>
              <div className="h-32 bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="section-spacing">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">บทความของฉัน</h1>
              <p className="text-muted-foreground">จัดการบทความทั้งหมดของคุณ</p>
            </div>
            <Link href="/write">
              <Button size="lg" className="font-sans">
                <PenSquare className="w-4 h-4 mr-2" />
                เขียนบทความใหม่
              </Button>
            </Link>
          </div>

          {/* Articles List */}
          {articles && articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => {
                const publishDate = article.publishedAt
                  ? format(new Date(article.publishedAt), "d MMM yyyy", { locale: th })
                  : null;

                return (
                  <div
                    key={article.id}
                    className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow bg-card"
                  >
                    <div className="flex gap-6">
                      {/* Thumbnail */}
                      {article.coverImageUrl && (
                        <div className="w-48 h-32 flex-shrink-0 magazine-image rounded-lg overflow-hidden">
                          <img
                            src={article.coverImageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {article.category && (
                                <span className="label-caps text-accent">
                                  {article.category.name}
                                </span>
                              )}
                              <span
                                className={`label-caps ${
                                  article.status === "published"
                                    ? "text-green-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {article.status === "published" ? "เผยแพร่แล้ว" : "ร่าง"}
                              </span>
                            </div>
                            <h2 className="font-display text-2xl font-bold mb-2 line-clamp-2">
                              {article.title}
                            </h2>
                            {article.excerpt && (
                              <p className="text-muted-foreground line-clamp-2 mb-3">
                                {article.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-sans">
                              {publishDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {publishDate}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.viewCount.toLocaleString()} ครั้งดู
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {article.status === "published" && (
                              <Link href={`/article/${article.slug}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/write/${article.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>ยืนยันการลบบทความ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?
                                    การดำเนินการนี้ไม่สามารถย้อนกลับได้
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(article.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    ลบบทความ
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <PenSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-display text-2xl font-bold mb-2">ยังไม่มีบทความ</h2>
              <p className="text-muted-foreground mb-6">เริ่มต้นเขียนบทความแรกของคุณวันนี้</p>
              <Link href="/write">
                <Button size="lg" className="font-sans">
                  <PenSquare className="w-4 h-4 mr-2" />
                  เขียนบทความใหม่
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
