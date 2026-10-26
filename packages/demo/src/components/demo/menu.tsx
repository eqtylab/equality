import {
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Menu,
  MenuBackButton,
  MenuDrill,
  MenuDrillLevel,
  MenuGroup,
  MenuItem,
  MenuList,
  MenuSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
  type MenuDrillRequest,
  type MenuSize,
} from "@eqtylab/equality";
import { Activity, BookOpen, Bot, LayoutGrid, Settings } from "lucide-react";

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

export function MenuGroupsDemo() {
  const link = useCurrent("dashboard");
  return (
    <div style={frame}>
      <Menu>
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
        <MenuGroup label="Governance">
          <MenuList>
            <MenuItem
              label="Applied Policies"
              prefix={<BookOpen />}
              suffix={<Badge size="sm">3</Badge>}
              {...link("policies")}
            />
            <MenuItem label="Agents" prefix={<Bot />} {...link("agents")} />
          </MenuList>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuList>
            <MenuItem
              label="Settings"
              prefix={<Settings />}
              {...link("settings")}
            />
          </MenuList>
        </MenuGroup>
      </Menu>
    </div>
  );
}

export function MenuNestingDemo({ icons = true }: { icons?: boolean }) {
  const link = useCurrent("input");
  return (
    <div style={frame}>
      <Menu>
        <MenuGroup label="Components">
          <MenuList>
            <MenuItem
              label="Overview"
              prefix={icons ? <LayoutGrid /> : undefined}
              {...link("overview")}
            />
            <li>
              <MenuGroup label="Forms">
                <MenuList>
                  <MenuItem label="Input" {...link("input")} />
                  <MenuItem label="Select" {...link("select")} />
                  <MenuItem label="Switch" {...link("switch")} />
                </MenuList>
              </MenuGroup>
            </li>
          </MenuList>
        </MenuGroup>
      </Menu>
    </div>
  );
}

export function MenuSizesDemo() {
  const sizes: MenuSize[] = ["md", "sm"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {sizes.map((size) => (
        <div key={size} style={frame}>
          <Menu size={size}>
            <MenuGroup label={size}>
              <MenuList>
                <MenuItem
                  label="Dashboard"
                  prefix={<LayoutGrid />}
                  href="#size"
                  current
                />
                <MenuItem
                  label="Indicators"
                  prefix={<Activity />}
                  href="#size"
                />
              </MenuList>
            </MenuGroup>
          </Menu>
        </div>
      ))}
    </div>
  );
}

export function MenuTouchDemo() {
  return (
    <div style={{ ...frame, ["--touch-target" as string]: "2.75rem" }}>
      <Menu>
        <MenuList>
          <MenuItem
            label="Dashboard"
            prefix={<LayoutGrid />}
            href="#touch"
            current
          />
          <MenuItem label="Indicators" prefix={<Activity />} href="#touch" />
        </MenuList>
      </Menu>
    </div>
  );
}

// Levels must be direct children of MenuDrill, so they are returned as an array, not a component
function projectLevels(link: ReturnType<typeof useCurrent>): ReactNode[] {
  return [
    <MenuDrillLevel key="projects" value="projects">
      <MenuGroup label="Projects">
        <MenuList>
          <MenuItem label="Ben Project" drill="ben" />
          <MenuItem label="Ada Project" drill="ada" />
        </MenuList>
      </MenuGroup>
    </MenuDrillLevel>,
    ...[
      ["ben", "Ben Project"],
      ["ada", "Ada Project"],
    ].map(([value, name]) => (
      <MenuDrillLevel key={value} value={value} parent="projects">
        <MenuBackButton label={name} aria-label={`${name}, back to Projects`} />
        <MenuList>
          <MenuItem
            label="Dashboard"
            prefix={<LayoutGrid />}
            {...link(`${value}-dashboard`)}
          />
          <MenuItem
            label="Applied Policies"
            prefix={<BookOpen />}
            {...link(`${value}-policies`)}
          />
          <MenuItem
            label="Settings"
            prefix={<Settings />}
            {...link(`${value}-settings`)}
          />
        </MenuList>
      </MenuDrillLevel>
    )),
  ];
}

export function MenuDrillPopoverDemo() {
  const link = useCurrent("ben-dashboard");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="secondary">
          Open projects
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" style={{ width: 240 }}>
        <Menu>
          <MenuDrill defaultView="projects">{projectLevels(link)}</MenuDrill>
        </Menu>
      </PopoverContent>
    </Popover>
  );
}

export function MenuDrillDrawerDemo() {
  const link = useCurrent("ben-dashboard");
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm" variant="secondary">
          Open drawer
        </Button>
      </DrawerTrigger>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader>
          <DrawerTitle>Projects</DrawerTitle>
        </DrawerHeader>
        <div
          style={{
            padding: "0 16px 24px",
            ["--touch-target" as string]: "2.75rem",
          }}
        >
          <Menu>
            <MenuDrill defaultView="projects">{projectLevels(link)}</MenuDrill>
          </Menu>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function MenuDrillControlledDemo() {
  const link = useCurrent("ben-dashboard");
  const [view, setView] = useState("projects");
  const [last, setLast] = useState<string>("none yet");
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
        <Menu>
          <MenuDrill
            view={view}
            onViewChange={(next: string, request: MenuDrillRequest) => {
              setLast(`${request} → ${next}`);
              setView(next);
            }}
          >
            {projectLevels(link)}
          </MenuDrill>
        </Menu>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ margin: 0 }}>
          Last request: <code>{last}</code>
        </p>
        <Button size="sm" variant="secondary" onClick={() => setView("ada")}>
          Show Ada Project without a request
        </Button>
      </div>
    </div>
  );
}
