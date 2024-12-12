import { App, PluginSettingTab, Setting } from "obsidian";
import { validateFolder } from "./utils";

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

		const children = this.app.vault.getAllFolders().map((f) => f.path);

		new Setting(containerEl)
			.setName("Directory Path")
			.setDesc("")
			.addDropdown((dropdown) => {
				children.forEach((c) => dropdown.addOption(c, c));
				dropdown.onChange(async (v) => {
					this.plugin.settings.path = validateFolder(v);
					await this.plugin.saveSettings();
				});
				dropdown.setValue(this.plugin.settings.path);
			});
	}
}
