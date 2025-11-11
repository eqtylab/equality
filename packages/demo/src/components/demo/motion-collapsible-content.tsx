import { Button, MotionCollapsibleContent } from "@eqtylab/equality";
import React, { useState } from "react";

export const MotionCollapsibleContentDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col space-y-6">
      <Button onClick={() => setIsOpen(!isOpen)}>Click me</Button>
      <MotionCollapsibleContent isOpen={isOpen}>
        <div>
          <h3 className="text-lg font-medium">Motion Collapsible Content</h3>
          <p>
            This is the content of the motion collapsible content. It is
            displayed when the motion collapsible content is open.
          </p>
        </div>
      </MotionCollapsibleContent>
    </div>
  );
};
