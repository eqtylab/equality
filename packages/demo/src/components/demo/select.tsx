import { useState } from "react";
import {
  SearchBar,
  SelectContent,
  SelectValue,
  Select,
  SelectTrigger,
  SelectItem,
} from "@eqtylab/equality";

export function SelectDemo({
  variant = "default",
}: {
  variant?: "default" | "disabled" | "pre-selected";
}) {
  const [selectValue, setSelectValue] = useState<string>("");

  if (variant === "default") {
    return (
      <Select value={selectValue} onValueChange={setSelectValue}>
        <SelectTrigger id="select-default">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
          <SelectItem value="option4">Option 4</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (variant === "disabled") {
    return (
      <Select disabled>
        <SelectTrigger id="select-disabled">
          <SelectValue placeholder="Disabled select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (variant === "pre-selected") {
    return (
      <Select defaultValue="option2">
        <SelectTrigger id="select-preselected">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return null;
}
