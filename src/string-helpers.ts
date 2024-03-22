/**
 * Prefixes a message with the plugin logging prefix.
 * @param msg - The message to be prefixed.
 * @returns The prefixed message.
 */
export function prefixMsg(msg: string): string {
  return `[Logstravaganza] ${msg}`;
}
