import {
  Button,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Command,
} from "@eqtylab/equality";
import { Check } from "lucide-react";
import { useState } from "react";

export const CommandDemo = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <div className="space-y-8">
      <Button size="sm" onClick={() => setOpen(true)}>
        Open command dialog
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search repositories..." />
        <CommandList>
          <CommandEmpty>No repositories found.</CommandEmpty>
          <CommandGroup heading="Repositories">
            <CommandItem value="Option 1" onSelect={handleClose}>
              Option 1
              <Check />
            </CommandItem>
            <CommandItem value="Option 2" onSelect={handleClose}>
              Option 2
            </CommandItem>
            <CommandItem value="Option 3" onSelect={handleClose}>
              Option 3
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Command>
        <CommandInput placeholder="Search repositories..." />
        <CommandList>
          <CommandEmpty>No repositories found.</CommandEmpty>
          <CommandGroup heading="Repositories">
            <CommandItem value="Option 1">
              Option 1
              <Check />
            </CommandItem>
            <CommandItem value="Option 2">Option 2</CommandItem>
            <CommandItem value="Option 3">Option 3</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};
