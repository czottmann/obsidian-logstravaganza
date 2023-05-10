import { getNoteFile } from "./file-handling";
import { LogEvent } from "./types";
import { debounce } from "./utils";

const logEventsQueue: LogEvent[] = [];

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
const processLogEvents = debounce(
  () => {
    // File operations before the layout is ready are usually not a good idea,
    // so we'll make sure Obsidian is ready before doing anything.
    window.app.workspace.onLayoutReady(async () => {
      // Access the vault from the window object
      const { vault } = window.app;

      // Retrieve the note file
      const note = await getNoteFile();

      // Array for holding the new lines to be appended to the note file
      const newLines: string[] = [];

      // Process all log events in the queue
      let logEvent: LogEvent | undefined;
      while ((logEvent = logEventsQueue.shift())) {
        // Destructure the log event properties
        const { timestamp, level, args } = logEvent;

        if (level === "_tableheader") {
          // Add a table header to the note file
          newLines.push(
            "",
            "",
            "| Timestamp | Level | Message |",
            "| --------- | ----- | ------- |",
          );
          continue;
        }

        // Format the log message
        const logMsg = args
          .map((arg) => (typeof arg === "string") ? arg : JSON.stringify(arg))
          .join(" ");

        // Add a table row to the note file
        newLines.push(`| ${timestamp.toISOString()} | ${level} | ${logMsg} |`);
      }

      // Read the current content of the note file
      const noteContent = await vault.read(note);

      // Append the new log message to the note file
      const linesToAppend = newLines.join("\n");
      await vault.modify(note, noteContent + linesToAppend);
    });
  },
  1000,
);
