import { useState, useMemo } from 'react';

export const usePagination = (items, itemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    if (!items) return { items: [], totalPages: 0, hasNextPage: false, hasPrevPage: false };
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return {
      items: paginatedItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      currentPage,
      totalItems: items.length
    };
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, paginatedData.totalPages)));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const reset = () => setCurrentPage(1);

  return {
    ...paginatedData,
    goToPage,
    nextPage,
    prevPage,
    reset,
    setCurrentPage
  };
};