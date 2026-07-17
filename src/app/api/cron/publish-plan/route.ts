import { NextRequest, NextResponse } from "next/server";
import { listPlan, markPlanPublished, PlanEntry } from "@/lib/article-plan";
import { savePost, validatePost, PostInput } from "@/lib/admin-posts";
import { getAllPosts } from "@/data/blog";
import { generateArticle, hueFor } from "@/lib/generate-article";
import { revalidatePostPages } from "@/lib/revalidate-posts";
import { submitToIndexNow } from "@/lib/indexnow";

// Vercel Cron (see vercel.json) hits this once a day. Finds every plan entry
// whose scheduled date/time has arrived, writes it via the Anthropic API
// (Claude Code's interactive content-writer skill can't run unattended in a
// serverless function), and publishes it immediately — the same "write it
// and it goes live on its own" model the content plan was already designed
// around, just with the writing step automated too.
//
// Hobby-plan cron jobs can only run once a day (±59 min), so this processes
// a small backlog per run rather than assuming near-real-time execution.

export const maxDuration = 280;

const MAX_PER_RUN = 5;
const TIME_BUDGET_MS = 260_000; // leave margin under maxDuration before Vercel kills the invocation

function isDue(entry: PlanEntry): boolean {
  if (entry.status !== "planned" || !entry.scheduledDate) return false;
  const dueAt = new Date(`${entry.scheduledDate}T${entry.scheduledTime ?? "00:00"}:00Z`).getTime();
  return dueAt <= Date.now();
}

function scheduleKey(entry: PlanEntry): string {
  return `${entry.scheduledDate}T${entry.scheduledTime ?? "00:00"}`;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const plan = await listPlan();
  const due = plan
    .filter(isDue)
    .sort((a, b) => (scheduleKey(a) < scheduleKey(b) ? -1 : 1))
    .slice(0, MAX_PER_RUN);

  const publishedPosts = await getAllPosts();
  const results: { title: string; ok: boolean; slug?: string; error?: string }[] = [];

  for (const entry of due) {
    if (Date.now() - start > TIME_BUDGET_MS) {
      results.push({ title: entry.title, ok: false, error: "Skipped — out of time budget for this run, will retry next run" });
      continue;
    }
    try {
      const siblings = publishedPosts
        .filter((p) => p.category === entry.chapter && p.slug !== entry.permalink)
        .map((p) => ({ slug: p.slug, title: p.title }))
        .slice(0, 8);

      const generated = await generateArticle(entry, siblings);

      const input: PostInput = {
        slug: entry.permalink,
        title: entry.title,
        excerpt: generated.excerpt,
        category: entry.chapter,
        date: entry.scheduledDate!,
        publishTime: entry.scheduledTime,
        hue: hueFor(entry.title),
        content: generated.content,
        keyword: entry.keyword,
        metaTitle: generated.metaTitle,
      };
      const error = validatePost(input);
      if (error) throw new Error(error);

      const { slug } = await savePost(input, { isNew: true });
      await markPlanPublished(entry.id, slug);
      revalidatePostPages(slug);
      await submitToIndexNow([`/${slug}`]);

      results.push({ title: entry.title, ok: true, slug });
    } catch (e) {
      results.push({ title: entry.title, ok: false, error: String((e as Error).message) });
    }
  }

  return NextResponse.json({
    checked: plan.filter((e) => e.status === "planned" && e.scheduledDate).length,
    due: due.length,
    results,
  });
}
