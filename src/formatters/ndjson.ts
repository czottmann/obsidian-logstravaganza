import { LogEventsFormatter } from "../types";

export default <LogEventsFormatter> {
  id: "ndjson",
  title: "NDJSON",
  description: "Generates a newline-delimited JSON file",
  fileExt: "ndjson",
  format: (logEvent) => JSON.stringify(logEvent),
};
