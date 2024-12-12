import { Plugin, Notice, TFile, TFolder } from "obsidian";

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
			addNewPaper(this.app, this.settings, (results, path) =>
				this.onPaperDataSubmit(results, path)
			)
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

	async onPaperDataSubmit(results: PaperData[], path?: string | null) {
		// Iterate over each entry and create a new file
		results.forEach(async (entry) => {
			await this.createFile(entry, path);
			this.openFileByName(entry.title, path);
		});
	}

	async createFile(entry: PaperData, path?: string | null) {
		const frontmatter = dataToFrontmatter(entry);
		await this.app.vault.create(
			`${path ?? this.settings.path}${entry.title.replaceAll(
				/[/\\:\s]/g,
				"_"
			)}.md`,
			frontmatter
		);
	}

	async openFileByName(fileName: string, path?: string | null) {
		const filePath = `${path ?? this.settings.path}${fileName.replaceAll(
			/[/\\:\s]/g,
			"_"
		)}.md`;
		const file = this.app.vault.getAbstractFileByPath(filePath);

		if (!file) {
			new Notice(`File "${filePath}" not found`);
			return;
		}

		if (file instanceof TFile) {
			await this.app.workspace.getLeaf().openFile(file);
		} else {
			new Notice(`"${filePath}" is not a valid file`);
		}
	}

	childrenDirectory(): TFolder[] {
		const children = this.app.vault.getAllFolders(false).filter((f) => {
			f.parent?.path === this.settings.path;
		});
		return children;
	}
}
