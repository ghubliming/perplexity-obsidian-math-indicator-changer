import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Platform, TFile ,TextFileView} from 'obsidian';

export default class MathIndicatorChanger extends Plugin {
	async onload() {
		const ribbonIconEl = this.addRibbonIcon('dollar-sign', 'Change math indicator', async (evt: MouseEvent) => {
			let activeFile = this.app.workspace.getActiveFile();
			if (activeFile) {
				const vault = this.app.vault;
				try {
					let fileView: TextFileView | null = this.app.workspace.getActiveViewOfType(TextFileView);
					if (!fileView) {
						new Notice('Math Indicator: No active file view');
						return;
					}
					await fileView.save();
					let content = await vault.cachedRead(activeFile);
					content = this.replaceAllMathIndicators(content);
					try {
						await vault.modify(activeFile, content);
					} catch (error) {
						new Notice('Math Indicator: Error updating file: ' + error);
					}
				} catch (error) {
					new Notice('Math Indicator: Error reading file: ' + error);
				}
			}
		});
		ribbonIconEl.addClass('math-indicator-changer-ribbon-class');

		this.addCommand({
			id: 'change-math-indicator',
			name: 'Change math indicator',
			editorCallback: (editor: Editor) => {
				const cursorPos = editor.getCursor();
				const scrollInfo = editor.getScrollInfo();
				const savedScrollTop = scrollInfo.top;
				const selectedText = editor.getSelection();
				let newContent: string;
				if (selectedText.length === 0) {
					new Notice('Math Indicator: No text selected, changing the whole file');
					newContent = this.replaceAllMathIndicators(editor.getValue());
					editor.setValue(newContent);
				} else {
					newContent = this.replaceAllMathIndicators(selectedText);
					editor.replaceSelection(newContent);
				}
				setTimeout(() => {
					editor.setCursor(cursorPos);
					editor.scrollTo(null, savedScrollTop);
				}, 100);
			}
		});
	}

	replaceAllMathIndicators(text: string): string {
		// Replace inline math equations
		let newText = text.replace(/\$\$ ([^\$]+) \$\$/g, '$$$1$');
		return newText;
	}

	onunload() {
		console.log('unloading Math Indicator Changer plugin');
	}
}
