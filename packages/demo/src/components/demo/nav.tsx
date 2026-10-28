import { useEffect, useState, type MouseEvent } from "react";
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

export function NavDemo() {
  const [project, setProject] = useState("ben");
  const [view, setView] = useState("project");
  const [current, setCurrent] = useState("dashboard");
  const projectName = PROJECTS.find(
    (option) => option.value === project,
  )!.label;
  const policy = POLICIES.find((item) => view === `policy:${item.slug}`);

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
        height: 560,
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid var(--color-border-raised)",
      }}
    >
      <NavRail aria-label="Main">
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
        aria-label={
          policy ? `Applied Policy: ${policy.name}` : `Project: ${projectName}`
        }
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
      <div style={{ flex: 1, padding: 24 }}>
        <p style={{ margin: 0 }}>Page content</p>
      </div>
    </div>
  );
}

export function NavSwitcherErrorDemo() {
  const [attempts, setAttempts] = useState(0);
  const [retrying, setRetrying] = useState(false);
  // The first retry fails too, so both outcomes show
  const loaded = attempts >= 2;

  useEffect(() => {
    if (!retrying) return;
    const timer = setTimeout(() => {
      setRetrying(false);
      setAttempts((count) => count + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [retrying]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 280,
          borderRadius: 8,
          border: "1px solid var(--color-border-raised)",
        }}
      >
        <NavPanel
          aria-label="Project: Ben Project"
          header={
            <NavSwitcher
              label="Ben Project"
              noun="project"
              collection="projects"
              options={loaded ? PROJECTS : []}
              value="ben"
              onValueChange={() => {}}
              error={!loaded}
              retrying={retrying}
              onRetry={() => setRetrying(true)}
            />
          }
        />
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={attempts === 0}
        onClick={() => {
          setRetrying(false);
          setAttempts(0);
        }}
      >
        Reset
      </Button>
    </div>
  );
}
