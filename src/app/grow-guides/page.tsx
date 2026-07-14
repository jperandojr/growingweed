import Link from "next/link";
import { getAllPosts } from "@/data/blog";
import { PostCover } from "@/components/PostCover";
import { JsonLd } from "@/components/JsonLd";
import { itemListSchema } from "@/lib/schema";

export const metadata = {
  title: "Grow Guides & Blog — GrowingWeed",
  description: "Cannabis growing guides, strain reviews, and industry news to help you grow better.",
};

// Re-checked periodically so newly-due scheduled posts appear without a redeploy.
export const revalidate = 1800;

export default function GrowGuidesPage() {
  const blogPosts = getAllPosts();
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <JsonLd
        data={itemListSchema(
          "Grow Guides & Blog",
          blogPosts.map((p) => ({ name: p.title, path: `/${p.slug}` }))
        )}
      />
      <h1 className="mb-2 text-2xl font-bold text-neutral-900 sm:text-3xl">Grow Guides &amp; Blog</h1>
      <p className="mb-8 max-w-2xl text-sm text-neutral-500">
        Everything you need to know about growing cannabis, from beginner basics to advanced
        techniques, plus the latest strain reviews and industry news.
      </p>
      {blogPosts.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-200 p-16 text-center text-sm text-neutral-400">
          No guides published yet — new articles are on the way.
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            href={`/${post.slug}`}
            className="group rounded-xl border border-neutral-100 bg-white overflow-hidden hover:shadow-lg transition"
          >
            <PostCover image={post.image} hue={post.hue} className="aspect-[16/9] w-full" iconClassName="w-10 h-10" />
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                {post.category}
              </p>
              <h2 className="mt-1 text-base font-semibold text-neutral-900 group-hover:text-emerald-700">
                {post.title}
              </h2>
              <p className="mt-1.5 text-sm text-neutral-500">{post.excerpt}</p>
              <p className="mt-3 text-xs text-neutral-400">
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {post.readTime}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
