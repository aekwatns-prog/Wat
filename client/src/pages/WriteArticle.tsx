import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Eye, ArrowLeft, ImageIcon } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function WriteArticle() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/write/:id");
  const articleId = params?.id ? parseInt(params.id) : undefined;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: existingArticle, isLoading: articleLoading } = trpc.articles.getById.useQuery(
    { id: articleId! },
    { enabled: !!articleId }
  );

  const createMutation = trpc.articles.create.useMutation();
  const updateMutation = trpc.articles.update.useMutation();
  const uploadMutation = trpc.upload.image.useMutation();

  // Load existing article data
  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setSlug(existingArticle.slug);
      setExcerpt(existingArticle.excerpt || "");
      setContent(existingArticle.content);
      setCoverImageUrl(existingArticle.coverImageUrl || "");
      setCategoryId(existingArticle.categoryId?.toString() || "");
      setStatus(existingArticle.status);
    }
  }, [existingArticle]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!articleId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlug(generatedSlug);
    }
  }, [title, articleId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, authLoading]);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        const result = await uploadMutation.mutateAsync({
          base64,
          filename: file.name,
          contentType: file.type,
        });

        setCoverImageUrl(result.url);
        toast.success("อัปโหลดรูปภาพปกสำเร็จ");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      setIsUploading(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!title.trim()) {
      toast.error("กรุณากรอกหัวข้อบทความ");
      return;
    }

    if (!content.trim()) {
      toast.error("กรุณากรอกเนื้อหาบทความ");
      return;
    }

    try {
      const articleData = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/\s+/g, "-"),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        coverImageUrl: coverImageUrl || undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        status: publishNow ? ("published" as const) : status,
      };

      if (articleId) {
        await updateMutation.mutateAsync({
          id: articleId,
          ...articleData,
        });
        toast.success(publishNow ? "เผยแพร่บทความสำเร็จ" : "บันทึกบทความสำเร็จ");
      } else {
        const result = await createMutation.mutateAsync(articleData);
        toast.success(publishNow ? "เผยแพร่บทความสำเร็จ" : "บันทึกบทความสำเร็จ");
        setLocation(`/write/${result.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    }
  };

  if (authLoading || (articleId && articleLoading)) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="section-spacing">
          <div className="container max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted w-1/2"></div>
              <div className="h-64 bg-muted"></div>
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
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => setLocation("/my-articles")} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
              <h1 className="font-display text-4xl font-bold">
                {articleId ? "แก้ไขบทความ" : "เขียนบทความใหม่"}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave(false)} disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                บันทึกร่าง
              </Button>
              <Button onClick={() => handleSave(true)} disabled={createMutation.isPending || updateMutation.isPending}>
                <Eye className="w-4 h-4 mr-2" />
                เผยแพร่
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div>
              <Label htmlFor="cover-image" className="font-sans">
                รูปภาพปก
              </Label>
              <div className="mt-2">
                {coverImageUrl ? (
                  <div className="relative aspect-video magazine-image mb-4">
                    <img
                      src={coverImageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setCoverImageUrl("")}
                    >
                      ลบ
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="cover-image"
                    className="flex items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors"
                  >
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground font-sans">
                        {isUploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูปภาพปก"}
                      </p>
                    </div>
                  </label>
                )}
                <input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageUpload}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="font-sans">
                หัวข้อบทความ *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="หัวข้อบทความที่น่าสนใจ..."
                className="mt-2 text-2xl font-display font-bold"
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug" className="font-sans">
                Slug (URL)
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-slug"
                className="mt-2 font-sans"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="font-sans">
                หมวดหมู่
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-2 font-sans">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt" className="font-sans">
                สรุปย่อ
              </Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="สรุปสั้นๆ เกี่ยวกับบทความนี้..."
                className="mt-2 font-serif"
                rows={3}
              />
            </div>

            {/* Content */}
            <div>
              <Label className="font-sans">เนื้อหาบทความ *</Label>
              <div className="mt-2">
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
