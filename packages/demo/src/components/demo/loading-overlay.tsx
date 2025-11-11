import { Button, LoadingOverlay } from "@eqtylab/equality";
import { useState } from "react";

export const LoadingOverlayDemo = () => {
  const [isVisible, setIsVisible] = useState(false);

  const onShowLoadingOverlay = () => {
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  return (
    <div>
      <Button onClick={onShowLoadingOverlay}>Show Loading Overlay</Button>
      <LoadingOverlay isVisible={isVisible} />
    </div>
  );
};
