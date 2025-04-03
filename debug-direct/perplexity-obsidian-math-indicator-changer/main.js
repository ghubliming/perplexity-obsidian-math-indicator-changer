var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MathIndicatorChanger
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var MathIndicatorChanger = class extends import_obsidian.Plugin {
  async onload() {
    // Changed from "dollar-sign" to "euro" for icon
    const ribbonIconEl = this.addRibbonIcon("euro", "Change math indicator", async (evt) => {
      let activeFile = this.app.workspace.getActiveFile();
      if (activeFile) {
        const vault = this.app.vault;
        try {
          let fileView = this.app.workspace.getActiveViewOfType(import_obsidian.TextFileView);
          if (!fileView) {
            new import_obsidian.Notice("Math Indicator: No active file view");
            return;
          }
          await fileView.save();
          let content = await vault.cachedRead(activeFile);
          content = this.replaceAllMathIndicators(content);
          try {
            await vault.modify(activeFile, content);
          } catch (error) {
            new import_obsidian.Notice("Math Indicator: Error updating file: " + error);
          }
        } catch (error) {
          new import_obsidian.Notice("Math Indicator: Error reading file: " + error);
        }
      }
    });
    ribbonIconEl.addClass("math-indicator-changer-ribbon-class");
    this.addCommand({
      id: "change-math-indicator",
      name: "Change math indicator",
      editorCallback: (editor) => {
        const cursorPos = editor.getCursor();
        const scrollInfo = editor.getScrollInfo();
        const savedScrollTop = scrollInfo.top;
        const selectedText = editor.getSelection();
        let newContent;
        if (selectedText.length === 0) {
          new import_obsidian.Notice("Math Indicator: No text selected, changing the whole file");
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

  // Improved method to replace inline math with spaces while preserving block math
  replaceInlineMathWithSpaces(text) {
    // Split text by line first to better identify inline vs block math
    const lines = text.split('\n');
    const processedLines = [];

    // Flag to track if we're inside a math block
    let insideMathBlock = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Check if line is a math block delimiter
      if (line.trim() === '$$') {
        insideMathBlock = !insideMathBlock;
        processedLines.push(line);
        continue;
      }

      // If we're inside a math block, don't modify
      if (insideMathBlock) {
        processedLines.push(line);
        continue;
      }

      // For regular lines, process inline math
      const inlineMathRegex = /\$\$([\s]*)((?:(?!\$\$).)+)([\s]*)\$\$/g;

      // Replace inline math with single $ delimiters
      line = line.replace(inlineMathRegex, function(match, leadingSpace, content, trailingSpace) {
        return '$' + content.trim() + '$';
      });

      processedLines.push(line);
    }

    return processedLines.join('\n');
  }

  replaceLeftParentheses(text) {
    return text.replace(/\\\([ \t]*/g, "$");
  }

  replaceRightParentheses(text) {
    return text.replace(/[ \t]*\\\)/g, "$");
  }

  replaceLeftBrackets(text) {
    return text.replace(/\\\[[ \t]*/g, "$$");
  }

  replaceRightBrackets(text) {
    return text.replace(/[ \t]*\\\]/g, "$$");
  }

  replaceAllMathIndicators(text) {
    // First handle the new functionality to replace inline $$ MATH $$ with $MATH$
    let newText = this.replaceInlineMathWithSpaces(text);

    // Then apply the original transformations
    newText = this.replaceLeftParentheses(newText);
    newText = this.replaceRightParentheses(newText);
    newText = this.replaceLeftBrackets(newText);
    newText = this.replaceRightBrackets(newText);

    return newText;
  }

  onunload() {
    console.log("unloading Math Indicator Changer plugin");
  }
};