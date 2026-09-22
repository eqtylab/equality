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
