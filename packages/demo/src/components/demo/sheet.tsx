import {
  Avatar,
  AvatarFallback,
  Button,
  Sheet,
  SheetContainer,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetHeaderIcon,
  SheetTitle,
} from "@eqtylab/equality";
import { useState } from "react";

export const SheetDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Sheet</Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContainer side="right">
          <SheetHeader>
            <SheetHeaderIcon>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </SheetHeaderIcon>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <SheetContent>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </SheetContent>
          <SheetFooter>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </SheetFooter>
        </SheetContainer>
      </Sheet>
    </div>
  );
};
