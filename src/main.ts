import { Plugin } from "obsidian";
import { ConsoleProxy } from "./console-proxy";
import { NoteLogger } from "./note-logger";
import { PLUGIN_INFO } from "./plugin-info";

export default class LoggingNote extends Plugin {
  private logger: NoteLogger;
  private cProxy: ConsoleProxy;

  onload() {
    const name = "plugin:logstravaganza";
    this.logger = new NoteLogger(this.app);
    this.logger.log("_tableheader", name);
    this.cProxy = new ConsoleProxy({ app: this.app, logger: this.logger });
    this.cProxy.setup();
    this.logger.log(
      "info",
      name,
      this.logger.prefixMsg(`Proxy set up (v${PLUGIN_INFO.pluginVersion})`),
    );
  }

  onunload() {
    this.cProxy.teardown();
  }
}
