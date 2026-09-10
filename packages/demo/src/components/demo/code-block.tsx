import { CodeBlock } from "@eqtylab/equality";

// Demos live here rather than inline in the MDX: Prettier reformats template literals
// embedded in MDX expressions, which flattens the indentation these samples exist to show.

export const CodeBlockLanguageDemo = () => {
  return (
    <CodeBlock
      title="package.json"
      language="json"
      code={`{
  "name": "my-app",
  "private": true,
  "type": "module",
  "dependencies": { "@eqtylab/equality": "^3.4.0" }
}`}
    />
  );
};

export const CodeBlockLineNumbersDemo = () => {
  return (
    <CodeBlock
      title="deploy.sh"
      language="bash"
      lineNumbers
      code={`#!/usr/bin/env bash
set -euo pipefail

if [ -z "\${APP:-}" ]; then
  echo "no app bound" >&2
  exit 1
fi

equality-deploy release --app "$APP" --channel stable`}
    />
  );
};

export const CodeBlockNeutralDemo = () => {
  return (
    <CodeBlock
      title="Example"
      language="tsx"
      codeLabel="// This is the code block component!"
      code={`import { CodeBlock } from "@eqtylab/equality";

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
`}
    />
  );
};
