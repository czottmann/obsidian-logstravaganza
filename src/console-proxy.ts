import { App, TAbstractFile, TFile, TFolder, Vault, Workspace } from "obsidian";
import { LogEvent, UnhandledRejectionEvent } from "./types";
import { prefixMsg } from "./utils";

// Storing the original `window.*` object so we can restore them later
const WINDOW_CONSOLE = window.console;

/**
 * A class that sets up a proxy for the `console` object to intercept log
 * events, which are added to the passed-in queue.
 */
export class ConsoleProxy {
  constructor(
    private queue: LogEvent[],
  ) {}

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
    window.addEventListener("error", this.onWindowError.bind(this));
    window.addEventListener(
      "unhandledrejection",
      this.onWindowUnhandledRejection.bind(this),
    );

    return this;
  }

  // Removing the console proxy object and the listener for uncaught errors
  public teardown(): void {
    window.console = WINDOW_CONSOLE;
    window.removeEventListener("error", this.onWindowError.bind(this));
    window.removeEventListener(
      "unhandledrejection",
      this.onWindowUnhandledRejection.bind(this),
    );

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
    this.queue.push({
      timestamp: new Date(),
      level,
      sender,
      args: args.map(this.rewriteForLogging.bind(this)),
    });
  }

  /**
   * Tries to prevent "max. call stack exceeded" errors by replacing certain
   * objects with a string representation.
   */
  private rewriteForLogging(value: any): any {
    if (value instanceof TFolder) {
      return `[TFolder] ${value.path}`;
    } else if (value instanceof TFile) {
      return `[TFile] ${value.path}`;
    } else if (value instanceof TAbstractFile) {
      return `[TAbstractFile] ${value.path}`;
    } else if (value instanceof App) {
      return "[App]";
    } else if (value instanceof Vault) {
      return "[Vault]";
    } else if (value instanceof Workspace) {
      return "[Workspace]";
    } else if (Array.isArray(value)) {
      return value.map((item) => this.rewriteForLogging(item));
    } else if (typeof value === "object" && value !== null) {
      return Object.fromEntries(
        Object.entries(value)
          .map(([key, val]) => [key, this.rewriteForLogging(val)]),
      );
    }
    return value;
  }

  /**
   * Event handler for window errors. Adds a "fatal"-level log event to the log
   * event queue.
   *
   * @param event - The error event object.
   */
  private onWindowError(event: ErrorEvent): void {
    const { message, colno, lineno, filename, error } = event;

    // Add a `fatal`-level log event to the queue
    this.storeEvent(
      "fatal",
      `${filename}:${lineno}:${colno}`,
      error.name,
      message,
      error.stack || "(stack trace unavailable)",
    );
  }

  /**
   * Event handler for unhandled exceptions happening in promises. Adds a
   * "fatal"-level log event to the log event queue.
   *
   * @param event - The error event object.
   */
  private onWindowUnhandledRejection(event: UnhandledRejectionEvent): void {
    const error = event.reason;

    if (typeof error === "string") {
      this.storeEvent(
        "fatal",
        "sender:unknown",
        "Uncaught (in promise)",
        error,
      );
    } else {
      const { colno, lineno, filename } = error;
      const sender = (filename && lineno && colno)
        ? `${filename}:${lineno}:${colno}`
        : error.stack?.match(/at eval \((.+?)\)/)?.[1] ?? "(undetermined)";

      // Add a `fatal`-level log event to the queue
      this.storeEvent(
        "fatal",
        sender,
        "Uncaught (in promise)",
        error.stack || "(stack trace unavailable)",
      );
    }
  }
}
