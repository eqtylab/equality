import {
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Badge,
  NavDrill,
  NavDrillLevel,
  NavList,
  NavListExpandable,
  NavListExpandableContent,
  NavListExpandableTrigger,
  NavListGroup,
  NavListItem,
  NavListSeparator,
} from "@eqtylab/equality";
import {
  Activity,
  Award,
  BookOpen,
  Blocks,
  Bot,
  Globe,
  ChartLine,
  Layers,
  LayoutGrid,
  Plus,
  Rocket,
  Settings,
  Trash2,
  Users,
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
        </NavListGroup>
        <NavListGroup label="Applied Policies">
          <NavListItem
            label="EU AI Act"
            prefix={<BookOpen />}
            {...link("eu-ai-act")}
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

// Stands in for the browser: a drill row or ‹ pushes a page, Back pops one without a request

function NavListExpandableBasicDemo() {
  const link = useCurrent("installation");
  return (
    <div style={frame}>
      <NavList>
        <NavListGroup>
          <NavListExpandable defaultOpen>
            <NavListExpandableTrigger label="Getting Started" />
            <NavListExpandableContent>
              <NavListItem label="Installation" {...link("installation")} />
              <NavListItem label="Theming" {...link("theming")} />
            </NavListExpandableContent>
          </NavListExpandable>
        </NavListGroup>
      </NavList>
    </div>
  );
}

function NavListExpandableNestedDemo() {
  const link = useCurrent("k3s-coco");
  return (
    <div style={frame}>
      <NavList>
        <NavListGroup>
          <NavListExpandable defaultOpen>
            <NavListExpandableTrigger label="Confidential Containers" />
            <NavListExpandableContent>
              <NavListItem label="Overview" {...link("overview")} />
              <NavListExpandable defaultOpen>
                <NavListExpandableTrigger label="Deployment" />
                <NavListExpandableContent>
                  <NavListItem label="Quick Start" {...link("quick-start")} />
                  <NavListExpandable defaultOpen>
                    <NavListExpandableTrigger label="Baremetal" />
                    <NavListExpandableContent>
                      <NavListItem label="BIOS Platform" {...link("bios")} />
                      <NavListItem label="K3s CoCo" {...link("k3s-coco")} />
                    </NavListExpandableContent>
                  </NavListExpandable>
                </NavListExpandableContent>
              </NavListExpandable>
            </NavListExpandableContent>
          </NavListExpandable>
        </NavListGroup>
      </NavList>
    </div>
  );
}

function NavListDocsSidebarDemo() {
  const link = useCurrent("installation");
  return (
    <div style={frame}>
      <NavList>
        <NavListGroup>
          <NavListExpandable defaultOpen>
            <NavListExpandableTrigger
              label="Getting Started"
              prefix={<Rocket />}
            />
            <NavListExpandableContent>
              <NavListItem label="Installation" {...link("installation")} />
              <NavListItem label="Theming" {...link("theming")} />
            </NavListExpandableContent>
          </NavListExpandable>
          <NavListExpandable>
            <NavListExpandableTrigger
              label="Guides"
              prefix={<BookOpen />}
              suffix={<Badge size="sm">Beta</Badge>}
            />
            <NavListExpandableContent>
              <NavListItem label="Quick Start" {...link("quick-start")} />
              <NavListExpandable>
                <NavListExpandableTrigger label="Deployment" />
                <NavListExpandableContent>
                  <NavListItem label="Baremetal" {...link("baremetal")} />
                  <NavListItem label="Cloud" {...link("cloud")} />
                </NavListExpandableContent>
              </NavListExpandable>
            </NavListExpandableContent>
          </NavListExpandable>
          <NavListExpandable>
            <NavListExpandableTrigger label="Components" prefix={<Blocks />} />
            <NavListExpandableContent>
              <NavListItem label="Button" {...link("button")} />
              <NavListItem label="Nav" {...link("nav")} />
            </NavListExpandableContent>
          </NavListExpandable>
          <NavListItem
            label="Status Page"
            prefix={<Globe />}
            href="https://status.eqtylab.io"
            target="_blank"
            rel="noopener noreferrer"
          />
        </NavListGroup>
      </NavList>
    </div>
  );
}

function DoDont({
  verdict,
  caption,
  children,
}: {
  verdict: "do" | "dont";
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure style={{ display: "grid", gap: 8, margin: 0, width: 240 }}>
      <div style={frame}>{children}</div>
      <figcaption
        style={{
          display: "grid",
          gap: 4,
          fontSize: 13,
          color: "var(--color-text-secondary)",
        }}
      >
        <span>
          <Badge size="sm" variant={verdict === "do" ? "success" : "danger"}>
            {verdict === "do" ? "Do" : "Don't"}
          </Badge>
        </span>
        {caption}
      </figcaption>
    </figure>
  );
}

function NavListDoDontIconsDemo() {
  const link = useCurrent("installation");
  const folders = (icons: [ReactNode, ReactNode]) => (
    <NavList>
      <NavListGroup>
        <NavListExpandable defaultOpen>
          <NavListExpandableTrigger label="Getting Started" prefix={icons[0]} />
          <NavListExpandableContent>
            <NavListItem label="Installation" {...link("installation")} />
            <NavListItem label="Themes" {...link("themes")} />
          </NavListExpandableContent>
        </NavListExpandable>
        <NavListExpandable defaultOpen>
          <NavListExpandableTrigger label="Components" prefix={icons[1]} />
          <NavListExpandableContent>
            <NavListItem label="Button" {...link("button")} />
          </NavListExpandableContent>
        </NavListExpandable>
      </NavListGroup>
    </NavList>
  );
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "start",
      }}
    >
      <DoDont
        verdict="do"
        caption="Icons on every top-level row. The rows inside have none, and line up under the label."
      >
        {folders([<Rocket />, <Blocks />])}
      </DoDont>
      <DoDont
        verdict="do"
        caption="No icons at all. The rows inside indent one step."
      >
        {folders([undefined, undefined])}
      </DoDont>
      <DoDont
        verdict="dont"
        caption="Icons on some top-level rows only, so the labels zigzag."
      >
        {folders([<Rocket />, undefined])}
      </DoDont>
    </div>
  );
}

function NavListDoDontStatusDemo() {
  const link = useCurrent("policies");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "start",
      }}
    >
      <DoDont
        verdict="do"
        caption="The status sits in suffix, and screen readers read it with the label."
      >
        <NavList>
          <NavListGroup>
            <NavListItem
              label="Policies"
              prefix={<BookOpen />}
              suffix={<Badge size="sm">New</Badge>}
              {...link("policies")}
            />
            <NavListItem
              label="Controls"
              prefix={<Layers />}
              {...link("controls")}
            />
          </NavListGroup>
        </NavList>
      </DoDont>
      <DoDont
        verdict="dont"
        caption="The status sits in prefix. Screen readers skip it, and the label moves out of line."
      >
        <NavList>
          <NavListGroup>
            <NavListItem
              label="Policies"
              prefix={<Badge size="sm">New</Badge>}
              {...link("policies")}
            />
            <NavListItem
              label="Controls"
              prefix={<Layers />}
              {...link("controls")}
            />
          </NavListGroup>
        </NavList>
      </DoDont>
    </div>
  );
}

function NavListDoDontActionsDemo() {
  const link = useCurrent("overview");
  const pages = (
    <>
      <NavListItem
        label="Overview"
        prefix={<LayoutGrid />}
        {...link("overview")}
      />
      <NavListItem label="Members" prefix={<Users />} {...link("members")} />
      <NavListItem
        label="Settings"
        prefix={<Settings />}
        {...link("settings")}
      />
    </>
  );
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "start",
      }}
    >
      <DoDont
        verdict="do"
        caption="Every row goes to a page. Actions live in a Dropdown Menu."
      >
        <NavList>
          <NavListGroup>{pages}</NavListGroup>
        </NavList>
      </DoDont>
      <DoDont
        verdict="dont"
        caption="Actions sit among the pages, so a click might create or delete something."
      >
        <NavList>
          <NavListGroup>
            {pages}
            <NavListItem
              label="New Project"
              prefix={<Plus />}
              onClick={() => {}}
            />
            <NavListItem
              label="Delete Project"
              prefix={<Trash2 />}
              onClick={() => {}}
            />
          </NavListGroup>
        </NavList>
      </DoDont>
    </div>
  );
}

function NavListDoDontStylingDemo() {
  const link = useCurrent("activity");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "start",
      }}
    >
      <DoDont
        verdict="do"
        caption="Rows take their colour and size from Equality."
      >
        <NavList>
          <NavListGroup>
            <NavListItem
              label="Activity"
              prefix={<Activity />}
              {...link("activity")}
            />
            <NavListItem label="Agents" prefix={<Bot />} {...link("agents")} />
            <NavListItem
              label="Alerts"
              prefix={<ChartLine />}
              {...link("alerts")}
            />
          </NavListGroup>
        </NavList>
      </DoDont>
      <DoDont
        verdict="dont"
        caption="One row is restyled to stand out, so it looks like an error or a different control."
      >
        <NavList>
          <NavListGroup>
            <NavListItem
              label="Activity"
              prefix={<Activity />}
              {...link("activity")}
            />
            <NavListItem label="Agents" prefix={<Bot />} {...link("agents")} />
            <NavListItem
              label="Alerts"
              prefix={<ChartLine />}
              style={{
                color: "var(--color-text-danger)",
                fontSize: 16,
                fontWeight: 600,
              }}
              {...link("alerts")}
            />
          </NavListGroup>
        </NavList>
      </DoDont>
    </div>
  );
}

const VARIANTS = {
  default: NavListGroupsDemo,
  "prefix-suffix": NavListPrefixSuffixDemo,
  drill: NavListDrillDemo,
  "expandable-basic": NavListExpandableBasicDemo,
  "expandable-nested": NavListExpandableNestedDemo,
  "docs-sidebar": NavListDocsSidebarDemo,
  "do-dont-icons": NavListDoDontIconsDemo,
  "do-dont-status": NavListDoDontStatusDemo,
  "do-dont-actions": NavListDoDontActionsDemo,
  "do-dont-styling": NavListDoDontStylingDemo,
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
