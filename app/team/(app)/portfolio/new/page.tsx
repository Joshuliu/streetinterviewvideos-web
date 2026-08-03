import Link from 'next/link';
import { db, tables } from '@/lib/db';
import { PortfolioVideoForm } from '@/components/crm/PortfolioVideoForm';

export default async function NewPortfolioVideoPage() {
  const rows = await db().select({ category: tables.portfolioVideos.category }).from(tables.portfolioVideos);
  const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))].sort();

  return (
    <div className="max-w-2xl">
      <Link href="/portfolio" className="text-xs text-[var(--crm-muted)] hover:text-[var(--crm-text)]">
        ← Portfolio
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-[var(--crm-strong)]">New video</h1>
      <p className="mt-1 mb-6 text-sm text-[var(--crm-muted)]">
        It lands at the bottom of the order; drag it up from the Portfolio list once saved.
      </p>
      <PortfolioVideoForm video={null} categories={categories} />
    </div>
  );
}
