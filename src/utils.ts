interface Frontmatter {
	[key: string]: string;
}

export const parseFrontmatter = (lines: string[]): Frontmatter => {
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

export const frontmatterToBibTeX = (frontmatter: Frontmatter) => {
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

export const dataToFrontmatter = (result: PaperData): string => {
	let frontmatter = `---
title: "${result.title}"
author: ${result.authors.map((a) => `\n  - ${a}`).join("")}
journal: "${result.journal}"
year: ${result.year}
volume:  ${result.volume}
number:  ${result.number}
pages:  ${result.pages}
doi: "${result.doi}"
---
`;
	// キーワードをタグに
	for (const i in result.keywords) {
		frontmatter += `#${result.keywords[i].replaceAll(" ", "_")} `;
	}
	frontmatter += "\n";
	// 筆者もタグに
	for (const i in result.authors) {
		frontmatter += `#${result.authors[i]
			.replaceAll(". ", "_")
			.replaceAll(" ", "_")} `;
	}
	frontmatter += "\n";
	// ジャーナル名もタグに
	frontmatter += `#${result.journal.replaceAll(" ", "_")}\n`;
	return frontmatter;
};

export const validateFolder = (path: string) => {
	let validated = "";

	// Remove leading slash
	if (path[0] === "/") {
		validated = path.slice(1);
	} else if (path.slice(0, 2) === "./") {
		validated = path.slice(2);
	} else {
		validated = path;
	}

	// add trailing slash
	if (validated.length !== 0 && validated[validated.length - 1] !== "/") {
		validated += "/";
	}

	return validated;
};
