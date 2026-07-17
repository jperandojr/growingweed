import Link from "next/link";
import { notFound } from "next/navigation";
import { getStrainBySlug } from "@/data/strains";
import { StrainForm } from "@/components/admin/StrainForm";

export default async function EditStrainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strain = await getStrainBySlug(slug);
  if (!strain) notFound();

  return (
    <div>
      <nav className="mb-6 text-xs text-neutral-400">
        <Link href="/admin/strains" className="hover:text-emerald-700">
          Strains
        </Link>{" "}
        / Edit
      </nav>
      <h1 className="mb-8 text-2xl font-bold text-neutral-900">Edit {strain.name}</h1>
      <StrainForm strain={strain} />
    </div>
  );
}
