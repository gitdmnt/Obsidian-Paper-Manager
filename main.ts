import { App, Plugin } from "obsidian";

import { SettingTab } from "src/setting";
import { AddNewPaperModal } from "src/modal";
import { exportBibTeX } from "src/command";

const DEFAULT_SETTINGS: Settings = {
	path: "/",
	format: "BiBTeX",
};

export default class PaperManagerPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();
		this.addRibbonIcon(
			"file-plus-2",
			"Add new paper",
			(evt: MouseEvent) => {
				new AddNewPaperModal(this.app, this.settings, (result) =>
					createPaperPage(this.app, this.settings, result)
				).open();
			}
		);
		this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: "export-bibtex",
			name: "Export citation as BibTeX",
			callback: () => exportBibTeX(this.app.vault, this.settings.path),
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

const createPaperPage = (app: App, settings: Settings, result: Result) => {
	let frontmatter = `---
title: "${result.data.title}"
author: "${result.data.authors}"
journal: "${result.data.journal}"
year: ${result.data.year}
volume:  ${result.data.volume}
number:  ${result.data.number}
pages:  ${result.data.pages}
doi: "${result.data.doi}"
---
`;
	// キーワードをタグに
	for (const i in result.keywords) {
		frontmatter += `#${result.keywords[i]} `;
	}
	frontmatter += "\n";

	// ファイルを作る
	const folder = settings.path;
	const filePath =
		folder + result.data.title.replaceAll(/[/\\:]/g, "  ") + ".md";
	app.vault.create(filePath, frontmatter);
	console.log(`Paper Manager: Create file at ${filePath}`);
};
