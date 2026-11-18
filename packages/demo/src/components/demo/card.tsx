import {
  Card,
  CardContent,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "@eqtylab/equality";
import { useState } from "react";

const PLANS = [
  { value: "starter", label: "Starter", description: "One project" },
  { value: "team", label: "Team", description: "Up to ten projects" },
];

export const CardSelectedDemo = () => {
  const [plan, setPlan] = useState("starter");

  return (
    <RadioGroup
      value={plan}
      onValueChange={setPlan}
      className="grid gap-3 sm:grid-cols-2"
    >
      {PLANS.map((option) => (
        <Card
          key={option.value}
          selected={option.value === plan}
          onClick={() => setPlan(option.value)}
        >
          <CardContent className="flex items-start gap-3">
            <RadioGroupItem value={option.value} id={`plan-${option.value}`} />
            <div className="space-y-0.5">
              <Label htmlFor={`plan-${option.value}`}>{option.label}</Label>
              <p className="text-text-secondary text-sm">
                {option.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </RadioGroup>
  );
};
