import type { Elevation } from "@eqtylab/equality";
import {
  Badge,
  EmptyTableState,
  IconButton,
  SortButton,
  Table,
} from "@eqtylab/equality";

interface TableDemoProps {
  variant?:
    | "default"
    | "clickable"
    | "with-border"
    | "with-sorter"
    | "empty-state"
    | "empty-state-custom";
  elevation?: Elevation;
}

export const TableDemo = ({
  variant = "default",
  elevation,
}: TableDemoProps) => {
  const columns = [
    { key: "name", content: "Name" },
    { key: "email", content: "Email" },
    { key: "role", content: "Role" },
    { key: "status", content: "Status" },
    { key: "actions", content: "" },
  ];

  const rows = [
    {
      key: "1",
      cells: [
        { key: "name", content: "Alice Cooper" },
        { key: "email", content: "alice@example.com" },
        { key: "role", content: "Admin" },
        { key: "status", content: <Badge variant="success">Active</Badge> },
        {
          key: "actions",
          content: <IconButton name="EllipsisVertical" label="Row actions" />,
        },
      ],
      ...(variant === "clickable" && {
        onClick: () => console.log("Clicked row 1"),
      }),
    },
    {
      key: "2",
      cells: [
        { key: "name", content: "Bob Smith" },
        { key: "email", content: "bob@example.com" },
        { key: "role", content: "User" },
        { key: "status", content: <Badge variant="success">Active</Badge> },
        {
          key: "actions",
          content: <IconButton name="EllipsisVertical" label="Row actions" />,
        },
      ],
      ...(variant === "clickable" && {
        onClick: () => console.log("Clicked row 2"),
      }),
    },
    {
      key: "3",
      cells: [
        { key: "name", content: "Charlie Brown" },
        { key: "email", content: "charlie@example.com" },
        { key: "role", content: "Viewer" },
        {
          key: "status",
          content: <Badge variant="neutral">Inactive</Badge>,
        },
        {
          key: "actions",
          content: <IconButton name="EllipsisVertical" label="Row actions" />,
        },
      ],
      ...(variant === "clickable" && {
        onClick: () => console.log("Clicked row 3"),
      }),
    },
  ];

  if (variant === "with-sorter") {
    const sortColumns = [
      {
        key: "name",
        content: (
          <SortButton
            field="name"
            sortField={null}
            sortDirection="asc"
            onSort={() => {}}
          >
            Name
          </SortButton>
        ),
      },
      {
        key: "email",
        content: (
          <SortButton
            field="email"
            sortField={null}
            sortDirection="asc"
            onSort={() => {}}
          >
            Email
          </SortButton>
        ),
      },
      {
        key: "role",
        content: (
          <SortButton
            field="role"
            sortField={null}
            sortDirection="asc"
            onSort={() => {}}
          >
            Role
          </SortButton>
        ),
      },
      {
        key: "status",
        content: (
          <SortButton
            field="status"
            sortField={null}
            sortDirection="asc"
            onSort={() => {}}
          >
            Status
          </SortButton>
        ),
      },
      { key: "actions", content: "" },
    ];

    return <Table columns={sortColumns} rows={rows} elevation={elevation} />;
  }

  if (variant === "empty-state") {
    return (
      <Table
        columns={columns}
        rows={[]}
        border
        elevation={elevation}
        emptyState="No data available"
      />
    );
  }

  if (variant === "empty-state-custom") {
    return (
      <Table
        columns={columns}
        rows={[]}
        border
        elevation={elevation}
        emptyState={
          <EmptyTableState
            icon="SearchX"
            title="No Members Found"
            description="Try refining your search terms or clearing filters."
            showClearButton
            onClear={() => {}}
          />
        }
      />
    );
  }

  return (
    <Table
      columns={columns}
      rows={rows}
      border={variant === "with-border"}
      elevation={elevation}
    />
  );
};
