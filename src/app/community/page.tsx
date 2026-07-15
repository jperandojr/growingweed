import Link from "next/link";
import { NotebookPen, MessagesSquare, Image as ImageIcon } from "lucide-react";
import { getAllPosts } from "@/data/blog";

export const metadata = {
  title: "Community | GrowingWeed",
  description: "Join the GrowingWeed grower community: grow diaries, forums, and photo galleries.",
};

const features = [
  {
    icon: NotebookPen,
    title: "Grow Diaries",
    description: "Follow along with real grows from seed to harvest, shared by the community.",
  },
  {
    icon: MessagesSquare,
    title: "Forums",
    description: "Ask questions and share tips with thousands of growers worldwide.",
  },
  {
    icon: ImageIcon,
    title: "Photo Gallery",
    description: "Browse photos of finished buds and grow setups for inspiration.",
  },
];

export default async function CommunityPage() {
  const blogPosts = await getAllPosts();
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900 sm:text-3xl">Community</h1>
      <p className="mb-8 max-w-2xl text-sm text-neutral-500">
        Connect with over a million growers worldwide sharing grow diaries, strain reviews, and
        advice.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border border-neutral-100 bg-neutral-50 p-6">
            <Icon size={22} className="text-emerald-700" />
            <h2 className="mt-3 text-sm font-bold text-neutral-900">{title}</h2>
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          </div>
        ))}
      </div>
      {blogPosts.length > 0 && (
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">From the Blog</h2>
        <ul className="flex flex-col gap-2">
          {blogPosts.map((p) => (
            <li key={p.id}>
              <Link href={`/${p.slug}`} className="text-sm text-emerald-700 hover:underline">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      )}
    </div>
  );
}
