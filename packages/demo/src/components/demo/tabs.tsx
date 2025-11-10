import { Tabs, TabsList, TabsTrigger } from "@eqtylab/equality";
import { cn } from "@/lib/utils";

export function TabsDemo({ withBorder = false }: { withBorder?: boolean }) {
  return (
    <Tabs className={cn(withBorder && "border-border border-b")}>
      <TabsList>
        <TabsTrigger value="declarations">Declarations</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
