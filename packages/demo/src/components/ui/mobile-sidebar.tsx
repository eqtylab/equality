import {
  IconButton,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@eqtylab/equality";
import { useEffect, useState, type ReactNode } from "react";

interface MobileSidebarProps {
  children?: ReactNode;
}

export const MobileSidebar = ({ children }: MobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Close on resize, to avoid showing on desktop
      setIsOpen(false);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <IconButton
        name="Menu"
        label="Open menu"
        size="md"
        onClick={() => setIsOpen(true)}
      />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="py-0! pr-0!" side="left">
          <div className="flex h-full w-full flex-col justify-between">
            <div className="flex max-h-full flex-col space-y-4">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                <SheetDescription>{children}</SheetDescription>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
