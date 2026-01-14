import { CopyButton } from "@eqtylab/equality";

export const CopyButtonDemo = ({
  size = "sm",
}: {
  size?: "sm" | "md" | "lg";
}) => {
  return (
    <CopyButton
      value="sample text"
      onClick={() => alert("Button clicked! Text copied!")}
      size={size}
    />
  );
};
