interface Settings {
	path: string;
	format: "BiBTeX" | "Direct Input";
}

interface Result {
	data: {
		title: string;
		authors: string[];
		journal: string;
		year: number;
		volume: number;
		number: number;
		pages: number;
		doi: string;
	};
	keywords: string[];
}
