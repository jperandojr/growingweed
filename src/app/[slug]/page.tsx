import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/data/blog";
import { PostCover } from "@/components/PostCover";
import { JsonLd } from "@/components/JsonLd";
import { blogPostSchema, breadcrumbSchema } from "@/lib/schema";

// Re-checked periodically so a post whose scheduled date has just arrived
// (or one written directly on the live site) appears without a redeploy.
export const revalidate = 1800;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.metaTitle?.trim() || `${post.title} — GrowingWeed Grow Guides`,
    description: post.excerpt,
    alternates: { canonical: `/${post.slug}` },
    ...(post.keyword ? { keywords: [post.keyword] } : {}),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <JsonLd
        data={[
          blogPostSchema(post),
          breadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Grow Guides", path: "/grow-guides" },
            { name: post.title, path: `/${post.slug}` },
          ]),
        ]}
      />
      <nav className="mb-4 text-xs text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link> /{" "}
        <Link href="/grow-guides" className="hover:text-emerald-700">Grow Guides</Link> /{" "}
        {post.title}
      </nav>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {post.category}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-neutral-900">{post.title}</h1>
      <p className="mt-2 text-sm text-neutral-400">
        {new Date(post.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}{" "}
        · {post.readTime}
      </p>
      <PostCover image={post.image} hue={post.hue} className="mt-6 aspect-[16/9] w-full rounded-xl" iconClassName="w-14 h-14" />
      {post.content ? (
        <ArticleBody content={post.content} />
      ) : (
        <>
          <p className="mt-6 text-base leading-relaxed text-neutral-700">{post.excerpt}</p>
          <p className="mt-4 text-base leading-relaxed text-neutral-700">
            Growing great cannabis starts with the right genetics. Choose a strain suited to your
            climate and experience level, provide consistent light, water and nutrients, and keep a
            close eye on your plants through each stage of growth — from seedling to flowering to
            harvest. Browse our <Link href="/strains" className="text-emerald-700 hover:underline">full strain catalog</Link>{" "}
            to find seeds that match your setup, and check out our other grow guides for more tips.
          </p>
        </>
      )}
      <Link
        href="/grow-guides"
        className="mt-8 inline-block text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to Grow Guides
      </Link>
    </div>
  );
}

/** Renders article content. Supported blocks (separated by blank lines):
 *  "## " headings (auto-anchored, collected into a TOC when there are 3+),
 *  a block starting with "TL;DR" or "Key Takeaways" (styled key-takeaways box),
 *  "- " bullet lists, and paragraphs with [label](/path) inline links. */
function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function ArticleBody({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const headings = blocks.filter((b) => b.startsWith("## ")).map((b) => b.slice(3));
  const firstHeadingIdx = blocks.findIndex((b) => b.startsWith("## "));
  const showToc = headings.length >= 3;

  const toc = showToc ? (
    <nav
      key="toc"
      aria-label="Table of contents"
      className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50 px-5 py-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
        In this guide
      </p>
      <ol className="mt-2 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
        {headings.map((h) => (
          <li key={h}>
            <a href={`#${headingId(h)}`} className="text-neutral-600 hover:text-emerald-700">
              {h}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  ) : null;

  const renderBlock = (block: string, i: number) => {
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-6 mb-2 text-base font-bold text-neutral-900">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("## ")) {
      const text = block.slice(3);
      return (
        <h2
          key={i}
          id={headingId(text)}
          className="mt-8 mb-3 scroll-mt-24 text-xl font-bold text-neutral-900"
        >
          {text}
        </h2>
      );
    }
    const lines = block.split("\n").map((l) => l.trim());
    if (/^(tl;?dr|key takeaways)\b/i.test(lines[0])) {
      const items = lines.slice(1).map((l) => l.replace(/^-\s*/, "")).filter(Boolean);
      return (
        <aside
          key={i}
          className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 px-5 py-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700">
            Key Takeaways
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-neutral-700">
            {items.map((item, j) => (
              <li key={j} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        </aside>
      );
    }
    if (lines.every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="mt-4 list-disc space-y-1.5 pl-6 text-base leading-relaxed text-neutral-700">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.slice(2))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-4 text-base leading-relaxed text-neutral-700">
        {renderInline(block)}
      </p>
    );
  };

  return (
    <div className="mt-6">
      {blocks.map((block, i) => (
        <div key={i} className="contents">
          {showToc && i === firstHeadingIdx && toc}
          {renderBlock(block, i)}
        </div>
      ))}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const href = match[2];
    parts.push(
      href.startsWith("/") ? (
        <Link key={key++} href={href} className="text-emerald-700 hover:underline">
          {match[1]}
        </Link>
      ) : (
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener"
          className="text-emerald-700 hover:underline"
        >
          {match[1]}
        </a>
      )
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
