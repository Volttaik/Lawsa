export const dynamic = "force-dynamic";
import { getPosts } from "@/lib/queries";
import FeedClient from "./FeedClient";
import { Post } from "@/types";

export default async function FeedPage() {
  const posts = await getPosts({}, 0, 10);
  const validPosts = (posts || []).filter((p): p is any => p !== null) as Post[];
  return <FeedClient initialPosts={validPosts} isLoggedIn={true} />;
}
