import { DisplayField, IconButton } from "@eqtylab/equality";

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
