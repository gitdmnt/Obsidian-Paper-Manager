import { App, Modal, Setting } from "obsidian";

import { parseBibFile, normalizeFieldValue } from "bibtex";

export class AddNewPaperModal extends Modal {
	result: Result;
	setting: Settings;
	onSubmit: (result: Result) => void;

	constructor(
		app: App,
		setting: Settings,
		onSubmit: (result: Result) => void
	) {
		super(app);
		this.onSubmit = onSubmit;
		this.setting = setting;
	}

	onOpen() {
		this.result = {
			data: {
				title: "",
				journal: "",
				authors: [],
				year: 0,
				volume: 0,
				number: 0,
				pages: 0,
				doi: "",
			},
			keywords: [],
		};
		const { contentEl } = this;

		// Modal title
		contentEl.createEl("h1", { text: "Input Paper Data" });

		// Details for citation
		if (this.setting.format === "BiBTeX") {
			new Setting(contentEl).setName("BibTeX").addTextArea((text) =>
				text.onChange((value) => {
					const serializedBibTeX = parseBibFile(value);

					for (const key in serializedBibTeX.entries$) {
						const entry = serializedBibTeX.getEntry(key);

						this.result.data.title =
							normalizeFieldValue(entry?.getField("title"))
								?.toString()
								.replaceAll(/[/\\:]/g, "  ") ?? "";

						this.result.data.authors =
							normalizeFieldValue(entry?.getField("author"))
								?.toString()
								.split(" and ") ?? [];

						this.result.data.journal =
							normalizeFieldValue(
								entry?.getField("journal")
							)?.toString() ?? "";

						this.result.data.year = Number(
							normalizeFieldValue(entry?.getField("year"))
						);

						this.result.data.volume = Number(
							normalizeFieldValue(entry?.getField("volume"))
						);

						this.result.data.number = Number(
							normalizeFieldValue(entry?.getField("number"))
						);

						this.result.data.pages = Number(
							normalizeFieldValue(entry?.getField("pages"))
						);

						this.result.data.journal =
							normalizeFieldValue(
								entry?.getField("doi")
							)?.toString() ?? "";
					}
				})
			);
		} else if (this.setting.format === "Direct Input") {
			new Setting(contentEl).setName("Title").addText((text) =>
				text.onChange((value) => {
					this.result.data.title = value.replaceAll(/[/\\:]/g, "  ");
				})
			);

			new Setting(contentEl).setName("Journal Name").addText((text) =>
				text.onChange((value) => {
					this.result.data.journal = value;
				})
			);

			new Setting(contentEl).setName("Authors").addText((text) =>
				text.onChange((value) => {
					this.result.data.authors = value
						.replaceAll("、", ",")
						.replaceAll(", ", ",")
						.replaceAll(". ", ".")
						.replaceAll(".", ". ")
						.split(",");
				})
			);

			new Setting(contentEl).setName("Published Year").addText((text) =>
				text.onChange((value) => {
					this.result.data.year = Number(value);
				})
			);

			new Setting(contentEl).setName("Volume").addText((text) =>
				text.onChange((value) => {
					this.result.data.volume = Number(value);
				})
			);

			new Setting(contentEl).setName("Number").addText((text) =>
				text.onChange((value) => {
					this.result.data.number = Number(value);
				})
			);

			new Setting(contentEl).setName("Pages").addText((text) =>
				text.onChange((value) => {
					this.result.data.pages = Number(value);
				})
			);

			new Setting(contentEl).setName("DOI").addText((text) =>
				text.onChange((value) => {
					this.result.data.doi = value;
				})
			);
		}

		// Keywords of the paper
		new Setting(contentEl).setName("Keywords").addText((text) =>
			text.onChange((value) => {
				this.result.keywords = value
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
					this.onSubmit(this.result);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class BibImportModal extends Modal {
	result: Result[];
	onSubmit: (result: Result[]) => void;

	constructor(app: App, onSubmit: (result: Result[]) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		this.result = [];
		const { contentEl } = this;

		// Modal title
		contentEl.createEl("h1", { text: "Import BibTeX" });

		// Details for citation
		new Setting(contentEl).setName("BibTeX").addTextArea((text) =>
			text.onChange((value) => {
				const serializedBibTeX = parseBibFile(value);

				for (const key in serializedBibTeX.entries$) {
					const entry = serializedBibTeX.getEntry(key);

					const result: Result = {
						data: {
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
						},
						keywords: [],
					};

					this.result.push(result);
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
					this.onSubmit(this.result);
				})
		);
	}
}
