import { SortButton } from "@eqtylab/equality";
import { useState } from "react";

type SortField = "name" | "date" | "status";

export const SortButtonDemo = () => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <SortButton
        field="name"
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      >
        Name
      </SortButton>
      <SortButton
        field="date"
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      >
        Date
      </SortButton>
      <SortButton
        field="status"
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      >
        Status
      </SortButton>
    </div>
  );
};
