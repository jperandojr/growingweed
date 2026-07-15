import { permanentRedirect } from "next/navigation";
import { getPostBySlug } from "@/data/blog";
import { notFound } from "next/navigation";

// Articles moved to root-level URLs (growingweed.com/{slug}).
// Old /grow-guides/{slug} links redirect permanently.
export default async function LegacyGuideRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getPostBySlug(slug))) notFound();
  permanentRedirect(`/${slug}`);
}
