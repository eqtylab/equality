import { useState } from "react";
import {
  SelectContent,
  SelectValue,
  Select,
  SelectTrigger,
  SelectItem,
} from "@eqtylab/equality";
import type { Elevation } from "@eqtylab/equality";

export function SelectDemo({
  variant = "default",
  elevation,
}: {
  variant?: "default" | "disabled" | "pre-selected";
  elevation?: Elevation;
}) {
  const [selectValue, setSelectValue] = useState<string>("");

  if (variant === "default") {
    return (
      <Select value={selectValue} onValueChange={setSelectValue}>
        <SelectTrigger id="select-default">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent elevation={elevation}>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
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
        <SelectContent elevation={elevation}>
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
        <SelectContent elevation={elevation}>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
          <SelectItem value="option4">Option 4</SelectItem>
          <SelectItem value="option5">Option 5</SelectItem>
          <SelectItem value="option6">Option 6</SelectItem>
          <SelectItem value="option7">Option 7</SelectItem>
          <SelectItem value="option8">Option 8</SelectItem>
          <SelectItem value="option9">Option 9</SelectItem>
          <SelectItem value="option10">Option 10</SelectItem>
          <SelectItem value="option11">Option 11</SelectItem>
          <SelectItem value="option12">Option 12</SelectItem>
          <SelectItem value="option13">Option 13</SelectItem>
          <SelectItem value="option14">Option 14</SelectItem>
          <SelectItem value="option15">Option 15</SelectItem>
          <SelectItem value="option16">Option 16</SelectItem>
          <SelectItem value="option17">Option 17</SelectItem>
          <SelectItem value="option18">Option 18</SelectItem>
          <SelectItem value="option19">Option 19</SelectItem>
          <SelectItem value="option20">Option 20</SelectItem>
          <SelectItem value="option21">Option 21</SelectItem>
          <SelectItem value="option22">Option 22</SelectItem>
          <SelectItem value="option23">Option 23</SelectItem>
          <SelectItem value="option24">Option 24</SelectItem>
          <SelectItem value="option25">Option 25</SelectItem>
          <SelectItem value="option26">Option 26</SelectItem>
          <SelectItem value="option27">Option 27</SelectItem>
          <SelectItem value="option28">Option 28</SelectItem>
          <SelectItem value="option29">Option 29</SelectItem>
          <SelectItem value="option30">Option 30</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return null;
}
