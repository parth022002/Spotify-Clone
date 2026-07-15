"use client";

import { useEffect, useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";

interface LikeButtonProps {
  songId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ songId }) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const { user } = useUser();

  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id || !songId) {
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/songs/like?userId=${user.id}&songId=${songId}`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.liked);
        }
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };

    fetchData();
  }, [songId, user?.id]);

  const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

  const handleLike = async () => {
    if (!user) {
      return authModal.onOpen();
    }

    try {
      if (isLiked) {
        const response = await fetch("/api/songs/like", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            songId,
          }),
        });

        if (response.ok) {
          setIsLiked(false);
          toast.success("Removed from liked songs");
        } else {
          toast.error("Failed to unlike song");
        }
      } else {
        const response = await fetch("/api/songs/like", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            songId,
          }),
        });

        if (response.ok) {
          setIsLiked(true);
          toast.success("Added to liked songs!");
        } else {
          toast.error("Failed to like song");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }

    router.refresh();
  };

  return (
    <button
      className="
        cursor-pointer 
        hover:opacity-75 
        transition
      "
      onClick={handleLike}
    >
      <Icon color={isLiked ? "#22c55e" : "white"} size={25} />
    </button>
  );
};

export default LikeButton;
