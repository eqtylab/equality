import type { CSSProperties } from "react";
import {
  Card,
  CardContent,
  Timeline,
  TimelineItem,
  TimelineSection,
} from "@eqtylab/equality";

type TimelineSize = "sm" | "md" | "lg";

interface EntryProps {
  title: string;
  detail: string;
}

const EntryCard = ({ title, detail }: EntryProps) => (
  <Card>
    <CardContent>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-text-secondary text-sm">{detail}</p>
      </div>
    </CardContent>
  </Card>
);

const EntryLine = ({ title, detail }: EntryProps) => (
  <p className="text-sm leading-5">
    <span className="font-medium">{title}</span>{" "}
    <span className="text-text-secondary">{detail}</span>
  </p>
);

/* Pins the markers below the docs site's sticky header, for a timeline that scrolls with the page. */
const underDocsHeader = {
  "--eq-timeline-offset": "var(--eq-docs-header-height)",
} as CSSProperties;

/* A control's history. Cards at md and lg, lines of text at sm. */
export function TimelineDemo({ size = "md" }: { size?: TimelineSize }) {
  const Entry = size === "sm" ? EntryLine : EntryCard;

  return (
    <Timeline
      aria-label={`Control timeline, ${size}`}
      size={size}
      style={underDocsHeader}
    >
      <TimelineSection label="Events while not started" icon="CircleDashed">
        <TimelineItem>
          <Entry
            title="Control added"
            detail="Added with the AI Governance Baseline policy."
          />
        </TimelineItem>
      </TimelineSection>
      <TimelineSection
        label="Events while in progress"
        icon="Clock"
        variant="primary"
      >
        <TimelineItem>
          <Entry
            title="Evidence attached"
            detail="model-card.pdf uploaded by Ada Okafor."
          />
        </TimelineItem>
        <TimelineItem>
          <Entry
            title="Declaration submitted"
            detail="Sent to reviewers for a decision."
          />
        </TimelineItem>
      </TimelineSection>
      <TimelineSection
        label="Events while compliant"
        icon="Check"
        variant="success"
      >
        <TimelineItem>
          <Entry
            title="Declaration accepted"
            detail="Accepted by Sam Rivera."
          />
        </TimelineItem>
      </TimelineSection>
    </Timeline>
  );
}

const VARIANTS = [
  { variant: "neutral", icon: "CircleDashed", title: "Neutral" },
  { variant: "primary", icon: "Clock", title: "Primary" },
  { variant: "success", icon: "Check", title: "Success" },
  { variant: "warning", icon: "OctagonAlert", title: "Warning" },
  { variant: "danger", icon: "TriangleAlert", title: "Danger" },
] as const;

/* One section for each variant. */
export function TimelineVariantsDemo() {
  return (
    <Timeline aria-label="Timeline variants" style={underDocsHeader}>
      {VARIANTS.map(({ variant, icon, title }) => (
        <TimelineSection
          key={variant}
          label={`${title} section`}
          icon={icon}
          variant={variant}
        >
          <TimelineItem>
            <EntryCard title={title} detail={`variant="${variant}"`} />
          </TimelineItem>
        </TimelineSection>
      ))}
    </Timeline>
  );
}

const markerColors = (status: string) =>
  ({
    "--eq-timeline-marker-background": `var(--color-badge-background-${status})`,
    "--eq-timeline-marker-color": `var(--color-badge-text-${status})`,
  }) as CSSProperties;

/* Sections in a control status's colours, which no variant has. */
export function TimelineCustomColorDemo() {
  return (
    <Timeline aria-label="Review timeline" style={underDocsHeader}>
      <TimelineSection
        label="Events while ready for review"
        icon="ClipboardCheck"
        style={markerColors("ready-for-review")}
      >
        <TimelineItem>
          <EntryCard
            title="Declaration submitted"
            detail="Sent to reviewers for a decision."
          />
        </TimelineItem>
      </TimelineSection>
      <TimelineSection
        label="Events while in review"
        icon="Eye"
        style={markerColors("in-review")}
      >
        <TimelineItem>
          <EntryCard
            title="Review started"
            detail="Sam Rivera opened the declaration."
          />
        </TimelineItem>
      </TimelineSection>
    </Timeline>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/* A scrolling pane, so each marker can be seen staying beside its entries. */
export function TimelinePinnedDemo() {
  return (
    <div className="border-border h-72 overflow-y-auto rounded-md border p-4">
      <Timeline aria-label="Evaluation timeline" size="sm">
        <TimelineSection
          label="Evaluations while passing"
          icon="Check"
          variant="success"
        >
          {DAYS.map((day) => (
            <TimelineItem key={day}>
              <EntryLine title={`${day}'s evaluation`} detail="Passed." />
            </TimelineItem>
          ))}
        </TimelineSection>
        <TimelineSection
          label="Evaluations while failing"
          icon="TriangleAlert"
          variant="danger"
        >
          {DAYS.map((day) => (
            <TimelineItem key={day}>
              <EntryLine
                title={`${day}'s evaluation`}
                detail="Failed: the bucket is not encrypted."
              />
            </TimelineItem>
          ))}
        </TimelineSection>
        <TimelineSection
          label="Evaluations since the fix"
          icon="Check"
          variant="success"
        >
          {DAYS.map((day) => (
            <TimelineItem key={day}>
              <EntryLine title={`${day}'s evaluation`} detail="Passed." />
            </TimelineItem>
          ))}
        </TimelineSection>
      </Timeline>
    </div>
  );
}
