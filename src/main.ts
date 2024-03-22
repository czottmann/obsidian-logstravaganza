import { debounce, Notice, Plugin, TFile } from "obsidian";
import { ConsoleProxy } from "./console-proxy";
import { NoteLogger } from "./note-logger";
import { PLUGIN_INFO } from "./plugin-info";
import { prefixMsg } from "./string-helpers";
import { LogEvent, LogEventsPrinter } from "./types";
// import { createLogEventsQueue } from "./queue";

export default class LoggingNote extends Plugin {
  private queue: LogEvent[];
  private proxy: ConsoleProxy;
  private printer: LogEventsPrinter;

  onload() {
    // this.logger = new NoteLogger(this.app);
    // this.logger.log("_tableheader", name);

    this.queue = this.createQueue(() => this.writeToFile());
    this.proxy = new ConsoleProxy(this.queue).setup();
    this.proxy.storeEvent(
      "info",
      "plugin:logstravaganza",
      prefixMsg(`Proxy set up (v${PLUGIN_INFO.pluginVersion})`),
    );

    new Notice("Logstravaganza is enabled!");
  }

  onunload() {
    this.proxy.teardown();
    new Notice("Logstravaganza is disabled");
  }

  /**
   * This function writes the log event to the file. It is called by the queue
   * when new log events have been intercepted.
   */
  private async writeToFile() {
    const formatter = null;
    const filename = "LOGGING-NOTE.ndjson";

    // Retrieve the note file
    const outputFile = await this.getFile(filename);

    let logEvent: LogEvent | undefined;
    while ((logEvent = this.queue.shift())) {
      const newLine = JSON.stringify(logEvent) + "\n";
      await this.app.vault.append(outputFile, newLine);
    }
  }

  /**
   * Retrieves the Obsidian file with the specified path or creates a new one
   * if it doesn't exist yet.
   *
   * @returns A `Promise` that resolves to a `TFile` representing the file.
   */
  private async getFile(filename: string): Promise<TFile> {
    const { vault } = this.app;
    const note = vault.getAbstractFileByPath(filename);
    return (note instanceof TFile) ? note : await vault.create(filename, "");
  }

  /**
   * Creates a queue for storing log events. The queue watches for new elements
   * added via `.push()`, and calls the `onNewElement` function whenever a new
   * element is added. The call is debounced by 1s.
   *
   * @param onNewElement Handler function which to be called on new elements.
   * The function is automatically debounced (1s).
   *
   * @returns `LogEvent[]`
   */
  private createQueue(onNewElement: () => void): LogEvent[] {
    const debouncedOnNewElement = debounce(onNewElement, 1000);
    const queue: LogEvent[] = [];
    const handler: ProxyHandler<LogEvent[]> = {
      get(target, prop) {
        if (prop === "push" || (prop as Symbol).description === "push()") {
          debouncedOnNewElement();
        }
        return (<any> target)[prop];
      },
    };

    return new Proxy(queue, handler);
  }
}
