import { useState } from "react";
import { ProgressIndicator, ProgressIndicatorStep } from "@eqtylab/equality";

/* Default horizontal layout with a mix of statuses. */
export function ProgressIndicatorDemo({
  layout = "horizontal",
}: {
  layout?: "horizontal" | "vertical";
}) {
  return (
    <div style={{ margin: "2rem 0" }}>
      <ProgressIndicator
        layout={layout}
        currentIndex={2}
        aria-label="Progress Indicator"
        className="my-4"
      >
        <ProgressIndicatorStep
          name="Success"
          description="Completed"
          status="success"
        />

        <ProgressIndicatorStep
          name="Danger"
          description="Action required"
          status="danger"
        />
        <ProgressIndicatorStep
          name="Editing"
          description="In progress"
          status="editing"
        />
        <ProgressIndicatorStep
          name="Info"
          description="Read only step"
          status="info"
        />
        <ProgressIndicatorStep name="Neutral" status="neutral" />
        <ProgressIndicatorStep
          name="Empty"
          description="Not yet edited"
          status="empty"
        />
      </ProgressIndicator>
    </div>
  );
}

const STEPS = ["Getting Started", "Policy Details", "Controls", "Review"];

/* Interactive example: clicking a step makes it the current step. */
export function ProgressIndicatorInteractiveDemo() {
  const [active, setActive] = useState(1);

  return (
    <div style={{ margin: "2rem 0" }}>
      <ProgressIndicator
        aria-label="Policy creation steps"
        currentIndex={active}
      >
        {STEPS.map((name, index) => (
          <ProgressIndicatorStep
            key={name}
            name={name}
            status={
              index < active
                ? "success"
                : index === active
                  ? "editing"
                  : "neutral"
            }
            onClick={() => setActive(index)}
          />
        ))}
      </ProgressIndicator>
    </div>
  );
}

/* Link example: each step navigates via an href. */
export function ProgressIndicatorLinkDemo() {
  return (
    <div style={{ margin: "2rem 0" }}>
      <ProgressIndicator aria-label="Documentation progress" currentIndex={1}>
        <ProgressIndicatorStep
          name="Introduction"
          status="success"
          href="#introduction"
        />
        <ProgressIndicatorStep
          name="Installation"
          status="editing"
          href="#installation"
        />
        <ProgressIndicatorStep name="Usage" status="neutral" href="#usage" />
      </ProgressIndicator>
    </div>
  );
}
