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
    | "responsive";
  elevation?: Elevation;
}

export const TableDemo = ({
  variant = "default",
  elevation,
}: TableDemoProps) => {
  if (variant === "column-sizing") {
    return (
      <TableContainer tableLayout="fixed" elevation={elevation}>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "30%" }}>Name</TableHead>
            <TableHead style={{ width: "30%" }}>Email</TableHead>
            <TableHead style={{ width: "100px" }}>Role</TableHead>
            <TableHead style={{ width: "100px" }}>Status</TableHead>
            <TableHead style={{ width: "60px" }} />
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
      <TableContainer tableLayout="fixed" elevation={elevation}>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "25%" }}>Name</TableHead>
            <TableHead style={{ width: "40%" }} truncate>
              Email
            </TableHead>
            <TableHead style={{ width: "100px" }}>Role</TableHead>
            <TableHead style={{ width: "100px" }}>Status</TableHead>
            <TableHead style={{ width: "60px" }} />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice Cooper</TableCell>
            <TableCell truncate>
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
            <TableCell truncate>bob@example.com</TableCell>
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
            <TableCell truncate>
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
        <TableContainer elevation={elevation}>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden @md:table-cell">Email</TableHead>
              <TableHead className="hidden @lg:table-cell">Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead style={{ width: "1%" }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Alice Cooper</TableCell>
              <TableCell className="hidden @md:table-cell">
                alice@example.com
              </TableCell>
              <TableCell className="hidden @lg:table-cell">Admin</TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob Smith</TableCell>
              <TableCell className="hidden @md:table-cell">
                bob@example.com
              </TableCell>
              <TableCell className="hidden @lg:table-cell">User</TableCell>
              <TableCell>
                <Badge variant="success">Active</Badge>
              </TableCell>
              <TableCell>
                <IconButton name="EllipsisVertical" label="Row actions" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Charlie Brown</TableCell>
              <TableCell className="hidden @md:table-cell">
                charlie@example.com
              </TableCell>
              <TableCell className="hidden @lg:table-cell">Viewer</TableCell>
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

  if (variant === "with-sorter") {
    return (
      <TableContainer elevation={elevation}>
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
      <TableContainer
        elevation={elevation}
        className="overflow-hidden rounded-md border"
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
      <TableContainer
        elevation={elevation}
        className="overflow-hidden rounded-md border"
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
      className={
        variant === "with-border"
          ? "overflow-hidden rounded-md border"
          : undefined
      }
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
