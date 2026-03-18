import { MarkdownView, Menu, Plugin, TFile, setIcon } from 'obsidian';
import { t } from './i18n';
import { collectVaultEmojis, getLeadingEmoji, removeLeadingEmoji, setLeadingEmoji } from './emoji';

export default class EmojiPrefixPlugin extends Plugin {
	private buttonMap = new WeakMap<MarkdownView, HTMLElement>();

	async onload() {
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
		const vaultEmojis = collectVaultEmojis(this.app.vault.getMarkdownFiles(), file);

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
