import { moment } from 'obsidian';

interface PluginStrings {
	setEmojiTitle: string;
	removeEmojiItem: string;
	noEmojisFound: string;
	excludedFoldersSettingName: string;
	excludedFoldersSettingDesc: string;
	addFolderButton: string;
	removeFolderButton: string;
	folderPlaceholder: string;
}

const en: PluginStrings = {
	setEmojiTitle: 'Set emoji prefix',
	removeEmojiItem: 'Remove emoji prefix',
	noEmojisFound: 'No emojis used in vault yet',
	excludedFoldersSettingName: 'Excluded folders',
	excludedFoldersSettingDesc:
		'Folders to exclude from emoji collection. Subfolders are also excluded.',
	addFolderButton: 'Add folder',
	removeFolderButton: 'Remove',
	folderPlaceholder: 'Folder path (e.g. Archive)',
};

const ja: PluginStrings = {
	setEmojiTitle: '先頭絵文字を設定',
	removeEmojiItem: '先頭絵文字を削除',
	noEmojisFound: 'Vault 内に絵文字がまだ使われていません',
	excludedFoldersSettingName: '除外フォルダ',
	excludedFoldersSettingDesc: '絵文字収集から除外するフォルダ。サブフォルダも除外されます。',
	addFolderButton: 'フォルダを追加',
	removeFolderButton: '削除',
	folderPlaceholder: 'フォルダパス（例: Archive）',
};

export function t<K extends keyof PluginStrings>(key: K): PluginStrings[K] {
	const locale = moment.locale();
	return ({ en, ja }[locale] ?? en)[key];
}
