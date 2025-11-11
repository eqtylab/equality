import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@eqtylab/equality";
import { useState } from "react";

export const SheetDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Sheet</Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right">
          <div className="flex h-full w-full flex-col justify-between">
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle>Sheet Title</SheetTitle>
              </SheetHeader>
              <SheetDescription>Sheet Description</SheetDescription>
            </div>
            <SheetFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
