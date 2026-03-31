/**
 * Query optimization utilities for Supabase paginated queries.
 */

/** Helper for paginated queries — returns Supabase range boundaries */
export function paginationRange(
  page: number,
  pageSize: number,
): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

/** Format pagination metadata for API responses */
export function paginationMeta(
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNext: page * pageSize < total,
    hasPrev: page > 1,
  };
}
