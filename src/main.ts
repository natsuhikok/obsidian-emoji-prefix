import { MarkdownView, Menu, Plugin, PluginSettingTab, Setting, TFile, setIcon } from 'obsidian';
import { t } from './i18n';
import { collectVaultEmojis, getLeadingEmoji, removeLeadingEmoji, setLeadingEmoji } from './emoji';

interface EmojiPrefixSettings {
	excludedFolders: string[];
}

const DEFAULT_SETTINGS: EmojiPrefixSettings = {
	excludedFolders: [],
};

export default class EmojiPrefixPlugin extends Plugin {
	settings: EmojiPrefixSettings = DEFAULT_SETTINGS;
	private buttonMap = new WeakMap<MarkdownView, HTMLElement>();

	async onload() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<EmojiPrefixSettings>,
		);
		this.addSettingTab(new EmojiPrefixSettingTab(this.app, this));
		this.registerEvent(this.app.workspace.on('layout-change', () => this.decorateAllViews()));
		this.registerEvent(this.app.workspace.on('file-open', () => this.decorateAllViews()));
		this.registerEvent(
			this.app.vault.on('rename', (_file, _oldPath) => this.decorateAllViews()),
		);
		this.decorateAllViews();
	}

	onunload() {}

	private decorateAllViews() {
		this.app.workspace.getLeavesOfType('markdown').forEach((leaf) => {
			const view = leaf.view;
			if (view instanceof MarkdownView) {
				this.decorateView(view);
			}
		});
	}

	private decorateView(view: MarkdownView) {
		const file = view.file;
		if (!file) return;

		if (this.buttonMap.has(view)) {
			this.updateButton(this.buttonMap.get(view)!, file);
			return;
		}

		const btn = view.addAction('smile', t('setEmojiTitle'), (evt) => {
			const currentFile = view.file;
			if (currentFile) this.showEmojiMenu(view, currentFile, evt);
		});
		this.buttonMap.set(view, btn);
		this.updateButton(btn, file);
	}

	private updateButton(el: HTMLElement, file: TFile) {
		const emoji = getLeadingEmoji(file.basename);
		el.empty();
		if (emoji) {
			el.setText(emoji);
			el.setAttribute('aria-label', t('setEmojiTitle'));
		} else {
			setIcon(el, 'smile');
			el.setAttribute('aria-label', t('setEmojiTitle'));
		}
	}

	private showEmojiMenu(view: MarkdownView, file: TFile, evt: MouseEvent) {
		const menu = new Menu();
		const vaultEmojis = collectVaultEmojis(this.app.vault.getMarkdownFiles(), {
			exclude: file,
			excludedFolders: this.settings.excludedFolders,
		});

		if (vaultEmojis.length === 0) {
			menu.addItem((item) => {
				item.setTitle(t('noEmojisFound')).setDisabled(true);
			});
		} else {
			for (const emoji of vaultEmojis) {
				menu.addItem((item) => {
					item.setTitle(emoji).onClick(() => {
						void this.renameWithEmoji(view, file, emoji);
					});
				});
			}
		}

		const currentEmoji = getLeadingEmoji(file.basename);
		if (currentEmoji) {
			menu.addSeparator();
			menu.addItem((item) => {
				item.setTitle(t('removeEmojiItem')).onClick(() => {
					void this.renameWithEmoji(view, file, null);
				});
			});
		}

		menu.showAtMouseEvent(evt);
	}

	private async renameWithEmoji(view: MarkdownView, file: TFile, emoji: string | null) {
		const newBasename =
			emoji === null
				? removeLeadingEmoji(file.basename)
				: setLeadingEmoji(file.basename, emoji);

		const newPath = file.path.replace(/[^/]+$/, `${newBasename}.${file.extension}`);

		await this.app.fileManager.renameFile(file, newPath);

		const btn = this.buttonMap.get(view);
		if (btn && view.file) this.updateButton(btn, view.file);
	}
}

class EmojiPrefixSettingTab extends PluginSettingTab {
	constructor(
		app: import('obsidian').App,
		private plugin: EmojiPrefixPlugin,
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(t('excludedFoldersSettingName'))
			.setDesc(t('excludedFoldersSettingDesc'));

		for (let i = 0; i < this.plugin.settings.excludedFolders.length; i++) {
			const index = i;
			new Setting(containerEl)
				.addText((text) => {
					text.setValue(this.plugin.settings.excludedFolders[index] ?? '').onChange(
						async (value) => {
							this.plugin.settings.excludedFolders[index] = value;
							await this.plugin.saveData(this.plugin.settings);
						},
					);
					text.inputEl.setAttr('placeholder', t('folderPlaceholder'));
				})
				.addButton((btn) => {
					btn.setButtonText(t('removeFolderButton')).onClick(async () => {
						this.plugin.settings.excludedFolders.splice(index, 1);
						await this.plugin.saveData(this.plugin.settings);
						this.display();
					});
				});
		}

		let newFolder = '';
		new Setting(containerEl)
			.addText((text) => {
				text.setPlaceholder(t('folderPlaceholder')).onChange((value) => {
					newFolder = value;
				});
			})
			.addButton((btn) => {
				btn.setButtonText(t('addFolderButton')).onClick(async () => {
					const trimmed = newFolder.trim();
					if (!trimmed) return;
					this.plugin.settings.excludedFolders.push(trimmed);
					await this.plugin.saveData(this.plugin.settings);
					this.display();
				});
			});
	}
}
