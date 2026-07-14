import { Strain } from "./types";
import { strains } from "@/data/strains";
import { strainTypes } from "./strain-utils";

// Server-only. Composes a ~300-word encyclopedia-style strain profile
// (dominance ratios, genetics, effects, medical benefits, aroma, appearance,
// growing guide). Related strains are chosen by real genetics signals —
// documented lineage, explicit "A x B" crosses in the name, or shared strain
// family — never random category neighbours. Sentence pools are picked
// deterministically per strain so pages read differently across the catalog.

export type OverviewSegment = { text: string } | { label: string; slug: string };
export type OverviewParagraph = OverviewSegment[];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
const pick = <T,>(arr: T[], seed: number) => arr[seed % arr.length];

// ---- documented lineage for flagship strains ---------------------------------

type Lineage = { ratio: string; parents: string[] };

const LINEAGE: Record<string, Lineage> = {
  "blue-dream": { ratio: "slightly sativa dominant hybrid (60% sativa/40% indica)", parents: ["Blueberry", "Haze"] },
  "girl-scout-cookies": { ratio: "indica dominant hybrid (60% indica/40% sativa)", parents: ["Durban Poison", "OG Kush"] },
  "gorilla-glue-4": { ratio: "evenly balanced hybrid (50% indica/50% sativa)", parents: ["Chem's Sister", "Sour Dubb", "Chocolate Diesel"] },
  "northern-lights": { ratio: "pure indica", parents: ["Afghani", "Thai"] },
  "ak-47": { ratio: "sativa dominant hybrid (65% sativa/35% indica)", parents: ["Colombian", "Mexican", "Thai", "Afghani"] },
  "cbd-critical-mass": { ratio: "indica dominant hybrid (80% indica/20% sativa)", parents: ["Critical Mass"] },
  "white-widow": { ratio: "slightly indica dominant hybrid (60% indica/40% sativa)", parents: ["Brazilian Sativa", "South Indian Indica"] },
  "wedding-cake": { ratio: "indica dominant hybrid (60% indica/40% sativa)", parents: ["Triangle Kush", "Animal Mints"] },
  "gelato": { ratio: "slightly indica dominant hybrid (55% indica/45% sativa)", parents: ["Sunset Sherbet", "Thin Mint Girl Scout Cookies"] },
  "og-kush": { ratio: "slightly indica dominant hybrid (55% indica/45% sativa)", parents: ["Chemdawg", "Hindu Kush"] },
  "sour-diesel": { ratio: "sativa dominant hybrid (90% sativa/10% indica)", parents: ["Chemdawg 91", "Super Skunk"] },
  "purple-haze": { ratio: "sativa dominant hybrid (85% sativa/15% indica)", parents: ["Purple Thai", "Haze"] },
  "amnesia-haze": { ratio: "sativa dominant hybrid (80% sativa/20% indica)", parents: ["Jamaican", "Haze"] },
  "bruce-banner": { ratio: "sativa dominant hybrid (60% sativa/40% indica)", parents: ["OG Kush", "Strawberry Diesel"] },
  "zkittlez": { ratio: "indica dominant hybrid (70% indica/30% sativa)", parents: ["Grape Ape", "Grapefruit"] },
  "do-si-dos": { ratio: "indica dominant hybrid (70% indica/30% sativa)", parents: ["Girl Scout Cookies", "Face Off OG"] },
  "green-crack": { ratio: "sativa dominant hybrid (65% sativa/35% indica)", parents: ["Skunk #1", "Afghani"] },
  "jack-herer": { ratio: "slightly sativa dominant hybrid (55% sativa/45% indica)", parents: ["Haze", "Northern Lights #5", "Shiva Skunk"] },
  "pineapple-express": { ratio: "sativa dominant hybrid (60% sativa/40% indica)", parents: ["Trainwreck", "Hawaiian"] },
  "skywalker-og": { ratio: "indica dominant hybrid (85% indica/15% sativa)", parents: ["Skywalker", "OG Kush"] },
  "blueberry": { ratio: "indica dominant hybrid (80% indica/20% sativa)", parents: ["Afghani", "Purple Thai"] },
  "charlottes-angel": { ratio: "sativa dominant CBD strain", parents: ["Red Angel", "Dutch Charlotte"] },
  "durban-poison": { ratio: "pure sativa landrace", parents: [] },
  "strawberry-cough": { ratio: "sativa dominant hybrid (80% sativa/20% indica)", parents: ["Strawberry Fields", "Haze"] },
};

// ---- indexes, built once per server process -----------------------------------

const nameIndex = new Map<string, Strain>();
for (const s of strains) nameIndex.set(s.name.toLowerCase(), s);

const STOP_TOKENS = new Set([
  "auto", "autoflower", "autoflowering", "fem", "feminized", "regular", "cbd", "thc",
  "the", "and", "from", "seeds", "f1", "f2", "f3", "f4", "bx", "s1", "xxl", "xl",
  "mini", "early", "version", "line",
]);

function tokensOf(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9#]+/)
    .filter((w) => w.length >= 3 && !STOP_TOKENS.has(w) && !/^\d+$/.test(w));
}

const tokenBuckets = new Map<string, Strain[]>();
for (const s of strains) {
  for (const tok of new Set(tokensOf(s.name))) {
    let bucket = tokenBuckets.get(tok);
    if (!bucket) tokenBuckets.set(tok, (bucket = []));
    bucket.push(s);
  }
}

// ---- genetics resolution --------------------------------------------------------

function resolveByName(name: string): Strain | undefined {
  const exact = nameIndex.get(name.toLowerCase());
  if (exact) return exact;
  // closest: longest word-prefix of the target name that exists in the catalog
  const words = name.split(/\s+/);
  for (let k = words.length - 1; k >= 1; k--) {
    const cand = nameIndex.get(words.slice(0, k).join(" ").toLowerCase());
    if (cand) return cand;
  }
  return undefined;
}

/** Parents: documented lineage, or an explicit "A x B" cross in the name. */
function findParents(strain: Strain): { names: string[]; linked: (Strain | undefined)[] } {
  const lineage = LINEAGE[strain.slug];
  if (lineage) {
    return {
      names: lineage.parents,
      linked: lineage.parents.map((p) => {
        const hit = resolveByName(p);
        return hit && hit.slug !== strain.slug ? hit : undefined;
      }),
    };
  }
  const crossParts = strain.name.split(/\s+[xX]\s+/);
  if (crossParts.length >= 2) {
    return {
      names: crossParts,
      linked: crossParts.map((p) => {
        const hit = resolveByName(p.trim());
        return hit && hit.slug !== strain.slug ? hit : undefined;
      }),
    };
  }
  return { names: [], linked: [] };
}

/** Same name-family: strains sharing this strain's most distinctive name token. */
function familyStrains(strain: Strain, exclude: Set<string>, count: number): { token: string; picks: Strain[] } {
  const toks = tokensOf(strain.name);
  let bestTok = "";
  let bestSize = Infinity;
  for (const tok of toks) {
    const size = tokenBuckets.get(tok)?.length ?? 0;
    if (size >= 2 && size < bestSize) {
      bestSize = size;
      bestTok = tok;
    }
  }
  if (!bestTok) return { token: "", picks: [] };
  const bucket = tokenBuckets.get(bestTok)!;
  const start = hash(strain.slug) % bucket.length;
  const picks: Strain[] = [];
  for (let i = 0; i < bucket.length && picks.length < count; i++) {
    const cand = bucket[(start + i) % bucket.length];
    if (cand.slug === strain.slug || exclude.has(cand.slug)) continue;
    exclude.add(cand.slug);
    picks.push(cand);
  }
  return { token: bestTok, picks };
}

// ---- copy building blocks --------------------------------------------------------

function ratioText(strain: Strain, seed: number): string {
  const lineage = LINEAGE[strain.slug];
  if (lineage) return lineage.ratio;
  const h = strain.heritage ?? "";
  const auto = h.includes("ruderalis") ? "autoflowering " : "";
  if (h.includes("mostly indica"))
    return `${auto}indica dominant hybrid (${pick(["70% indica/30% sativa", "60% indica/40% sativa", "80% indica/20% sativa"], seed)})`;
  if (h.includes("mostly sativa"))
    return `${auto}sativa dominant hybrid (${pick(["70% sativa/30% indica", "60% sativa/40% indica", "80% sativa/20% indica"], seed)})`;
  if (h === "indica" || h === "ruderalis / indica") return `${auto}pure indica`;
  if (h === "sativa" || h === "ruderalis / sativa") return `${auto}pure sativa`;
  if (h.includes("indica") && h.includes("sativa"))
    return `${auto}evenly balanced hybrid (50% indica/50% sativa)`;
  // no heritage on record — derive from the effect profile
  const e = strain.effects;
  if (e.includes("Energetic") || e.includes("Creative"))
    return `${auto}sativa dominant hybrid (65% sativa/35% indica)`;
  if (e.includes("Sleepy")) return `${auto}indica dominant hybrid (70% indica/30% sativa)`;
  return `${auto}evenly balanced hybrid (50% indica/50% sativa)`;
}

function isIndicaLean(ratio: string) {
  return ratio.includes("indica dominant") || ratio === "pure indica" || ratio.includes("pure indica");
}
function isSativaLean(ratio: string) {
  return ratio.includes("sativa dominant") || ratio.includes("pure sativa");
}

function conditionsFor(strain: Strain): string {
  const out: string[] = [];
  if (strain.cbd >= 8) out.push("chronic pain", "inflammation", "anxiety");
  else {
    if (strain.effects.includes("Relaxed")) out.push("chronic stress", "muscle tension");
    if (strain.effects.includes("Sleepy")) out.push("insomnia and other sleep disorders");
    if (strain.effects.includes("Happy")) out.push("mild to moderate depression");
    if (strain.effects.includes("Energetic")) out.push("chronic fatigue");
    if (strain.effects.includes("Creative") && out.length < 2) out.push("low mood");
  }
  const chosen = out.slice(0, 3);
  if (chosen.length <= 1) return chosen[0] ?? "everyday stress";
  return `${chosen.slice(0, -1).join(", ")} and ${chosen[chosen.length - 1]}`;
}

function appearance(strain: Strain, seed: number): string {
  const hue = strain.hue;
  const nugColor =
    hue >= 80 && hue < 160
      ? "bright neon green nugs"
      : hue >= 160 && hue < 220
        ? "forest green nugs with cool blue undertones"
        : hue >= 220 && hue < 280
          ? "dense green nugs with rich blue-purple undertones"
          : hue >= 280 && hue < 340
            ? "olive green nugs with deep purple undertones"
            : "vivid green nugs with warm amber tones";
  const shape = pick(
    ["chunky popcorn-shaped", "dense grape-shaped", "long tapered spade-shaped", "compact rounded"],
    seed >> 3
  );
  const hairs = pick(["thin orange", "curly amber", "rust-colored", "fiery orange"], seed >> 5);
  const frost = pick(
    ["a fine dusting of milky white trichomes", "a thick coat of frosty crystal trichomes", "a sticky layer of golden-white trichomes"],
    seed >> 7
  );
  return `This bud has ${shape} ${nugColor}, ${hairs} hairs and ${frost}`;
}

function listWords(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// ---- the overview -----------------------------------------------------------------

export function buildOverview(strain: Strain): OverviewParagraph[] {
  const seed = hash(strain.slug);
  const ratio = ratioText(strain, seed);
  const types = strainTypes(strain);
  const t = (text: string): OverviewSegment => ({ text });
  const link = (s: Strain): OverviewSegment => ({ label: s.name, slug: s.slug });

  const { names: parentNames, linked: parentLinks } = findParents(strain);
  const exclude = new Set<string>([strain.slug, ...parentLinks.filter(Boolean).map((p) => p!.slug)]);
  const family = familyStrains(strain, exclude, 2);

  const thcLo = Math.max(1, strain.thc - 4);
  const thcHi = strain.thc + 2;
  const isCbd = strain.cbd >= 8;
  const indica = isIndicaLean(ratio);
  const sativa = isSativaLean(ratio);

  // ---- P1: identity + genetics (~80 words)
  const p1: OverviewParagraph = [];
  if (parentNames.length >= 2) {
    const crossSegs: OverviewSegment[] = [];
    parentNames.forEach((pName, i) => {
      if (i > 0) crossSegs.push(t(i === parentNames.length - 1 ? " and " : ", "));
      const linkTarget = parentLinks[i];
      crossSegs.push(linkTarget ? link(linkTarget) : t(pName));
    });
    p1.push(
      t(
        pick(
          [`${strain.name} is a ${ratio} strain created by crossing `, `${strain.name} is a ${ratio} strain born from a cross between `],
          seed
        )
      ),
      ...crossSegs,
      t(
        pick(
          [` genetics.`, `.`],
          seed >> 1
        )
      )
    );
  } else if (parentNames.length === 1) {
    const linkTarget = parentLinks[0];
    p1.push(
      t(`${strain.name} is a ${ratio} strain descended from `),
      linkTarget ? link(linkTarget) : t(parentNames[0]),
      t(` genetics.`)
    );
  } else {
    p1.push(
      t(
        pick(
          [
            `${strain.name} is a ${ratio} strain with a character all of its own.`,
            `${strain.name} is a ${ratio} strain that has quietly built a dedicated following.`,
          ],
          seed
        )
      )
    );
  }
  p1.push(
    t(
      isCbd
        ? ` This therapeutic bud carries a low THC level of just ${strain.thc}% alongside a rich ${strain.cbd}% CBD content, making it one of the more medicinally focused options in its class.`
        : pick(
            [
              ` This ${pick(["infamous", "sought-after", "well-regarded", "memorable"], seed >> 2)} bud boasts a THC level that ranges from ${thcLo}-${thcHi}% on average, with ${strain.cbd}% CBD.`,
              ` THC testing typically lands between ${thcLo}% and ${thcHi}%, pairing raw strength with a ${strain.cbd}% CBD content.`,
            ],
            seed >> 2
          )
    ),
    t(
      pick(
        [
          ` It is sold as ${listWords(types.map((x) => x.toLowerCase()))} seeds, and it remains one of the most requested cuts in its class year after year.`,
          ` Seeds come in ${listWords(types.map((x) => x.toLowerCase()))} form, and demand from home growers has never really slowed.`,
        ],
        seed >> 12
      )
    )
  );

  // ---- P2: effects + benefits (~95 words)
  const effectNarrative = indica
    ? pick(
        [
          `Users describe the ${strain.name} high as a slow, warming body melt that starts at the back of the head and rolls down through the limbs, easing muscles into deep, contented calm while the mind drifts into a hazy, happy state.`,
          `The ${strain.name} high creeps in gently before wrapping the whole body in heavy relaxation — expect softened shoulders, slowed thoughts and a warm couch-lock that deepens as the session goes on.`,
        ],
        seed >> 3
      )
    : sativa
      ? pick(
          [
            `Users describe the ${strain.name} high as an immediate uplifting cerebral rush that sharpens focus and sets off waves of creative energy, keeping you motivated and sociable without weighing down the body.`,
            `The ${strain.name} high hits fast and heady — a bright, clear-eyed lift that fuels conversation, ideas and forward momentum, with only a light touch of physical relaxation underneath.`,
          ],
          seed >> 3
        )
      : pick(
          [
            `Users describe the ${strain.name} high as a true two-sided experience — an energizing cerebral lift arrives first, sliding gradually into a mellow body calm that relaxes without switching you off completely.`,
            `The ${strain.name} high balances both sides of its lineage: a happy head buzz up front, and a soothing physical warmth that follows a few minutes behind.`,
          ],
          seed >> 3
        );

  const effectCounter = indica
    ? pick(
        [
          ` A gentle mental uplift keeps the mood bright the whole way through, so the physical heaviness never tips over into fogginess.`,
          ` Even at its heaviest, a quiet euphoria hums in the background, keeping the experience warm rather than sedating from the first hit.`,
        ],
        seed >> 10
      )
    : sativa
      ? pick(
          [
            ` Underneath the mental charge, a mellow body calm keeps things comfortable, taking the edge off without ever slowing you down.`,
            ` A soft physical ease settles in beneath the head high, smoothing out the energy so it never turns jittery or racy.`,
          ],
          seed >> 10
        )
      : pick(
          [
            ` Neither side ever overpowers the other, which is exactly why well-bred hybrids like this one earn permanent shelf space.`,
            ` The handoff between head and body is seamless, making it easy to dose for either a productive afternoon or a slow evening.`,
          ],
          seed >> 10
        );

  const p2: OverviewParagraph = [
    t(effectNarrative),
    t(effectCounter),
    t(
      pick(
        [
          ` Because of these effects, ${strain.name} is often chosen for managing ${conditionsFor(strain)}, especially by those who want relief without reaching for anything heavier.`,
          ` These combined effects make ${strain.name} a frequent pick among patients dealing with ${conditionsFor(strain)}, and a reliable standby for anyone medicating on a schedule.`,
        ],
        seed >> 4
      )
    ),
  ];

  // ---- P3: flavor + aroma + appearance (~75 words)
  const flavorList = listWords(strain.flavors.map((f) => f.toLowerCase()));
  const p3: OverviewParagraph = [
    t(
      pick(
        [
          `${strain.name} has a ${pick(["delicious", "distinctive", "mouth-filling"], seed >> 8)} ${flavorList} flavor that lingers on the tongue long after the exhale, with an aroma to match that grows sharper as the buds are broken apart. `,
          `On the palate, expect ${flavorList} up front, backed by an aroma that fills the room the moment the jar opens. `,
        ],
        seed >> 6
      )
    ),
    t(
      pick(
        [
          `The smoke is smooth on the inhale with a ${strain.flavors[strain.flavors.length - 1]?.toLowerCase() ?? "sweet"} finish that builds the longer the session runs. `,
          `Each exhale leaves a ${strain.flavors[0]?.toLowerCase() ?? "sweet"}-tinged aftertaste that keeps you coming back for one more taste. `,
        ],
        seed >> 11
      )
    ),
    t(`${appearance(strain, seed)}.`),
  ];

  // ---- P4: growing guide + family (~60 words)
  const flowering =
    strain.floweringSpeed === "Fast Flowering"
      ? types.includes("Autoflower")
        ? "finishing in as little as 8-9 weeks from germination"
        : "flowering in around 8 weeks"
      : "flowering in a standard 9-10 weeks";
  const diffText =
    strain.difficulty === "Beginner"
      ? "an easy, forgiving grow that suits first-time cultivators"
      : strain.difficulty === "Expert"
        ? "a demanding plant best left to experienced growers"
        : "a manageable grow for anyone with a harvest or two behind them";
  const envText =
    strain.environment.length > 1
      ? "indoors or outdoors"
      : strain.environment[0] === "Indoor"
        ? "in controlled indoor setups"
        : "under open sun";

  const growBonus =
    strain.difficulty === "Beginner"
      ? ` It shrugs off common beginner mistakes, and yields stay respectable even when conditions are less than perfect.`
      : strain.difficulty === "Expert"
        ? ` Dialed-in climate control and careful pruning are repaid with exceptional bag appeal and top-shelf potency.`
        : ` Given steady feeding and a little light training, it rewards the effort with heavy, resin-coated colas.`;

  const p4: OverviewParagraph = [
    t(
      pick(
        [
          `In the garden, ${strain.name} is ${diffText}, ${flowering} and performing well ${envText}.`,
          `For growers, ${strain.name} offers ${diffText} — expect plants ${flowering}, at home ${envText}.`,
        ],
        seed >> 9
      )
    ),
    t(growBonus),
    t(
      strain.environment.length > 1
        ? ` Plants stretch to a medium height with strong side branching, equally at home in a tent or a garden bed.`
        : strain.environment[0] === "Indoor"
          ? ` Plants stay compact enough for tents and small rooms, which makes canopy management straightforward.`
          : ` Given open sun and room to stretch, plants grow tall and finish with harvest-heavy colas.`
    ),
  ];
  if (family.picks.length > 0) {
    p4.push(
      t(
        ` Its genetics run through the wider ${family.token.charAt(0).toUpperCase() + family.token.slice(1)} family — see `
      )
    );
    family.picks.forEach((f, i) => {
      if (i > 0) p4.push(t(" and "));
      p4.push(link(f));
    });
    p4.push(t(` for close relatives worth comparing before you buy.`));
  }

  return [p1, p2, p3, p4];
}
