import { Plugin, Notice, TFile } from "obsidian";

import { SettingTab } from "src/setting";
import { addNewPaper, exportBibTeX, importBibTeX } from "src/command";
import { dataToFrontmatter } from "src/utils";

const DEFAULT_SETTINGS: Settings = {
	path: "/",
};

export default class PaperManagerPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();
		this.addRibbonIcon("file-plus-2", "Add new paper", (evt: MouseEvent) =>
			addNewPaper(this.app, (results) => this.onPaperDataSubmit(results))
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
			callback: async () =>
				importBibTeX(this.app, (results) =>
					this.onPaperDataSubmit(results)
				),
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

	async onPaperDataSubmit(results: PaperData[]) {
		// Iterate over each entry and create a new file
		results.forEach(async (entry) => {
			await this.createFile(entry);
			this.openFileByName(entry.title);
		});
	}

	async createFile(entry: PaperData) {
		const frontmatter = dataToFrontmatter(entry);
		await this.app.vault.create(
			`${this.settings.path}${entry.title.replaceAll(
				/[/\\:\s]/g,
				"_"
			)}.md`,
			frontmatter
		);
	}

	async openFileByName(fileName: string) {
		const path = `${this.settings.path}${fileName.replaceAll(
			/[/\\:\s]/g,
			"_"
		)}.md`;
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!file) {
			new Notice(`File "${path}" not found`);
			return;
		}

		if (file instanceof TFile) {
			await this.app.workspace.getLeaf().openFile(file);
		} else {
			new Notice(`"${path}" is not a valid file`);
		}
	}
}
