# Log To Note

This plugin copies all console output and uncaught exceptions to a note in your vault.  It's mainly aimed at developers, and makes debugging of mobile plugins easier (YMMV).

It will start logging as soon as it initializes.  The log note `LOGGING-NOTE.md` will be created in the root of your vault.  Due to the way Obsidian works, the plugin can't know about past log messages, i.e. `console` output that occurred before the plugin was initialized.

**Please note:** When this plugin is active and proxying `console` calls, all output to the actual console will appear as coming from `plugin:logging-note`.


## Example output

```
| Timestamp | Level | Message |
| --------- | ----- | ------- |
| 2023-05-10T17:37:46.457Z | INFO | [Log To Note] ----- Plugin loaded ----- |
| 2023-05-10T17:37:46.457Z | INFO | [Log To Note] Proxy set up |
| 2023-05-10T17:37:46.632Z | LOG | [Actions URI] Registered URI handlers: ["actions-uri","actions-uri/dataview","actions-uri/dataview/table-query", ……… |
| 2023-05-10T17:37:46.632Z | TIME | Omnisearch - Indexing total time |
| 2023-05-10T17:37:46.632Z | LOG | Omnisearch - 42 files total |
| 2023-05-10T17:37:46.632Z | LOG | Omnisearch - Cache is disabled |
| 2023-05-10T17:37:46.696Z | LOG | Dataview: all 42 files have been indexed in 0.065s (40 cached, 0 skipped). |
| 2023-05-10T17:37:46.702Z | LOG | Dataview: Dropped cache entries for 1 deleted files. |
| 2023-05-10T17:37:46.713Z | TIMEEND | Omnisearch - Indexing total time |
| 2023-05-10T17:38:24.580Z | LOG | Received URL action {"if-exists":"skip","x-error":"actions-for-obsidian://x-callback-url/response? ……… |
| 2023-05-10T17:38:24.608Z | LOG | [Actions URI] Call handled: {"params":{"action":"actions-uri/note/create","vault":"Testbed","debug-mode":false, ……… |
```

In reading mode, the output will be displayed as a table.


## Installation

1. Search for "Log To Note" in Obsidian's community plugins browser. ([This link should bring it up.](https://obsidian.md/plugins?id=zottmann))
2. Install it.
3. Enable the plugin in your Obsidian settings under "Community plugins".

That's it.


## Installation via <abbr title="Beta Reviewers Auto-update Tester">BRAT</abbr> (for pre-releases or betas)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Add "Log To Note" to BRAT:
    1. Open "Obsidian42 - BRAT" via Settings → Community Plugins
    2. Click "Add Beta plugin"
    3. Use the repository address `czottmann/obsidian-log-to-note`
3. Enable "Log To Note" under Settings → Options → Community Plugins


## Development

Clone the repository, run `pnpm install` OR `npm install` to install the dependencies.  Afterwards, run `pnpm dev` OR `npm run dev` to compile and have it watch for file changes.


## Author

Carlo Zottmann, <carlo@zottmann.co>, https://zottmann.co/, https://github.com/czottmann


## Disclaimer

Use at your own risk.  Things might go sideways, hard.  I'm not responsible for any data loss or damage.  You have been warned.

Always back up your data.  Seriously.


## License

MIT, see [LICENSE.md](LICENSE.md).
