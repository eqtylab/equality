import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/button/button';
import styles from '@/components/pagination/pagination.module.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';
import { cn } from '@/lib/utils';

const ChevronLeftIcon = ChevronLeft as React.ComponentType<{ className?: string }>;
const ChevronRightIcon = ChevronRight as React.ComponentType<{ className?: string }>;
const ChevronsLeftIcon = ChevronsLeft as React.ComponentType<{ className?: string }>;
const ChevronsRightIcon = ChevronsRight as React.ComponentType<{ className?: string }>;

interface PaginationProps {
  /** The active page, 1-based; one past the last page shows as the last page */
  currentPage: number;
  /** Full dataset size; the controls render only when it exceeds the smallest page size */
  totalItems: number;
  /** Item count after filtering, which drives the page count and the info text */
  filteredItems: number;
  /** Number of items shown per page */
  itemsPerPage: number;
  /** Called with the new page when the user navigates */
  onPageChange: (page: number) => void;
  /** Called with the new page size; when set, the items-per-page dropdown shows */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /** Choices in the items-per-page dropdown */
  itemsPerPageOptions?: number[];
  /** Whether to show the "Showing X to Y of Z" info text */
  showInfo?: boolean;
  /** Whether to show jump-to-first and jump-to-last buttons once there are more pages than `maxVisiblePages` */
  showFirstLast?: boolean;
  /** Most numbered page buttons shown at once */
  maxVisiblePages?: number;
  /** Additional classes on the root */
  className?: string;
  /** Noun after the total in the info text, such as `items` */
  type?: string;
  /** Element, or an element `id`, scrolled into view when the page changes */
  scrollTargetRef?: React.RefObject<HTMLElement | null> | string;
}

const Pagination = ({
  currentPage: requestedPage,
  totalItems,
  filteredItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = '',
  type = '',
  scrollTargetRef,
}: PaginationProps) => {
  const totalPages = Math.ceil(filteredItems / itemsPerPage);
  const currentPage = Math.min(Math.max(requestedPage, 1), Math.max(totalPages, 1));
  const startItem = Math.min(filteredItems, 1 + (currentPage - 1) * itemsPerPage);
  const endItem = Math.min(currentPage * itemsPerPage, filteredItems);
  const hasFilteredItems = filteredItems > 0;
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;
  const showFirstLastButtons = showFirstLast && totalPages > maxVisiblePages;

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
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    onItemsPerPageChange?.(newItemsPerPage);
    // Reset to page 1 when changing items per page
    onPageChange(1);
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handlePreviousPage = () => {
    handlePageChange(Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    handlePageChange(Math.min(totalPages, currentPage + 1));
  };

  const handleLastPage = () => {
    handlePageChange(totalPages);
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
        endPage = startPage + maxVisiblePages - 1;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? 'primary' : 'tertiary'}
          size="sm"
          onClick={() => handlePageChange(i)}
          aria-label={`Page ${i} of ${totalPages}`}
          aria-current={currentPage === i ? 'page' : undefined}
          className={cn(currentPage !== i && styles['wide-only'])}
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
            <span className={styles['wide-only']}>Showing {startItem} to</span>
            {onItemsPerPageChange ? (
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger
                  className={styles['items-per-page-trigger']}
                  aria-label="Items per page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className={styles['wide-only']}>{endItem}</span>
            )}
            {onItemsPerPageChange && filteredItems < 1000 && (
              <span
                className={cn(
                  styles['page-size-label'],
                  filteredItems < 100
                    ? styles['page-size-label--short']
                    : styles['page-size-label--medium']
                )}
                aria-hidden="true"
              >
                per page
              </span>
            )}
            <span className={styles['wide-only']}>
              of {filteredItems} {type}
            </span>
            <span className={styles['narrow-only']}>
              <span aria-hidden="true">
                {startItem}–{endItem} of {filteredItems}
              </span>
              <span className={styles['spoken-count']}>
                {startItem} to {endItem} of {filteredItems}
              </span>
            </span>
          </>
        )}
      </div>

      {/* Right side: Page navigation */}
      <nav className={styles['page-navigation-container']} aria-label="Pagination">
        {showFirstLastButtons && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleFirstPage}
            disabled={isFirstPage}
            aria-label="First page"
            className={styles['wide-only']}
          >
            <ChevronsLeftIcon />
          </Button>
        )}

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

        {showFirstLastButtons && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleLastPage}
            disabled={isLastPage}
            aria-label={`Last page (${totalPages})`}
            className={styles['wide-only']}
          >
            <ChevronsRightIcon />
          </Button>
        )}
      </nav>
    </div>
  );
};

export { Pagination };
