"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostRedirectClient({ postId }: { postId: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/?post=${postId}`);
  }, [postId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-400 text-sm">Loading post…</div>
    </div>
  );
}
