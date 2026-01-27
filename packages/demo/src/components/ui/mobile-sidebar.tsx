import {
  IconButton,
  ScrollArea,
  Sheet,
  SheetContainer,
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
        <SheetContainer className="py-0! pr-0!" side="left">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <SheetContent className="p-0">
            <ScrollArea className="h-full">
              <SheetDescription>{children}</SheetDescription>
            </ScrollArea>
          </SheetContent>
        </SheetContainer>
      </Sheet>
    </div>
  );
};
