import { RadioDropdown } from "@eqtylab/equality";
import { useState } from "react";

const CATEGORIES = [
  { value: "access-control", label: "Access control", count: 12 },
  { value: "audit-logging", label: "Audit logging", count: 4 },
  { value: "data-retention", label: "Data retention", count: 9 },
  { value: "encryption", label: "Encryption", count: 3 },
  { value: "incident-response", label: "Incident response", count: 7 },
  { value: "model-evaluation", label: "Model evaluation", count: 15 },
  { value: "privacy", label: "Privacy", count: 6 },
  { value: "third-party-risk", label: "Third party risk", count: 2 },
  { value: "training-data", label: "Training data", count: 11 },
  { value: "transparency", label: "Transparency", count: 8 },
];

export const RadioDropdownDemo = ({
  variant = "default",
}: {
  variant?: "default" | "searchable";
}) => {
  const [selectedStatus, setSelectedStatus] = useState<"active" | "archived">(
    "active",
  );
  const [category, setCategory] = useState("model-evaluation");

  const handleStatusChange = (value: "active" | "archived") => {
    setSelectedStatus(value);
  };

  if (variant === "searchable") {
    return (
      <div className="mb-4">
        <RadioDropdown
          label="Category"
          options={CATEGORIES}
          selectedValue={category}
          onSelect={setCategory}
          searchable
          searchPlaceholder="Search categories..."
          emptyPlaceholder="No categories match"
        />
      </div>
    );
  }

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
