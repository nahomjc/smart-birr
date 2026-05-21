import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
};

function campaignsPageHref(page: number) {
  return page <= 1 ? "/managment/campaigns" : `/managment/campaigns?page=${page}`;
}

export function CampaignHistoryPagination({
  page,
  totalPages,
  total,
  pageSize,
}: Props) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="mt-5 flex flex-col gap-3 border-t border-zinc-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Campaign history pagination"
    >
      <p className="text-xs text-zinc-500">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        {prevPage ? (
          <Link
            href={campaignsPageHref(prevPage)}
            className="rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-600">
            Previous
          </span>
        )}
        <span className="px-2 text-xs text-zinc-500">
          Page {page} of {totalPages}
        </span>
        {nextPage ? (
          <Link
            href={campaignsPageHref(nextPage)}
            className="rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-lg border border-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-600">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
