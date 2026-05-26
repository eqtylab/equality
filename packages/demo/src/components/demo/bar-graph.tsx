import { BarGraph, BarGraphSegment } from "@eqtylab/equality";

export function BarGraphDemo() {
  return (
    <div style={{ margin: "1rem 0 2rem" }}>
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
    </div>
  );
}

const controlsSegments = () => [
  <BarGraphSegment
    key="success"
    value={12}
    color="var(--color-brand-green)"
    label="Success"
    tooltip="12 controls"
  />,
  <BarGraphSegment
    key="pending"
    value={190}
    color="var(--color-brand-yellow)"
    label="Pending"
    tooltip="190 controls"
  />,
  <BarGraphSegment
    key="failure"
    value={1}
    color="var(--color-brand-red)"
    label="Failure"
    tooltip="1 control"
  />,
];

export function BarGraphSizeSmDemo() {
  return (
    <div style={{ margin: "1rem 0 2rem" }}>
      <BarGraph
        size="sm"
        aria-label="Controls status: 12 success, 3 pending, 28 failure"
      >
        {controlsSegments()}
      </BarGraph>
    </div>
  );
}

export function BarGraphSizeMdDemo() {
  return (
    <div style={{ margin: "1rem 0 2rem" }}>
      <BarGraph
        size="md"
        aria-label="Controls status: 12 success, 3 pending, 28 failure"
      >
        {controlsSegments()}
      </BarGraph>
    </div>
  );
}

export function BarGraphSizeLgDemo() {
  return (
    <div style={{ margin: "1rem 0 2rem" }}>
      <BarGraph
        size="lg"
        aria-label="Controls status: 12 success, 3 pending, 28 failure"
      >
        {controlsSegments()}
      </BarGraph>
    </div>
  );
}

export function BarGraphWithLabelsDemo() {
  return (
    <div style={{ margin: "1rem 0 2rem" }}>
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
    </div>
  );
}

export function BarGraphRichTooltipDemo() {
  return (
    <div style={{ margin: "1rem 0 2rem" }}>
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
          value={8}
          color="var(--color-brand-red)"
          label="8"
          tooltip={
            <div>
              <strong>Failure</strong>
              <p>8 controls</p>
            </div>
          }
        />
      </BarGraph>
    </div>
  );
}
