import {
  SortSelector,
  type SortField,
  type SortMode,
  type SortOrder,
} from "@eqtylab/equality";
import { useState } from "react";

export const SortSelectorDemo = ({
  showDateOptions = true,
  sortMode = "created",
}: {
  showDateOptions?: boolean;
  sortMode?: SortMode;
}) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  return (
    <SortSelector
      sortField={sortField}
      sortOrder={sortOrder}
      setSortField={setSortField}
      setSortOrder={setSortOrder}
      showDateOptions={showDateOptions}
      sortMode={sortMode}
    />
  );
};
