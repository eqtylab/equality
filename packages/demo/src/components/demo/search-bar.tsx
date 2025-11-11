import { useState } from "react";
import { SearchBar } from "@eqtylab/equality";

export function SearchBarDemo() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
  );
}
