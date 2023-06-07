import { Plugin } from "obsidian";
import { ConsoleProxy } from "./console-proxy";
import { NoteLogger } from "./note-logger";

export default class LoggingNote extends Plugin {
  private logger: NoteLogger;
  private cProxy: ConsoleProxy;

  onload() {
    this.logger = new NoteLogger(this.app);
    this.logger.log("_tableheader");
    this.cProxy = new ConsoleProxy({ app: this.app, logger: this.logger });
    this.cProxy.setup();
    this.logger.log("info", this.logger.prefixMsg("Proxy set up"));
  }

  onunload() {
    this.cProxy.teardown();
  }
}
