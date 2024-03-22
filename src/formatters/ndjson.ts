import { LogEventsFormatter } from "../types";

export const ndjsonFormatter: LogEventsFormatter = {
  id: "ndjson",
  title: "NDJSON",
  description: "Generates a newline-delimited JSON file",
  fileExt: "ndjson",
  format: (logEvent) => JSON.stringify(logEvent),
};
