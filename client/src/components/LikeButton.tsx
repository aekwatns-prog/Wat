import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

interface LikeButtonProps {
  articleId: number;
  className?: string;
}

export default function LikeButton({ articleId, className = '' }: LikeButtonProps) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: countData } = trpc.likes.getCount.useQuery({ articleId });
  const { data: userLikedData } = trpc.likes.getUserLiked.useQuery(undefined, {
    enabled: !!user,
  });
  const toggleLikeMutation = trpc.likes.toggle.useMutation();

  useEffect(() => {
    if (countData) {
      setLikeCount(countData.count);
    }
  }, [countData]);

  useEffect(() => {
    if (userLikedData) {
      setIsLiked(userLikedData.likedArticleIds.includes(articleId));
    }
  }, [userLikedData, articleId]);

  const handleLikeClick = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบเพื่อกดไลค์บทความ');
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleLikeMutation.mutateAsync({ articleId });
      setIsLiked(result.liked);
      setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
      toast.success(result.liked ? 'เพิ่มไปยังรายการโปรด' : 'ลบออกจากรายการโปรด');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isLiked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Heart
        size={20}
        className={isLiked ? 'fill-current' : ''}
      />
      <span>{likeCount}</span>
    </button>
  );
}
