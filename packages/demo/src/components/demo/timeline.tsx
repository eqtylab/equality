import type { CSSProperties } from "react";
import {
  Check,
  CircleDashed,
  ClipboardCheck,
  Clock,
  Eye,
  OctagonAlert,
  TriangleAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  Timeline,
  TimelineItem,
  TimelineSection,
} from "@eqtylab/equality";

type TimelineSize = "sm" | "md";

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

/* A control's history. Cards at md, lines of text at sm. */
export function TimelineDemo({ size = "md" }: { size?: TimelineSize }) {
  const Entry = size === "sm" ? EntryLine : EntryCard;

  return (
    <Timeline
      aria-label={`Control timeline, ${size}`}
      size={size}
      style={underDocsHeader}
    >
      <TimelineSection label="Events while not started" icon={<CircleDashed />}>
        <TimelineItem>
          <Entry
            title="Control added"
            detail="Added with the AI Governance Baseline policy."
          />
        </TimelineItem>
      </TimelineSection>
      <TimelineSection
        label="Events while in progress"
        icon={<Clock />}
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
        icon={<Check />}
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
  { variant: "neutral", icon: <CircleDashed />, title: "Neutral" },
  { variant: "primary", icon: <Clock />, title: "Primary" },
  { variant: "success", icon: <Check />, title: "Success" },
  { variant: "warning", icon: <OctagonAlert />, title: "Warning" },
  { variant: "danger", icon: <TriangleAlert />, title: "Danger" },
] as const;

const EVENTS = ["First event", "Second event", "Third event"];

/* One section for each variant, in a scrolling pane so each marker can be seen staying beside its entries. */
export function TimelineVariantsDemo() {
  return (
    <div className="border-border h-96 overflow-y-auto rounded-md border p-4">
      <Timeline aria-label="Timeline variants">
        {VARIANTS.map(({ variant, icon, title }) => (
          <TimelineSection
            key={variant}
            label={`${title} section`}
            icon={icon}
            variant={variant}
          >
            {EVENTS.map((event) => (
              <TimelineItem key={event}>
                <EntryCard title={event} detail={`variant="${variant}"`} />
              </TimelineItem>
            ))}
          </TimelineSection>
        ))}
      </Timeline>
    </div>
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
        icon={<ClipboardCheck />}
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
        icon={<Eye />}
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
