import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/button/button';
import styles from '@/components/pagination/pagination.module.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';
import { ELEVATION, Elevation } from '@/lib/elevations';
import { cn } from '@/lib/utils';

const ChevronLeftIcon = ChevronLeft as React.ComponentType<{ className?: string }>;
const ChevronRightIcon = ChevronRight as React.ComponentType<{ className?: string }>;

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
  dropdownElevation?: Elevation;
  className?: string;
  type?: string;
  scrollTargetRef?: React.RefObject<HTMLElement> | string;
}

const Pagination = ({
  currentPage,
  totalItems,
  filteredItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  showInfo = true,
  maxVisiblePages = 5,
  dropdownElevation = ELEVATION.OVERLAY,
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
          variant={currentPage === i ? 'primary' : 'tertiary'}
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
    <div className={cn(styles['pagination'], className)}>
      {/* Left side: Info text with inline dropdown */}
      <div className={styles['info-container']}>
        {showInfo && hasFilteredItems && (
          <>
            <span>Showing {startItem} to</span>
            {onItemsPerPageChange ? (
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent elevation={dropdownElevation}>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
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
          </>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div className={styles['page-navigation-container']}>
        <Button
          variant="tertiary"
          size="sm"
          onClick={handlePreviousPage}
          disabled={isFirstPage}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </Button>

        {getVisiblePages()}

        <Button
          variant="tertiary"
          size="sm"
          onClick={handleNextPage}
          disabled={isLastPage}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
};

export { Pagination };
