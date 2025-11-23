import { useState } from "react";
import { Badge, Button } from "@eqtylab/equality";

type BadgeVariant = "primary" | "neutral" | "danger" | "success";

const variantOrder: BadgeVariant[] = [
  "primary",
  "neutral",
  "danger",
  "success",
];

export function BadgeClosableDemo() {
  const [badges, setBadges] = useState<number[]>([1, 2, 3, 4]);

  const addBadge = () => {
    setBadges((prev) => [...prev, Date.now()]);
  };

  const removeBadge = (id: number) => {
    setBadges((prev) => prev.filter((badgeId) => badgeId !== id));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map((id, index) => (
        <Badge
          key={id}
          variant={variantOrder[index % variantOrder.length]}
          closeable
          handleClosable={() => removeBadge(id)}
        >
          This is a badge
        </Badge>
      ))}
      <Button size="sm" variant="tertiary" onClick={addBadge}>
        Add Badge
      </Button>
    </div>
  );
}

export function BadgeTruncateDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge truncate truncateLength={15}>
        This is a badge that is longer than 15 characters
      </Badge>
      <Badge truncate>
        This is a badge that is longer than 50 characters and will be truncated
      </Badge>
      <Badge truncate>
        did:example:123456789abcdefghi123456789abcdefghi123456789abcdefghi
      </Badge>
    </div>
  );
}
