const Header = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-border flex items-end justify-between border-b pb-4">
        <div className="space-y-2">
          <h1 className="text-3xl">Equality - EQTYLab Component Library</h1>
          <p className="text-muted-foreground text-sm">
            This is a reference for the component library <code>@eqtylab/equality</code>. It is a
            living document that will be updated as the component library evolves.
          </p>
        </div>
        <div className="text-muted-foreground flex items-center space-x-1">
          <p className="text-sm">Latest Updates: October 14, 2025</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-medium">Installation Instructions</h2>
        <div className="[&_code]:bg-muted space-y-6 [&_code]:w-max [&_code]:rounded-md [&_code]:px-2 [&_code]:py-1 [&_code]:text-sm">
          <div className="space-y-2">
            <p>To install the component library, run the following command:</p>
            <div className="flex flex-col gap-2">
              <code>pnpm add @eqtylab/equality</code>
              or
              <code>npm install @eqtylab/equality</code>
              or
              <code>yarn add @eqtylab/equality</code>
            </div>
          </div>
          <div className="space-y-2">
            <p>Then, import the library CSS once in your app entry:</p>
            <pre>
              <code>import '@eqtylab/equality/styles/style.css'</code>
            </pre>
          </div>
          <div className="space-y-2">
            <p>Then, import and use components:</p>
            <pre>
              <code>{`import { Button } from '@eqtylab/equality'`}</code>
            </pre>
          </div>
          <div className="space-y-2">
            <p>
              Finally, wrap a top-level container with the <code>equality</code> class to scope
              styles/utilities:
            </p>
            <pre className="bg-muted overflow-x-auto rounded-md p-2">
              <code className="block bg-transparent p-0 font-mono text-sm">{`<div className="equality">
  <Button>Click me</Button>
</div>`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
