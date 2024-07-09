import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Vault,
} from "obsidian";

import { parseBibFile, normalizeFieldValue } from "bibtex";

// Remember to rename these classes and interfaces!

interface Settings {
	mySetting: string;
}

const DEFAULT_SETTINGS: Settings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Add new paper",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new SampleModal(this.app, (result) =>
					createPaperPage(this.app, result)
				).open();
			}
		);

		this.addSettingTab(new SampleSettingTab(this.app, this));
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

interface Result {
	bibtex: string;
	keywords: string[];
}

class SampleModal extends Modal {
	result: Result;
	onSubmit: (result: Result) => void;

	constructor(app: App, onSubmit: (result: Result) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		this.result = { bibtex: "", keywords: [] };
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Input Paper Data" });
		new Setting(contentEl).setName("BibTeX").addTextArea((text) =>
			text.onChange((value) => {
				this.result.bibtex = value;
			})
		);
		new Setting(contentEl).setName("Keywords").addText((text) =>
			text.onChange((value) => {
				this.result.keywords = value
					.replace("、", ",")
					.replace(", ", ",")
					.split(",");
			})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Create Page")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.result);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
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
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

const createPaperPage = (app: App, result: Result) => {
	const serializedBibTeX = parseBibFile(result.bibtex);
	// .bibに何枚あってもいい
	for (let key in serializedBibTeX.entries$) {
		const entry = serializedBibTeX.getEntry(key);
		const title = normalizeFieldValue(entry?.getField("title"));

		// bibtexをフロントマターに
		let frontmatter = "---";
		for (let key in entry?.fields) {
			frontmatter += `\n${key}: "${normalizeFieldValue(
				entry?.getField(key)
			)}"`;
		}
		frontmatter += "\n---";

		// キーワードをタグに
		frontmatter += "\n";
		for (let i in result.keywords) {
			frontmatter += `#${result.keywords[i]} `;
		}
		frontmatter += "\n";

		// ファイルを作る
		const folder = "paperreview/";
		const filePath = folder + title + ".md";
		app.vault.create(filePath, frontmatter);
	}
};
