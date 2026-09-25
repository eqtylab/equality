import {
  Badge,
  SegmentedControls,
  type SegmentedControlOption,
  type SegmentedControlsDisplay,
  type SegmentedControlsSize,
} from "@eqtylab/equality";
import { useState } from "react";

export const SegmentedControlsDemo = ({
  options,
  defaultValue,
  display,
  size,
}: {
  options: SegmentedControlOption[];
  defaultValue: string;
  display?: SegmentedControlsDisplay;
  size?: SegmentedControlsSize;
}) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <SegmentedControls
      options={options}
      value={value}
      onValueChange={setValue}
      display={display}
      size={size}
    />
  );
};

const textOptions: SegmentedControlOption[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export const SegmentedControlsTextDemo = () => (
  <SegmentedControlsDemo defaultValue="week" options={textOptions} />
);

const iconOptions: SegmentedControlOption[] = [
  { value: "list", label: "List", icon: "List" },
  { value: "board", label: "Board", icon: "Columns3" },
  { value: "calendar", label: "Calendar", icon: "Calendar" },
];

export const SegmentedControlsIconDemo = () => (
  <SegmentedControlsDemo defaultValue="list" options={iconOptions} />
);

const suffixOptions: SegmentedControlOption[] = [
  {
    value: "all",
    label: "All",
    suffix: <Badge size="sm">128</Badge>,
  },
  {
    value: "open",
    label: "Open",
    suffix: <Badge size="sm">12</Badge>,
  },
  {
    value: "closed",
    label: "Closed",
    suffix: <Badge size="sm">116</Badge>,
  },
];

export const SegmentedControlsSuffixDemo = () => (
  <SegmentedControlsDemo defaultValue="all" options={suffixOptions} />
);

const iconOnlyOptions: SegmentedControlOption[] = [
  { value: "list", label: "List view", icon: "List" },
  { value: "table", label: "Table view", icon: "Grid3X3" },
];

export const SegmentedControlsIconOnlyDemo = () => (
  <div style={{ marginBottom: "1rem" }}>
    <SegmentedControlsDemo
      display="icon-only"
      defaultValue="table"
      options={iconOnlyOptions}
    />
  </div>
);

const sizes: SegmentedControlsSize[] = ["sm", "md", "lg"];

export const SegmentedControlsSizesDemo = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "1rem",
    }}
  >
    {sizes.map((size) => (
      <SegmentedControlsDemo
        key={size}
        size={size}
        defaultValue="list"
        options={iconOptions}
      />
    ))}
  </div>
);

const variantOptions: SegmentedControlOption[] = [
  { value: "primary", label: "Primary" },
  {
    value: "success",
    label: "Success",
    icon: "Check",
    variant: "success",
  },
  {
    value: "warning",
    label: "Warning",
    icon: "OctagonAlert",
    variant: "warning",
  },
  {
    value: "danger",
    label: "Danger",
    icon: "TriangleAlert",
    variant: "danger",
  },
  {
    value: "neutral",
    label: "Neutral",
    variant: "neutral",
  },
];

export const SegmentedControlsVariantsDemo = () => (
  <SegmentedControlsDemo defaultValue="danger" options={variantOptions} />
);
