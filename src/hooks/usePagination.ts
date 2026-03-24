import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  // Reset to page 1 if items shrink below current page
  const safePage = currentPage > totalPages ? 1 : currentPage;
  if (safePage !== currentPage) setCurrentPage(safePage);

  return {
    currentPage,
    totalPages,
    totalItems: items.length,
    itemsPerPage,
    paginatedItems,
    setCurrentPage,
  };
}
