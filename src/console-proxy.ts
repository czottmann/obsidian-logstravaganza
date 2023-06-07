import { App } from "obsidian";
import { NoteLogger } from "./note-logger";

// Storing the original `console` object so we can restore it later
const WINDOW_CONSOLE = window.console;

type ConsoleProxyOptions = {
  app: App;
  logger: NoteLogger;
};

export class ConsoleProxy {
  private readonly app: App;
  private readonly logger: NoteLogger;

  constructor(options: ConsoleProxyOptions) {
    const { app, logger } = options;
    this.app = app;
    this.logger = logger;
  }

  // Installing the console proxy object and the listener for uncaught errors
  public setup(): void {
    // Preventing scoping issues in the `Proxy` object
    const { logger } = this;

    // Set up a new `Proxy` object to intercept any `console` calls
    const consoleProxy = new Proxy(
      window.console,
      {
        get: function (target: any, prop: string) {
          // Intercept the property access
          const property = target[prop];

          if (typeof property === "function") {
            // Wrap the original method with the extra logging behavior
            return function (...args: any[]) {
              logger.addToLogEvents(prop, ...args);

              // Forward the method call to the original `console` method
              return property.apply(target, args);
            };
          }

          // Return non-function properties as is
          return property;
        },
      },
    );

    // Replace the `console` object with the proxy
    window.console = consoleProxy;

    // Listen for uncaught exceptions
    window.addEventListener("error", this.onWindowError);
  }

  // Removing the console proxy object and the listener for uncaught errors
  public teardown(): void {
    window.console = WINDOW_CONSOLE;
    window.removeEventListener("error", this.onWindowError);
    console.info(this.logger.prefixMsg("Proxy removed"));
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
    this.logger.addToLogEvents("fatal", logMessage);
  }
}
