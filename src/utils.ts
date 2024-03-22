import { App, debounce, TFile, Vault } from "obsidian";
import { LogEvent } from "./types";

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
 *
 * @returns `LogEvent[]`
 */
export function createQueue(onPush: () => void): LogEvent[] {
  const callback = debounce(onPush, 1000);
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
