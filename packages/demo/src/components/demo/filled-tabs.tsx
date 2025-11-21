import React from "react";
import { FilledTabs, Card, CardContent } from "@eqtylab/equality";

export function FilledTabsDemo() {
  const [activeTab, setActiveTab] = React.useState("declarations");

  return (
    <FilledTabs
      items={[
        {
          label: "Declarations",
          value: "declarations",
          icon: "Shield",
          content: (
            <Card>
              <CardContent>Declarations Content</CardContent>
            </Card>
          ),
        },
        {
          label: "Reviews",
          value: "reviews",
          icon: "Shield",
          content: (
            <Card>
              <CardContent>Reviews Content</CardContent>
            </Card>
          ),
        },
      ]}
      activeTab={activeTab}
      onValueChange={setActiveTab}
    />
  );
}
