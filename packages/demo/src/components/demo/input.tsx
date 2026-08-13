import { Input, Label } from "@eqtylab/equality";
import { useState } from "react";

const ERROR_TEXT = "Password must be at least 8 characters.";

const isTooShort = (value: string) => value.length > 0 && value.length < 8;

export function InputErrorTextDemo() {
  const [withHelp, setWithHelp] = useState("");
  const [withoutHelp, setWithoutHelp] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="input-error-text-help">Password (with help text)</Label>
        <Input
          id="input-error-text-help"
          type="password"
          placeholder="Enter password"
          value={withHelp}
          onChange={(e) => setWithHelp(e.target.value)}
          helpText="Use at least 8 characters."
          errorText={isTooShort(withHelp) ? ERROR_TEXT : undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="input-error-text-only">Password (no help text)</Label>
        <Input
          id="input-error-text-only"
          type="password"
          placeholder="Enter password"
          value={withoutHelp}
          onChange={(e) => setWithoutHelp(e.target.value)}
          errorText={isTooShort(withoutHelp) ? ERROR_TEXT : undefined}
        />
      </div>
    </div>
  );
}
