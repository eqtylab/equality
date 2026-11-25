import { Badge, Button, IconButton } from "@eqtylab/equality";

const STEPS = [
  {
    step: 16,
    parts: (
      <>
        <p className="text-caption text-text-secondary">Caption</p>
        <Badge size="sm">Small badge</Badge>
      </>
    ),
  },
  {
    step: 20,
    parts: (
      <>
        <p className="text-body">Body</p>
        <Badge>Badge</Badge>
      </>
    ),
  },
  {
    step: 24,
    parts: (
      <>
        <p className="text-section">Section</p>
        <IconButton size="xs" name="X" label="Clear" />
      </>
    ),
  },
  {
    step: 28,
    parts: (
      <>
        <div className="bg-background-sunken flex h-full items-center gap-3 rounded-md pl-2 pr-0.5">
          <p className="text-section">Section row</p>
          <Button size="sm" variant="tertiary">
            Small
          </Button>
        </div>
      </>
    ),
  },
  {
    step: 36,
    parts: (
      <>
        <p className="text-title">Title</p>
        <Button variant="tertiary">Default</Button>
      </>
    ),
  },
  {
    step: 44,
    parts: (
      <>
        <Button size="lg" variant="tertiary">
          Large
        </Button>
      </>
    ),
  },
  {
    step: 52,
    parts: (
      <div className="bg-background-sunken text-caption text-text-secondary w-(--eq-size-xl) flex h-full items-center justify-center rounded-md">
        Logo
      </div>
    ),
  },
];

export function SizingDemo() {
  return (
    <div className="space-y-2">
      {STEPS.map(({ step, parts }) => (
        <div key={step} className="flex items-center gap-4">
          <span className="text-caption text-text-tertiary w-6 shrink-0 text-right tabular-nums">
            {step}
          </span>
          <div
            className="border-border text-body box-content flex items-center gap-3 border-y border-dashed"
            style={{ height: step }}
          >
            {parts}
          </div>
        </div>
      ))}
    </div>
  );
}
