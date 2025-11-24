import {
  Card,
  CardContent,
  Tabs,
  TabsContainer,
  TabsList,
  TabsTrigger,
} from "@eqtylab/equality";
import { cn } from "@/lib/utils";

export function OldTabsDemo({ withBorder = false }: { withBorder?: boolean }) {
  return (
    <TabsContainer className={cn(withBorder && "border-border border-b")}>
      <TabsList>
        <TabsTrigger value="declarations">Declarations</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
    </TabsContainer>
  );
}

export function TabsDemo({
  variant = "default",
}: {
  variant?:
    | "default"
    | "with-icons"
    | "with-active-fill"
    | "with-icons-and-active-fill";
}) {
  if (variant === "default") {
    return (
      <Tabs
        id="default-tabs"
        items={[
          {
            label: "Declarations",
            value: "declarations",
            content: (
              <div>
                <CardContent>Declarations Content</CardContent>
              </div>
            ),
          },
          {
            label: "Reviews",
            value: "reviews",
            content: (
              <div>
                <CardContent>Reviews Content</CardContent>
              </div>
            ),
          },
        ]}
      />
    );
  }

  if (variant === "with-icons") {
    return (
      <Tabs
        id="with-icons-tabs"
        items={[
          {
            label: "Declarations",
            value: "declarations",
            icon: "Pen",
            content: (
              <Card>
                <CardContent>Declarations Content</CardContent>
              </Card>
            ),
          },
          {
            label: "Reviews",
            value: "reviews",
            icon: "Eye",
            content: (
              <Card>
                <CardContent>Reviews Content</CardContent>
              </Card>
            ),
          },
        ]}
      />
    );
  }

  if (variant === "with-active-fill") {
    return (
      <Tabs
        id="with-active-fill-tabs"
        items={[
          {
            label: "Implementation",
            value: "implementation",
            content: (
              <Card>
                <CardContent>Implementation Content</CardContent>
              </Card>
            ),
          },
          {
            label: "Monitoring",
            value: "monitoring",
            content: (
              <Card>
                <CardContent>Monitoring Content</CardContent>
              </Card>
            ),
          },
          {
            label: "Report",
            value: "report",
            content: (
              <Card>
                <CardContent>Report Content</CardContent>
              </Card>
            ),
          },
        ]}
        tabsListBackground="filled"
      />
    );
  }

  if (variant === "with-icons-and-active-fill") {
    return (
      <Tabs
        id="with-icons-and-active-fill-tabs"
        items={[
          {
            label: "Implementation",
            value: "implementation",
            icon: "Shield",
            content: (
              <Card>
                <CardContent>Implementation Content</CardContent>
              </Card>
            ),
          },
          {
            label: "Monitoring",
            value: "monitoring",
            icon: "Activity",
            content: (
              <Card>
                <CardContent>Monitoring Content</CardContent>
              </Card>
            ),
          },
          {
            label: "Report",
            value: "report",
            icon: "FileChartLine",
            content: (
              <Card>
                <CardContent>Report Content</CardContent>
              </Card>
            ),
          },
        ]}
        tabsListBackground="filled"
      />
    );
  }

  return null;
}
