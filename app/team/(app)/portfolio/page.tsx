import Link from 'next/link';
import { asc } from 'drizzle-orm';
import { db, tables } from '@/lib/db';
import { PortfolioManager } from '@/components/crm/PortfolioManager';

// The portfolio editor's home: every video (hidden ones included) in the
// saved order. The order IS the site — homepage takes the first 6, the hero
// wall the first 12, and the featured pair on /portfolio is the first
// unscripted + first scripted published row. Auth comes from the (app)
// layout; mutations re-check it in actions.ts.
export default async function PortfolioAdminPage() {
  const rows = await db()
    .select()
    .from(tables.portfolioVideos)
    .orderBy(asc(tables.portfolioVideos.position));

  const videos = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    kind: r.kind,
    published: r.published,
    poster: r.poster,
  }));

  const hidden = videos.filter((v) => !v.published).length;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--crm-strong)]">Portfolio</h1>
          <p className="mt-1 text-sm text-[var(--crm-muted)]">
            Drag to reorder. The order is live on the site: the homepage shows the first 6, and the first unscripted
            and first scripted videos are the featured pair.
          </p>
        </div>
        <Link href="/portfolio/new" className="sign-btn-cta text-xs px-4 py-2 shrink-0">
          New video
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--crm-line)] bg-[var(--crm-panel)] px-4 py-2">
        <PortfolioManager videos={videos} />
      </div>

      <p className="mt-3 text-xs text-[var(--crm-faint)]">
        {videos.length} videos{hidden > 0 ? `, ${hidden} hidden` : ''}. Tap a row to edit it.
      </p>
    </div>
  );
}
