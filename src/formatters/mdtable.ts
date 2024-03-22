import { LogEvent, LogEventsFormatter } from "../types";

export const mdtableFormatter: LogEventsFormatter = {
  id: "mdtable",
  title: "Markdown Table",
  description: "Generates a Markdown file containing a table",
  fileExt: "md",
  contentHead: [
    "| Timestamp | Originator | Level | Message |",
    "| --------- | ---------- | ----- | ------- |",
  ].join("\n"),

  format: ({ timestamp, level, sender, args }) => {
    // Format the log message
    const logMsg = args
      .map((arg) => (typeof arg === "string") ? arg : JSON.stringify(arg))
      .map(escapeForMdTable)
      .join(" ");

    return [
      "",
      timestamp.toISOString(),
      escapeForMdTable(sender ?? ""),
      level,
      logMsg,
      "",
    ]
      .join(" | ")
      .trim();
  },
};

const escapeForMdTable = (str: string) => str.replace(/([\|\[<])/sg, "\\$1");
