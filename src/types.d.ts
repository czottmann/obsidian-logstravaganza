export interface LogstravaganzaSettings {
  formatterID: string;
}

export interface LogEventsFormatter {
  /**
   * The ID of the formatter. This is used to identify the formatter in the settings.
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
   * The file extension for the output file, e.g. `.md`, `.ndjson`, `.txt`.
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
