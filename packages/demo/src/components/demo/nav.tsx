import { useState, type CSSProperties, type MouseEvent } from "react";
import {
  Button,
  NavDrill,
  NavDrillLevel,
  NavList,
  NavListGroup,
  NavListItem,
  NavPanel,
  NavRail,
  NavRailItem,
  NavSwitcher,
  Sheet,
  SheetContainer,
  SheetTitle,
  SheetTrigger,
} from "@eqtylab/equality";
import {
  Activity,
  Award,
  Blocks,
  BookOpen,
  Bot,
  ChartLine,
  ClipboardCheck,
  Folder,
  Layers,
  LayoutGrid,
  LibraryBig,
  Logs,
  Network,
  Settings,
} from "lucide-react";

const PROJECTS = [
  { value: "ben", label: "Ben Project" },
  { value: "ada", label: "Ada Project" },
];

const POLICIES = [
  { slug: "eu-ai-act", name: "EU AI Act" },
  { slug: "nist-ai-rmf", name: "NIST AI RMF" },
];

const PROJECT_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutGrid /> },
  { id: "indicators", label: "Indicators", icon: <Activity /> },
  { id: "lineage", label: "Lineage Graphs", icon: <Network /> },
  { id: "agents", label: "Associated Agents", icon: <Bot /> },
  { id: "plugins", label: "Plugin Configurations", icon: <Blocks /> },
  { id: "settings", label: "Project Settings", icon: <Settings /> },
];

const POLICY_ITEMS = [
  { id: "controls", label: "Controls", icon: <Layers /> },
  { id: "monitoring", label: "Monitoring", icon: <Activity /> },
  { id: "evaluations", label: "Indicator Evaluations", icon: <ChartLine /> },
  { id: "certification", label: "Certification", icon: <Award /> },
];

function ProjectSidebar({
  onNavigate,
  example,
}: {
  onNavigate?: () => void;
  example?: string;
}) {
  const [project, setProject] = useState("ben");
  const [view, setView] = useState("project");
  const [current, setCurrent] = useState("dashboard");
  const projectName = PROJECTS.find(
    (option) => option.value === project,
  )!.label;
  const policy = POLICIES.find((item) => view === `policy:${item.slug}`);
  const named = (label: string) => (example ? `${label}, ${example}` : label);

  // Rows are links; the demo keeps you on the page and moves the current row instead
  const link = (id: string) => ({
    href: `#${id}`,
    current: current === id,
    onClick: (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setCurrent(id);
      onNavigate?.();
    },
  });

  return (
    <>
      <NavRail aria-label={named("Main")}>
        <NavRailItem
          icon={<Folder />}
          label="Projects"
          href="#projects"
          current
        />
        <NavRailItem icon={<Bot />} label="Agents" href="#agents" />
        <NavRailItem icon={<LibraryBig />} label="Library" href="#library" />
        <NavRailItem
          icon={<ClipboardCheck />}
          label="Assessments"
          href="#assessments"
        />
        <NavRailItem icon={<Logs />} label="Activity Logs" href="#logs" />
      </NavRail>
      <NavPanel
        aria-label={named(
          policy ? `Applied Policy: ${policy.name}` : `Project: ${projectName}`,
        )}
        header={
          <NavSwitcher
            label={projectName}
            noun="project"
            collection="projects"
            options={PROJECTS}
            value={project}
            onValueChange={(next) => {
              setProject(next);
              setView("project");
            }}
          />
        }
      >
        <NavList>
          <NavDrill value={view} onValueChange={(next) => setView(next)}>
            <NavDrillLevel value="project">
              <NavListGroup label="Project">
                {PROJECT_ITEMS.map((item) => (
                  <NavListItem
                    key={item.id}
                    label={item.label}
                    prefix={item.icon}
                    {...link(item.id)}
                  />
                ))}
              </NavListGroup>
              <NavListGroup label="Applied Policies">
                {POLICIES.map((item) => (
                  <NavListItem
                    key={item.slug}
                    label={item.name}
                    prefix={<BookOpen />}
                    drill={`policy:${item.slug}`}
                    {...link(item.slug)}
                  />
                ))}
              </NavListGroup>
            </NavDrillLevel>
            {policy && (
              <NavDrillLevel
                value={`policy:${policy.slug}`}
                parent="project"
                label={policy.name}
                backLabel={`${policy.name}, back to ${projectName}`}
              >
                <NavListGroup>
                  {POLICY_ITEMS.map((item) => (
                    <NavListItem
                      key={item.id}
                      label={item.label}
                      prefix={item.icon}
                      {...link(`${policy.slug}-${item.id}`)}
                    />
                  ))}
                </NavListGroup>
              </NavDrillLevel>
            )}
          </NavDrill>
        </NavList>
      </NavPanel>
    </>
  );
}

export function NavDemo({ example }: { example?: string }) {
  return (
    <div
      style={{
        display: "flex",
        height: 560,
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid var(--color-border-raised)",
      }}
    >
      <ProjectSidebar example={example} />
      <div style={{ flex: 1, minWidth: 0, padding: 24 }}>
        <p style={{ margin: 0 }}>Page content</p>
      </div>
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

export function NavSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ margin: "1rem 0" }}>
      <Sheet open={open} onOpenChange={setOpen}>
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
          <div style={{ display: "flex", height: "100%" }}>
            <ProjectSidebar onNavigate={() => setOpen(false)} />
          </div>
        </SheetContainer>
      </Sheet>
    </div>
  );
}

export function NavSwitcherDemo() {
  const [project, setProject] = useState("ben");
  const [current, setCurrent] = useState("dashboard");
  const projectName = PROJECTS.find(
    (option) => option.value === project,
  )!.label;

  // Rows are links; the demo keeps you on the page and moves the current row instead
  const link = (id: string) => ({
    href: `#${id}`,
    current: current === id,
    onClick: (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setCurrent(id);
    },
  });

  return (
    <div
      style={{
        display: "flex",
        height: 200,
        margin: "1rem 0",
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid var(--color-border-raised)",
      }}
    >
      <NavPanel
        aria-label={`Project: ${projectName}, Switcher example`}
        header={
          <NavSwitcher
            label={projectName}
            noun="project"
            collection="projects"
            options={PROJECTS}
            value={project}
            onValueChange={(next) => {
              setProject(next);
              setCurrent("dashboard");
            }}
            action={{ label: "Create Project", onSelect: () => {} }}
          />
        }
      >
        <NavList>
          <NavListGroup>
            {PROJECT_ITEMS.slice(0, 3).map((item) => (
              <NavListItem
                key={item.id}
                label={item.label}
                prefix={item.icon}
                {...link(item.id)}
              />
            ))}
          </NavListGroup>
        </NavList>
      </NavPanel>
      <div style={{ flex: 1, minWidth: 0, padding: 24 }}>
        <p style={{ margin: 0 }}>Page content</p>
      </div>
    </div>
  );
}
