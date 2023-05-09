import { Plugin, TFile } from "obsidian";

const PLUGIN_LOGGING_PREFIX = "logging-note";
const CONSOLE_ORIGINALS: { [key: string]: Function } = {
  "debug": console.debug,
  "error": console.error,
  "info": console.info,
  "log": console.log,
  "warn": console.warn,
};
const SEVERITY_EMOJI: { [key: string]: string } = {
  "debug": "🟫",
  "error": "🟥",
  "fatal": "❌",
  "info": "🟦",
  "log": "⬜️",
  "warn": "🟧",
};

export default class LoggingNote extends Plugin {
  onload() {
    this.app.workspace.onLayoutReady(() => {
      installProxies();
      setTimeout(() => {
        Object.keys(CONSOLE_ORIGINALS).forEach((level) => {
          window.console[level](`[${PLUGIN_LOGGING_PREFIX}] ${level} test`);
        });
        hurray();
      }, 2000);
    });
  }

  onunload() {
    removeProxies();
  }
}

async function getNoteFile() {
  const { vault } = window.app;
  const note = vault.getAbstractFileByPath("LOGGING-NOTE.md");
  return (note instanceof TFile)
    ? note
    : await vault.create("LOGGING-NOTE.md", "");
}

function installProxies() {
  window.addEventListener("error", onWindowError);
  Object.keys(CONSOLE_ORIGINALS).forEach((level) => {
    const console = <any> window.console;
    console[level] = (...args: any[]) => {
      appendToNote(level, ...args);
      CONSOLE_ORIGINALS[level](...args);
    };
  });

  CONSOLE_ORIGINALS.log(`[${PLUGIN_LOGGING_PREFIX}] Proxies installed`);
}

function removeProxies() {
  Object.keys(CONSOLE_ORIGINALS).forEach((level) => {
    (<any> window.console)[level] = CONSOLE_ORIGINALS[level];
  });
  window.removeEventListener("error", onWindowError);
  console.log(`[${PLUGIN_LOGGING_PREFIX}] Proxies removed`);
}

async function onWindowError(event: ErrorEvent) {
  const { message, colno, lineno, filename } = event;
  await appendToNote("fatal", `${message} (${filename}:${lineno}:${colno})`);
}

async function appendToNote(level: string, ...args: any[]) {
  const { vault } = window.app;
  const note = await getNoteFile();
  const noteContent = await vault.read(note);
  const timestamp = new Date().toISOString();
  const logMsg = args
    .map((arg) => typeof arg === "string" ? arg : JSON.stringify(arg))
    .join(" ");
  const prefix = SEVERITY_EMOJI[level];
  const newLine = `${timestamp} ${prefix} [${level.toUpperCase()}] ${logMsg}`;

  await vault.modify(note, `${noteContent}${newLine}\n`);
}
