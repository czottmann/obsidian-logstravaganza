import { LogEvent } from "./types";
import { prefixMsg } from "./string-helpers";

// Storing the original `console` object so we can restore it later
const WINDOW_CONSOLE = window.console;

/**
 * A class that sets up a proxy for the `console` object to intercept log
 * events, which are added to the passed-in queue.
 */
export class ConsoleProxy {
  private queue: LogEvent[];

  constructor(queue: LogEvent[]) {
    this.queue = queue;
  }

  // Installing the console proxy object and the listener for uncaught errors
  public setup(): ConsoleProxy {
    // Preventing scoping issues in the `Proxy` object
    const self = this;

    const handler: ProxyHandler<Console> = {
      get(target, prop) {
        // Intercept the property access
        const property = (<any> target)[prop];

        if (typeof property === "function") {
          // Wrap the original method with the extra logging behavior
          return (...args: any[]) => {
            // Get the sender of the log event by parsing the stack trace
            const sender = new Error().stack
              ?.split("\n").at(2)
              ?.replace(/^.+\((.+?)\).*$/, "$1")
              .replace("app://obsidian.md/", "")
              .trim();

            self.storeEvent(prop.toString(), sender, args);

            // Forward the method call to the original `console` method
            return property.apply(target, args);
          };
        }

        // Return non-function properties as is
        return property;
      },
    };

    // Set up a new `Proxy` object to intercept any `console` calls
    const consoleProxy = new Proxy(window.console, handler);

    // Replace the `console` object with the proxy
    window.console = consoleProxy;

    // Listen for uncaught exceptions
    window.addEventListener("error", this.onWindowError);
    return this;
  }

  // Removing the console proxy object and the listener for uncaught errors
  public teardown(): void {
    window.console = WINDOW_CONSOLE;
    window.removeEventListener("error", this.onWindowError);
    console.info(prefixMsg("Proxy removed"));
  }

  /**
   * Adds log events with the specified level and arguments to the log event
   * queue.
   *
   * @param level - The level of the log event.
   * @param sender - The sender of the log event (e.g., "plugin:whatever").
   * @param args - The argument(s) to be logged, optional.
   */
  public storeEvent(
    level: string,
    sender: string | undefined,
    ...args: any[]
  ): void {
    this.queue.push({ timestamp: new Date(), level, sender, args });
  }

  /**
   * Event handler for window errors. Adds a "fatal"-level log event to the log
   * event queue.
   *
   * @param event - The error event object.
   */
  private onWindowError(event: ErrorEvent): void {
    const { message, colno, lineno, filename } = event;
    const logMessage = `${message} (${filename}:${lineno}:${colno})`;

    // Add a `fatal`-level log event to the queue
    this.storeEvent("fatal", logMessage);
  }
}
