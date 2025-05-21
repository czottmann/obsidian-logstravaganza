# Release history

## 2.2.0, 2025-05-21

- Adds toggle for disabling file write debouncing.
- Changes min Obsidian version from 1.5.0 to 1.8.0.


## 2.1.1, 2024-08-06

- Fixes "warn" log level outputting all the things. Thanks to [@Erallie](https://github.com/Erallie) for both the heads-up and the fix! [#14](https://github.com/czottmann/obsidian-logstravaganza/issues/14)
- Changes min Obsidian version from 1.4.0 to 1.5.0.


## 2.1.0, 2024-05-07

- Adds new output formatter, Markdown Code Blocks, which outputs log entries as
  code blocks in a Markdown file. This is useful for log files that are meant to
  be read by humans, not machines. Contribution by [@fyears](https://github.com/fyears)
  ([PR#11](https://github.com/czottmann/obsidian-logstravaganza/pull/11)), thanks!
- Adds new setting to specify the log level. Another fine contribution by
  [@fyears](https://github.com/fyears), ([PR#12](https://github.com/czottmann/obsidian-logstravaganza/pull/12))


## 2.0.1, 2024-03-25

- Adds countermeasures against "max call stack size exceeded" errors caused
  by several internal Obsidian objects (app, vault, workspace, (abstract) files,
  folders)


## 2.0.0, 2024-03-25

This update brings a full rewrite of the plugin: Not only is it more performant
and reliable now, but it comes with support for different output formats.
In addition to the tried-and-true Markdown table file, there's now the option
to log to an [NDJSON file](https://github.com/ndjson/ndjson-spec). See the README
for examples on how to work with NDJSON files.

- Adds support for additional output formats, adds NDJSON format
- Adds support for setting the output folder for log files
- Adds toggle to date-stamp output files
- New settings tab
- Logs unhandled exceptions in main thread `Promise`s now (not in workers)
- Changes output base file name


## 1.2.0, 2023-07-23

- Fixes missing line breaks between some table rows (#6)
- Adds device name (taken from Sync core plugin) to log note title (#7)
- Adds the original sender of a log message to the log note


## 1.1.1, 2023-06-07

- Refactored everything as part of Community Plugins code review. Got good input
  there!


## 0.1.0, 2023-05-09

- Initial pre-1.0 release. Let's get this show on the road! 🚀
