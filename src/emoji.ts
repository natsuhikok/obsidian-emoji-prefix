import { TFile } from 'obsidian';

const segmenter = new Intl.Segmenter();

function isEmoji(segment: string): boolean {
	return /\p{Extended_Pictographic}/u.test(segment);
}

export function getLeadingEmoji(title: string): string | null {
	const segments = [...segmenter.segment(title)];
	const firstSegment = segments[0];
	if (!firstSegment) return null;
	const first = firstSegment.segment;
	return isEmoji(first) ? first : null;
}

export function removeLeadingEmoji(title: string): string {
	const emoji = getLeadingEmoji(title);
	if (!emoji) return title;
	const rest = title.slice(emoji.length);
	return rest.startsWith(' ') ? rest.slice(1) : rest;
}

export function setLeadingEmoji(title: string, emoji: string): string {
	const body = removeLeadingEmoji(title);
	return `${emoji} ${body}`;
}

export function collectVaultEmojis(files: TFile[], exclude?: TFile): string[] {
	const seen = new Set<string>();
	for (const file of files) {
		if (exclude && file.path === exclude.path) continue;
		const emoji = getLeadingEmoji(file.basename);
		if (emoji) seen.add(emoji);
	}
	return [...seen];
}
