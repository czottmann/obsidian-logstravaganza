import { normalizePath, Notice, Plugin } from "obsidian";
import { ConsoleProxy } from "./console-proxy";
import { findFormatterByID } from "./formatters";
import { PLUGIN_INFO } from "./plugin-info";
import { LogstravaganzaSettingTab } from "./settings";
import { LogEvent, LogstravaganzaSettings } from "./types";
import { createQueue, getDeviceName, getFile, prefixMsg } from "./utils";

const DEFAULT_SETTINGS: LogstravaganzaSettings = {
  fileNameContainsDate: false,
  formatterID: "mdtable",
  outputFolder: "/",
};

export default class Logstravaganza extends Plugin {
  private queue: LogEvent[];
  private proxy: ConsoleProxy;
  private deviceName: string = getDeviceName(this.app);

  settings: LogstravaganzaSettings;
  outputFileBasename: string = `console-log.${this.deviceName}`;

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
    this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  getOutputFilename(ext: string) {
    const currentDate = new Date().toISOString().split("T")[0];
    const filename = this.settings.fileNameContainsDate
      ? `${this.outputFileBasename}.${currentDate}.${ext}`
      : `${this.outputFileBasename}.${ext}`;
    return normalizePath(`${this.settings.outputFolder}/${filename}`);
  }

  /**
   * This function writes the log event to the file. It is called by the queue
   * when new log events have been intercepted.
   */
  private async writeToFile() {
    const { vault, workspace } = this.app;

    // Processing files before the layout is ready is usually not a good idea…
    workspace.onLayoutReady(async () => {
      const formatter = findFormatterByID(this.settings.formatterID)!;
      const filename = this.getOutputFilename(formatter.fileExt);

      // Retrieve the file
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
