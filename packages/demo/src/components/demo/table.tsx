import type { Elevation } from "@eqtylab/equality";
import {
  Badge,
  Checkbox,
  EmptyTableState,
  IconButton,
  SortButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableRowAction,
} from "@eqtylab/equality";
import { type CSSProperties, useState } from "react";

interface TableDemoProps {
  variant?:
    | "default"
    | "clickable"
    | "selectable"
    | "with-border"
    | "with-sorter"
    | "empty-state"
    | "empty-state-custom"
    | "column-sizing"
    | "truncation"
    | "responsive"
    | "sticky-header"
    | "sticky-header-page"
    | "sticky-header-page-offset";
  elevation?: Elevation;
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
}: TableDemoProps) => {
  const [opened, setOpened] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const toggleSelected = (email: string) =>
    setSelected((current) =>
      current.includes(email)
        ? current.filter((item) => item !== email)
        : [...current, email],
    );

  if (variant === "clickable") {
    return (
      <div className="space-y-3">
        <TableContainer elevation={elevation} columns={defaultCols}>
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
            {longTableData.slice(0, 3).map((user) => (
              <TableRow
                key={user.email}
                href={`#${user.email}`}
                onClick={() => setOpened(user.name)}
              >
                <TableCell>
                  <TableRowAction>{user.name}</TableRowAction>
                </TableCell>
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
        <p role="status" className="text-text-secondary text-sm">
          {opened ? `Opened ${opened}` : "No row opened yet"}
        </p>
      </div>
    );
  }

  if (variant === "selectable") {
    return (
      <TableContainer elevation={elevation} columns="auto 1fr 1fr auto">
        <TableHeader>
          <TableRow>
            <TableHead>
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {longTableData.slice(0, 3).map((user) => {
            const isSelected = selected.includes(user.email);
            const nameId = `select-${user.email}`;
            return (
              <TableRow
                key={user.email}
                data-state={isSelected ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-labelledby={nameId}
                    checked={isSelected}
                    onCheckedChange={() => toggleSelected(user.email)}
                  />
                </TableCell>
                <TableCell id={nameId}>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
    );
  }
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
        <TableRow href="https://eqtylab.io">
          <TableCell>
            <TableRowAction>Charlie Brown</TableRowAction>
          </TableCell>
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
