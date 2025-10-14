import { Button, Card, CardContent } from '@eqtylab/equality';

export default function App() {
  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-semibold">@eqtylab/equality demo</h1>
      <Card onClick={() => alert('clicked')}>
        <CardContent>
          <p className="mb-4">Card content with blurred glass defaults.</p>
          <div className="flex gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </CardContent>
      </Card>

      <section id="buttons" className="space-y-6">
        <h3 className="border-border border-b pb-2 text-xl font-medium">Buttons</h3>
        <div className="grid grid-cols-7 gap-6">
          {/* Default */}
          <div className="flex flex-col gap-4">
            <Button variant="default">Default</Button>
            <Button variant="default" size="lg">
              Default LG
            </Button>
            <Button variant="default" size="md">
              Default MD
            </Button>
            <Button variant="default" size="sm">
              Default SM
            </Button>
          </div>

          {/* Outline */}
          <div className="flex flex-col gap-4">
            <Button variant="outline">Outline</Button>
            <Button variant="outline" size="lg">
              Outline LG
            </Button>
            <Button variant="outline" size="md">
              Outline MD
            </Button>
            <Button variant="outline" size="sm">
              Outline SM
            </Button>
          </div>

          {/* Primary */}
          <div className="flex flex-col gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="primary" size="lg">
              Primary LG
            </Button>
            <Button variant="primary" size="md">
              Primary MD
            </Button>
            <Button variant="primary" size="sm">
              Primary SM
            </Button>
          </div>

          {/* Secondary */}
          <div className="flex flex-col gap-4">
            <Button variant="secondary">Secondary</Button>
            <Button variant="secondary" size="lg">
              Secondary LG
            </Button>{' '}
            <Button variant="secondary" size="md">
              Secondary MD
            </Button>
            <Button variant="secondary" size="sm">
              Secondary SM
            </Button>
          </div>

          {/* Destructive */}
          <div className="flex flex-col gap-4">
            <Button variant="destructive">Destructive</Button>
            <Button variant="destructive" size="lg">
              Destructive LG
            </Button>
            <Button variant="destructive" size="md">
              Destructive MD
            </Button>
            <Button variant="destructive" size="sm">
              Destructive SM
            </Button>
          </div>

          {/* Link */}
          <div className="flex flex-col gap-4">
            <Button variant="link">Link</Button>
            <Button variant="link" size="lg">
              Link LG
            </Button>
            <Button variant="link" size="md">
              Link MD
            </Button>
            <Button variant="link" size="sm">
              Link SM
            </Button>
          </div>

          {/* Icon */}
          {/* <div className="flex flex-col items-center gap-4">
                    <Button variant="icon">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="icon" size="lg">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="icon" size="md">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="icon" size="sm">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div> */}
        </div>
      </section>
    </div>
  );
}
