export type PaginationInput = {
  page?: string | number | null;
  pageSize: number;
  totalItems: number;
};

export function createPagination({ page, pageSize, totalItems }: PaginationInput) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const requestedPage = Number(page);
  const safeRequestedPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const safePage = Math.min(safeRequestedPage, totalPages);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    offset: (safePage - 1) * pageSize,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}
