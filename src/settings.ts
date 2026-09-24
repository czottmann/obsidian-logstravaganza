import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import Logstravaganza from "./main";
import { formatters } from "./formatters";
import type { LogLevel } from "./types";
import { getObsidianURI } from "./utils";

type SettingDefinition = {
  name: string;
  desc?: string;
  render: (setting: Setting) => void;
};

export class LogstravaganzaSettingTab extends PluginSettingTab {
  plugin: Logstravaganza;

  constructor(app: App, plugin: Logstravaganza) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinition[] {
    const { plugin } = this;

    return [
      {
        name: "Output format",
        desc: "This plugin intercepts developer console messages and saves them to a file in your vault. Select the output file format here.",
        render: (setting) => {
          setting.addDropdown((dropdown) => {
            dropdown
              .addOptions(this.allFormatters())
              .setValue(plugin.settings.formatterID)
              .onChange(async (value) => {
                plugin.settings.formatterID = value;
                await plugin.saveSettings();
                this.refreshSettings();
              });
          });

          const ul = setting.descEl.createEl("ul", {
            cls: "setting-item-description",
            attr: { style: "margin-block-start: 0; padding-inline-start: 2em;" },
          });
          formatters.forEach((f) => {
            const item = ul.createEl("li", {
              attr: { style: "margin-bottom: 0.5rem;" },
            });
            item.createEl("strong", { text: f.title });
            item.appendText(`: ${f.description ?? ""}.`);
            item.createEl("br");
            item.appendText("File extension: ");
            item.createEl("code", { text: `.${f.fileExt}` });
          });
        },
      },
      {
        name: "Output folder",
        desc: "Where to save the log files.",
        render: (setting) => {
          setting.addDropdown((dropdown) => {
            dropdown
              .addOptions(this.allFolders())
              .setValue(plugin.settings.outputFolder)
              .onChange(async (value) => {
                plugin.settings.outputFolder = value;
                await plugin.saveSettings();
                this.refreshSettings();
              });
          });
        },
      },
      {
        name: "Include current date in filename",
        desc: "Adds the current date to the output filename.",
        render: (setting) => {
          setting.addToggle((toggle) => {
            toggle
              .setValue(plugin.settings.fileNameContainsDate)
              .onChange(async (value) => {
                plugin.settings.fileNameContainsDate = value;
                await plugin.saveSettings();
                this.refreshSettings();
              });
          });
        },
      },
      {
        name: "Log level to render",
        desc: "Only print out the log level equal to or above what you set here.",
        render: (setting) => {
          setting.addDropdown((dropdown) => {
            dropdown
              .addOption("debug", "Debug (print everything)")
              .addOption("info", "Info")
              .addOption("warn", "Warn")
              .addOption("error", "Error (only print error)")
              .setValue(plugin.settings.logLevel)
              .onChange(async (value) => {
                plugin.settings.logLevel = value as LogLevel;
                await plugin.saveSettings();
                this.refreshSettings();
              });
          });
        },
      },
      {
        name: "Debounce writing to output file",
        desc: "Turning off this setting writes each log event as it occurs. " +
          "This can reduce performance. Keep this setting on for normal use.",
        render: (setting) => {
          setting.addToggle((toggle) => {
            toggle
              .setValue(plugin.settings.debounceWrites)
              .onChange(async (value) => {
                plugin.settings.debounceWrites = value;
                await plugin.saveSettings();
                this.refreshSettings();
              });
          });
        },
      },
      {
        name: "Output file",
        render: (setting) => {
          const fileExt = formatters
            .find((f) => f.id === plugin.settings.formatterID)!
            .fileExt;
          const filename = plugin.getOutputFilename(fileExt);
          const link = getObsidianURI(this.app.vault, filename);
          setting.setHeading();
          setting.descEl
            .createEl("p", { text: "→ " })
            .createEl("a", { text: filename, attr: { href: link } });

          const afoURL =
            "https://actions.work/actions-for-obsidian?ref=plugin-logstravaganza";
          const promo = setting.descEl.createDiv({
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
          });
          promo.createEl("a", { attr: { href: afoURL } }).createEl("img", {
            attr: {
              src: "https://actions.work/img/afo-icon.png",
              style: "margin: -0.4rem -0.5rem -0.5rem 0; width: 5rem;",
              alt: "Actions for Obsidian icon, a cog wheel on a glossy black background",
            },
          });
          const description = promo.createSpan();
          description.appendText("Logstravaganza is brought to you by ");
          description.createEl("a", { attr: { href: afoURL } })
            .createEl("strong", { text: "Actions for Obsidian" });
          description.appendText(
            ", a macOS/iOS app made by the same developer as this plugin. " +
            "AFO is the missing link between Obsidian and macOS / iOS: " +
            "50+ Shortcuts actions to bring your notes and your automations together. ",
          );
          description.createEl("a", {
            text: "Take a look!",
            attr: { href: afoURL },
          });
        },
      },
    ];
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    for (const definition of this.getSettingDefinitions()) {
      const setting = new Setting(containerEl).setName(definition.name);
      if (definition.desc) setting.setDesc(definition.desc);
      definition.render(setting);
    }
  }

  private refreshSettings(): void {
    const update = Reflect.get(this, "update");
    if (typeof update === "function") {
      Reflect.apply(update, this, []);
    } else {
      this.display();
    }
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
      .reduce<Record<string, string>>(
        (obj, f) => ({ [f.path]: f.name, ...obj }),
        {},
      );
  }

  private allFormatters(): Record<string, string> {
    return formatters.reduce<Record<string, string>>(
      (obj, f) => ({ [f.id]: f.title, ...obj }),
      {},
    );
  }
}
