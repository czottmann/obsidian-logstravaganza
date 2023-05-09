import { Plugin, TAbstractFile, TFile } from "obsidian";

const ORIGINALS: { [key: string]: Function } = {};
const COLORS: { [key: string]: string } = {
  "log": "⬜️",
  "error": "🟥",
  "info": "🟦",
  "warn": "🟧",
  "debug": "🟫",
};

export default class LoggingNote extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => installProxies());
  }

  async onunload() {
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
  Object.keys(COLORS).forEach((level) => {
    const console = <any> window.console;
    ORIGINALS[level] = console[level];

    console[level] = (...args: any[]) => {
      ORIGINALS[level](...args);
      appendToNote(level, ...args);
    };
  });
  console.log("Proxies installed");
}

function removeProxies() {
  Object.keys(ORIGINALS).forEach((level) => {
    (<any> window.console)[level] = ORIGINALS[level];
  });
  console.log("Proxies removed");
}

async function appendToNote(level: string, ...args: any[]) {
  const { vault } = window.app;
  const note = await getNoteFile();
  const noteContent = await vault.read(note);
  const timestamp = new Date().toISOString();
  const logMsg = args
    .map((arg) => typeof arg === "string" ? arg : JSON.stringify(arg))
    .join(" ");
  const prefix = COLORS[level];
  const newLine =
    `\`\`\`${prefix} ${timestamp} [${level.toUpperCase()}] ${logMsg}\`\`\``;
  await vault.modify(note, `${noteContent}${newLine}\n`);
}
