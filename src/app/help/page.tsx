import { JsonLd } from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";

export const metadata = {
  title: "Help Center | GrowingWeed",
  description: "Frequently asked questions about shipping, payment, germination and returns.",
};

const faqs = [
  {
    q: "Is it legal to buy cannabis seeds?",
    a: "Cannabis seed legality varies by country and region. Seeds are typically sold as souvenirs or for storage. It's your responsibility to check local laws before germinating.",
  },
  {
    q: "How does buying through GrowingWeed work?",
    a: "GrowingWeed is a comparison site — we don't sell seeds directly. Compare strains and prices here, then click through to your chosen seed bank to complete your purchase securely on their website. We may earn a commission at no extra cost to you.",
  },
  {
    q: "How discreet is shipping?",
    a: "All our partner seed banks ship in plain, unmarked packaging with no reference to the contents on the outside of the package.",
  },
  {
    q: "What payment methods can I use?",
    a: "Payment options are handled by each seed bank and typically include major credit cards, bank transfer, and select cryptocurrencies.",
  },
  {
    q: "Do you offer a germination guarantee?",
    a: "Most seed banks listed on GrowingWeed offer a germination guarantee — check each seed bank's page for details.",
  },
  {
    q: "How long does shipping take?",
    a: "Delivery times vary by seed bank and destination, typically 3-15 business days for worldwide shipping. Check your order status directly with the seed bank you purchased from.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <JsonLd data={faqSchema(faqs)} />
      <h1 className="mb-2 text-2xl font-bold text-neutral-900 sm:text-3xl">Help Center</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Find answers to common questions about ordering, shipping and germination.
      </p>
      <div className="flex flex-col gap-4">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-xl border border-neutral-100 p-5">
            <h2 className="text-sm font-semibold text-neutral-900">{f.q}</h2>
            <p className="mt-2 text-sm text-neutral-500">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
