import {
  Button,
  DialogDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Card,
  CardContent,
  ELEVATION,
} from "@eqtylab/equality";
import { useState } from "react";

export const DialogDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button size="sm" onClick={() => setIsModalOpen(true)}>
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
              variant="tertiary"
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

export const DialogWithTableDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button size="sm" onClick={() => setIsModalOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogDescription>Dialog Description</DialogDescription>
          <Card elevation={ELEVATION.FLOATING}>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Card</h4>
                <p className="text-text-secondary text-sm">
                  This card has an elevation of Floating.
                </p>
              </div>
            </CardContent>
          </Card>
          <DialogFooter>
            <Button
              size="sm"
              variant="tertiary"
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
