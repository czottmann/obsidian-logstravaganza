import { debounce, Notice, Plugin, TFile } from "obsidian";
import { ConsoleProxy } from "./console-proxy";
import { findFormatterByID } from "./formatters";
import { PLUGIN_INFO } from "./plugin-info";
import { getDeviceName, prefixMsg } from "./utils";
import { LogEvent, LogEventsFormatter } from "./types";

export default class LoggingNote extends Plugin {
  private queue: LogEvent[];
  private proxy: ConsoleProxy;
  private formatter: LogEventsFormatter;
  private deviceName: string = getDeviceName(this.app);

  onload() {
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
    // TODO: Read Settings/configuration
    const formatterID = "ndjson";

    const formatter = findFormatterByID(formatterID)!;
    const filename = `LOGGING-NOTE (${this.deviceName}).${formatter.fileExt}`;

    // Retrieve the note file
    const outputFile = await this.getFile(filename, formatter.contentHead);

    // Write the log events to the file
    let logEvent: LogEvent | undefined;
    while ((logEvent = this.queue.shift())) {
      await this.app.vault.append(
        outputFile,
        formatter.format(logEvent) + "\n",
      );
    }
  }

  /**
   * Retrieves the Obsidian file with the specified path or creates a new one
   * if it doesn't exist yet.
   *
   * @returns A `Promise` that resolves to a `TFile` representing the file.
   */
  private async getFile(
    filename: string,
    initialContent?: string,
  ): Promise<TFile> {
    const { vault } = this.app;
    const note = vault.getAbstractFileByPath(filename);
    return (note instanceof TFile)
      ? note
      : await vault.create(filename, (initialContent ?? "") + "\n");
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
  private createQueue(onPush: () => void): LogEvent[] {
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
}
