import {
  ListOrGridViewToggle,
  type ViewMode,
  type ViewOrder,
} from "@eqtylab/equality";
import { useState } from "react";

export const ListOrGridViewToggleDemo = ({
  viewMode: initialViewMode,
  order,
}: {
  viewMode: ViewMode;
  order: ViewOrder;
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);

  return (
    <ListOrGridViewToggle
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      order={order}
    />
  );
};
