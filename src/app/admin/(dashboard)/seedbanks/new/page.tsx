import Link from "next/link";
import { SeedBankForm } from "@/components/admin/SeedBankForm";

export default function NewSeedBankPage() {
  return (
    <div>
      <nav className="mb-6 text-xs text-neutral-400">
        <Link href="/admin/seedbanks" className="hover:text-emerald-700">
          Seed Banks
        </Link>{" "}
        / New
      </nav>
      <h1 className="mb-8 text-2xl font-bold text-neutral-900">New Seed Bank</h1>
      <SeedBankForm />
    </div>
  );
}
