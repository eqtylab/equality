import {
  Badge,
  Button,
  Card,
  CardContent,
  IconButton,
} from "@eqtylab/equality";

type TypographyExample =
  | "title"
  | "title-2"
  | "section"
  | "body"
  | "caption"
  | "badge";

export function TypographyDemo({ example }: { example: TypographyExample }) {
  if (example === "title") {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-title">Projects</p>
        <Button>New Project</Button>
      </div>
    );
  }

  if (example === "title-2") {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-title-2">Edit Project</p>
        <IconButton name="X" label="Close" />
      </div>
    );
  }

  if (example === "section") {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <p className="text-section">Recent Activity</p>
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
      <p className="text-title">Model Registry</p>
      <Badge variant="neutral">Beta</Badge>
    </div>
  );
}
