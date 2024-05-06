import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import Logstravaganza from "./main";
import { formatters } from "./formatters";
import { getObsidianURI } from "./utils";

export class LogstravaganzaSettingTab extends PluginSettingTab {
  plugin: Logstravaganza;

  constructor(app: App, plugin: Logstravaganza) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl, plugin } = this;

    containerEl.empty();
    containerEl.createEl("h2", { text: "Logstravaganza Settings" });

    // Output format
    new Setting(containerEl)
      .setName("Output format")
      .setDesc(`
        This plugin intercepts developer console messages, and saves them to a
        file in your vault. Select the output file format here.`)
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(this.allFormatters())
          .setValue(plugin.settings.formatterID)
          .onChange(
            async (value) => {
              plugin.settings.formatterID = value;
              await plugin.saveSettings();
              this.display();
            },
          );
      });

    const ul = containerEl.createEl("ul", {
      cls: "setting-item-description",
      attr: { style: "margin-block-start: 0; padding-inline-start: 2em;" },
    });
    formatters.forEach((f) => {
      ul.createEl("li", { attr: { style: "margin-bottom: 0.5rem;" } })
        .innerHTML = `
          <strong>${f.title}</strong>: ${f.description}.<br>
          File extension: <code>.${f.fileExt}</code>
        `;
    });

    // Output folder
    new Setting(containerEl)
      .setName("Output folder")
      .setDesc("Where to save the log files.")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(this.allFolders())
          .setValue(plugin.settings.outputFolder)
          .onChange(
            async (value) => {
              plugin.settings.outputFolder = value;
              await plugin.saveSettings();
              this.display();
            },
          );
      });

    // Include current date in filename
    new Setting(containerEl)
      .setName("Include current date in filename")
      .setDesc("Adds the YYYY-MM-DD timestamp to the output filename.")
      .addToggle((toggle) => {
        toggle
          .setValue(plugin.settings.fileNameContainsDate)
          .onChange(async (value) => {
            plugin.settings.fileNameContainsDate = value;
            await plugin.saveSettings();
            this.display();
          });
      });

    // Log level!
    new Setting(containerEl)
      .setName("Log level to render")
      .setDesc("Only print out the log level equal to or above what you set here.")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("debug", "debug (print everything)")
          .addOption("info", "info")
          .addOption("warn", "warn")
          .addOption("error", "error (only print error)")
          .setValue(plugin.settings.logLevel)
          .onChange(async (value) => {
            plugin.settings.logLevel = value as any;
            await plugin.saveSettings();
            this.display();
          });
      });

    // Display & link output file path
    const fileExt = formatters
      .find((f) => f.id === plugin.settings.formatterID)!
      .fileExt;
    const filename = plugin.getOutputFilename(fileExt);
    const link = getObsidianURI(this.app.vault, filename);
    containerEl.createEl("h5", { text: "Output file" });
    containerEl
      .createEl("p", { text: "→ " })
      .createEl("a", { text: filename, attr: { href: link } });

    // Sponsoring
    const afoURL =
      "https://actions.work/actions-for-obsidian?ref=plugin-logstravaganza";
    containerEl.createEl("div", {
      attr: {
        style: `
          border-radius: 0.5rem;
          border: 1px dashed var(--text-muted);
          color: var(--text-muted);
          display: grid;
          font-size: 85%;
          grid-gap: 1rem;
          grid-template-columns: auto 1fr;
          margin-top: 4rem;
          opacity: 0.75;
          padding: 1rem;
        `,
      },
    })
      .innerHTML = `
        <a href="${afoURL}">
          <img
            src="https://actions.work/img/afo-icon.png"
            style="margin: -0.4rem -0.5rem -0.5rem 0; width: 5rem;"
            alt="Actions for Obsidian icon, a cog wheel on a glossy black background">
        </a>
        <span>
          Logstravaganza is brought to you by
          <a href="${afoURL}"><strong>Actions for Obsidian</strong></a>,
          a macOS/iOS app made by the same developer as this plugin. AFO is the
          missing link between Obsidian and macOS&nbsp;/&nbsp;iOS: 50+ Shortcuts
          actions to bring your notes and your automations together.
          <a href="${afoURL}">Take a look!</a>
        </span>
      `;
  }

  private allFolders(): Record<string, string> {
    return this.app.vault
      .getAllLoadedFiles()
      .filter((f) => f instanceof TFolder)
      .map((f) => ({
        name: `/${f.path}`.replace(/^\/+/, "/"),
        path: f.path,
      }))
      .sort((a, b) => b.name.localeCompare(a.name))
      .reduce(
        (obj: any, f) => ({ [f.path]: f.name, ...obj }),
        {},
      );
  }

  private allFormatters(): Record<string, string> {
    return formatters.reduce(
      (obj: any, f) => ({ [f.id]: f.title, ...obj }),
      {},
    );
  }
}
