import { DateRangePicker } from "@eqtylab/equality";
import { useState } from "react";

export const DateRangePickerDemo = () => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  return <DateRangePicker dateRange={dateRange} onSelect={setDateRange} />;
};
