import { Heading } from "@eqtylab/equality";

const HeadingDemo = ({
  as,
  displayAs,
}: {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  displayAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) => {
  const label = displayAs ? `${as} styled as ${displayAs}` : as;

  return (
    <div>
      <Heading as={as}>This is an {label} heading</Heading>
    </div>
  );
};

export { HeadingDemo };
