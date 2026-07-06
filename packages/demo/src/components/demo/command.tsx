import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@eqtylab/equality";
import { Check } from "lucide-react";
import { useState } from "react";

const options = ["Option 1", "Option 2", "Option 3"];

export const CommandDemo = () => {
  const [selected, setSelected] = useState("Option 1");

  return (
    <Command>
      <CommandInput placeholder="Search repositories..." />
      <CommandList>
        <CommandEmpty>No repositories found.</CommandEmpty>
        <CommandGroup heading="Repositories">
          {options.map((option) => (
            <CommandItem key={option} value={option} onSelect={setSelected}>
              {option}
              {selected === option && <Check />}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
