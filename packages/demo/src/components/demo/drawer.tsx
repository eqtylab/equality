import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerHeaderActions,
  DrawerInnerContent,
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
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>Drawer Description</DrawerDescription>
            <DrawerHeaderActions rowSpan={2}>
              <Button variant="tertiary" size="sm" onClick={onClose}>
                <X />
              </Button>
            </DrawerHeaderActions>
          </DrawerHeader>

          <DrawerInnerContent>Drawer Content</DrawerInnerContent>

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
