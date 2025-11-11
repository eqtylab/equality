import { RadioDropdown } from "@eqtylab/equality";
import { useState } from "react";

export const RadioDropdownDemo = () => {
  const [selectedStatus, setSelectedStatus] = useState<"active" | "archived">(
    "active",
  );

  const handleStatusChange = (value: "active" | "archived") => {
    setSelectedStatus(value);
  };

  return (
    <RadioDropdown
      label="Status"
      options={[
        { value: "active", label: "Active", count: 5 },
        { value: "archived", label: "Archived", count: 2 },
      ]}
      selectedValue={selectedStatus}
      onSelect={(value) => handleStatusChange(value as "active" | "archived")}
    />
  );
};
