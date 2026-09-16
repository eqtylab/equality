# @eqtylab/skills

Agent skills for building with Equality. These teach a coding agent to find and
compose the components we already have, instead of reinventing them in every
prototype.

Distributed with [`npx skills`](https://github.com/vercel-labs/skills) works with Claude Code, Cursor, Copilot, Codex, and the other
agents it supports.

## Installation

From the root of the project you're building:

```bash
pnpx skills add eqtylab/equality
```

That installs `equality-design-system` into whichever agents you pick. To skip
the prompts:

```bash
pnpx skills add eqtylab/equality -a '*' --all
```

Useful flags: `--list` to see what's on offer without installing `-g` to install for your user rather than one project.

Re-run the same command to pull updates after the design system ships new components.

> **Don't use `--skill` with this repo.** That flag takes a different discovery
> path in the CLI that skips `.claude-plugin/plugin.json` — so it misses the
> skill in `packages/skills/` and offers the internal maintainer skills instead.
> `--all` selects everything on offer, which here is the one skill you want.

## Skills

### `equality-design-system`

For anyone building a product surface, prototype, or mockup with
`@eqtylab/equality`.

- A pointer to the live component index, so lookup is never stale
- An list of what Equality lacks, so agents stop searching
- Setup, theming, portals, and dark mode, with the usual failure modes
- Composition recipes for list pages, dashboards, detail panels, and forms
- An escape ladder for when nothing fits

## Discovery

`npx skills` scans a repo's root, `skills/`, agent directories like
`.claude/skills/`, and any path declared in `.claude-plugin/plugin.json`. This
package lives at `packages/skills/` to match the monorepo layout, which is not
one of the scanned locations — so the repo-root `.claude-plugin/plugin.json`
points at it.

**If you add a skill here, add it to that manifest or the CLI won't find it.**

If the manifest indirection ever becomes a nuisance, moving these to a top-level
`skills/` directory would make them discoverable on every code path, `--skill`
included, at the cost of a directory outside `packages/`.

The maintainer skills in `.claude/skills/` (`create-component`,
`create-documentation`) are marked `metadata.internal: true` so they stay out of
the consumer-facing list.
