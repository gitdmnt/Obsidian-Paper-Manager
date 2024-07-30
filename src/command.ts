import { App, Vault } from "obsidian";
import { BibImportModal, AddNewPaperModal } from "./modal";

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
export const importBibTeX = async (app: App, path: string) => {
	const onSubmit = (result: Result[]) => {
		// Iterate over each entry and create a new file
		result.forEach((entry) => {
			createFile(app.vault, path, entry);
		});
	};

	new BibImportModal(app, onSubmit).open();
};

// Create a new file with the specified paper information
export const addNewPaper = async (app: App, settings: Settings) => {
	const onSubmit = (entry: Result) =>
		createFile(app.vault, settings.path, entry);
	new AddNewPaperModal(app, settings, onSubmit).open();
};

interface Frontmatter {
	[key: string]: string;
}

const parseFrontmatter = (lines: string[]) => {
	const frontmatter: Frontmatter = {};
	const authors = [];
	for (const line of lines) {
		if (line[0] === " ") {
			authors.push(line.slice(4));
			continue;
		}
		const [key, value] = line.split(": ");
		frontmatter[key] = value;
	}
	frontmatter["author"] = authors.join(", ");
	return frontmatter;
};

const frontmatterToBibTeX = (frontmatter: Frontmatter) => {
	return `@article{${frontmatter.author.replaceAll(" ", "")}${
		frontmatter.year
	},
  author = {${frontmatter.author}},
  title = {${frontmatter.title}},
  journal = {${frontmatter.journal}},
  year = {${frontmatter.year}},
  volume = {${frontmatter.volume}},
  number = {${frontmatter.number}},
  pages = {${frontmatter.pages}},
  doi = {${frontmatter.doi}},
}`;
};

const dataToFrontmatter = (result: Result): string => {
	let frontmatter = `---
title: "${result.data.title}"
author: ${result.data.authors.map((a) => `\n  - ${a}`).join("")}
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
	// 筆者もタグに
	for (const i in result.data.authors) {
		frontmatter += `#${result.data.authors[i]} `;
	}
	// ジャーナル名もタグに
	frontmatter += `#${result.data.journal}\n`;
	return frontmatter;
};

const createFile = (vault: Vault, path: string, entry: Result) => {
	const frontmatter = dataToFrontmatter(entry);
	vault.create(
		`${path}${entry.data.title.replaceAll(/[/\\:\s]/g, "_")}.md`,
		frontmatter
	);
};
