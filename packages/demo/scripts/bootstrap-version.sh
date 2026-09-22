#!/usr/bin/env bash
# Makes the docs of one old release readable by the versioned build and tags the result.
# Usage: bootstrap-version.sh <commit> <version>      e.g. bootstrap-version.sh 2502725 3.9.1
# Works in a detached worktree; the current checkout is never touched. The tag's parent is the real release commit.
set -euo pipefail
COMMIT=$1; VERSION=$2; TAG="v$VERSION"
ROOT=$(git rev-parse --show-toplevel)
SCRIPTS="$ROOT/packages/demo/scripts"
WT="$(dirname "$ROOT")/eq-bootstrap-$VERSION"
SRC=packages/demo/src/content/components
DST=packages/demo/src/content/docs

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then echo "$TAG exists; skipping"; exit 0; fi

git worktree add --detach "$WT" "$COMMIT" >/dev/null
trap 'git -C "$ROOT" worktree remove --force "$WT" 2>/dev/null || true' EXIT
cd "$WT"

if [ ! -d "$SRC" ]; then echo "$VERSION: no $SRC at $COMMIT; not bootstrapped" >&2; exit 2; fi
mkdir -p "$DST"
git mv "$SRC" "$DST/components"
node "$SCRIPTS/convert-frontmatter.mjs" "$DST"/components/*.mdx

# Demo widgets resolve against main's tree. A page whose widget no longer exists cannot build.
for f in "$DST"/components/*.mdx; do
  for w in $(grep -oE '@demo/components/[A-Za-z0-9_./-]+' "$f" | sort -u); do
    rel="$ROOT/packages/demo/src/components/${w#@demo/components/}"
    if [ ! -e "$rel" ] && [ ! -e "$rel.tsx" ] && [ ! -e "$rel.ts" ]; then
      echo "$VERSION: dropping $(basename "$f"): $w is gone from main" >&2
      git rm -q "$f"; break
    fi
  done
done

if grep -rnE "from ['\"]\.\./" "$DST" >/dev/null; then
  echo "$VERSION: a relative import escapes the content directory; fix by hand" >&2; exit 3
fi

printf 'order:\n  - components\n' > "$DST/_group.yaml"
git -C "$ROOT" show 13ba745:packages/demo/src/content/docs/components/_group.yaml > "$DST/components/_group.yaml"

git add -A packages/demo/src/content
git -c user.name="docs-bootstrap" -c user.email="docs-bootstrap@eqtylab.io" commit -q \
  -m "docs: snapshot the $VERSION content in the converted shape for versioned builds"
git tag -a "$TAG" -m "Docs snapshot for $VERSION. Content only; see .anchor.local/living-docs/features/docs-versioning.md"
echo "tagged $TAG on $(git rev-parse --short HEAD) (parent $(git rev-parse --short "$COMMIT"))"
