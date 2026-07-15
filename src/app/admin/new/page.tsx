import Link from "next/link";
import { PostForm } from "@/components/admin/PostForm";
import { listPlan } from "@/lib/article-plan";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planId } = await searchParams;
  const entry = planId ? (await listPlan()).find((e) => e.id === planId) : undefined;
  const brief = entry
    ? {
        planId: entry.id,
        title: entry.title,
        category: entry.chapter,
        learningObjective: entry.learningObjective,
        difficulty: entry.difficulty,
        suggestedWordCount: entry.wordCount,
        keyword: entry.keyword,
        permalink: entry.permalink,
        scheduledDate: entry.scheduledDate,
        scheduledTime: entry.scheduledTime,
      }
    : undefined;
  return (
    <div>
      <nav className="mb-6 text-xs text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">
          Blog Posts
        </Link>{" "}
        / New
      </nav>
      <h1 className="mb-8 text-2xl font-bold text-neutral-900">New Post</h1>
      <PostForm brief={brief} />
    </div>
  );
}
