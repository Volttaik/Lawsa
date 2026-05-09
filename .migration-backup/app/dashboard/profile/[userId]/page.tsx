export const dynamic = "force-dynamic";
import { getUserById, getPosts } from "@/lib/queries";
import ProfileClient from "./ProfileClient";
import { Post } from "@/types";

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const [profile, postsData] = await Promise.all([
    getUserById(userId),
    getPosts({ authorId: userId }, 0, 30),
  ]);

  if (!profile) {
    return (
      <div className="max-w-[600px] mx-auto border-x border-[#2f3336] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const validPosts = (postsData || []).filter((p): p is any => p !== null) as Post[];

  return (
    <ProfileClient
      profile={profile}
      initialPosts={validPosts}
    />
  );
}
