export interface LogEventsFormatter {
  /**
   * The ID of the printer. This is used to identify the printer in the settings.
   */
  id: string;

  /**
   * The human-readable title of the printer. This is used for the the printer
   * selection in the settings.
   */
  title: string;

  /**
   * An optional description of the printer. This is used to provide additional
   * information about the printer in the settings.
   */
  description?: string;

  /**
   * The file extension for the log file, e.g. `.md`, `.ndjson`, `.txt`.
   */
  fileExt: string;

  /**
   * When a new file is created, this string is written to the top of the file.
   */
  contentHead?: string;

  /**
   * The output formatter for log events. Basically, for every log event, this
   * function is called with the log event as an argument, and it should return
   * a string representation of the log event.
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
