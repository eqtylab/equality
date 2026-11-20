import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  SearchBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@eqtylab/equality";
import avatarSrc from "@demo/assets/avatar.avif";
import { useState } from "react";

const IMAGE_SRC = avatarSrc.src;

export const AvatarDemo = ({
  variant = "default",
  size,
  shape,
}: {
  variant?: "default" | "fallback";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
}) => {
  return (
    <Avatar size={size} shape={shape}>
      <AvatarImage
        src={variant === "default" ? IMAGE_SRC : undefined}
        alt="User avatar"
      />
      <AvatarFallback>RG</AvatarFallback>
    </Avatar>
  );
};

export const AvatarSizesDemo = ({
  variant = "fallback",
  shape,
}: {
  variant?: "default" | "fallback";
  shape?: "circle" | "square";
}) => {
  const sizes = ["sm", "md", "lg", "xl"] as const;
  const labels = { sm: "SM", md: "MD", lg: "LG", xl: "XL" };
  return (
    <div className="mb-4 flex items-end gap-4">
      {sizes.map((s) => (
        <Avatar key={s} size={s} shape={shape}>
          <AvatarImage
            src={variant === "default" ? IMAGE_SRC : undefined}
            alt="User avatar"
          />
          <AvatarFallback>{labels[s]}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
};

export const AvatarShapeDemo = ({ shape }: { shape: "circle" | "square" }) => {
  return (
    <div className="mb-4 flex items-center gap-4">
      <Avatar shape={shape}>
        <AvatarFallback>RG</AvatarFallback>
      </Avatar>
      <Avatar shape={shape}>
        <AvatarImage src={IMAGE_SRC} alt="User avatar" />
        <AvatarFallback>RG</AvatarFallback>
      </Avatar>
    </div>
  );
};

const PEOPLE = [
  { name: "Alice Cooper", initials: "AC", role: "Admin" },
  { name: "Bob Smith", initials: "BS", role: "Member" },
  { name: "Charlie Brown", initials: "CB", role: "Member" },
];

export const AvatarControlDemo = () => {
  const [query, setQuery] = useState("");
  return (
    <div className="mb-4 flex max-w-sm items-center gap-2">
      <SearchBar searchQuery={query} setSearchQuery={setQuery} />
      <Avatar size="lg">
        <AvatarFallback>RG</AvatarFallback>
      </Avatar>
    </div>
  );
};

export const AvatarRowDemo = ({
  variant = "table",
}: {
  variant?: "table" | "menu" | "select";
}) => {
  const [person, setPerson] = useState("");

  if (variant === "select") {
    return (
      <div className="mb-4 max-w-xs">
        <Select value={person} onValueChange={setPerson}>
          <SelectTrigger aria-label="Owner">
            <SelectValue placeholder="Choose an owner" />
          </SelectTrigger>
          <SelectContent>
            {PEOPLE.map((p) => (
              <SelectItem key={p.name} value={p.name} textValue={p.name}>
                <span className="flex items-center gap-2">
                  <Avatar aria-hidden>
                    <AvatarFallback>{p.initials}</AvatarFallback>
                  </Avatar>
                  {p.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (variant === "menu") {
    return (
      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="tertiary">Assign to</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Team members</DropdownMenuLabel>
            {PEOPLE.map((person) => (
              <DropdownMenuItem key={person.name} textValue={person.name}>
                <Avatar aria-hidden>
                  <AvatarFallback>{person.initials}</AvatarFallback>
                </Avatar>
                <span>{person.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <TableContainer columns="1fr auto" border>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PEOPLE.map((person) => (
            <TableRow key={person.name}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar aria-hidden>
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                  {person.name}
                </div>
              </TableCell>
              <TableCell>{person.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};
