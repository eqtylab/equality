// Sample sources live here rather than inline in the MDX: Prettier reformats template literals
// embedded in MDX expressions, which flattens the indentation the line-number demo is meant to show.

export const deployScriptSample = `#!/usr/bin/env bash
set -euo pipefail

if [ -z "\${APP:-}" ]; then
  echo "no app bound" >&2
  exit 1
fi

equality-deploy release --app "$APP" --channel stable`;

export const releaseNotesSample = `import { CodeBlock } from "@eqtylab/equality";

interface ReleaseNotesProps {
  manifest: string;
}

const ReleaseNotes = ({ manifest }: ReleaseNotesProps) => {
  return (
    <CodeBlock
      title="manifest.json"
      language="json"
      code={manifest}
      lineNumbers
    />
  );
};

export { ReleaseNotes };
`;

export const packageJsonSample = `{
  "name": "my-app",
  "private": true,
  "type": "module",
  "dependencies": { "@eqtylab/equality": "^3.4.0" }
}`;
