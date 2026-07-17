import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeedBankById } from "@/data/seedbanks";
import { SeedBankForm } from "@/components/admin/SeedBankForm";

export default async function EditSeedBankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seedBank = await getSeedBankById(id);
  if (!seedBank) notFound();

  return (
    <div>
      <nav className="mb-6 text-xs text-neutral-400">
        <Link href="/admin/seedbanks" className="hover:text-emerald-700">
          Seed Banks
        </Link>{" "}
        / Edit
      </nav>
      <h1 className="mb-8 text-2xl font-bold text-neutral-900">Edit Seed Bank</h1>
      <SeedBankForm seedBank={seedBank} />
    </div>
  );
}
