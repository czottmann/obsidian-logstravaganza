import { LogEventsFormatter } from "../types";

/**
 * A formatter that generates a newline-delimited JSON file.
 * See https://github.com/ndjson/ndjson-spec for more information on the spec.
 */
export default <LogEventsFormatter> {
  id: "ndjson",
  title: "NDJSON",
  description: "Generates a newline-delimited JSON file",
  fileExt: "ndjson",
  format: (logEvent) => JSON.stringify(logEvent),
};
