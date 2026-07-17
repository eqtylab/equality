import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
} from "@eqtylab/equality";

export function PopoverDemo({
  align = "center",
  arrow = false,
}: {
  align?: "start" | "end" | "center";
  arrow?: boolean;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm">Click me</Button>
        </PopoverTrigger>
        <PopoverContent align={align} arrow={arrow}>
          <p>This is a popover</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
