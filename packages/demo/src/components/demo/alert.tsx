import { Alert, Button } from "@eqtylab/equality";
import { RefreshCw } from "lucide-react";

export function AlertActionDemo() {
  return (
    <Alert
      as="aside"
      variant="warning"
      title="Some agents couldn't be loaded."
      description="Results may be incomplete."
      action={
        <Button variant="tertiary" size="sm" prefix={<RefreshCw />}>
          Retry
        </Button>
      }
    />
  );
}
