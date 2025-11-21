import { Button, SortButton, Table, Badge } from "@eqtylab/equality";

interface TableDemoProps {
  variant?:
    | "unclickable"
    | "clickable"
    | "with-actions"
    | "with-border"
    | "with-sorter"
    | "with-background";
}

export const TableDemo = ({ variant = "unclickable" }: TableDemoProps) => {
  const columns = [
    { key: "name", content: "Name" },
    { key: "email", content: "Email" },
    { key: "role", content: "Role" },
    { key: "status", content: "Status" },
  ];

  const demo_rows_unclickable = [
    {
      key: "1",
      cells: [
        { key: "name", content: "Alice Cooper" },
        { key: "email", content: "alice@example.com" },
        { key: "role", content: "Admin" },
        { key: "status", content: <Badge variant="success">Active</Badge> },
      ],
    },
    {
      key: "2",
      cells: [
        { key: "name", content: "Bob Smith" },
        { key: "email", content: "bob@example.com" },
        { key: "role", content: "User" },
        { key: "status", content: <Badge variant="success">Active</Badge> },
      ],
    },
    {
      key: "3",
      cells: [
        { key: "name", content: "Charlie Brown" },
        { key: "email", content: "charlie@example.com" },
        { key: "role", content: "Viewer" },
        { key: "status", content: <Badge variant="neutral">Inactive</Badge> },
      ],
    },
  ];

  const demo_rows_clickable = [
    {
      key: "1",
      cells: [
        { key: "name", content: "Alice Cooper" },
        { key: "email", content: "alice@example.com" },
        { key: "role", content: "Admin" },
        { key: "status", content: "Active" },
      ],
      onClick: () => console.log("Clicked row 1"),
    },
    {
      key: "2",
      cells: [
        { key: "name", content: "Bob Smith" },
        { key: "email", content: "bob@example.com" },
        { key: "role", content: "User" },
        { key: "status", content: "Active" },
      ],
      onClick: () => console.log("Clicked row 2"),
    },
    {
      key: "3",
      cells: [
        { key: "name", content: "Charlie Brown" },
        { key: "email", content: "charlie@example.com" },
        { key: "role", content: "Viewer" },
        { key: "status", content: "Inactive" },
      ],
      onClick: () => console.log("Clicked row 3"),
    },
  ];

  if (variant === "unclickable") {
    return <Table columns={columns} rows={demo_rows_unclickable} />;
  }

  if (variant === "clickable") {
    return <Table columns={columns} rows={demo_rows_clickable} />;
  }

  if (variant === "with-actions") {
    const columns_with_actions = [
      { key: "name", content: "Name" },
      { key: "email", content: "Email" },
      { key: "role", content: "Role" },
      { key: "status", content: "Status" },
      { key: "actions", content: "Actions" },
    ];

    const demo_rows_with_actions = [
      {
        key: "1",
        cells: [
          { key: "name", content: "Alice Cooper" },
          { key: "email", content: "alice@example.com" },
          { key: "role", content: "Admin" },
          { key: "status", content: "Active" },
          {
            key: "actions",
            content: (
              <Button variant="tertiary" size="sm">
                View
              </Button>
            ),
          },
        ],
      },
      {
        key: "2",
        cells: [
          { key: "name", content: "Bob Smith" },
          { key: "email", content: "bob@example.com" },
          { key: "role", content: "User" },
          { key: "status", content: "Active" },
          {
            key: "actions",
            content: (
              <Button variant="tertiary" size="sm">
                View
              </Button>
            ),
          },
        ],
      },
      {
        key: "3",
        cells: [
          { key: "name", content: "Charlie Brown" },
          { key: "email", content: "charlie@example.com" },
          { key: "role", content: "Viewer" },
          { key: "status", content: "Inactive" },
          {
            key: "actions",
            content: (
              <Button variant="tertiary" size="sm">
                View
              </Button>
            ),
          },
        ],
      },
    ];
    return (
      <Table columns={columns_with_actions} rows={demo_rows_with_actions} />
    );
  }

  if (variant === "with-border") {
    return <Table columns={columns} rows={demo_rows_unclickable} border />;
  }

  if (variant === "with-sorter") {
    const columns_with_sorter = [
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
    ];

    return <Table columns={columns_with_sorter} rows={demo_rows_unclickable} />;
  }

  if (variant === "with-background") {
    return <Table columns={columns} rows={demo_rows_unclickable} background />;
  }

  if (variant === "with-border-and-background") {
    return (
      <Table columns={columns} rows={demo_rows_unclickable} border background />
    );
  }

  return null;
};
