import { seedBanks } from "@/data/seedbanks";
import { strains } from "@/data/strains";

export const metadata = {
  title: "About Us | GrowingWeed",
  description: "GrowingWeed aggregates the world's best cannabis seed banks in one marketplace.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-4 text-2xl font-bold text-neutral-900 sm:text-3xl">About GrowingWeed</h1>
      <p className="text-sm leading-relaxed text-neutral-600">
        GrowingWeed brings together {seedBanks.length}+ of the world&apos;s most trusted cannabis seed
        banks and breeders in one place, so growers can compare {strains.length}+ strains by
        price, THC content, effects, flavor and rating before they buy — instead of shopping
        around dozens of individual seed bank websites.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        Every seed bank listed on GrowingWeed is vetted for reliability, discreet shipping, and
        germination guarantees. Our mission is to make finding the right seeds simple, transparent
        and trustworthy for growers everywhere.
      </p>
      <h2 className="mt-8 mb-3 text-lg font-bold text-neutral-900">How It Works</h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-neutral-600">
        <li>Browse and filter thousands of strains, or compare seed banks side by side.</li>
        <li>Check real prices from every seed bank that stocks the strain you want.</li>
        <li>
          Click through to your chosen seed bank and complete your purchase securely on their
          website.
        </li>
      </ol>
      <p className="mt-4 text-xs leading-relaxed text-neutral-400">
        GrowingWeed doesn&apos;t sell seeds directly and never handles your payment. When you buy
        through links on our site we may earn a commission from the seed bank, at no extra cost
        to you. It&apos;s how we keep GrowingWeed free and independent.
      </p>
    </div>
  );
}
