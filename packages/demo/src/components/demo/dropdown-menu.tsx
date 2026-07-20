import { useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSearch,
  DropdownMenuEmpty,
  Icon,
} from "@eqtylab/equality";
import { Settings, User, LogOut } from "lucide-react";

const MEMBERS = [
  { name: "Ada Lovelace", icon: "User" },
  { name: "Alan Turing", icon: "UserCog" },
  { name: "Grace Hopper", icon: "User" },
  { name: "Katherine Johnson", icon: "UserCog" },
  { name: "Linus Torvalds", icon: "UserStar" },
  { name: "Margaret Hamilton", icon: "User" },
];

const COLUMN_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  role: "Role",
  status: "Status",
  created: "Created",
  lastActive: "Last active",
  team: "Team",
  location: "Location",
};

export const DropdownMenuDemo = ({
  variant = "default",
}: {
  variant?:
    | "default"
    | "with-separators"
    | "with-checkboxes"
    | "with-radio"
    | "with-shortcuts"
    | "with-submenu"
    | "with-groups"
    | "with-search"
    | "with-search-always"
    | "with-search-submenu";
}) => {
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showActivityBar, setShowActivityBar] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [position, setPosition] = useState("bottom");
  const [assignee, setAssignee] = useState<string | null>(null);
  const [columns, setColumns] = useState<Record<string, boolean>>({
    name: true,
    email: true,
    role: true,
    status: false,
    created: false,
    lastActive: false,
    team: false,
    location: false,
  });

  if (variant === "default") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              Open Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem variant="danger">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-separators") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              Account Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-checkboxes") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              View Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showStatusBar}
              onCheckedChange={setShowStatusBar}
            >
              Status Bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showActivityBar}
              onCheckedChange={setShowActivityBar}
            >
              Activity Bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showPanel}
              onCheckedChange={setShowPanel}
            >
              Panel
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-radio") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              Position: {position}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={position}
              onValueChange={setPosition}
            >
              <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom">
                Bottom
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-shortcuts") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>
              <span>New Tab</span>
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>New Window</span>
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Close Tab</span>
              <DropdownMenuShortcut>⌘W</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Print</span>
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-submenu") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              More Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Back</DropdownMenuItem>
            <DropdownMenuItem>Forward</DropdownMenuItem>
            <DropdownMenuItem>Reload</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>More Tools</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Save Page As...</DropdownMenuItem>
                <DropdownMenuItem>Create Shortcut...</DropdownMenuItem>
                <DropdownMenuItem>Name Window...</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>Developer Tools</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Console</DropdownMenuItem>
                    <DropdownMenuItem>Network</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>Profiling</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Performance</DropdownMenuItem>
                        <DropdownMenuItem>Memory</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-groups") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              File Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>File</DropdownMenuLabel>
              <DropdownMenuItem>
                <span>New File</span>
                <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Open File</span>
                <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Save</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Edit</DropdownMenuLabel>
              <DropdownMenuItem>Undo</DropdownMenuItem>
              <DropdownMenuItem>Redo</DropdownMenuItem>
              <DropdownMenuItem>Cut</DropdownMenuItem>
              <DropdownMenuItem>Copy</DropdownMenuItem>
              <DropdownMenuItem>Paste</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-search") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              {assignee ? `Assigned: ${assignee}` : "Assign reviewer"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSearch placeholder="Search members..." />
            <DropdownMenuLabel>Team members</DropdownMenuLabel>
            {MEMBERS.map((person) => (
              <DropdownMenuItem
                key={person.name}
                textValue={person.name}
                onSelect={() => setAssignee(person.name)}
              >
                <Icon
                  icon={person.icon}
                  size="xs"
                  background="circle"
                  elevation="raised"
                />
                <span>{person.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuEmpty>No members found</DropdownMenuEmpty>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-search-always") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSearch alwaysVisible placeholder="Search columns..." />
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            {Object.entries(COLUMN_LABELS).map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={columns[key]}
                onCheckedChange={(checked) =>
                  setColumns((prev) => ({ ...prev, [key]: checked }))
                }
                onSelect={(event) => event.preventDefault()}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuEmpty>No columns found</DropdownMenuEmpty>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "with-search-submenu") {
    return (
      <div style={{ margin: "1rem 0" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="tertiary">
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSearch placeholder="Search actions..." />
            <DropdownMenuItem>Cut</DropdownMenuItem>
            <DropdownMenuItem>Copy</DropdownMenuItem>
            <DropdownMenuItem>Paste</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>More Tools</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Save Page As...</DropdownMenuItem>
                <DropdownMenuItem>Create Shortcut...</DropdownMenuItem>
                <DropdownMenuItem>Developer Tools</DropdownMenuItem>
                <DropdownMenuItem>Task Manager</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuEmpty>No actions found</DropdownMenuEmpty>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return null;
};
