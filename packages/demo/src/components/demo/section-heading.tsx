import { Button, SectionHeading } from "@eqtylab/equality";
import { UserPlus } from "lucide-react";

export function SectionHeadingDemo({
  withDescription = false,
}: {
  withDescription?: boolean;
}) {
  return (
    <SectionHeading
      heading={withDescription ? "Project Members" : "Filter Results"}
      description={
        withDescription
          ? "Manage member access and roles for this project"
          : undefined
      }
      renderRightContent={() =>
        withDescription ? (
          <Button>
            <UserPlus />
            Add Member
          </Button>
        ) : (
          <Button variant="link" size="sm">
            Clear Filters
          </Button>
        )
      }
    />
  );
}
