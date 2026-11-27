import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Progress,
  Separator,
} from "@eqtylab/equality";
import type { ReactNode } from "react";

type TypographyExample =
  | "composite"
  | "lines"
  | "page-header"
  | "dialog-header"
  | "card-header"
  | "display";

const Preview = ({ children }: { children: ReactNode }) => (
  <div className="py-2">{children}</div>
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
  <Card className="overflow-hidden">
    <Dialog>
      <DialogHeader>
        <DialogTitle>New Project</DialogTitle>
        <DialogDescription>
          Name the project and choose who owns it.
        </DialogDescription>
      </DialogHeader>
    </Dialog>
  </Card>
);

const StorageHeader = () => (
  <div className="flex flex-col">
    <div className="flex items-center justify-between gap-4">
      <p className="text-section">Storage</p>
      <Button variant="tertiary" size="sm">
        Manage
      </Button>
    </div>
    <p className="text-body text-text-secondary">
      Files uploaded to this project
    </p>
  </div>
);

const StorageCard = () => (
  <Card>
    <CardContent className="flex flex-col gap-4">
      <StorageHeader />
      <Separator />
      <div className="flex flex-col gap-2">
        <p className="text-body">12.4 GB of 50 GB used</p>
        <Progress value={25} aria-label="Storage used" />
        <p className="text-caption text-text-secondary">Resets on 1 December</p>
      </div>
    </CardContent>
  </Card>
);

function Example({ example }: { example: TypographyExample }) {
  if (example === "display") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Tag>text-display-1 · a landing page hero</Tag>
          <p className="text-display-1">Build with Equality</p>
        </div>
        <div className="flex flex-col gap-2">
          <Tag>text-display-2 · a docs home title</Tag>
          <p className="text-display-2">Typography</p>
        </div>
      </div>
    );
  }

  if (example === "composite") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Tag>text-title-1 · the page</Tag>
          <PageHeader />
        </div>
        <div className="flex flex-col gap-2">
          <Tag>text-section · its dialog</Tag>
          <DialogHeaderLike />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Tag>text-section · the card</Tag>
            <Tag>text-body · its text</Tag>
            <Tag>text-caption · its note</Tag>
          </div>
          <StorageCard />
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
            Choosing a Style
          </Line>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Line className="text-section" height={24}>
            Storage
          </Line>
          <Button variant="tertiary" size="sm">
            Manage
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

  return <StorageCard />;
}

export function TypographyDemo({ example }: { example: TypographyExample }) {
  return (
    <Preview>
      <Example example={example} />
    </Preview>
  );
}
