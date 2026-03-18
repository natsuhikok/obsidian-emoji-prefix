import { moment } from 'obsidian';

interface PluginStrings {
	setEmojiTitle: string;
	removeEmojiItem: string;
	noEmojisFound: string;
}

const en: PluginStrings = {
	setEmojiTitle: 'Set emoji prefix',
	removeEmojiItem: 'Remove emoji prefix',
	noEmojisFound: 'No emojis used in vault yet',
};

const ja: PluginStrings = {
	setEmojiTitle: '先頭絵文字を設定',
	removeEmojiItem: '先頭絵文字を削除',
	noEmojisFound: 'Vault 内に絵文字がまだ使われていません',
};

export function t<K extends keyof PluginStrings>(key: K): PluginStrings[K] {
	const locale = moment.locale();
	return ({ en, ja }[locale] ?? en)[key];
}
