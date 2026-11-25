import {
  Badge,
  Button,
  Card,
  CardContent,
  ControlStatusBadge,
  IconButton,
  Progress,
  Skeleton,
  TitleBlock,
  TitleBlockMark,
  TitleBlockSkeleton,
  type TitleBlockSize,
} from "@eqtylab/equality";
import { useState } from "react";

const SIZE_EXAMPLES: Record<
  TitleBlockSize,
  { icon: string; title: string; description?: string }
> = {
  sm: { icon: "SquareChartGantt", title: "Activity Logs" },
  md: {
    icon: "Layers",
    title: "Data Layer",
    description: "Inputs every run reads from",
  },
  lg: {
    icon: "Settings2",
    title: "Configuration Summary",
    description: "What this project runs, and the rules it is checked against",
  },
};

export function TitleBlockSizeDemo({ size }: { size: TitleBlockSize }) {
  const { icon, title, description } = SIZE_EXAMPLES[size];

  return (
    <Card>
      <CardContent>
        <TitleBlock
          size={size}
          mark={<TitleBlockMark icon={icon} />}
          title={title}
          description={description}
          trailing={
            size === "sm" ? undefined : <Badge variant="success">Active</Badge>
          }
          actions={
            size === "sm" ? (
              <Button variant="tertiary" size="sm">
                See All
              </Button>
            ) : undefined
          }
        />
      </CardContent>
    </Card>
  );
}

export function TitleBlockNoDescriptionDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardContent>
          <TitleBlock
            mark={<TitleBlockMark icon="Layers" />}
            title="Data Layer"
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <TitleBlock
            size="lg"
            mark={<TitleBlockMark icon="Settings2" />}
            title="Configuration Summary"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function TitleBlockMarksDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardContent>
          <TitleBlock
            mark={<TitleBlockMark icon="Layers" />}
            title="Data Layer"
            description="Inputs every run reads from"
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <TitleBlock
            title="Members"
            description="People who can see and change this project"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function TitleBlockTrailingDemo() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardContent>
          <TitleBlock
            mark={<TitleBlockMark icon="ShieldCheck" />}
            title="Data Retention"
            description="Control 4.2"
            trailing={<ControlStatusBadge status="compliant" />}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <TitleBlock
            mark={<TitleBlockMark icon="Layers" />}
            title="Data Layer"
            description="Inputs every run reads from"
            trailing={<Badge variant="neutral">3 sources</Badge>}
            actions={
              <Button variant="tertiary" size="sm">
                Edit
              </Button>
            }
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <TitleBlock
            size="lg"
            mark={<TitleBlockMark icon="Settings2" />}
            title="Configuration Summary"
            description="What this project runs with today"
            trailing={<Badge variant="success">Active</Badge>}
            actions={
              <IconButton name="EllipsisVertical" label="More actions" />
            }
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-4">
          <TitleBlock
            title="Members"
            actions={
              <Button variant="tertiary" size="sm">
                Invite
              </Button>
            }
          />
          <TitleBlock
            size="lg"
            title="Policies"
            actions={
              <Button variant="tertiary" size="sm">
                Add Policy
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function TitleBlockMoreContentDemo() {
  return (
    <Card className="max-w-sm">
      <CardContent>
        <TitleBlock
          mark={<TitleBlockMark icon="Layers" />}
          title="Data Layer"
          description="Inputs every run reads from"
        >
          <Progress value={60} className="mt-2" aria-label="Sources read" />
        </TitleBlock>
      </CardContent>
    </Card>
  );
}

export function TitleBlockLongTitleDemo() {
  return (
    <Card className="max-w-xs">
      <CardContent>
        <TitleBlock
          mark={<TitleBlockMark icon="ClipboardCheck" />}
          title="Evaluations Awaiting Reviewer Sign-off Before Release"
          description="Seven evaluations from the last run"
          trailing={<Badge variant="warning">7</Badge>}
        />
      </CardContent>
    </Card>
  );
}

export function TitleBlockSkeletonDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          {loading ? (
            <TitleBlockSkeleton
              titleWidth="w-28"
              descriptionWidth="w-48"
              trailing={<Skeleton className="h-5 w-14" />}
            />
          ) : (
            <TitleBlock
              mark={<TitleBlockMark icon="Layers" />}
              title="Data Layer"
              description="Inputs every run reads from"
              trailing={<Badge variant="success">Active</Badge>}
            />
          )}
        </CardContent>
      </Card>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setLoading(!loading)}
      >
        {loading ? "Show loaded" : "Show loading"}
      </Button>
    </div>
  );
}
