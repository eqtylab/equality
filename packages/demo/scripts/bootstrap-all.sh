#!/usr/bin/env bash
# Newest first. Minor-last releases get a snapshot commit; every other release gets a plain tag
# on its real commit so its URL redirects. Stops at nothing: a failed snapshot is reported and skipped,
# and that release still gets a plain tag so the extractor can redirect it.
set -uo pipefail
ROOT=$(git rev-parse --show-toplevel); cd "$ROOT"
node packages/demo/scripts/release-commits.mjs | sort -t. -k1,1nr -k2,2nr -k3,3nr | while read -r VERSION SHA KIND; do
  TAG="v$VERSION"
  if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then echo "$TAG exists"; continue; fi
  if [ "$KIND" = minor ]; then
    if ! packages/demo/scripts/bootstrap-version.sh "$SHA" "$VERSION"; then
      echo "$VERSION: snapshot failed; tagging the real commit so it redirects" >&2
      git tag -a "$TAG" "$SHA" -m "Release $VERSION. No docs snapshot; see .anchor.local/living-docs/features/docs-versioning.md"
    fi
  else
    git tag -a "$TAG" "$SHA" -m "Release $VERSION"
  fi
done
echo; echo "tags:"; git tag --list 'v*' | sort -V | tr '\n' ' '; echo

# A failed snapshot still gets a redirect tag, so the tag list alone cannot tell you whether a
# minor has a copy. Without this summary a half-finished bootstrap looks identical to a complete
# one: 13 of 26 copies were missing on the first run and nothing said so.
echo
COPIES=0; FALLBACKS=""
while read -r VERSION SHA KIND; do
  [ "$KIND" = minor ] || continue
  if [ "$(git log -1 --format='%an' "v$VERSION" 2>/dev/null)" = "docs-bootstrap" ]; then
    COPIES=$((COPIES + 1))
  else
    FALLBACKS="$FALLBACKS v$VERSION"
  fi
done < <(node packages/demo/scripts/release-commits.mjs)
echo "copies built: $COPIES of $(node packages/demo/scripts/release-commits.mjs | grep -c minor)"
if [ -n "$FALLBACKS" ]; then
  echo "NO COPY (redirecting to the minor below):$FALLBACKS"
  echo "To retry: git tag -d$FALLBACKS && packages/demo/scripts/bootstrap-all.sh"
  exit 1
fi
