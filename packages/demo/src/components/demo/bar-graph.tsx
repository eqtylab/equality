import { BarGraph, BarGraphSegment } from "@eqtylab/equality";

export function BarGraphDemo() {
  return (
    <BarGraph aria-label="Sprint capacity: 12 done, 3 in progress, 28 remaining">
      <BarGraphSegment
        value={12}
        color="var(--color-brand-green)"
        label="Done"
        tooltip="12 tasks done"
      />
      <BarGraphSegment
        value={3}
        color="var(--color-brand-yellow)"
        label="In progress"
        tooltip="3 tasks in progress"
      />
      <BarGraphSegment
        value={28}
        color="var(--color-greyscale-600)"
        label="Remaining"
        tooltip="28 tasks remaining"
      />
    </BarGraph>
  );
}

export function BarGraphWithLabelsDemo() {
  return (
    <BarGraph
      aria-label="Sprint capacity: 12 done, 3 in progress, 28 remaining"
      showLabels
    >
      <BarGraphSegment
        value={12}
        color="var(--color-brand-green)"
        label="Done"
        tooltip="12 tasks done"
      />
      <BarGraphSegment
        value={3}
        color="var(--color-brand-yellow)"
        label="In progress"
        tooltip="3 tasks in progress"
      />
      <BarGraphSegment
        value={28}
        color="var(--color-greyscale-600)"
        label="Remaining"
        tooltip="28 tasks remaining"
      />
    </BarGraph>
  );
}

export function BarGraphRichTooltipDemo() {
  return (
    <BarGraph
      aria-label="Storage usage: 240GB documents, 80GB media, 120GB free"
      showLabels
    >
      <BarGraphSegment
        value={10}
        color="var(--color-brand-green)"
        label="10"
        tooltip={
          <div>
            <strong>Success</strong>
            <p>10 controls</p>
          </div>
        }
      />
      <BarGraphSegment
        value={290}
        color="var(--color-brand-yellow)"
        label="290"
        tooltip={
          <div>
            <strong>Pending</strong>
            <p>290 controls</p>
          </div>
        }
      />
      <BarGraphSegment
        value={3}
        color="var(--color-brand-red)"
        label="3"
        tooltip={
          <div>
            <strong>Failure</strong>
            <p>3 controls</p>
          </div>
        }
      />
    </BarGraph>
  );
}
