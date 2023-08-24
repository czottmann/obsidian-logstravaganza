# Logstravaganza
**Adventures in Console Land**

This plugin copies all console output and uncaught exceptions to a note in your vault.  It's mainly aimed at developers, and makes debugging of mobile plugins easier (YMMV). You could ask your customers to install this plugin and send you the log note when they report a bug.

It will start logging as soon as it initializes.  The log note `LOGGING-NOTE (device name).md` will be created in the root of your vault.  (Note: `device name` is a placeholder, and will be replaced with the actual device name as returned by the Sync core plugin. This works whether or not Sync is activated or not.)  Due to the way Obsidian works, the plugin can't know about past log messages, i.e. `console` output that occurred before the plugin was initialized.

**Please note:** When this plugin is active and proxying `console` calls, all output to the actual console will appear as coming from `plugin:logstravaganza`.

Bug reports and feature requests are welcome, feel free to [open an issue](https://github.com/czottmann/obsidian-logstravaganza/issues) here on GitHub. For discussions, please visit the [Plugin Forum](https://forum.actions.work/c/logstravaganza-obsidian-plugin/8) ("Log in with GitHub" is enabled).

## Example output

```
| Timestamp | Originator | Level | Message |
| --------- | ---------- | ----- | ------- |
| 2023-05-10T17:37:46.457Z | plugin:logstravaganza | INFO | [Logstravaganza] Proxy set up (v1.1.1) |
| 2023-05-10T17:37:46.632Z | plugin:actions-uri:10201:11 | LOG | Registered URI handlers: ["actions-uri","actions-uri/dataview","actions-uri/dataview/table-query", ……… |
| 2023-05-10T17:37:46.632Z | plugin:omnisearch:45:7203 | TIME | Omnisearch - Indexing total time |
| 2023-05-10T17:37:46.632Z | plugin:omnisearch:45:7325 | LOG | Omnisearch - 42 files total |
| 2023-05-10T17:37:46.632Z | plugin:omnisearch:45:7377 | LOG | Omnisearch - Omnisearch - Cache is enabled |
| 2023-05-10T17:37:46.696Z | plugin:dataview:12571:17 | LOG | Dataview: all 42 files have been indexed in 0.065s (40 cached, 0 skipped). |
| 2023-05-10T17:38:24.580Z | app.js:1:1973721 | LOG | Received URL action {"if-exists":"skip","x-error":"actions-for-obsidian://x-callback-url/response? ……… |
| 2023-05-10T17:38:24.608Z | plugin:actions-uri:10201:11 | LOG | Call handled: {"params":{"action":"actions-uri/note/create","vault":"Testbed","debug-mode":false, ……… |
```

In reading mode, the output will be displayed as a table.


## Bug Reports & Discussions

For bug reports please use this repo's Issues section — thank you!

I've moved all plugin **discussions** to the ActionsDotWork Forum which is a hub for both my Obsidian plugins and the macOS/iOS productivity apps I'm building: [Carlo's Obsidian Plugins - ActionsDotWork Forum](https://forum.actions.work/c/obsidian-plugins/8).

The forum supports single-sign-on via GitHub, Apple and Google, meaning you can log in with your GitHub account.


## Installation

1. Search for "Logstravaganza" in Obsidian's community plugins browser. ([This link should bring it up.](https://obsidian.md/plugins?id=zottmann))
2. Install it.
3. Enable the plugin in your Obsidian settings under "Community plugins".

That's it.


## Installation via <abbr title="Beta Reviewers Auto-update Tester">BRAT</abbr> (for pre-releases or betas)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Add "Logstravaganza" to BRAT:
    1. Open "Obsidian42 - BRAT" via Settings → Community Plugins
    2. Click "Add Beta plugin"
    3. Use the repository address `czottmann/obsidian-logstravaganza`
3. Enable "Logstravaganza" under Settings → Options → Community Plugins


## Development

Clone the repository, run `pnpm install` OR `npm install` to install the dependencies.  Afterwards, run `pnpm dev` OR `npm run dev` to compile and have it watch for file changes.


## Author

Carlo Zottmann, <carlo@zottmann.co>, https://zottmann.co/, https://github.com/czottmann


## Disclaimer

Use at your own risk.  Things might go sideways, hard.  I'm not responsible for any data loss or damage.  You have been warned.

Always back up your data.  Seriously.


## License

MIT, see [LICENSE.md](LICENSE.md).
