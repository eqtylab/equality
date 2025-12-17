import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@eqtylab/equality";
import { useState } from "react";
import { X } from "lucide-react";

export const DrawerDemo = () => {
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button size="sm" variant="tertiary" onClick={() => setOpen(true)}>
        Open Drawer
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="grid-cols-[1fr_auto]">
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>Drawer Description</DrawerDescription>
            <Button
              variant="tertiary"
              size="sm"
              onClick={onClose}
              className="col-start-2 row-span-2 row-start-1"
            >
              <X />
            </Button>
          </DrawerHeader>

          <div className="px-4">Drawer Content</div>

          <DrawerFooter>
            <Button size="sm" variant="tertiary" onClick={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
