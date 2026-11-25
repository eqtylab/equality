import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  ControlStatusBadge,
  Skeleton,
  TitleBlock,
  TitleBlockMark,
  TitleBlockSkeleton,
  type TitleBlockSize,
} from "@eqtylab/equality";
import avatarSrc from "@demo/assets/avatar.avif";
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
            size === "sm" ? (
              <Button variant="tertiary" size="sm">
                See All
              </Button>
            ) : (
              <Badge variant="success">Active</Badge>
            )
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
            mark={
              <Avatar size="md" aria-hidden>
                <AvatarImage src={avatarSrc.src} alt="" />
                <AvatarFallback>RG</AvatarFallback>
              </Avatar>
            }
            title="Rosa García"
            description="Project admin"
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <TitleBlock
            mark={
              <Avatar size="md" shape="square" aria-hidden>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            }
            title="AI Governance Baseline"
            description="Policy, 24 controls"
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
            trailing={
              <>
                <Badge variant="neutral">3 sources</Badge>
                <Button variant="tertiary" size="sm">
                  Edit
                </Button>
              </>
            }
          />
        </CardContent>
      </Card>
    </div>
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
