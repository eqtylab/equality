#!/usr/bin/env node
// Prints one line per release below 4.0.0 and at or above 1.0.0: `<version> <sha> <lastOfMinor>`.
// A release commit is the LAST commit that set that version in packages/ui/package.json.
import { execFileSync } from "node:child_process";

const log = execFileSync(
  "git",
  ["log", "--format=@@%H", "-p", "--", "packages/ui/package.json"],
  {
    encoding: "utf8",
  },
);
const seen = new Map(); // version -> sha (first seen in log order = newest commit)
let sha = "";
for (const line of log.split("\n")) {
  if (line.startsWith("@@")) sha = line.slice(2);
  const m = /^\+\s*"version":\s*"(\d+)\.(\d+)\.(\d+)"/.exec(line);
  if (m && !seen.has(`${m[1]}.${m[2]}.${m[3]}`))
    seen.set(`${m[1]}.${m[2]}.${m[3]}`, sha);
}
const releases = [...seen]
  .map(([v, s]) => ({ v, s, parts: v.split(".").map(Number) }))
  .filter(({ parts: [M] }) => M >= 1 && M < 4)
  .sort(
    (a, b) =>
      a.parts[0] - b.parts[0] ||
      a.parts[1] - b.parts[1] ||
      a.parts[2] - b.parts[2],
  );
const lastOfMinor = new Map();
for (const r of releases) lastOfMinor.set(`${r.parts[0]}.${r.parts[1]}`, r.v);
for (const r of releases) {
  const last = lastOfMinor.get(`${r.parts[0]}.${r.parts[1]}`) === r.v;
  console.log(`${r.v} ${r.s} ${last ? "minor" : "patch"}`);
}
