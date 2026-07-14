export type SeedBank = {
  id: string;
  slug: string;
  name: string;
  rating: number;
  reviewCount: number;
  strainCount: number;
  freeSeeds: boolean;
  worldwideShipping: boolean;
  established: number;
  description: string;
  accent: string; // tailwind text/bg color token used for the wordmark treatment
  url: string; // outbound store link — append affiliate tracking params here
  logo: string; // path under /public to the seed bank's brand logo
};

export type StrainType = "Feminized" | "Autoflower" | "Regular";

export type Badge =
  | "Bestseller"
  | "Top Rated"
  | "High THC"
  | "Fast Flowering"
  | "High Yield"
  | "CBD Rich"
  | "New";

export type Offer = {
  seedBankId: string;
  price: number;
  type: StrainType; // seed type is a per-offer variant, not part of the strain identity
};

export type Strain = {
  id: string;
  slug: string;
  name: string;
  thc: number;
  cbd: number;
  badge?: Badge;
  rating: number;
  reviewCount: number;
  offers: Offer[];
  effects: string[];
  flavors: string[];
  environment: ("Indoor" | "Outdoor")[];
  difficulty: "Beginner" | "Intermediate" | "Expert";
  floweringSpeed: "Fast Flowering" | "Standard";
  category: string[];
  description: string;
  hue: number; // used to derive a deterministic placeholder gradient
  heritage?: string; // indica/sativa lineage from the source sheet, e.g. "mostly indica"
  image?: string; // primary photo — auto-set when /public/strains/{slug}.* exists
  images?: string[]; // full gallery: primary plus {slug}-2/-3/-4.* angle shots
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string; // card blurb; also used as the meta description
  category: string;
  readTime: string;
  date: string;
  hue: number;
  /** Full article body: paragraphs separated by blank lines; "## " for
   *  headings; [label](/path) for internal links. */
  content?: string;
  keyword?: string; // target SEO keyword, used in page metadata
  image?: string; // featured image URL, shown in place of the generated cover art
  metaTitle?: string; // overrides the <title> tag; falls back to `title`
};
