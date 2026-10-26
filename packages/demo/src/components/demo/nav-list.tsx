import {
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Badge,
  Button,
  NavDrill,
  NavDrillLevel,
  NavList,
  NavListGroup,
  NavListItem,
  NavListSeparator,
  Sheet,
  SheetContainer,
  SheetTitle,
  SheetTrigger,
} from "@eqtylab/equality";
import {
  Activity,
  Award,
  BookOpen,
  Bot,
  ChartLine,
  Layers,
  LayoutGrid,
  Settings,
} from "lucide-react";

const frame: CSSProperties = {
  width: 240,
  padding: 8,
  borderRadius: 8,
  border: "1px solid var(--color-border-raised)",
  background: "var(--color-background-raised)",
};

// Rows are links; the demos keep you on the page and move the current row instead
function useCurrent(initial: string) {
  const [current, setCurrent] = useState(initial);
  const link = (id: string) => ({
    href: `#${id}`,
    current: current === id,
    onClick: (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setCurrent(id);
    },
  });
  return link;
}

function NavListGroupsDemo() {
  const link = useCurrent("dashboard");
  return (
    <div style={frame}>
      <NavList>
        <NavListGroup label="Project">
          <NavListItem
            label="Dashboard"
            prefix={<LayoutGrid />}
            {...link("dashboard")}
          />
          <NavListItem
            label="Indicators"
            prefix={<Activity />}
            {...link("indicators")}
          />
          <NavListItem
            label="Associated Agents"
            prefix={<Bot />}
            {...link("agents")}
          />
        </NavListGroup>
        <NavListGroup label="Applied Policies">
          <NavListItem
            label="EU AI Act"
            prefix={<BookOpen />}
            {...link("eu-ai-act")}
          />
          <NavListItem
            label="NIST AI RMF"
            prefix={<BookOpen />}
            {...link("nist-ai-rmf")}
          />
        </NavListGroup>
        <NavListSeparator />
        <NavListGroup>
          <NavListItem
            label="Project Settings"
            prefix={<Settings />}
            {...link("settings")}
          />
        </NavListGroup>
      </NavList>
    </div>
  );
}

function NavListPrefixSuffixDemo() {
  return (
    <div style={frame}>
      <NavList>
        <NavListGroup>
          <NavListItem
            label="Applied Policies"
            prefix={<BookOpen />}
            suffix={<Badge size="sm">2</Badge>}
            href="#policies"
            current
          />
          <NavListItem
            label="EU AI Act"
            prefix={<BookOpen />}
            drill="eu-ai-act"
          />
          <NavListItem
            label="Controls"
            prefix={<Layers />}
            suffix={<Badge size="sm">12</Badge>}
            href="#controls"
          />
        </NavListGroup>
      </NavList>
    </div>
  );
}

const APPLIED_POLICIES = [
  ["eu-ai-act", "EU AI Act"],
  ["nist-ai-rmf", "NIST AI RMF"],
];

// Levels must be direct children of NavDrill, so they are returned as an array, not a component
function policyLevels(link: ReturnType<typeof useCurrent>): ReactNode[] {
  return [
    <NavDrillLevel key="project" value="project">
      <NavListGroup label="Project">
        <NavListItem
          label="Dashboard"
          prefix={<LayoutGrid />}
          {...link("dashboard")}
        />
        <NavListItem
          label="Indicators"
          prefix={<Activity />}
          {...link("indicators")}
        />
        <NavListItem
          label="Associated Agents"
          prefix={<Bot />}
          {...link("agents")}
        />
      </NavListGroup>
      <NavListGroup label="Applied Policies">
        {APPLIED_POLICIES.map(([value, name]) => (
          <NavListItem
            key={value}
            label={name}
            prefix={<BookOpen />}
            drill={value}
          />
        ))}
      </NavListGroup>
    </NavDrillLevel>,
    ...APPLIED_POLICIES.map(([value, name]) => (
      <NavDrillLevel
        key={value}
        value={value}
        parent="project"
        label={name}
        backLabel={`${name}, back to the project`}
      >
        <NavListGroup>
          <NavListItem
            label="Controls"
            prefix={<Layers />}
            {...link(`${value}-controls`)}
          />
          <NavListItem
            label="Monitoring"
            prefix={<Activity />}
            {...link(`${value}-monitoring`)}
          />
          <NavListItem
            label="Indicator Evaluations"
            prefix={<ChartLine />}
            {...link(`${value}-evaluations`)}
          />
          <NavListItem
            label="Certification"
            prefix={<Award />}
            {...link(`${value}-certification`)}
          />
        </NavListGroup>
      </NavDrillLevel>
    )),
  ];
}

function NavListDrillDemo() {
  const link = useCurrent("dashboard");
  return (
    <div style={frame}>
      <NavList>
        <NavDrill defaultValue="project">{policyLevels(link)}</NavDrill>
      </NavList>
    </div>
  );
}

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

function NavListDrillSheetDemo() {
  const link = useCurrent("dashboard");
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="tertiary">
          Open navigation
        </Button>
      </SheetTrigger>
      <SheetContainer
        side="left"
        aria-describedby={undefined}
        style={{ minWidth: 0 }}
      >
        <SheetTitle style={visuallyHidden}>Navigation</SheetTitle>
        <NavList style={{ width: 264, padding: "16px 8px" }}>
          <NavDrill defaultValue="project">{policyLevels(link)}</NavDrill>
        </NavList>
      </SheetContainer>
    </Sheet>
  );
}

// Stands in for the browser: a drill row or ‹ pushes a page, Back pops one without a request
function NavListDrillControlledDemo() {
  const link = useCurrent("dashboard");
  const [history, setHistory] = useState(["project"]);
  const level = history[history.length - 1];
  const url = level === "project" ? "/project" : `/policies/${level}`;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "start",
        gap: 16,
      }}
    >
      <div style={frame}>
        <NavList>
          <NavDrill
            value={level}
            onValueChange={(next) => setHistory([...history, next])}
          >
            {policyLevels(link)}
          </NavDrill>
        </NavList>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ margin: 0 }}>
          URL: <code>{url}</code>
        </p>
        <Button
          size="sm"
          variant="tertiary"
          disabled={history.length === 1}
          onClick={() => setHistory(history.slice(0, -1))}
        >
          Browser Back
        </Button>
      </div>
    </div>
  );
}

const VARIANTS = {
  default: NavListGroupsDemo,
  "prefix-suffix": NavListPrefixSuffixDemo,
  drill: NavListDrillDemo,
  "drill-sheet": NavListDrillSheetDemo,
  "drill-controlled": NavListDrillControlledDemo,
};

export function NavListDemo({
  variant = "default",
}: {
  variant?: keyof typeof VARIANTS;
}) {
  const Demo = VARIANTS[variant];
  return (
    <div style={{ margin: "1rem 0" }}>
      <Demo />
    </div>
  );
}
