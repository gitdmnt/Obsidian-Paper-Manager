import { Vault } from "obsidian";

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

interface Frontmatter {
	[key: string]: string;
}

const parseFrontmatter = (lines: string[]) => {
	const frontmatter: Frontmatter = {};
	for (const line of lines) {
		const [key, value] = line.split(": ");
		frontmatter[key] = value;
	}
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
