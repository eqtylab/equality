import {
  Badge,
  Button,
  Card,
  CardContent,
  CardContentHeader,
  IconButton,
} from "@eqtylab/equality";
import type { ReactNode } from "react";

type TypographyExample =
  | "composite"
  | "align"
  | "spacing"
  | "card-header"
  | "title-1"
  | "title-2"
  | "section"
  | "body"
  | "caption"
  | "badge";

const Label = ({ children }: { children: ReactNode }) => (
  <code className="text-caption text-text-tertiary font-mono">{children}</code>
);

const Line = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => (
  <span
    className={`${className} bg-text-primary/5 outline-border inline-block outline-dashed outline-1`}
  >
    {children}
  </span>
);

const rows = [
  ["Claims Triage Assistant", "2 hours ago"],
  ["Underwriting Copilot", "5 hours ago"],
  ["Fraud Review Agent", "3 days ago"],
];

export function TypographyDemo({ example }: { example: TypographyExample }) {
  if (example === "composite") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>text-title-1 · a page</Label>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-title-1">Claims Processing</p>
              <p className="text-body text-text-secondary">
                Agents, policies and traffic for this project
              </p>
            </div>
            <Button>Associate Agent</Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>text-title-2 · a dialog, sheet or tab panel</Label>
          <Card>
            <CardContent className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <p className="text-title-2">Associate an Agent</p>
                <IconButton name="X" label="Close" />
              </div>
              <p className="text-body text-text-secondary">
                Pick an agent to track in Claims Processing.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-2">
          <Label>
            text-section · a card · text-body and text-caption · its rows
          </Label>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <CardContentHeader
                icon="Bot"
                heading="Associated Agents"
                onButtonClick={() => {}}
              />
              <ul className="flex flex-col">
                {rows.map(([name, when]) => (
                  <li
                    key={name}
                    className="border-border flex items-center justify-between gap-4 border-t py-2"
                  >
                    <span className="text-body">{name}</span>
                    <span className="text-caption text-text-secondary">
                      {when}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (example === "align") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Line className="text-title-1">Projects</Line>
          <Button>New Project</Button>
        </div>
        <div className="flex items-center gap-4">
          <Line className="text-title-2">Edit Project</Line>
          <IconButton name="X" label="Close" />
        </div>
        <div className="flex items-center gap-4">
          <Line className="text-section">Recent Activity</Line>
          <Button variant="tertiary" size="sm">
            See All
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Line className="text-body">Claims Triage Assistant</Line>
          <Badge variant="success">Active</Badge>
        </div>
      </div>
    );
  }

  if (example === "spacing") {
    return (
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col">
          <p className="text-section">Recent Activity</p>
          <p className="text-body text-text-secondary">
            What changed this week
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-title-2">Edit Project</p>
          <p className="text-body text-text-secondary">
            Change its name and owner
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-title-1">Projects</p>
          <p className="text-body text-text-secondary">
            Every project your team can open
          </p>
        </div>
      </div>
    );
  }

  if (example === "card-header") {
    return (
      <Card>
        <CardContent>
          <CardContentHeader
            icon="Activity"
            heading="Recent Activity"
            onButtonClick={() => {}}
          />
        </CardContent>
      </Card>
    );
  }

  if (example === "title-1") {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-title-1">Projects</p>
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
      <p className="text-title-1">Model Registry</p>
      <Badge variant="neutral">Beta</Badge>
    </div>
  );
}
