import { App, PluginSettingTab, Setting } from "obsidian";

import PaperManagerPlugin from "main";

export class SettingTab extends PluginSettingTab {
	plugin: PaperManagerPlugin;

	constructor(app: App, plugin: PaperManagerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Path")
			.setDesc("Not works now")
			.addText((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.path)
					.onChange(async (value) => {
						this.plugin.settings.path = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Input Method")
			.setDesc("Select how you input paper information.")
			.addDropdown((c) =>
				c
					.addOption("BiBTeX", "BiBTeX")
					.addOption("Direct Input", "Direct Input")
					.setValue(this.plugin.settings.format)
					.onChange(async (value: "BiBTeX" | "Direct Input") => {
						this.plugin.settings.format = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
