// Small client-safe pool used by the purchase-proof toast. Kept separate from
// the full catalog (which is server-only) so the widget ships only a few KB.

export type PoolStrain = {
  name: string;
  slug: string;
  hue: number;
  banks: string[]; // seed bank ids that actually stock this strain
};

export const proofStrains: PoolStrain[] = [
  { name: "Girl Scout Cookies", slug: "girl-scout-cookies", hue: 142, banks: ["seedsman", "crop-king-seeds", "royal-queen-seeds", "barneys-farm", "msnl", "42-fastbuds", "herbies"] },
  { name: "Blue Dream", slug: "blue-dream", hue: 221, banks: ["seedsman", "crop-king-seeds", "msnl", "dutch-passion", "sensi-seeds", "royal-queen-seeds", "42-fastbuds", "herbies"] },
  { name: "Gorilla Glue #4", slug: "gorilla-glue-4", hue: 27, banks: ["seedsman", "crop-king-seeds", "msnl", "dutch-passion", "royal-queen-seeds", "barneys-farm", "42-fastbuds", "herbies"] },
  { name: "Northern Lights", slug: "northern-lights", hue: 200, banks: ["seedsman", "sensi-seeds", "dutch-passion", "royal-queen-seeds", "42-fastbuds", "herbies"] },
  { name: "AK-47", slug: "ak-47", hue: 45, banks: ["seedsman", "crop-king-seeds", "msnl", "royal-queen-seeds"] },
  { name: "CBD Critical Mass", slug: "cbd-critical-mass", hue: 173, banks: ["seedsman", "dutch-passion", "royal-queen-seeds"] },
  { name: "White Widow", slug: "white-widow", hue: 84, banks: ["seedsman", "msnl", "sensi-seeds", "royal-queen-seeds", "42-fastbuds"] },
  { name: "Wedding Cake", slug: "wedding-cake", hue: 315, banks: ["royal-queen-seeds", "barneys-farm", "seedsman", "42-fastbuds", "herbies"] },
  { name: "Gelato", slug: "gelato", hue: 262, banks: ["barneys-farm", "royal-queen-seeds", "crop-king-seeds", "42-fastbuds", "herbies"] },
  { name: "OG Kush", slug: "og-kush", hue: 96, banks: ["seedsman", "msnl", "dutch-passion", "42-fastbuds"] },
  { name: "Sour Diesel", slug: "sour-diesel", hue: 51, banks: ["seedsman", "msnl", "crop-king-seeds"] },
  { name: "Purple Haze", slug: "purple-haze", hue: 280, banks: ["royal-queen-seeds", "barneys-farm"] },
  { name: "Amnesia Haze", slug: "amnesia-haze", hue: 58, banks: ["royal-queen-seeds", "dutch-passion", "barneys-farm"] },
  { name: "Bruce Banner", slug: "bruce-banner", hue: 9, banks: ["seedsman", "msnl", "42-fastbuds"] },
  { name: "Zkittlez", slug: "zkittlez", hue: 300, banks: ["barneys-farm", "royal-queen-seeds", "crop-king-seeds", "42-fastbuds"] },
  { name: "Do-Si-Dos", slug: "do-si-dos", hue: 268, banks: ["seedsman", "royal-queen-seeds"] },
  { name: "Green Crack", slug: "green-crack", hue: 112, banks: ["crop-king-seeds", "msnl"] },
  { name: "Jack Herer", slug: "jack-herer", hue: 130, banks: ["sensi-seeds", "seedsman"] },
  { name: "Pineapple Express", slug: "pineapple-express", hue: 40, banks: ["barneys-farm", "42-fastbuds"] },
  { name: "Skywalker OG", slug: "skywalker-og", hue: 190, banks: ["royal-queen-seeds", "dutch-passion"] },
  { name: "Blueberry", slug: "blueberry", hue: 235, banks: ["dutch-passion", "42-fastbuds"] },
  { name: "Charlotte's Angel", slug: "charlottes-angel", hue: 165, banks: ["dutch-passion", "royal-queen-seeds"] },
  { name: "Durban Poison", slug: "durban-poison", hue: 74, banks: ["dutch-passion", "sensi-seeds"] },
  { name: "Strawberry Cough", slug: "strawberry-cough", hue: 350, banks: ["msnl", "seedsman"] },
];

export const proofLocations = [
  "Denver, USA",
  "Los Angeles, USA",
  "Portland, USA",
  "Phoenix, USA",
  "Chicago, USA",
  "Detroit, USA",
  "Las Vegas, USA",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Montreal, Canada",
  "Amsterdam, Netherlands",
  "Rotterdam, Netherlands",
  "Berlin, Germany",
  "Hamburg, Germany",
  "London, UK",
  "Manchester, UK",
  "Barcelona, Spain",
  "Madrid, Spain",
  "Lisbon, Portugal",
  "Rome, Italy",
  "Milan, Italy",
  "Vienna, Austria",
  "Zurich, Switzerland",
  "Prague, Czechia",
  "Warsaw, Poland",
  "Copenhagen, Denmark",
  "Oslo, Norway",
  "Helsinki, Finland",
  "Dublin, Ireland",
  "Athens, Greece",
  "Melbourne, Australia",
  "Sydney, Australia",
  "Auckland, New Zealand",
  "Cape Town, South Africa",
  "Bangkok, Thailand",
  "Mexico City, Mexico",
  "Buenos Aires, Argentina",
  "Montevideo, Uruguay",
];
