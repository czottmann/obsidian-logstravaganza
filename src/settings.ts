import { App, PluginSettingTab, Setting } from "obsidian";
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

    new Setting(containerEl)
      .setName("Output format")
      .setDesc(`
        This plugin intercepts developer console messages, and saves them to a
        file in your vault. Select the output file format here.`)
      .addDropdown((dropdown) => {
        const options: Record<string, string> = formatters.reduce(
          (obj: any, f) => ({ [f.id]: f.title, ...obj }),
          {},
        );

        dropdown
          .addOptions(options)
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
      const filename = plugin.getOutputFilename(f.fileExt);
      const link = getObsidianURI(this.app.vault, filename);

      ul.createEl("li", { attr: { style: "margin-bottom: 0.5rem;" } })
        .innerHTML = `
          <strong>${f.title}</strong>: ${f.description}.<br>
          Output file: <a href="${link}"><code>${filename}</code></a>
        `;
    });

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
}
