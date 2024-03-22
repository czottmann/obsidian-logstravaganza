export interface LogEventsPrinter {
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
