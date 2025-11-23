import { Heading } from "@eqtylab/equality";

type HeadingTagType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingDemoProps {
  as?: HeadingTagType;
  displayAs?: HeadingTagType;
}

const HeadingDemo = ({ as, displayAs }: HeadingDemoProps = {}) => {
  // If specific props are provided, render single variant
  if (as) {
    const label = displayAs ? `${as} styled as ${displayAs}` : `an ${as}`;

    return (
      <Heading as={as} displayAs={displayAs}>
        This is {label} heading
      </Heading>
    );
  }

  // Otherwise, render all variants
  const variants: HeadingTagType[] = ["h1", "h2", "h3", "h4", "h5", "h6"];

  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <Heading key={variant} as={variant}>
          This is an {variant} heading
        </Heading>
      ))}
    </div>
  );
};

export { HeadingDemo };
