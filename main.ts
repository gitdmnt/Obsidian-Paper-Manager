import { Plugin } from "obsidian";

import { SettingTab } from "src/setting";
import { addNewPaper, exportBibTeX, importBibTeX } from "src/command";

const DEFAULT_SETTINGS: Settings = {
	path: "/",
	format: "BiBTeX",
};

export default class PaperManagerPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();
		this.addRibbonIcon("file-plus-2", "Add new paper", (evt: MouseEvent) =>
			addNewPaper(this.app, this.settings)
		);
		this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: "export-bibtex",
			name: "Export citation as BibTeX",
			callback: () => exportBibTeX(this.app.vault, this.settings.path),
		});

		this.addCommand({
			id: "import-bibtex",
			name: "import BibTeX formatted text",
			callback: () => importBibTeX(this.app, this.settings.path),
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
