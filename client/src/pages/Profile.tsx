import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, User as UserIcon, ImageIcon } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("อัปเดตโปรไฟล์สำเร็จ");
      // Refresh user data
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const uploadMutation = trpc.upload.image.useMutation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setAvatarUrl(result.url);
        toast.success("อัปโหลดรูปโปรไฟล์สำเร็จ");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("กรุณากรอกชื่อ");
      return;
    }

    await updateMutation.mutateAsync({
      name: name.trim(),
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl || undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="section-spacing">
          <div className="container max-w-2xl">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted w-1/3"></div>
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
        <div className="container max-w-2xl">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold mb-2">โปรไฟล์ของฉัน</h1>
            <p className="text-muted-foreground">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div>
              <Label className="font-sans">รูปโปรไฟล์</Label>
              <div className="mt-2 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer font-sans"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {isUploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปภาพ"}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarUrl("")}
                      className="ml-2"
                    >
                      ลบ
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name" className="font-sans">
                ชื่อ *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อของคุณ"
                className="mt-2 font-sans"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <Label htmlFor="email" className="font-sans">
                อีเมล
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="mt-2 font-sans bg-muted"
              />
              <p className="text-sm text-muted-foreground mt-1 font-sans">
                อีเมลไม่สามารถเปลี่ยนแปลงได้
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="font-sans">
                ประวัติย่อ
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="เล่าเกี่ยวกับตัวคุณ..."
                className="mt-2 font-serif"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={updateMutation.isPending}
              className="font-sans"
            >
              <Save className="w-4 h-4 mr-2" />
              บันทึกการเปลี่ยนแปลง
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
