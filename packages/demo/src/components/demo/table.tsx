import type { Elevation } from "@eqtylab/equality";
import {
  Avatar,
  AvatarFallback,
  Badge,
  EmptyTableState,
  IconButton,
  SortButton,
  Switch,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@eqtylab/equality";
import { type CSSProperties, useState } from "react";

interface TableDemoProps {
  variant?:
    | "default"
    | "clickable"
    | "with-border"
    | "with-sorter"
    | "empty-state"
    | "empty-state-custom"
    | "column-sizing"
    | "truncation"
    | "responsive"
    | "sticky-header"
    | "sticky-header-page"
    | "sticky-header-page-offset"
    | "with-actions"
    | "striped";
  elevation?: Elevation;
  density?: "regular" | "comfortable";
}

const defaultCols = "1fr 1fr auto auto auto";

const roles = ["Admin", "User", "Viewer"] as const;
const longTableData = Array.from({ length: 10 }, (_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: roles[i % roles.length],
  active: i % 4 !== 0,
}));

export const TableDemo = ({
  variant = "default",
  elevation,
  density,
}: TableDemoProps) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const toggleRow = (row: number) =>
    setSelectedRow((current) => (current === row ? null : row));
  if (variant === "column-sizing") {
    return (
      <TableContainer elevation={elevation} columns="3fr 3fr 100px 100px 60px">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice Cooper</TableCell>
            <TableCell>alice@example.com</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>
              <Badge variant="success">Active</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob Smith</TableCell>
            <TableCell>bob@example.com</TableCell>
            <TableCell>User</TableCell>
            <TableCell>
              <Badge variant="success">Active</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Charlie Brown</TableCell>
            <TableCell>charlie@example.com</TableCell>
            <TableCell>Viewer</TableCell>
            <TableCell>
              <Badge variant="neutral">Inactive</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );
  }

  if (variant === "striped") {
    const models = [
      ["claims-triage-v4", "0.912", "0.884", "0.931", "0.907", "142", "$0.84"],
      ["claims-triage-v3", "0.897", "0.861", "0.925", "0.892", "156", "$0.79"],
      ["fraud-screen-v2", "0.874", "0.902", "0.811", "0.854", "88", "$0.41"],
      ["fraud-screen-v1", "0.853", "0.879", "0.794", "0.834", "91", "$0.40"],
      ["intake-router-v7", "0.948", "0.951", "0.942", "0.946", "37", "$0.12"],
      ["intake-router-v6", "0.939", "0.944", "0.930", "0.937", "35", "$0.12"],
      ["summary-gen-v2", "0.821", "0.808", "0.846", "0.827", "611", "$2.30"],
      ["summary-gen-v1", "0.802", "0.794", "0.823", "0.808", "644", "$2.25"],
    ];
    return (
      <TableContainer
        elevation={elevation}
        striped
        columns="minmax(10rem, 1fr) repeat(6, auto)"
      >
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Accuracy</TableHead>
            <TableHead>Precision</TableHead>
            <TableHead>Recall</TableHead>
            <TableHead>F1</TableHead>
            <TableHead>Latency (ms)</TableHead>
            <TableHead>Cost / 1k</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map(([name, ...values]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              {values.map((value, i) => (
                <TableCell key={i} className="tabular-nums">
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    );
  }

  if (variant === "with-actions") {
    return (
      <TableContainer
        elevation={elevation}
        density={density}
        columns="1fr auto auto auto"
      >
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Alerts</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {longTableData.slice(0, 3).map((user) => (
            <TableRow key={user.email}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar aria-hidden>
                    <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.active ? "success" : "neutral"}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch
                  size="sm"
                  defaultChecked={user.active}
                  aria-label={`Alerts for ${user.name}`}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  name="EllipsisVertical"
                  label={`Actions for ${user.name}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    );
  }

  if (variant === "truncation") {
    return (
      <TableContainer
        elevation={elevation}
        columns="minmax(0,5fr) minmax(0,8fr) 100px 100px 60px"
      >
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="min-w-0 truncate">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice Cooper</TableCell>
            <TableCell className="min-w-0 truncate">
              alice.cooper.very.long.email.address@example.com
            </TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>
              <Badge variant="success">Active</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob Smith</TableCell>
            <TableCell className="min-w-0 truncate">bob@example.com</TableCell>
            <TableCell>User</TableCell>
            <TableCell>
              <Badge variant="success">Active</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Charlie Brown</TableCell>
            <TableCell className="min-w-0 truncate">
              charlie.brown.another.really.long.address@longdomain.example.com
            </TableCell>
            <TableCell>Viewer</TableCell>
            <TableCell>
              <Badge variant="neutral">Inactive</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );
  }

  if (variant === "responsive") {
    return (
      <div className="@container">
        <TableContainer
          elevation={elevation}
          className="@md:[--table-columns:1fr_1fr_auto_auto] @lg:[--table-columns:1fr_1fr_auto_auto_auto] [--table-columns:1fr_auto_auto]"
        >
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="@md:block hidden">Email</TableHead>
              <TableHead className="@lg:block hidden">Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Alice Cooper</TableCell>
              <TableCell className="@md:block hidden">
                alice@example.com
              </TableCell>
              <TableCell className="@lg:block hidden">Admin</TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob Smith</TableCell>
              <TableCell className="@md:block hidden">
                bob@example.com
              </TableCell>
              <TableCell className="@lg:block hidden">User</TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Charlie Brown</TableCell>
              <TableCell className="@md:block hidden">
                charlie@example.com
              </TableCell>
              <TableCell className="@lg:block hidden">Viewer</TableCell>
              <TableCell>
                <Badge variant="neutral">Inactive</Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
          </TableBody>
        </TableContainer>
      </div>
    );
  }

  if (variant === "sticky-header") {
    return (
      <TableContainer
        elevation={elevation}
        className="max-h-[240px]"
        columns={defaultCols}
        border
      >
        <TableHeader sticky="container">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            {
              name: "Alice Cooper",
              email: "alice@example.com",
              role: "Admin",
              active: true,
            },
            {
              name: "Bob Smith",
              email: "bob@example.com",
              role: "User",
              active: true,
            },
            {
              name: "Charlie Brown",
              email: "charlie@example.com",
              role: "Viewer",
              active: false,
            },
            {
              name: "Diana Prince",
              email: "diana@example.com",
              role: "Admin",
              active: true,
            },
            {
              name: "Eve Wilson",
              email: "eve@example.com",
              role: "User",
              active: true,
            },
            {
              name: "Frank Castle",
              email: "frank@example.com",
              role: "Viewer",
              active: false,
            },
            {
              name: "Grace Hopper",
              email: "grace@example.com",
              role: "Admin",
              active: true,
            },
            {
              name: "Hank Pym",
              email: "hank@example.com",
              role: "User",
              active: true,
            },
          ].map((user) => (
            <TableRow key={user.name}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.active ? "success" : "neutral"}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    );
  }

  if (
    variant === "sticky-header-page" ||
    variant === "sticky-header-page-offset"
  ) {
    const offset = variant === "sticky-header-page-offset";
    return (
      <TableContainer
        elevation={elevation}
        columns={defaultCols}
        border
        style={
          offset
            ? ({ "--table-sticky-top": "57px" } as CSSProperties)
            : undefined
        }
      >
        <TableHeader sticky="page">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* sticky="page" keeps the header pinned to the viewport as the page scrolls */}
          {longTableData.map((user) => (
            <TableRow key={user.name}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.active ? "success" : "neutral"}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    );
  }

  if (variant === "with-sorter") {
    return (
      <TableContainer elevation={elevation} columns={defaultCols}>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton
                field="name"
                sortField={null}
                sortDirection="asc"
                onSort={() => {}}
              >
                Name
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton
                field="email"
                sortField={null}
                sortDirection="asc"
                onSort={() => {}}
              >
                Email
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton
                field="role"
                sortField={null}
                sortDirection="asc"
                onSort={() => {}}
              >
                Role
              </SortButton>
            </TableHead>
            <TableHead>
              <SortButton
                field="status"
                sortField={null}
                sortDirection="asc"
                onSort={() => {}}
              >
                Status
              </SortButton>
            </TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice Cooper</TableCell>
            <TableCell>alice@example.com</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>
              <Badge variant="success">Active</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob Smith</TableCell>
            <TableCell>bob@example.com</TableCell>
            <TableCell>User</TableCell>
            <TableCell>
              <Badge variant="success">Active</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Charlie Brown</TableCell>
            <TableCell>charlie@example.com</TableCell>
            <TableCell>Viewer</TableCell>
            <TableCell>
              <Badge variant="neutral">Inactive</Badge>
            </TableCell>
            <TableCell>
              <IconButton name="EllipsisVertical" label="Row actions" />
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );
  }

  if (variant === "empty-state") {
    return (
      <TableContainer elevation={elevation} columns={defaultCols} border>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              style={{ gridColumn: "1 / -1" }}
              className="text-text-secondary py-8 text-center"
            >
              No data available
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );
  }

  if (variant === "empty-state-custom") {
    return (
      <TableContainer elevation={elevation} columns={defaultCols} border>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell style={{ gridColumn: "1 / -1" }}>
              <EmptyTableState
                icon="SearchX"
                title="No Members Found"
                description="Try refining your search terms or clearing filters."
                showClearButton
                onClear={() => {}}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      elevation={elevation}
      columns={defaultCols}
      border={variant === "with-border"}
    >
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          clickable={variant === "clickable"}
          data-state={selectedRow === 0 ? "selected" : undefined}
          onClick={variant === "clickable" ? () => toggleRow(0) : undefined}
        >
          <TableCell>Alice Cooper</TableCell>
          <TableCell>alice@example.com</TableCell>
          <TableCell>Admin</TableCell>
          <TableCell>
            <Badge variant="success">Active</Badge>
          </TableCell>
          <TableCell>
            <IconButton name="EllipsisVertical" label="Row actions" />
          </TableCell>
        </TableRow>
        <TableRow
          clickable={variant === "clickable"}
          data-state={selectedRow === 1 ? "selected" : undefined}
          onClick={variant === "clickable" ? () => toggleRow(1) : undefined}
        >
          <TableCell>Bob Smith</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell>User</TableCell>
          <TableCell>
            <Badge variant="success">Active</Badge>
          </TableCell>
          <TableCell>
            <IconButton name="EllipsisVertical" label="Row actions" />
          </TableCell>
        </TableRow>
        <TableRow href="https://eqtylab.io">
          <TableCell>Charlie Brown</TableCell>
          <TableCell>charlie@example.com</TableCell>
          <TableCell>Viewer</TableCell>
          <TableCell>
            <Badge variant="neutral">Inactive</Badge>
          </TableCell>
          <TableCell>
            <IconButton name="EllipsisVertical" label="Row actions" />
          </TableCell>
        </TableRow>
      </TableBody>
    </TableContainer>
  );
};
