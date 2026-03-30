import type { Elevation } from "@eqtylab/equality";
import {
  Badge,
  EmptyTableState,
  IconButton,
  SortButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@eqtylab/equality";

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
    | "sticky-header";
  elevation?: Elevation;
}

const defaultCols = "1fr 1fr auto auto auto";

export const TableDemo = ({
  variant = "default",
  elevation,
}: TableDemoProps) => {
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
          className="[--table-columns:1fr_auto_auto] @md:[--table-columns:1fr_1fr_auto_auto] @lg:[--table-columns:1fr_1fr_auto_auto_auto]"
        >
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden @md:block">Email</TableHead>
              <TableHead className="hidden @lg:block">Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Alice Cooper</TableCell>
              <TableCell className="hidden @md:block">
                alice@example.com
              </TableCell>
              <TableCell className="hidden @lg:block">Admin</TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob Smith</TableCell>
              <TableCell className="hidden @md:block">
                bob@example.com
              </TableCell>
              <TableCell className="hidden @lg:block">User</TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Charlie Brown</TableCell>
              <TableCell className="hidden @md:block">
                charlie@example.com
              </TableCell>
              <TableCell className="hidden @lg:block">Viewer</TableCell>
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
        <TableHeader sticky>
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
              colSpan={5}
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
            <TableCell colSpan={5}>
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
          onClick={
            variant === "clickable"
              ? () => console.log("Clicked row 1")
              : undefined
          }
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
          onClick={
            variant === "clickable"
              ? () => console.log("Clicked row 2")
              : undefined
          }
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
        <TableRow
          clickable={variant === "clickable"}
          onClick={
            variant === "clickable"
              ? () => console.log("Clicked row 3")
              : undefined
          }
        >
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
