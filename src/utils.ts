import { App } from "obsidian";

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
