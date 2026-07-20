import { useState, type Dispatch, type SetStateAction } from "react";

import { FilterDropdown } from "@eqtylab/equality";

const TEAMS = [
  { value: "applied-research", label: "Applied research" },
  { value: "data-platform", label: "Data platform" },
  { value: "design-system", label: "Design system" },
  { value: "developer-relations", label: "Developer relations" },
  { value: "governance", label: "Governance" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "legal", label: "Legal" },
  { value: "security", label: "Security" },
  { value: "solutions-engineering", label: "Solutions engineering" },
  { value: "trust-and-safety", label: "Trust and safety" },
];

export const FilterDropdownDemo = ({
  variant = "default",
}: {
  variant?: "default" | "searchable";
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const toggle = (
    setter: Dispatch<SetStateAction<string[]>>,
    value: string,
  ) => {
    setter((prev: string[]) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  if (variant === "searchable") {
    return (
      <div className="mb-4">
        <FilterDropdown
          label="Team"
          options={TEAMS}
          selectedFilters={selectedTeams}
          onToggleFilter={(value) => toggle(setSelectedTeams, value)}
          onClearAll={() => setSelectedTeams([])}
          searchable
          searchPlaceholder="Search teams..."
          emptyPlaceholder="No teams match"
        />
      </div>
    );
  }

  return (
    <FilterDropdown
      label="Scope"
      options={[
        { value: "organization", label: "Organization" },
        { value: "project", label: "Project" },
      ]}
      selectedFilters={selectedFilters}
      onToggleFilter={(value) => toggle(setSelectedFilters, value)}
      onClearAll={() => setSelectedFilters([])}
    />
  );
};
