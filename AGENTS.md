# Repository guide

## Product

Logstravaganza is an Obsidian community plugin, not a standalone app. It records console calls, window errors, and unhandled promise rejections after the plugin loads. The plugin writes events to a file in the user's vault. It forwards intercepted console calls to the original console.

The output file uses the name `console-log.<device-name>[.<YYYY-MM-DD>].<extension>` in the selected vault folder. The device name comes from Obsidian's internal Sync plugin. Without that plugin, the name is `Unknown device`. The default output is a Markdown table in the vault root. Users can select NDJSON or Markdown code blocks, a folder, a minimum log level, a date suffix, and write debouncing.

Console arguments can contain private data. Preserve the existing local-only logging behavior. Do not add network transmission or broaden captured data without an explicit request.

## Code map

- `src/main.ts`: Plugin lifecycle, default settings, output paths, queue draining, log-level filtering, and vault writes.
- `src/console-proxy.ts`: Global `window.console` proxy, original console forwarding, uncaught error listeners, sender detection, and argument conversion.
- `src/utils.ts`: Queue with optional one-second debounce, device name, file creation, Obsidian URI, and log-level filtering.
- `src/settings.ts`: Settings tab and saved setting changes.
- `src/formatters.ts` and `src/formatters/`: Formatter registry and output implementations (`mdtable`, `ndjson`, `mdcodeblocks`).
- `src/types.d.ts`: Settings, event, and formatter types.
- `src/plugin-info.ts` and `src/plugin-info.json`: Release version metadata.
- `manifest.json` and `versions.json`: Obsidian plugin metadata and minimum supported versions.
- `esbuild.config.mjs`: Bundles `src/main.ts` into `main.js`.

## Development

- Use Node.js 22 and the pnpm version pinned in `package.json`. Run `corepack enable`, then `pnpm install --frozen-lockfile`.
- Run `pnpm lint` to check TypeScript against the Obsidian ESLint preset.
- Run `pnpm build` to type-check and make a minified production bundle.
- If you need the watch build, run `pnpm dev`. On the maintainer's machine, the watch build also runs a local vault sync command after builds.
- The build generates `main.js`, which Git ignores. Edit the TypeScript source, not the bundle.
- The repository has no automated test script. After behavior changes, use `pnpm lint`, `pnpm build`, and check the plugin in an Obsidian vault. If relevant, verify console forwarding, file creation, the output format, level filtering, and unload behavior.

## Change boundaries

- Treat `window.console` interception and global error listeners as application-wide behavior. Keep the original console call intact. Avoid logging through the proxied console during event storage or vault writes: recursive logging can result.
- Keep file writes in the Obsidian vault API and respect layout readiness. The queue batches writes by default. Plugin load sets the queue's debounce choice. Saving settings does not rebuild the queue.
- If you add or change a formatter, update its implementation, `src/formatters.ts`, and the format documentation. Keep the formatter ID stable for saved settings.
- If you change the output filename or settings schema, check compatibility with vault files and saved settings first.
- Do not run `bin/tag-release.fish` or `bin/tag-patch-release.fish` for routine work. These scripts update version metadata, commit, tag, and push. GitHub Actions checks pull requests and `main`. The tag workflow builds and attaches `main.js` and `manifest.json` to a draft release.
