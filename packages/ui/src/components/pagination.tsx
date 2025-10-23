import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  filteredItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showInfo?: boolean;
  maxVisiblePages?: number;
  className?: string;
  type?: string;
  scrollTargetRef?: React.RefObject<HTMLElement> | string;
}

export const Pagination = ({
  currentPage,
  totalItems,
  filteredItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  showInfo = true,
  maxVisiblePages = 5,
  className = '',
  type = '',
  scrollTargetRef,
}: PaginationProps) => {
  const totalPages = Math.ceil(filteredItems / itemsPerPage);
  const startItem = Math.min(filteredItems, 1 + (currentPage - 1) * itemsPerPage);
  const endItem = Math.min(currentPage * itemsPerPage, filteredItems);
  const hasFilteredItems = filteredItems > 0;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Don't render if there's only one page or no items
  if (totalItems <= itemsPerPageOptions[0]) {
    return null;
  }

  const handlePageChange = (page: number) => {
    onPageChange(page);

    // Scroll to target element if provided
    if (scrollTargetRef) {
      if (typeof scrollTargetRef === 'string') {
        // Handle string case - treat as element ID
        const target = document.getElementById(scrollTargetRef);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Handle ref case
        if (scrollTargetRef.current) {
          scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }

      const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    onItemsPerPageChange?.(newItemsPerPage);
    // Reset to page 1 when changing items per page
    onPageChange(1);
  };

  const handlePreviousPage = () => {
    handlePageChange(Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    handlePageChange(Math.min(totalPages, currentPage + 1));
  };

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pageButtons = [];
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      const halfVisible = Math.floor(maxVisiblePages / 2);

      if (currentPage <= halfVisible + 1) {
        // Show first pages
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfVisible) {
        // Show last pages
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        // Show pages centered around current page
        startPage = currentPage - halfVisible;
        endPage = currentPage + halfVisible;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return pageButtons;
  };

  return (
    <div className={`relative mt-4 flex items-center justify-between ${className}`}>
      {/* Left side: Info text with inline dropdown */}
      <div className="flex items-center gap-2">
        {showInfo && hasFilteredItems && (
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <span>Showing {startItem} to</span>
            {onItemsPerPageChange ? (
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="border-border hover:text-accent-foreground h-7 w-auto gap-0.5 rounded-md border bg-black/60 px-2 text-sm hover:bg-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()} className="cursor-pointer">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span>{endItem}</span>
            )}
            <span>
              of {filteredItems} {type}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={isFirstPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getVisiblePages()}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={isLastPage}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
