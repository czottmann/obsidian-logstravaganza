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
  "debug": "🔎",
  "error": "❗️",
  "fatal": "❌",
  "info": "ℹ️",
  "log": "🗒️",
  "warn": "🟧",
};

type LogEvent = {
  timestamp: Date;
  level: string;
  args: any[];
};
const LOG_EVENTS: LogEvent[] = [];

export default class LoggingNote extends Plugin {
  onload() {
    this.app.workspace.onLayoutReady(() => installProxies());
  }

  onunload() {
    removeProxies();
  }
}

function addToLogEvents(level: string, ...args: any[]) {
  const timestamp = new Date();
  LOG_EVENTS.push({ timestamp, level, args });
  debounceProcessLogEvents();
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
      addToLogEvents(level, ...args);
      CONSOLE_ORIGINALS[level](...args);
    };
  });

  addToLogEvents(
    "info",
    `[${PLUGIN_LOGGING_PREFIX}] ----- Plugin loaded -----`,
  );
  addToLogEvents("info", `[${PLUGIN_LOGGING_PREFIX}] Proxies installed`);
}

function removeProxies() {
  Object.keys(CONSOLE_ORIGINALS).forEach((level) => {
    (<any> window.console)[level] = CONSOLE_ORIGINALS[level];
  });
  window.removeEventListener("error", onWindowError);
  console.info(`[${PLUGIN_LOGGING_PREFIX}] Proxies removed`);
}

function onWindowError(event: ErrorEvent) {
  const { message, colno, lineno, filename } = event;
  addToLogEvents("fatal", `${message} (${filename}:${lineno}:${colno})`);
}

function debounce(func: Function, delayInMs: number) {
  let timeoutId: any;

  return function (...args: any[]) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delayInMs);
  };
}

async function processLogEvents() {
  const { vault } = window.app;
  const note = await getNoteFile();

  let logEvent: LogEvent | undefined;
  while (logEvent = LOG_EVENTS.shift()) {
    const { timestamp, level, args } = logEvent;
    const noteContent = await vault.read(note);

    const logMsg = args
      .map((arg) => typeof arg === "string" ? arg : JSON.stringify(arg))
      .join(" ");
    const prefix = SEVERITY_EMOJI[level];
    const newLine =
      `${timestamp.toISOString()} ${prefix} [${level.toUpperCase()}] ${logMsg}`;

    await vault.modify(note, `${noteContent}${newLine}\n`);
  }
}

const debounceProcessLogEvents = debounce(processLogEvents, 1000);
