import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftItems = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItems }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightItems = 3 + 2 * siblingCount;
      const rightRange = Array.from({ length: rightItems }, (_, i) => totalPages - rightItems + i + 1);
      return [1, '...', ...rightRange];
    }

    if (showLeftDots && showRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, '...', ...middleRange, '...', totalPages];
    }

    return [];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all border select-none cursor-pointer
          ${currentPage === 1
            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95'}
        `}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Précédent</span>
      </button>

      <div className="flex items-center gap-1.5">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="w-9 h-9 flex items-center justify-center text-xs font-bold text-slate-400 select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                w-9 h-9 flex items-center justify-center rounded-xl text-xs font-extrabold transition-all border select-none cursor-pointer
                ${isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
              `}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all border select-none cursor-pointer
          ${currentPage === totalPages
            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95'}
        `}
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
