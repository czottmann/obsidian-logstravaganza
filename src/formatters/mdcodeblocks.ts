import { LogEventsFormatter } from "../types";

/**
 * A formatter that generates a Markdown file containing code blocks, 
 * where each block represents a log event.
 */
export default <LogEventsFormatter> {
  id: "mdcodeblocks",
  title: "Markdown Code Blocks",
  description: "Generates a Markdown file containing code blocks.",
  fileExt: "md",

  format: ({ timestamp, level, sender, args }) => {
    // Format the log message
    const logMsg = args
      .map((arg) => {
        if (typeof arg === "string") {
          return arg;
        }
        if (Array.isArray(arg) && arg.length <= 1) {
          if (typeof arg[0] === "string") {
            return arg[0];
          }
          return JSON.stringify(arg[0], null, 2);
        }
        return JSON.stringify(arg, null, 2);
      });
    
    return [
      "```",
      `time: ${timestamp.toISOString()}`,
      `from: ${sender ?? ""}`,
      `level: ${level}`,
      logMsg,
      "```",
      "",
    ]
      .join("\n");
  },
};
