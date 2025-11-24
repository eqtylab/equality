import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
} from "@eqtylab/equality";

export function PopoverDemo({
  align = "center",
}: {
  align?: "start" | "end" | "center";
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm">Click me</Button>
      </PopoverTrigger>
      <PopoverContent align={align}>
        <p>This is a popover</p>
      </PopoverContent>
    </Popover>
  );
}
