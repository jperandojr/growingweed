import { PlanEntry } from "./article-plan";

// Calls the Anthropic API directly (not the interactive content-writer Claude
// Code skill, which can't run inside an unattended serverless function) to
// draft a plan entry into a full article body. Used by the publish-plan cron
// — see src/app/api/cron/publish-plan/route.ts.

const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 8000;

export type GeneratedArticle = {
  content: string;
  excerpt: string;
  metaTitle: string;
};

function hueFor(title: string): number {
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h) % 360;
}

function buildPrompt(entry: PlanEntry, linkCandidates: { slug: string; title: string }[]): string {
  const links = [
    "/strains", "/seed-banks", "/grow-guides", "/deals", "/compare",
    ...linkCandidates.map((l) => `/${l.slug} ("${l.title}")`),
  ];

  return `Write a GrowingWeed.com article for the "${entry.chapter}" chapter of our Grow Guides series.

Title: ${entry.title}
Learning objective: ${entry.learningObjective}
Audience level: ${entry.difficulty}
Target length: ~${entry.wordCount} words
${entry.keyword ? `Target SEO keyword: ${entry.keyword}` : ""}

GrowingWeed.com is a cannabis growing and education site: cultivation guides plus 30,000+ strains
compared across the world's most trusted seed banks. Write for a reader who wants clear, accurate,
practical information, not marketing fluff.

Format rules (strict — the site's renderer depends on this exact structure):
- Do not repeat the title as a heading. Start directly with a 2-4 sentence hook paragraph that
  states what the article covers, using the target keyword naturally in the first 100 words.
- Next, a block that starts with the exact line "Key Takeaways" followed by 4-6 bullet lines,
  each starting with "- ". No heading marker on this line, just the plain text "Key Takeaways".
- Then the body, broken into "## " headings (Title Case, no colons-then-repeat-title), each
  followed by 2-4 paragraphs of 3-5 sentences. Use "- " bullet lists where they aid scanning.
- Include one "## Frequently Asked Questions" section near the end with 3-5 "### Question" items,
  each followed by a single 40-60 word answer paragraph.
- Close with a "## The Bottom Line" section: one short paragraph recapping the key point, ending
  with a paragraph containing 2-3 internal links to related pages using markdown link syntax.
- Separate every block (paragraph, heading, bullet list, key takeaways) with a single blank line.
- Every factual claim, statistic, date or named source must be either general knowledge or cited
  inline as a markdown link to a real, well-known authoritative source (e.g. a government health
  agency, a peer-reviewed journal, a major news outlet). Never invent a study, statistic, or URL.
  If you are not confident a specific fact is accurate, omit it rather than guess.
- Use markdown links "[label](/path)" for internal links naturally where relevant, drawn only from
  this list of pages that actually exist on the site: ${links.join(", ")}. Do not invent other
  internal URLs.
- Never use an em dash (—) or parentheses anywhere in the article. Rewrite around them instead.
- Do not use AI-writing tells: no "In conclusion", "It's important to note", "In today's world",
  no rhetorical questions as section openers, no excessive hedging.

Respond with ONLY plain text in exactly this format, no JSON, no markdown code fence, no other
commentary before or after:

METATITLE: <SEO title tag, under 60 characters, following the pattern "${entry.title} | GrowingWeed"
or a natural variant if that's too long>
EXCERPT: <140-160 character meta description / card blurb summarizing the article, as prose, no
markdown links, all on one line>
===CONTENT===
<the full article body as described above, starting immediately on the next line>`;
}

function parseResponse(text: string): { metaTitle: string; excerpt: string; content: string } {
  const marker = "===CONTENT===";
  const markerIdx = text.indexOf(marker);
  if (markerIdx === -1) throw new Error("Model response is missing the ===CONTENT=== marker");
  const header = text.slice(0, markerIdx);
  const content = text.slice(markerIdx + marker.length).trim();

  const metaTitleMatch = header.match(/METATITLE:\s*(.+)/i);
  const excerptMatch = header.match(/EXCERPT:\s*(.+)/i);
  if (!metaTitleMatch || !excerptMatch) {
    throw new Error("Model response is missing METATITLE or EXCERPT");
  }
  return { metaTitle: metaTitleMatch[1].trim(), excerpt: excerptMatch[1].trim(), content };
}

export async function generateArticle(
  entry: PlanEntry,
  linkCandidates: { slug: string; title: string }[]
): Promise<GeneratedArticle> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Extended thinking adds a large latency tax (~300s vs ~35s per
      // article in testing) for no quality benefit on a single-pass
      // structured-JSON writing task — disabled to fit a cron time budget.
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: buildPrompt(entry, linkCandidates) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const textBlock = data?.content?.find((b: { type: string }) => b.type === "text");
  const text = textBlock?.text;
  if (typeof text !== "string") throw new Error("Unexpected Anthropic API response shape");

  const parsed = parseResponse(text);
  if (!parsed.content || !parsed.excerpt || !parsed.metaTitle) {
    throw new Error("Generated article is missing required fields");
  }
  return parsed;
}

export { hueFor };
