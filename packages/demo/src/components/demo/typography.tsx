import { Badge, Button, Card, CardContent } from "@eqtylab/equality";

type TypographyExample = "title" | "section" | "body" | "caption" | "badge";

export function TypographyDemo({ example }: { example: TypographyExample }) {
  if (example === "title") {
    return (
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title">Projects</h1>
        <Button>New Project</Button>
      </div>
    );
  }

  if (example === "section") {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-section">Recent Activity</h2>
            <Button variant="tertiary" size="sm">
              See All
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (example === "body") {
    return (
      <p className="text-body">
        Every model in this project is evaluated against its controls before
        release.
      </p>
    );
  }

  if (example === "caption") {
    return (
      <p className="text-caption text-text-secondary">Updated 2 hours ago</p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-title">Model Registry</h1>
      <Badge variant="neutral">Beta</Badge>
    </div>
  );
}
