import { useState } from "react";

import { FilterDropdown } from "@eqtylab/equality";

export const FilterDropdownDemo = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const onToggleFilter = (value: string) => {
    setSelectedFilters((prev: string[]) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  const onClearAll = () => {
    setSelectedFilters([]);
  };

  return (
    <FilterDropdown
      label="Scope"
      options={[
        { value: "organization", label: "Organization" },
        { value: "project", label: "Project" },
      ]}
      selectedFilters={selectedFilters}
      onToggleFilter={onToggleFilter}
      onClearAll={onClearAll}
    />
  );
};
