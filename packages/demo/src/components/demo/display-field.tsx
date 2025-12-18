import { DisplayField, IconButton } from "@eqtylab/equality";
import type { Elevation } from "@eqtylab/equality/lib/elevations";

export const DisplayFieldDemo = ({
  truncate = false,
  copy = true,
  prefix = "",
  variant = "neutral",
  elevation,
}: {
  truncate?: true | false | "middle";
  copy?: boolean;
  prefix?: string;
  variant?: "neutral" | "success" | "neutralCheck" | "failure";
  elevation?: Elevation;
}) => {
  return (
    <DisplayField
      truncate={truncate}
      copy={copy}
      prefix={prefix}
      variant={variant}
      elevation={elevation}
    >
      zQ3shrGxRrYyWixJGrr45jJ1MEY76YQZ4KVbt9CYRsTWZ5MWV
    </DisplayField>
  );
};

export function DisplayFieldWithActionsDemo({
  copy = true,
}: {
  copy?: boolean;
}) {
  return (
    <DisplayField
      copy={copy}
      actions={
        <>
          <IconButton
            name="ExternalLink"
            label="Open"
            size="sm"
            onClick={() => console.log("Open clicked")}
          />
          <IconButton
            name="Share2"
            label="Share"
            size="sm"
            onClick={() => console.log("Share clicked")}
          />
        </>
      }
    >
      zQ3shrGxRrYyWixJGrr45jJ1MEY76YQZ4KVbt9CYRsTWZ5MWV
    </DisplayField>
  );
}

export const DisplayFieldWithSlotDemo = ({
  truncate = false,
  copy = true,
  prefix = "",
  variant = "neutral",
  elevation,
}: {
  truncate?: true | false | "middle";
  copy?: boolean;
  prefix?: string;
  variant?: "neutral" | "success" | "neutralCheck" | "failure";
  elevation?: Elevation;
}) => {
  return (
    <DisplayField
      truncate={truncate}
      copy={copy}
      prefix={prefix}
      variant={variant}
      elevation={elevation}
      slot={
        <div className="flex flex-col gap-2">
          <div>No additional data available</div>
          <div>VComp Container</div>
        </div>
      }
    >
      zQ3shrGxRrYyWixJGrr45jJ1MEY76YQZ4KVbt9CYRsTWZ5MWV
    </DisplayField>
  );
};
