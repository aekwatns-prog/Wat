import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { User as UserIcon, Trash2, MessageSquare } from "lucide-react";
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

interface CommentSectionProps {
  articleId: number;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const utils = trpc.useUtils();

  const { data: comments, isLoading } = trpc.comments.list.useQuery({ articleId });
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ articleId });
      setCommentText("");
      toast.success("เพิ่มความคิดเห็นสำเร็จ");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ articleId });
      toast.success("ลบความคิดเห็นสำเร็จ");
    },
    onError: (error) => {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error("กรุณากรอกความคิดเห็น");
      return;
    }

    await createMutation.mutateAsync({
      articleId,
      content: commentText.trim(),
    });
  };

  const handleDelete = async (commentId: number) => {
    await deleteMutation.mutateAsync({ id: commentId });
  };

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      {isAuthenticated ? (
        <div>
          <h3 className="font-display text-2xl font-bold mb-4">แสดงความคิดเห็น</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="แบ่งปันความคิดเห็นของคุณ..."
              rows={4}
              className="font-serif"
            />
            <Button type="submit" disabled={createMutation.isPending} className="font-sans">
              <MessageSquare className="w-4 h-4 mr-2" />
              ส่งความคิดเห็น
            </Button>
          </form>
        </div>
      ) : (
        <div className="text-center p-8 border border-border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4 font-sans">
            เข้าสู่ระบบเพื่อแสดงความคิดเห็น
          </p>
          <Button onClick={() => (window.location.href = getLoginUrl())} className="font-sans">
            เข้าสู่ระบบ
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div>
        <h3 className="font-display text-2xl font-bold mb-6">
          ความคิดเห็น ({comments?.length || 0})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-6 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="h-4 bg-muted w-32"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted w-full"></div>
                  <div className="h-4 bg-muted w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => {
              const commentDate = format(new Date(comment.createdAt), "d MMM yyyy · HH:mm", {
                locale: th,
              });
              const isOwner = user?.id === comment.authorId;

              return (
                <div key={comment.id} className="p-6 border border-border rounded-lg bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-sans font-medium">{comment.author?.name || "ผู้ใช้"}</p>
                        <p className="text-sm text-muted-foreground font-sans">{commentDate}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบความคิดเห็น</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ว่าต้องการลบความคิดเห็นนี้?
                              การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(comment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              ลบความคิดเห็น
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-border rounded-lg bg-muted/10">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground font-sans">ยังไม่มีความคิดเห็น</p>
          </div>
        )}
      </div>
    </div>
  );
}
