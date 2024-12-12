import { App, Vault } from "obsidian";
import { BibImportModal, AddNewPaperModal } from "./modal";
import { parseFrontmatter, frontmatterToBibTeX } from "./utils";

// Export the BibTeX of all the files in the specified directory
export const exportBibTeX = async (vault: Vault, path: string) => {
	let bibtex = "";
	const files = await vault
		.getMarkdownFiles()
		.filter((f) => {
			// Check if the file is in the specified directory
			if (f.parent?.path === "/") {
				return "" === path;
			} else {
				return f.parent?.path + "/" === path;
			}
		})
		.map((f) => vault.cachedRead(f));

	// Iterate over each file and extract the frontmatter
	for (const file of files) {
		const lines = (await file).split("\n");
		const frontmatter = parseFrontmatter(lines);
		bibtex += frontmatterToBibTeX(frontmatter) + "\n";
	}
	vault.create(path + "exported.bib", bibtex);
	console.log(bibtex);
	console.log("Exported BibTeX");
};

// Import the BibTeX file and create a new file for each entry
export const importBibTeX = async (
	app: App,
	onSubmit: (result: PaperData[]) => void
) => {
	new BibImportModal(app, onSubmit).open();
};

// Create a new file with the specified paper information
export const addNewPaper = async (
	app: App,
	settings: Settings,
	onSubmit: (result: PaperData[], path: string) => void
) => {
	new AddNewPaperModal(app, settings, onSubmit).open();
};
