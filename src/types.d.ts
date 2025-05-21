export interface LogstravaganzaSettings {
  fileNameContainsDate: boolean;
  formatterID: string;
  outputFolder: string;
  logLevel: LogLevel;

  /**
   * By default, Logstravanganza will debounce write operations to the file to
   * avoid excessive writes. This is done by default to improve performance.
   * Setting this to `false` will write the log events immediately to the file,
   * likely resulting in a performance hit. (Personally, I disable this option
   * for local debugging and testing purposes.)
   */
  debounceWrites: boolean;
}

export interface LogEventsFormatter {
  /**
   * The ID of the formatter. This is used to identify the formatter in the
   * settings. It should be unique among all formatters, all lowercase, and
   * have a clear relation to the object it represents (e.g., when the formatter
   * is named `ndjsonFormatter`, the ID should be `ndjson`).
   */
  id: string;

  /**
   * The human-readable title of the formatter, used for the formatter selection
   * in the settings.
   */
  title: string;

  /**
   * An optional description of the formatter, used to provide additional
   * information about the formatter in the settings.
   */
  description?: string;

  /**
   * The file extension for the output file, e.g. `md`, `ndjson`, `txt` (omit
   * the leading period!).
   */
  fileExt: string;

  /**
   * When a new file is created, this string is written to the top of the file.
   */
  contentHead?: string;

  /**
   * The output formatting function for log events. For every log event, this
   * function is called with the log event as an argument, and it should return
   * a string representation of the log event which will be appended to the
   * output file.
   */
  format: (logEvent: LogEvent) => string;
}

/**
 * An object representing an intercepted log event.
 */
type LogEvent = {
  timestamp: Date;
  level: string;
  sender: string | undefined;
  args: any[];
};

export interface UnhandledRejectionEvent extends PromiseRejectionEvent {
  reason: any;
  promise: Promise<any>;
}

export type LogLevel = "debug" | "info" | "warn" | "error";
