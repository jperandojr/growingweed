export const categories = [
  { slug: "feminized", name: "Feminized", count: "8,000+ Strains" },
  { slug: "autoflower", name: "Autoflower", count: "6,000+ Strains" },
  { slug: "regular", name: "Regular", count: "2,000+ Strains" },
  { slug: "cbd", name: "CBD", count: "1,500+ Strains" },
  { slug: "high-thc", name: "High THC", count: "7,000+ Strains" },
  { slug: "medical", name: "Medical", count: "5,000+ Strains" },
  { slug: "indoor", name: "Indoor", count: "4,000+ Strains" },
  { slug: "outdoor", name: "Outdoor", count: "4,500+ Strains" },
  { slug: "beginner", name: "Beginner", count: "3,000+ Strains" },
  { slug: "fast-flowering", name: "Fast Flowering", count: "6,000+ Strains" },
] as const;

export const effects = [
  "Happy",
  "Relaxed",
  "Creative",
  "Sleepy",
  "Energetic",
] as const;

export const flavors = [
  "Berry",
  "Lemon",
  "Diesel",
  "Earthy",
  "Pine",
  "Sweet",
  "Skunk",
  "Citrus",
  "Chocolate",
  "Coffee",
] as const;

export const thcLevels = [
  { slug: "low", name: "< 15%", label: "Low" },
  { slug: "mild", name: "15-20%", label: "Mild" },
  { slug: "moderate", name: "20-25%", label: "Moderate" },
  { slug: "high", name: "25-30%", label: "High" },
  { slug: "very-high", name: "30%+", label: "Very High" },
] as const;
