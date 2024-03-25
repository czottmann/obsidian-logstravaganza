# Logstravaganza

This is a plugin for [Obsidian](https://obsidian.md) that logs all console output and uncaught exceptions to a note in a vault.  **It's mainly aimed at developers.**

As such, it's also useful for letting your plugin's users help you debug your plugin's issues: Ask your customers to install this plugin, then send you the resulting log when they report a bug.


## What it does

- Intercepts and writes all `console.*()` output to a file in your vault.
- Logs uncaught exceptions to the same file, including exceptions occurring in async code and promises (as long as they're happening in the main thread).
- Logs can be written in several formats:
    - [NDJSON](https://github.com/ndjson/ndjson-spec), a plain text format that can be read by humans and machines alike. Every line in the file is a JSON object. Think CSV, but with JSON.
    - Markdown file containing a table.


## Example output

The log output will be written to a `console-log.DEVICE-NAME.*` or, optionally, `console-log.DEVICE-NAME.2024-01-31.*` . (Here, `DEVICE-NAME` is a placeholder for the actual device name as returned by the core Sync plugin. This works whether or not Sync is activated or not.)


### Using the built-in NDJSON formatter

Output file name: `console-log.DEVICE-NAME.ndjson`

```plaintext
{"timestamp":"2024-03-24T16:18:04.256Z","level":"info","sender":"plugin:logstravaganza","args":["[Logstravaganza] Proxy set up (v2.0.0)"]}
{"timestamp":"2024-03-24T16:18:04.419Z","level":"log","sender":"plugin:actions-uri:12152:11","args":[["[Actions URI]","Registered URI handlers:",["actions-uri","actions-uri/command","actions-uri/command/list","actions-uri/command/execute","actions-uri/dataview","actions-uri/dataview/table-query","actions-uri/dataview/list-query","actions-uri/file","actions-uri/file/list","actions-uri/file/get-active","actions-uri/file/open","actions-uri/file/delete","actions-uri/file/trash","actions-uri/file/rename","actions-uri/folder","actions-uri/folder/list","actions-uri/folder/create","actions-uri/folder/rename","actions-uri/folder/delete","actions-uri/folder/trash","actions-uri/info","actions-uri/note-properties","actions-uri/note-properties/get","actions-uri/note-properties/set","actions-uri/note-properties/clear","actions-uri/note-properties/remove-keys","actions-uri/note","actions-uri/note/list","actions-uri/note/get","actions-uri/note/get-first-named","actions-uri/note/get-active","actions-uri/note/open","actions-uri/note/create","actions-uri/note/append","actions-uri/note/prepend","actions-uri/note/touch","actions-uri/note/delete","actions-uri/note/trash","actions-uri/note/rename","actions-uri/note/search-string-and-replace","actions-uri/note/search-regex-and-replace","actions-uri/omnisearch","actions-uri/omnisearch/all-notes","actions-uri/omnisearch/open","actions-uri/daily-note","actions-uri/daily-note/list","actions-uri/daily-note/get-current","actions-uri/daily-note/get-most-recent","actions-uri/daily-note/open-current","actions-uri/daily-note/open-most-recent","actions-uri/daily-note/create","actions-uri/daily-note/append","actions-uri/daily-note/prepend","actions-uri/daily-note/search-string-and-replace","actions-uri/daily-note/search-regex-and-replace","actions-uri/weekly-note","actions-uri/weekly-note/list","actions-uri/weekly-note/get-current","actions-uri/weekly-note/get-most-recent","actions-uri/weekly-note/open-current","actions-uri/weekly-note/open-most-recent","actions-uri/weekly-note/create","actions-uri/weekly-note/append","actions-uri/weekly-note/prepend","actions-uri/weekly-note/search-string-and-replace","actions-uri/weekly-note/search-regex-and-replace","actions-uri/monthly-note","actions-uri/monthly-note/list","actions-uri/monthly-note/get-current","actions-uri/monthly-note/get-most-recent","actions-uri/monthly-note/open-current","actions-uri/monthly-note/open-most-recent","actions-uri/monthly-note/create","actions-uri/monthly-note/append","actions-uri/monthly-note/prepend","actions-uri/monthly-note/search-string-and-replace","actions-uri/monthly-note/search-regex-and-replace","actions-uri/quarterly-note","actions-uri/quarterly-note/list","actions-uri/quarterly-note/get-current","actions-uri/quarterly-note/get-most-recent","actions-uri/quarterly-note/open-current","actions-uri/quarterly-note/open-most-recent","actions-uri/quarterly-note/create","actions-uri/quarterly-note/append","actions-uri/quarterly-note/prepend","actions-uri/quarterly-note/search-string-and-replace","actions-uri/quarterly-note/search-regex-and-replace","actions-uri/yearly-note","actions-uri/yearly-note/list","actions-uri/yearly-note/get-current","actions-uri/yearly-note/get-most-recent","actions-uri/yearly-note/open-current","actions-uri/yearly-note/open-most-recent","actions-uri/yearly-note/create","actions-uri/yearly-note/append","actions-uri/yearly-note/prepend","actions-uri/yearly-note/search-string-and-replace","actions-uri/yearly-note/search-regex-and-replace","actions-uri/search","actions-uri/search/all-notes","actions-uri/search/open","actions-uri/tags","actions-uri/tags/list","actions-uri/vault","actions-uri/vault/open","actions-uri/vault/close","actions-uri/vault/info","actions-uri/vault/list-all-files","actions-uri/vault/list-non-notes-files"]]]}
{"timestamp":"2024-03-24T16:18:04.530Z","level":"time","sender":"plugin:omnisearch:50:7444","args":[["Omnisearch - Indexing total time"]]}
{"timestamp":"2024-03-24T16:18:04.530Z","level":"log","sender":"plugin:omnisearch:50:7571","args":[["Omnisearch - 66 files total"]]}
```

Obsidian won't open `.ndjson` files, even though they're basically plain text files.

In NDJSON, every line is a self-contained JSON object.  This makes it easy to read and parse with tools like `jq`. For example, the file can be filtered with `jq`:

```bash
jq -r 'select(.level == "error")' < "console-log.DEVICE-NAME.ndjson"
```

This will only show the lines where the `level` is `error`. You can also stream the output of the plugin to a file and then use `jq` to filter it in real-time.

```bash
tail -f "console-log.DEVICE-NAME.ndjson" | jq -r 'select(.level == "error")'
```


### Using the built-in Markdown Table formatter

Output file name: `console-log.DEVICE-NAME.md`

```plaintext
| Timestamp | Originator | Level | Message |
| --------- | ---------- | ----- | ------- |
| 2024-03-23T17:25:42.973Z | plugin:logstravaganza | info | \[Logstravaganza] Proxy set up (v1.3.0) |
| 2024-03-23T17:25:43.109Z | plugin:actions-uri:12152:11 | log | \["\[Actions URI]","Registered URI handlers:",\["actions-uri","actions-uri/command","actions-uri/command/list","actions-uri/command/execute","actions-uri/dataview","actions-uri/dataview/table-query","actions-uri/dataview/list-query","actions-uri/file","actions-uri/file/list","actions-uri/file/get-active","actions-uri/file/open","actions-uri/file/delete","actions-uri/file/trash","actions-uri/file/rename","actions-uri/folder","actions-uri/folder/list","actions-uri/folder/create","actions-uri/folder/rename","actions-uri/folder/delete","actions-uri/folder/trash","actions-uri/info","actions-uri/note-properties","actions-uri/note-properties/get","actions-uri/note-properties/set","actions-uri/note-properties/clear","actions-uri/note-properties/remove-keys","actions-uri/note","actions-uri/note/list","actions-uri/note/get","actions-uri/note/get-first-named","actions-uri/note/get-active","actions-uri/note/open","actions-uri/note/create","actions-uri/note/append","actions-uri/note/prepend","actions-uri/note/touch","actions-uri/note/delete","actions-uri/note/trash","actions-uri/note/rename","actions-uri/note/search-string-and-replace","actions-uri/note/search-regex-and-replace","actions-uri/omnisearch","actions-uri/omnisearch/all-notes","actions-uri/omnisearch/open","actions-uri/daily-note","actions-uri/daily-note/list","actions-uri/daily-note/get-current","actions-uri/daily-note/get-most-recent","actions-uri/daily-note/open-current","actions-uri/daily-note/open-most-recent","actions-uri/daily-note/create","actions-uri/daily-note/append","actions-uri/daily-note/prepend","actions-uri/daily-note/search-string-and-replace","actions-uri/daily-note/search-regex-and-replace","actions-uri/weekly-note","actions-uri/weekly-note/list","actions-uri/weekly-note/get-current","actions-uri/weekly-note/get-most-recent","actions-uri/weekly-note/open-current","actions-uri/weekly-note/open-most-recent","actions-uri/weekly-note/create","actions-uri/weekly-note/append","actions-uri/weekly-note/prepend","actions-uri/weekly-note/search-string-and-replace","actions-uri/weekly-note/search-regex-and-replace","actions-uri/monthly-note","actions-uri/monthly-note/list","actions-uri/monthly-note/get-current","actions-uri/monthly-note/get-most-recent","actions-uri/monthly-note/open-current","actions-uri/monthly-note/open-most-recent","actions-uri/monthly-note/create","actions-uri/monthly-note/append","actions-uri/monthly-note/prepend","actions-uri/monthly-note/search-string-and-replace","actions-uri/monthly-note/search-regex-and-replace","actions-uri/quarterly-note","actions-uri/quarterly-note/list","actions-uri/quarterly-note/get-current","actions-uri/quarterly-note/get-most-recent","actions-uri/quarterly-note/open-current","actions-uri/quarterly-note/open-most-recent","actions-uri/quarterly-note/create","actions-uri/quarterly-note/append","actions-uri/quarterly-note/prepend","actions-uri/quarterly-note/search-string-and-replace","actions-uri/quarterly-note/search-regex-and-replace","actions-uri/yearly-note","actions-uri/yearly-note/list","actions-uri/yearly-note/get-current","actions-uri/yearly-note/get-most-recent","actions-uri/yearly-note/open-current","actions-uri/yearly-note/open-most-recent","actions-uri/yearly-note/create","actions-uri/yearly-note/append","actions-uri/yearly-note/prepend","actions-uri/yearly-note/search-string-and-replace","actions-uri/yearly-note/search-regex-and-replace","actions-uri/search","actions-uri/search/all-notes","actions-uri/search/open","actions-uri/tags","actions-uri/tags/list","actions-uri/vault","actions-uri/vault/open","actions-uri/vault/close","actions-uri/vault/info","actions-uri/vault/list-all-files","actions-uri/vault/list-non-notes-files"]] |
| 2024-03-23T17:25:43.168Z | plugin:omnisearch:50:7444 | time | \["Omnisearch - Indexing total time"] |
| 2024-03-23T17:25:43.168Z | plugin:omnisearch:50:7571 | log | \["Omnisearch - 66 files total"] |
```

In reading mode, the output will be displayed as a table.


## Caveats

Naturally, the plugin can't know about past console output.  It can only log what happens after when it's activated/enabled.

**Please note:** When this plugin is active and proxying `console` calls, all output to the actual console will appear as coming from `plugin:logstravaganza`.

 For discussions, please visit the [Plugin Forum](https://forum.actions.work/c/logstravaganza-obsidian-plugin/8) ("Log in with GitHub" is enabled).


## Bug Reports & Discussions

Bug reports and feature requests are welcome, feel free to [open an issue](https://github.com/czottmann/obsidian-logstravaganza/issues) here on GitHub — thank you!

I've moved all plugin **discussions** to the ActionsDotWork Forum which is a hub for both my Obsidian plugins and the macOS/iOS productivity apps I'm building: [Carlo's Obsidian Plugins - ActionsDotWork Forum](https://forum.actions.work/c/obsidian-plugins/8).

The forum supports single-sign-on via GitHub, Apple and Google, meaning you can log in with your GitHub account.


## Installation

1. Search for "Logstravaganza" in Obsidian's community plugins browser. ([This link should bring it up.](https://obsidian.md/plugins?id=zottmann))
2. Install it.
3. Enable the plugin in your Obsidian settings under "Community plugins".

That's it.


### Installation via <abbr title="Beta Reviewers Auto-update Tester">BRAT</abbr> (for pre-releases or betas)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Add "Logstravaganza" to BRAT:
    1. Open "Obsidian42 - BRAT" via Settings → Community Plugins
    2. Click "Add Beta plugin"
    3. Use the repository address `czottmann/obsidian-logstravaganza`
3. Enable "Logstravaganza" under Settings → Options → Community Plugins


## Development

Clone the repository, run `pnpm install` OR `npm install` to install the dependencies.  Afterwards, run `pnpm dev` OR `npm run dev` to compile and have it watch for file changes.


## Author

Carlo Zottmann, <carlo@zottmann.dev>, https://c.zottmann.dev/

My Obsidian plugins: https://obsidian.md/plugins?search=zottmann

### Logstravaganza is brought to you by …

[**Actions for Obsidian**](https://actions-for-obsidian.com?ref=github), a macOS/iOS app also made by me! AFO is the missing link between Obsidian and macOS / iOS: 50+ Shortcuts actions to bring your notes and your automations together. [Take a look!](https://actions.work/actions-for-obsidian?ref=github)


## Disclaimer

Use at your own risk.  Things might go sideways, hard.  I'm not responsible for any data loss or damage.  You have been warned.

Always back up your data.  Seriously.


## License

MIT, see [LICENSE.md](LICENSE.md).
