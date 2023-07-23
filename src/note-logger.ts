import { App, debounce, TFile } from "obsidian";

type LogEvent = {
  timestamp: Date;
  level: string;
  args: any[];
};

export class NoteLogger {
  private readonly app: App;
  private readonly PLUGIN_LOGGING_PREFIX = "Logstravaganza";
  private readonly OUTPUT_FILENAME = "LOGGING-NOTE.md";
  private logEventsQueue: LogEvent[] = [];

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Adds log events with the specified level and arguments to the log event
   * array. This function triggers the processing function to write the log events
   * to the note file.
   *
   * @param level - The level of the log event.
   * @param args - The arguments to be logged.
   */
  public log(level: string, ...args: any[]): void {
    // Get the current time
    const timestamp = new Date();

    // Create a log event and add it to the list
    this.logEventsQueue.push({ timestamp, level, args });

    // Tell the processing function there's new work but debounce it so it doesn't
    // fall over itself.
    this.processLogEvents();
  }

  /**
   * Prefixes a message with the plugin logging prefix.
   * @param msg - The message to be prefixed.
   * @returns The prefixed message.
   */
  public prefixMsg(msg: string): string {
    return `[${this.PLUGIN_LOGGING_PREFIX}] ${msg}`;
  }

  /**
   * Debounced function that processes log events by appending them to the note
   * file.
   */
  private processLogEvents = debounce(
    () => {
      // Processing file before the layout is ready are usually not a good idea,
      // so we'll make sure Obsidian is ready before doing anything.
      this.app.workspace.onLayoutReady(async () => {
        const { vault } = this.app;

        // Retrieve the note file
        const note = await this.getNoteFile();

        // Array for holding the new lines to be appended to the note file
        const newLines: string[] = [];

        // Process all log events in the queue
        let logEvent: LogEvent | undefined;
        while ((logEvent = this.logEventsQueue.shift())) {
          // Destructure the log event properties
          const { timestamp, level, args } = logEvent;

          if (level === "_tableheader") {
            // Add a table header to the note file
            newLines.push(
              "",
              "",
              "| Timestamp | Originator | Level | Message |",
              "| --------- | ---------- | ----- | ------- |",
            );
            continue;
          }

          // Format the log message
          const logMsg = args
            .map((arg) => (typeof arg === "string") ? arg : JSON.stringify(arg))
            .join(" ");
          let { originator, message } = this.splitOriginatorAndMessage(logMsg);

          // Escape the pipe character so it doesn't break the table
          message = message.replace("|", "\\|");

          // Add a table row to the note file
          newLines.push(
            `| ${timestamp.toISOString()} | ${originator} | ${level} | ${message} |`,
          );
        }

        // Append the new log message to the note file
        await vault.process(note, (currentNoteContent) => {
          return currentNoteContent + newLines.join("\n") + "\n";
        });
      });
    },
    1000,
  );

  // If the log message starts with "[Plugin Name] ", then extract "Plugin Name",
  // store it as the originator, and remove the prefix from the message.
  //
  // This is a convention I use in my plugins to make it easier to filter log
  // messages by plugin: I prefix all log messages with the plugin name in square
  // brackets.
  private splitOriginatorAndMessage(message: string) {
    const regex = /^\[(.*?)\] /;
    const match = message.match(regex);
    let originator = "";
    if (match) {
      originator = match[1];
      message = message.replace(regex, "");
    }

    return { originator, message };
  }

  /**
   * Retrieves the note file with the specified path or creates a new one if it
   * doesn't exist.
   *
   * @returns A `Promise` that resolves to a `TFile` representing the note file.
   */
  private async getNoteFile(): Promise<TFile> {
    const { vault } = this.app;

    // Get the note file by its path
    const note = vault.getAbstractFileByPath(this.OUTPUT_FILENAME);

    // If the note file exists, return it; otherwise, create a new note file
    if (note instanceof TFile) {
      return note;
    } else {
      // Create a new note file with the specified name and empty content
      return await vault.create(this.OUTPUT_FILENAME, "");
    }
  }
}
