import { DateRangePicker } from "@eqtylab/equality";
import { useState } from "react";

export const DateRangePickerDemo = ({
  displayMinWidth = false,
}: {
  displayMinWidth?: boolean;
}) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  if (displayMinWidth) {
    return (
      <div className="flex">
        <DateRangePicker dateRange={dateRange} onSelect={setDateRange} />
      </div>
    );
  }

  return <DateRangePicker dateRange={dateRange} onSelect={setDateRange} />;
};
