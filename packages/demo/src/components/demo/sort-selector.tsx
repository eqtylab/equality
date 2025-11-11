import {
  SortSelector,
  type SortField,
  type SortOrder,
} from "@eqtylab/equality";
import { useState } from "react";

export const SortSelectorDemo = () => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  return (
    <SortSelector
      sortField={sortField}
      sortOrder={sortOrder}
      setSortField={setSortField}
      setSortOrder={setSortOrder}
    />
  );
};
