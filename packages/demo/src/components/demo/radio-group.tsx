import { Label, RadioGroup, RadioGroupItem } from "@eqtylab/equality";
import { useState } from "react";

export const RadioGroupDemo = () => {
  const [selectedValue, setSelectedValue] = useState<string>("none");

  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={(value) => setSelectedValue(value)}
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem value="none" />
        <Label htmlFor="none">No Access</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="read" />
        <Label htmlFor="read">Read Only</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="write" />
        <Label htmlFor="write">Read & Write</Label>
      </div>
    </RadioGroup>
  );
};
