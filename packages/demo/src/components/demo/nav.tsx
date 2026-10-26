import { useState, type MouseEvent } from "react";
import {
  Menu,
  MenuBackButton,
  MenuDrill,
  MenuDrillLevel,
  MenuGroup,
  MenuItem,
  MenuList,
  NavPanel,
  NavRail,
  NavRailItem,
  NavSwitcher,
} from "@eqtylab/equality";
import {
  Activity,
  BookOpen,
  FileText,
  FolderKanban,
  LayoutGrid,
  ShieldCheck,
  Settings,
} from "lucide-react";

const PROJECTS = [
  { value: "ben", label: "Ben Project" },
  { value: "ada", label: "Ada Project" },
];

const POLICIES = [
  { slug: "ai-baseline", name: "AI Baseline" },
  { slug: "eu-ai-act", name: "EU AI Act" },
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
        height: 440,
        overflow: "hidden",
        borderRadius: 8,
        border: "1px solid var(--color-border-raised)",
      }}
    >
      <NavRail aria-label="Main">
        <NavRailItem
          icon={<FolderKanban />}
          label="Projects"
          href="#projects"
          current
        />
        <NavRailItem icon={<ShieldCheck />} label="Policies" href="#policies" />
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
        <Menu>
          <MenuDrill view={view} onViewChange={(next) => setView(next)}>
            <MenuDrillLevel value="project">
              <MenuGroup>
                <MenuList>
                  <MenuItem
                    label="Dashboard"
                    prefix={<LayoutGrid />}
                    {...link("dashboard")}
                  />
                  <MenuItem
                    label="Indicators"
                    prefix={<Activity />}
                    {...link("indicators")}
                  />
                </MenuList>
              </MenuGroup>
              <MenuGroup label="Applied Policies">
                <MenuList>
                  {POLICIES.map((item) => (
                    <MenuItem
                      key={item.slug}
                      label={item.name}
                      prefix={<BookOpen />}
                      drill={`policy:${item.slug}`}
                      {...link(item.slug)}
                    />
                  ))}
                </MenuList>
              </MenuGroup>
              <MenuGroup>
                <MenuList>
                  <MenuItem
                    label="Settings"
                    prefix={<Settings />}
                    {...link("settings")}
                  />
                </MenuList>
              </MenuGroup>
            </MenuDrillLevel>
            {policy && (
              <MenuDrillLevel value={`policy:${policy.slug}`} parent="project">
                <MenuBackButton
                  label={policy.name}
                  aria-label={`${policy.name}, back to ${projectName}`}
                />
                <MenuList>
                  <MenuItem
                    label="Overview"
                    prefix={<FileText />}
                    {...link(`${policy.slug}-overview`)}
                  />
                  <MenuItem
                    label="Controls"
                    prefix={<ShieldCheck />}
                    {...link(`${policy.slug}-controls`)}
                  />
                </MenuList>
              </MenuDrillLevel>
            )}
          </MenuDrill>
        </Menu>
      </NavPanel>
      <div style={{ flex: 1, padding: 24 }}>
        <p style={{ margin: 0 }}>Page content</p>
      </div>
    </div>
  );
}
