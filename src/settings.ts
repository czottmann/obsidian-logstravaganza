import { App, PluginSettingTab, Setting } from "obsidian";
import Logstravaganza from "./main";
import { formatters } from "./formatters";

export class LogstravaganzaSettingTab extends PluginSettingTab {
  plugin: Logstravaganza;

  constructor(app: App, plugin: Logstravaganza) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

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
          .setValue(this.plugin.settings.formatterID)
          .onChange(
            async (value) => {
              this.plugin.settings.formatterID = value;
              await this.plugin.saveSettings();
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
          <strong>${f.title}</strong>: ${f.description}.
          <br>
          Output file: <code>${this.plugin.getOutputFilename(f.fileExt)}</code>.
        `;
    });

    containerEl.createEl("div", {
      attr: {
        style: `
          border-radius: 0.5rem;
          border: 1px dashed var(--text-muted);
          color: var(--text-muted);
          font-size: 85%;
          margin-top: 4rem;
          opacity: 0.75;
          padding: 1rem;
        `,
      },
    })
      .innerHTML = `
        <a href="#link#">
          <img
            src="https://actions.work/img/afo-icon.png"
            style="width: 5rem; float: left; margin: -0.4rem 0.5rem 0 0;"
            alt="Actions for Obsidian icon, a cog wheel on a shiny black background">
          </a>
        Logstravaganza is brought to you by
        <a href="#link#"><strong>Actions for Obsidian</strong></a>,
        a macOS/iOS app made by the same developer as this plugin. AFO is the
        missing link between Obsidian and macOS/iOS: 50+ Shortcuts actions to bring
        your notes and your automations together. <a href="#link#">Take a look!</a>
      `
        .replace(
          "#link#",
          "https://actions.work/actions-for-obsidian?ref=plugin-logstravaganza",
        );
  }
}
