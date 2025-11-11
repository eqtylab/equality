import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@eqtylab/equality";
import { Check } from "lucide-react";

export const CommandDemo = () => {
  return (
    <Command>
      <CommandInput placeholder="Search repositories..." />
      <CommandEmpty>No repositories found.</CommandEmpty>
      <CommandGroup heading="Repositories">
        <CommandItem value="Option 1" onSelect={() => {}}>
          Option 1
          <Check />
        </CommandItem>
        <CommandItem value="Option 2" onSelect={() => {}}>
          Option 2
        </CommandItem>
        <CommandItem value="Option 3" onSelect={() => {}}>
          Option 3
        </CommandItem>
      </CommandGroup>
    </Command>
  );
};
