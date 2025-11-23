import { PanelLabel, ControlStatusBadge } from "@eqtylab/equality";

export const ControlStatusBadgeDemo = () => {
  return (
    <div className="grid grid-cols-[auto_auto_auto] gap-6">
      <div className="flex flex-col items-start space-y-3">
        <PanelLabel label="With Icons (default)" />
        <ControlStatusBadge status="Not Started" />
        <ControlStatusBadge status="In Progress" />
        <ControlStatusBadge status="Ready For Review" />
        <ControlStatusBadge status="In Review" />
        <ControlStatusBadge status="Compliant" />
        <ControlStatusBadge status="Non-Compliant" />
        <ControlStatusBadge status="Not Applicable" />
        <ControlStatusBadge status="ACCEPTED" />
        <ControlStatusBadge status="QUESTIONED" />
        <ControlStatusBadge status="GENERAL" />
        <ControlStatusBadge status="COMMENT" />
        <ControlStatusBadge status="FAILED" />
      </div>
      <div className="flex flex-col items-start space-y-3">
        <PanelLabel label="Label Only" />
        <ControlStatusBadge status="Not Started" hideIcon />
        <ControlStatusBadge status="In Progress" hideIcon />
        <ControlStatusBadge status="Ready For Review" hideIcon />
        <ControlStatusBadge status="In Review" hideIcon />
        <ControlStatusBadge status="Compliant" hideIcon />
        <ControlStatusBadge status="Non-Compliant" hideIcon />
        <ControlStatusBadge status="Not Applicable" hideIcon />
        <ControlStatusBadge status="ACCEPTED" hideIcon />
        <ControlStatusBadge status="QUESTIONED" hideIcon />
        <ControlStatusBadge status="GENERAL" hideIcon />
        <ControlStatusBadge status="COMMENT" hideIcon />
        <ControlStatusBadge status="FAILED" hideIcon />
      </div>
      <div className="flex flex-col items-start space-y-3">
        <PanelLabel label="Icon Only" />
        <ControlStatusBadge status="Not Started" hideLabel />
        <ControlStatusBadge status="In Progress" hideLabel />
        <ControlStatusBadge status="Ready For Review" hideLabel />
        <ControlStatusBadge status="In Review" hideLabel />
        <ControlStatusBadge status="Compliant" hideLabel />
        <ControlStatusBadge status="Non-Compliant" hideLabel />
        <ControlStatusBadge status="Not Applicable" hideLabel />
        <ControlStatusBadge status="ACCEPTED" hideLabel />
        <ControlStatusBadge status="QUESTIONED" hideLabel />
        <ControlStatusBadge status="GENERAL" hideLabel />
        <ControlStatusBadge status="COMMENT" hideLabel />
        <ControlStatusBadge status="FAILED" hideLabel />
      </div>
    </div>
  );
};
