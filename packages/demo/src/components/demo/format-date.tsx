import { PanelLabel, FormatDate, Card, CardContent } from "@eqtylab/equality";
import { useMemo } from "react";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function FormatDateRelativeDemo() {
  // Compute offsets from "now" once on mount so the examples read naturally.
  const samples = useMemo(() => {
    const now = new Date();
    const time = now.getTime();
    return [
      { label: "Seconds ago", date: new Date(time - 10 * 1000) },
      { label: "Minutes ago", date: new Date(time - 5 * MINUTE) },
      { label: "Hours ago", date: new Date(time - 3 * HOUR) },
      { label: "Days ago", date: new Date(time - 2 * DAY) },
      { label: "Weeks ago", date: new Date(time - 2 * WEEK) },
      { label: "In the future", date: new Date(time + 4 * DAY) },
    ];
  }, []);

  return (
    <div className="my-4">
      <Card>
        <CardContent>
          {samples.map((sample) => (
            <div key={sample.label} className="flex items-center gap-3">
              <PanelLabel label={sample.label} className="w-28" />
              <FormatDate date={sample.date} displayAs="relative" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function FormatDateTimeZoneDemo() {
  const date = useMemo(() => new Date("2026-06-09T18:42:03Z"), []);

  return (
    <div className="my-4">
      <Card>
        <CardContent className="divide-border divide-y divide-solid">
          <div className="flex items-center gap-3 py-1">
            <PanelLabel label="UTC (default)" className="w-28" />
            <FormatDate date={date} displayAs="absolute" />
          </div>
          <div className="flex items-center gap-3 py-1">
            <PanelLabel label="New York" className="w-28" />
            <FormatDate
              date={date}
              displayAs="absolute"
              timeZone="America/New_York"
            />
          </div>
          <div className="flex items-center gap-3 py-1">
            <PanelLabel label="Tokyo" className="w-28" />
            <FormatDate
              date={date}
              displayAs="absolute"
              timeZone="Asia/Tokyo"
            />
          </div>
          <div className="flex items-center gap-3 py-1">
            <PanelLabel label="Auckland" className="w-28" />
            <FormatDate
              date={date}
              displayAs="absolute"
              timeZone="Pacific/Auckland"
            />
          </div>
          <div className="flex items-center gap-3 py-1">
            <PanelLabel label="Toronto" className="w-28" />
            <FormatDate
              date={date}
              displayAs="absolute"
              timeZone="America/Toronto"
            />
          </div>
          <div className="flex items-center gap-3 py-1">
            <PanelLabel label="Los Angeles" className="w-28" />
            <FormatDate
              date={date}
              displayAs="absolute"
              timeZone="America/Los_Angeles"
            />
          </div>
          <div className="flex items-center gap-3 py-1">
            <PanelLabel label="Buenos Aires" className="w-28" />
            <FormatDate
              date={date}
              displayAs="absolute"
              timeZone="America/Buenos_Aires"
            />
          </div>
          <div className="flex items-center gap-3 py-1">
            <PanelLabel label="London" className="w-28" />
            <FormatDate
              date={date}
              displayAs="absolute"
              timeZone="Europe/London"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FormatDateOptionsDemo() {
  const date = useMemo(() => new Date("2026-06-09T18:42:03Z"), []);

  // Each entry overrides the default Intl.DateTimeFormat options.
  const samples: {
    label: string;
    options: Intl.DateTimeFormatOptions;
  }[] = [
    {
      label: "Date only",
      options: { year: "numeric", month: "long", day: "numeric" },
    },
    {
      label: "Time only",
      options: { hour: "2-digit", minute: "2-digit" },
    },
    {
      label: "With weekday",
      options: {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    },
    {
      label: "Short numeric",
      options: { dateStyle: "short", timeStyle: "short" },
    },
  ];

  return (
    <div className="my-4">
      <Card>
        <CardContent className="divide-border divide-y divide-solid">
          {samples.map((sample) => (
            <div key={sample.label} className="flex items-center gap-3 py-1">
              <PanelLabel label={sample.label} className="w-28" />
              <FormatDate
                date={date}
                displayAs="absolute"
                absoluteOptions={sample.options}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
