import { App, Modal, Setting } from "obsidian";

import { parseBibFile, normalizeFieldValue } from "bibtex";

export class AddNewPaperModal extends Modal {
	results: PaperData[];
	onSubmit: (results: PaperData[]) => void;

	constructor(app: App, onSubmit: (results: PaperData[]) => void) {
		super(app);
		this.onSubmit = onSubmit;
		this.results = [];
	}

	onOpen() {
		const { contentEl } = this;

		// Modal title
		contentEl.createEl("h1", { text: "Input Paper Data" });

		this.results.push({
			title: "",
			authors: [],
			journal: "",
			year: 0,
			volume: 0,
			number: 0,
			pages: 0,
			doi: "",
			keywords: [],
		});

		new Setting(contentEl).setName("Title").addText((text) =>
			text.onChange((value) => {
				this.results[0].title = value.replaceAll(/[/\\:]/g, "  ");
			})
		);

		new Setting(contentEl).setName("Journal Name").addText((text) =>
			text.onChange((value) => {
				this.results[0].journal = value;
			})
		);

		new Setting(contentEl).setName("Authors").addText((text) =>
			text.onChange((value) => {
				this.results[0].authors = value
					.replaceAll("、", ",")
					.replaceAll(", ", ",")
					.replaceAll(". ", ".")
					.replaceAll(".", ". ")
					.split(",");
			})
		);

		new Setting(contentEl).setName("Published Year").addText((text) =>
			text.onChange((value) => {
				this.results[0].year = Number(value);
			})
		);

		new Setting(contentEl).setName("Volume").addText((text) =>
			text.onChange((value) => {
				this.results[0].volume = Number(value);
			})
		);

		new Setting(contentEl).setName("Number").addText((text) =>
			text.onChange((value) => {
				this.results[0].number = Number(value);
			})
		);

		new Setting(contentEl).setName("Pages").addText((text) =>
			text.onChange((value) => {
				this.results[0].pages = Number(value);
			})
		);

		new Setting(contentEl).setName("DOI").addText((text) =>
			text.onChange((value) => {
				this.results[0].doi = value;
			})
		);

		// Keywords of the paper
		new Setting(contentEl).setName("Keywords").addText((text) =>
			text.onChange((value) => {
				this.results[0].keywords = value
					.replaceAll("、", ",")
					.replaceAll(", ", ",")
					.split(",");
			})
		);

		// Submit button
		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Create Page")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.results);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class BibImportModal extends Modal {
	results: PaperData[];
	onSubmit: (results: PaperData[]) => void;

	constructor(app: App, onSubmit: (result: PaperData[]) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		this.results = [];
		const { contentEl } = this;

		// Modal title
		contentEl.createEl("h1", { text: "Import BibTeX" });

		// Details for citation
		new Setting(contentEl).setName("BibTeX").addTextArea((text) =>
			text.onChange((value) => {
				const serializedBibTeX = parseBibFile(value);

				for (const key in serializedBibTeX.entries$) {
					const entry = serializedBibTeX.getEntry(key);

					const result: PaperData = {
						title:
							normalizeFieldValue(entry?.getField("title"))
								?.toString()
								.replaceAll(/[/\\:]/g, "  ") ?? "",
						authors:
							normalizeFieldValue(entry?.getField("author"))
								?.toString()
								.split(" and ") ?? [],
						journal:
							normalizeFieldValue(
								entry?.getField("journal")
							)?.toString() ?? "",
						year: Number(
							normalizeFieldValue(entry?.getField("year"))
						),
						volume: Number(
							normalizeFieldValue(entry?.getField("volume"))
						),
						number: Number(
							normalizeFieldValue(entry?.getField("number"))
						),
						pages: Number(
							normalizeFieldValue(entry?.getField("pages"))
						),
						doi:
							normalizeFieldValue(
								entry?.getField("doi")
							)?.toString() ?? "",
						keywords: [],
					};

					this.results.push(result);
				}
			})
		);

		// Submit button
		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Create Pages")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.results);
				})
		);
	}
}
