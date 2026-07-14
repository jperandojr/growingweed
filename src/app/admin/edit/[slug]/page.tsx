import Link from "next/link";
import { notFound } from "next/navigation";
import { getEditablePost } from "@/lib/admin-posts";
import { PostForm } from "@/components/admin/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getEditablePost(slug);
  if (!post) notFound();

  return (
    <div>
      <nav className="mb-6 text-xs text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">
          Blog Posts
        </Link>{" "}
        / Edit
      </nav>
      <h1 className="mb-8 text-2xl font-bold text-neutral-900">Edit Post</h1>
      <PostForm post={post} />
    </div>
  );
}
