import { Pagination } from "@eqtylab/equality";
import React, { useState, useMemo, useRef } from "react";

// Generate mock items
const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }));
};

export const PaginationDemo = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const itemsGridRef = useRef<HTMLDivElement | null>(null);

  // Total items (before filtering)
  const totalItems = 100;
  const allItems = useMemo(() => generateItems(totalItems), []);

  // Paginate filtered items
  const paginatedItems = useMemo(
    () =>
      allItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [allItems, currentPage, itemsPerPage],
  );

  const totalFilteredItems = allItems.length;

  return (
    <div className="space-y-4">
      {/* Items Grid */}
      <div ref={itemsGridRef} className="grid gap-2">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="border-border bg-muted/50 rounded-md border p-3"
          >
            <div className="font-medium">{item.name}</div>
            <div className="text-text-secondary text-sm">
              {item.description}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        filteredItems={totalFilteredItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemsPerPageOptions={[5, 10, 25, 50, 100]}
        showInfo={true}
        maxVisiblePages={5}
        className="w-full"
        type="items"
        scrollTargetRef={itemsGridRef as React.RefObject<HTMLElement>}
      />
    </div>
  );
};
