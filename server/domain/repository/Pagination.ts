export type PaginationRequest = {
  page: number;
  pageSize: number;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function normalizePagination(request: PaginationRequest) {
  const page = Math.max(1, Math.floor(request.page));
  const pageSize = Math.min(50, Math.max(1, Math.floor(request.pageSize)));

  return { page, pageSize };
}
