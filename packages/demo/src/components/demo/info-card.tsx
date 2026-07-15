import { InfoCard } from "@eqtylab/equality";

export const InfoCardClickableDemo = () => {
  return (
    <InfoCard
      label="Policy Type"
      description="Custom"
      icon="Shield"
      onClick={() => alert("Clicked!")}
    />
  );
};
