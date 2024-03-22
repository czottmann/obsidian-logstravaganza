import { Notice, Plugin } from "obsidian";
import { ConsoleProxy } from "./console-proxy";
import { findFormatterByID } from "./formatters";
import { PLUGIN_INFO } from "./plugin-info";
import { LogstravaganzaSettingTab } from "./settings";
import { LogEvent, LogstravaganzaSettings } from "./types";
import { createQueue, getDeviceName, getFile, prefixMsg } from "./utils";

const DEFAULT_SETTINGS: LogstravaganzaSettings = {
  formatterID: "mdtable",
};

export default class Logstravaganza extends Plugin {
  private queue: LogEvent[];
  private proxy: ConsoleProxy;
  private deviceName: string = getDeviceName(this.app);

  settings: LogstravaganzaSettings;
  outputFileBasename: string = `LOGGING-NOTE (${this.deviceName})`;

  async onload() {
    await this.loadSettings();

    this.queue = createQueue(this.writeToFile.bind(this));
    this.proxy = new ConsoleProxy(this.queue).setup();
    this.proxy.storeEvent(
      "info",
      "plugin:logstravaganza",
      prefixMsg(`Proxy set up (v${PLUGIN_INFO.pluginVersion})`),
    );
    this.addSettingTab(new LogstravaganzaSettingTab(this.app, this));

    new Notice("Logstravaganza is enabled!");
  }

  onunload() {
    this.proxy.teardown();
    new Notice("Logstravaganza is disabled");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  getOutputFilename(ext: string) {
    return `${this.outputFileBasename}.${ext}`;
  }

  /**
   * This function writes the log event to the file. It is called by the queue
   * when new log events have been intercepted.
   */
  private async writeToFile() {
    const { vault, workspace } = this.app;

    // Processing file before the layout is ready are usually not a good idea,
    // so we'll make sure Obsidian is ready before doing anything.
    workspace.onLayoutReady(async () => {
      const formatter = findFormatterByID(this.settings.formatterID)!;
      const filename = this.getOutputFilename(formatter.fileExt);

      // Retrieve the note file
      const file = await getFile(vault, filename, formatter.contentHead);

      // Write the log events to the file
      let logEvent: LogEvent | undefined;
      while ((logEvent = this.queue.shift())) {
        let line = formatter.format(logEvent) + "\n";
        await vault.append(file, line);
      }
    });
  }
}
