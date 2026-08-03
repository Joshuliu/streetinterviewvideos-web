import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq, ne } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { DeleteVideoButton, PortfolioVideoForm, PublishedToggle } from '@/components/crm/PortfolioVideoForm';

export default async function EditPortfolioVideoPage({ params }: { params: { id: string } }) {
  const pv = tables.portfolioVideos;
  const [row] = await db().select().from(pv).where(eq(pv.id, params.id));
  if (!row) notFound();

  const others = await db().select({ category: pv.category }).from(pv).where(ne(pv.id, params.id));
  const categories = [...new Set(others.map((r) => r.category).filter(Boolean))].sort();

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/portfolio" className="text-xs text-[var(--crm-muted)] hover:text-[var(--crm-text)]">
            ← Portfolio
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-[var(--crm-strong)] break-words">{row.title}</h1>
          {!row.published && (
            <p className="mt-1 text-xs font-semibold text-[var(--crm-warn-soft)]">Hidden: not on the public site right now.</p>
          )}
        </div>
        <div className="shrink-0 pt-6">
          <PublishedToggle id={row.id} published={row.published} />
        </div>
      </div>

      <div className="mt-6">
        <PortfolioVideoForm
          video={{
            id: row.id,
            slug: row.slug,
            title: row.title,
            category: row.category,
            goal: row.goal,
            format: row.format,
            deliverables: row.deliverables,
            whyItWorked: row.whyItWorked,
            kind: row.kind,
            published: row.published,
            src: row.src,
            poster: row.poster,
          }}
          categories={categories}
        />
      </div>

      <div className="mt-10 border-t border-[var(--crm-line)] pt-4">
        <DeleteVideoButton id={row.id} title={row.title} />
      </div>
    </div>
  );
}
