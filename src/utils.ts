import { App, debounce, TFile, Vault } from "obsidian";
import type { LogEvent, LogLevel } from "./types";

/**
 * Gets the device name from the sync plugin. If the device name is not
 * explicitly set in the plugin's user configuration, the default device name is
 * returned.
 *
 * @param app The Obsidian app object
 * @returns The device name
 */
export function getDeviceName(app: App): string {
  const syncPlugin = (<any> app).internalPlugins?.plugins["sync"]?.instance;

  if (!syncPlugin) {
    return "Unknown device";
  }

  return syncPlugin.deviceName
    ? syncPlugin.deviceName
    : syncPlugin.getDefaultDeviceName();
}

/**
 * Prefixes a message with the plugin logging prefix.
 * @param msg - The message to be prefixed.
 * @returns The prefixed message.
 */
export function prefixMsg(msg: string): string {
  return `[Logstravaganza] ${msg}`;
}

/**
 * Creates a queue for storing log events. The queue watches for new elements
 * added via `.push()`, and calls the `onNewElement` function whenever a new
 * element is added. The call is debounced by 1s.
 *
 * @param onPush Handler function which to be called on new elements. The
 * function will be automatically debounced (1s).
 * @param disableDebounce If `true`, the debouncing is disabled.
 *
 * @returns `LogEvent[]`
 */
export function createQueue(
  onPush: () => void,
  debounceWrites: boolean = true,
): LogEvent[] {
  const callback = debounceWrites ? debounce(onPush, 1000) : onPush;
  const queue: LogEvent[] = [];
  const handler: ProxyHandler<LogEvent[]> = {
    get(target: any, prop) {
      if (prop === "push" || (prop as Symbol).description === "push") {
        callback();
      }
      return target[prop];
    },
  };

  return new Proxy(queue, handler);
}

/**
 * Retrieves the Obsidian file with the specified path or creates a new one
 * if it doesn't exist yet.
 *
 * @returns A `Promise` that resolves to a `TFile` representing the file.
 */
export async function getFile(
  vault: Vault,
  filename: string,
  initialContent?: string,
): Promise<TFile> {
  const note = vault.getAbstractFileByPath(filename);
  return (note instanceof TFile)
    ? note
    : await vault.create(filename, (initialContent ?? "") + "\n");
}

/**
 * Returns the Obsidian URI for the specified vault and path.
 * @returns "obsidian://open?vault=…&file=…"
 */
export function getObsidianURI(vault: Vault, path: string): string {
  const v = encodeURIComponent(vault.getName());
  const p = encodeURIComponent(path);
  return `obsidian://open?vault=${v}&file=${p}`;
}

export function logLevelFilter(logEvent: LogEvent, logLevel: LogLevel) {
  switch (logLevel) {
    case "debug":
      return true;
    case "info":
      return logEvent.level !== "debug";
    case "warn":
      return !["debug", "info", "log"].includes(logEvent.level);
    case "error":
      return !["debug", "info", "log", "warn"].includes(logEvent.level);
    default:
      break;
  }
  // what?
  return true;
}
