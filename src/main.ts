import { Plugin } from "obsidian";
import { addToLogEvents, CONSOLE_ORIGINALS, prepLogMessage } from "./logging";

export default class LoggingNote extends Plugin {
  onload() {
    this.app.workspace.onLayoutReady(() => installProxies());
  }

  onunload() {
    removeProxies();
  }
}

function installProxies() {
  window.addEventListener("error", onWindowError);
  Object.keys(CONSOLE_ORIGINALS).forEach((level) => {
    const console = <any> window.console;
    console[level] = (...args: any[]) => {
      addToLogEvents(level, ...args);
      CONSOLE_ORIGINALS[level](...args);
    };
  });

  addToLogEvents("info", prepLogMessage("----- Plugin loaded -----"));
  addToLogEvents("info", prepLogMessage("Proxies installed"));
}

function removeProxies() {
  Object.keys(CONSOLE_ORIGINALS).forEach((level) => {
    (<any> window.console)[level] = CONSOLE_ORIGINALS[level];
  });
  window.removeEventListener("error", onWindowError);
  console.info(prepLogMessage("Proxies removed"));
}

function onWindowError(event: ErrorEvent) {
  const { message, colno, lineno, filename } = event;
  addToLogEvents("fatal", `${message} (${filename}:${lineno}:${colno})`);
}
