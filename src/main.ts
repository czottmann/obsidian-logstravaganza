import { Plugin } from "obsidian";
import { PLUGIN_LOGGING_PREFIX } from "./constants";
import { addToLogEvents } from "./logging";

// Storing the original `console` object so we can restore it later
const WINDOW_CONSOLE = window.console;

export default class LoggingNote extends Plugin {
  onload() {
    addToLogEvents("_tableheader");

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
              addToLogEvents(prop, ...args);

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
    window.addEventListener("error", onWindowError);

    addToLogEvents("info", prefixMsg("----- Plugin loaded -----"));
    addToLogEvents("info", prefixMsg("Proxy set up"));
  }

  onunload() {
    window.console = WINDOW_CONSOLE;
    window.removeEventListener("error", onWindowError);
    console.info(prefixMsg("Proxy removed"));
  }
}

/**
 * Event handler for window errors. Adds a "fatal"-level log event to the log
 * event queue.
 *
 * @param event - The error event object.
 */
function onWindowError(event: ErrorEvent): void {
  const { message, colno, lineno, filename } = event;
  const logMessage = `${message} (${filename}:${lineno}:${colno})`;

  // Add a `fatal`-level log event to the queue
  addToLogEvents("fatal", logMessage);
}

/**
 * Prefixes a message with the plugin logging prefix.
 * @param msg - The message to be prefixed.
 * @returns The prefixed message.
 */
function prefixMsg(msg: string): string {
  return `[${PLUGIN_LOGGING_PREFIX}] ${msg}`;
}
