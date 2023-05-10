import { PLUGIN_LOGGING_PREFIX } from "./constants";
import { getNoteFile } from "./file-handling";
import { LogEvent } from "./types";
import { debounce } from "./utils";

const logEventsQueue: LogEvent[] = [];
const severityMarkers: Readonly<{ [key: string]: string }> = {
  "debug": "🔎",
  "error": "❗️",
  "fatal": "❌",
  "info": "ℹ️",
  "log": "🗒️",
  "warn": "🟧",
  "_unknown": "❓",
};

export const CONSOLE_ORIGINALS: Readonly<{ [key: string]: Function }> = {
  "debug": console.debug,
  "error": console.error,
  "info": console.info,
  "log": console.log,
  "warn": console.warn,
};

export function prepLogMessage(msg: string): string {
  return `[${PLUGIN_LOGGING_PREFIX}] ${msg}`;
}

/**
 * Adds log events with the specified level and arguments to the log event
 * array. This function triggers the processing function to write the log events
 * to the note file.
 *
 * @param level - The level of the log event.
 * @param args - The arguments to be logged.
 */
export function addToLogEvents(level: string, ...args: any[]): void {
  // Get the current time
  const timestamp = new Date();

  // Create a log event and add it to the list
  logEventsQueue.push({ timestamp, level, args });

  // Tell the processing function there's new work but debounce it so it doesn't
  // fall over itself.
  processLogEvents();
}

/**
 * Debounced function that processes log events by appending them to the note
 * file.
 */
const processLogEvents = debounce(async () => {
  // Access the vault from the window object
  const { vault } = window.app;

  // Retrieve the note file
  const note = await getNoteFile();
  const newLines: string[] = [];

  // Process all log events in the queue
  let logEvent: LogEvent | undefined;
  while ((logEvent = logEventsQueue.shift())) {
    // Destructure the log event properties
    const { timestamp, level, args } = logEvent;
    const ts = timestamp.toISOString();
    const lvl = level.toUpperCase().padEnd(5, " ");

    // Format the log message
    const logMsg = args
      .map((arg) => (typeof arg === "string") ? arg : JSON.stringify(arg))
      .join(" ");
    const marker = severityMarkers[level] || severityMarkers["_unknown"];
    newLines.push(`${marker} ${ts} ${lvl} | ${logMsg}`);
  }

  // Read the current content of the note file
  const noteContent = await vault.read(note);

  // Append the new log message to the note file
  const linesToAppend = newLines.join("\n") + "\n\n";
  await vault.modify(note, noteContent + linesToAppend);
}, 1000);
