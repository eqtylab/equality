import {
  Button,
  DialogDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@eqtylab/equality";
import { useState } from "react";

export const DialogDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogDescription>Dialog Description</DialogDescription>
          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
