import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardContentHeader,
  IconButton,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TitleBlock,
} from "@eqtylab/equality";
import type { ReactNode } from "react";

type TypographyExample =
  | "composite"
  | "lines"
  | "page-header"
  | "dialog-header"
  | "section-header"
  | "card-header"
  | "title-1"
  | "title-2"
  | "section"
  | "body"
  | "caption";

const Preview = ({ children }: { children: ReactNode }) => (
  <div className="bg-background-sunken border-border rounded-lg border p-2 sm:p-6">
    {children}
  </div>
);

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="bg-background-base border-border text-caption text-text-secondary inline-flex w-fit shrink-0 items-center rounded-md border px-2">
    {children}
  </span>
);

const Line = ({
  className,
  height,
  children,
}: {
  className: string;
  height: number;
  children: ReactNode;
}) => (
  <span className="flex items-center gap-2">
    <span
      className={`${className} bg-lilac-400/20 inline-block shadow-[inset_0_1px_0_var(--color-lilac-500),inset_0_-1px_0_var(--color-lilac-500)]`}
    >
      {children}
    </span>
    <Tag>{height}</Tag>
  </span>
);

const members = [
  { name: "Ada Park", email: "ada@example.com", initials: "AP", role: "Owner" },
  {
    name: "Marcus Hale",
    email: "marcus@example.com",
    initials: "MH",
    role: "Editor",
  },
  {
    name: "Priya Shah",
    email: "priya@example.com",
    initials: "PS",
    role: "Viewer",
  },
];

const PageHeader = ({ badge = false }: { badge?: boolean }) => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <p className="text-title-1">Projects</p>
        {badge && <Badge variant="neutral">Beta</Badge>}
      </div>
      <div className="flex gap-2">
        <Button variant="tertiary">Import</Button>
        <Button>New Project</Button>
      </div>
    </div>
    <p className="text-body text-text-secondary">
      Every project your team can open
    </p>
  </div>
);

const DialogHeaderLike = () => (
  <Card>
    <CardContent className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-4">
        <p className="text-title-2">New Project</p>
        <IconButton name="X" label="Close" />
      </div>
      <p className="text-body text-text-secondary">
        Name the project and choose who owns it.
      </p>
    </CardContent>
  </Card>
);

const MembersCard = () => (
  <Card>
    <CardContent className="flex flex-col gap-2">
      <CardContentHeader
        icon="Users"
        heading="Members"
        onButtonClick={() => {}}
      />
      <TableContainer
        columns="1fr auto"
        className="border-(--eq-table-row-divider-color) border-t [--eq-table-row-padding-inline:0]"
      >
        <TableBody>
          {members.map(({ name, email, initials, role }) => (
            <TableRow key={email}>
              <TableCell>
                <TitleBlock
                  titleAs="p"
                  mark={
                    <Avatar size="md" aria-hidden>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  }
                  title={name}
                  description={email}
                />
              </TableCell>
              <TableCell className="justify-self-end">
                {role === "Owner" ? (
                  <Badge>{role}</Badge>
                ) : (
                  <p className="text-caption text-text-secondary">{role}</p>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </CardContent>
  </Card>
);

function Example({ example }: { example: TypographyExample }) {
  if (example === "composite") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Tag>text-title-1 · the page</Tag>
          <PageHeader />
        </div>
        <div className="flex flex-col gap-2">
          <Tag>text-title-2 · its dialog</Tag>
          <DialogHeaderLike />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Tag>text-section · the card</Tag>
            <Tag>text-body · each name</Tag>
            <Tag>text-caption · each email and role</Tag>
          </div>
          <MembersCard />
        </div>
      </div>
    );
  }

  if (example === "lines") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Line className="text-title-1" height={36}>
            Projects
          </Line>
          <Button>New Project</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Line className="text-title-2" height={28}>
            New Project
          </Line>
          <IconButton name="X" label="Close" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Line className="text-section" height={24}>
            Members
          </Line>
          <Button variant="tertiary" size="sm">
            See All
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Line className="text-body" height={20}>
            Ada Park
          </Line>
          <Badge>Owner</Badge>
        </div>
      </div>
    );
  }

  if (example === "page-header") {
    return <PageHeader badge />;
  }

  if (example === "dialog-header") {
    return <DialogHeaderLike />;
  }

  if (example === "section-header") {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <p className="text-section">Members</p>
          <Button variant="tertiary" size="sm">
            See All
          </Button>
        </div>
        <p className="text-body text-text-secondary">
          People who can open this project
        </p>
      </div>
    );
  }

  if (example === "card-header") {
    return <MembersCard />;
  }

  if (example === "title-1") {
    return <p className="text-title-1">Projects</p>;
  }

  if (example === "title-2") {
    return <p className="text-title-2">New Project</p>;
  }

  if (example === "section") {
    return <p className="text-section">Members</p>;
  }

  if (example === "body") {
    return (
      <p className="text-body">
        Every project your team can open, with who owns it and when it last
        changed.
      </p>
    );
  }

  return <p className="text-caption text-text-secondary">Joined 3 days ago</p>;
}

export function TypographyDemo({ example }: { example: TypographyExample }) {
  return (
    <Preview>
      <Example example={example} />
    </Preview>
  );
}
