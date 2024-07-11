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
			.setName("Directory Path")
			.setDesc("")
			.addText((text) =>
				text
					.setPlaceholder("/")
					.setValue(this.plugin.settings.path)
					.onChange(async (v) => {
						let path = "";

						if (v[0] === "/") {
							path = v.slice(1);
						} else if (v.slice(0, 2) === "./") {
							path = v.slice(2);
						} else {
							path = v;
						}

						if (path[path.length - 1] !== "/") {
							path += "/";
						}

						this.plugin.settings.path = path;
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
