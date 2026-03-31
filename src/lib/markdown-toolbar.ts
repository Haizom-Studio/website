/** Helpers for the admin Markdown editor toolbar (wrap / line / block ops). */

export function wrapSelection(
  textarea: HTMLTextAreaElement,
  value: string,
  setValue: (v: string) => void,
  before: string,
  after: string,
  emptyPlaceholder = ""
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  const inner = selected.length > 0 ? selected : emptyPlaceholder;
  const next = value.slice(0, start) + before + inner + after + value.slice(end);
  setValue(next);
  const selStart = start + before.length;
  const selEnd = selStart + inner.length;
  queueMicrotask(() => {
    textarea.focus();
    textarea.setSelectionRange(selStart, selEnd);
  });
}

export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  value: string,
  setValue: (v: string) => void,
  insertion: string
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const next = value.slice(0, start) + insertion + value.slice(end);
  setValue(next);
  const pos = start + insertion.length;
  queueMicrotask(() => {
    textarea.focus();
    textarea.setSelectionRange(pos, pos);
  });
}

function lineRangeAt(value: string, pos: number): [number, number] {
  const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
  let lineEnd = value.indexOf("\n", pos);
  if (lineEnd === -1) lineEnd = value.length;
  return [lineStart, lineEnd];
}

/** Block = lines from the line containing selectionStart through the line containing selectionEnd. */
function blockRange(value: string, selStart: number, selEnd: number): [number, number] {
  const [blockStart] = lineRangeAt(value, selStart);
  const [, lineEndLast] = lineRangeAt(value, Math.max(selStart, selEnd - 1));
  return [blockStart, lineEndLast];
}

export function setHeadingLine(
  textarea: HTMLTextAreaElement,
  value: string,
  setValue: (v: string) => void,
  level: 2 | 3 | 4
) {
  const pos = textarea.selectionStart;
  const [lineStart, lineEnd] = lineRangeAt(value, pos);
  const line = value.slice(lineStart, lineEnd);
  const stripped = line.replace(/^#{1,6}\s+/, "");
  const prefix = `${"#".repeat(level)} `;
  const next =
    value.slice(0, lineStart) + prefix + stripped + value.slice(lineEnd);
  setValue(next);
  const newPos = lineStart + prefix.length + stripped.length;
  queueMicrotask(() => {
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
  });
}

export function prefixLinesInBlock(
  textarea: HTMLTextAreaElement,
  value: string,
  setValue: (v: string) => void,
  prefix: string
) {
  const selStart = textarea.selectionStart;
  const selEnd = textarea.selectionEnd;
  const [blockStart, blockEnd] = blockRange(value, selStart, selEnd);
  const block = value.slice(blockStart, blockEnd);
  const lines = block.split("\n");
  const newLines = lines.map((line) =>
    line.startsWith(prefix) ? line : prefix + line
  );
  const nextBlock = newLines.join("\n");
  const next = value.slice(0, blockStart) + nextBlock + value.slice(blockEnd);
  setValue(next);
  const delta = nextBlock.length - block.length;
  queueMicrotask(() => {
    textarea.focus();
    textarea.setSelectionRange(selStart, selEnd + delta);
  });
}

export function numberLinesInBlock(
  textarea: HTMLTextAreaElement,
  value: string,
  setValue: (v: string) => void
) {
  const selStart = textarea.selectionStart;
  const selEnd = textarea.selectionEnd;
  const [blockStart, blockEnd] = blockRange(value, selStart, selEnd);
  const block = value.slice(blockStart, blockEnd);
  const lines = block.split("\n");
  const newLines = lines.map((line, i) => {
    const stripped = line.replace(/^\d+\.\s+/, "");
    return `${i + 1}. ${stripped}`;
  });
  const nextBlock = newLines.join("\n");
  const next = value.slice(0, blockStart) + nextBlock + value.slice(blockEnd);
  setValue(next);
  const delta = nextBlock.length - block.length;
  queueMicrotask(() => {
    textarea.focus();
    textarea.setSelectionRange(selStart, selEnd + delta);
  });
}

export function insertHorizontalRule(
  textarea: HTMLTextAreaElement,
  value: string,
  setValue: (v: string) => void
) {
  const pos = textarea.selectionStart;
  const before = value.slice(0, pos);
  const needsLead = before.length > 0 && !before.endsWith("\n\n");
  const insertion = `${needsLead ? "\n\n" : ""}---\n\n`;
  insertAtCursor(textarea, value, setValue, insertion);
}

export function wrapCodeBlock(
  textarea: HTMLTextAreaElement,
  value: string,
  setValue: (v: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  const inner = selected.length > 0 ? selected : "code";
  const wrapped = `\`\`\`\n${inner}\n\`\`\``;
  const next = value.slice(0, start) + wrapped + value.slice(end);
  setValue(next);
  const selStart = start + 4;
  const selEnd = selStart + inner.length;
  queueMicrotask(() => {
    textarea.focus();
    textarea.setSelectionRange(selStart, selEnd);
  });
}

export function insertLink(
  textarea: HTMLTextAreaElement,
  value: string,
  setValue: (v: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  const url = window.prompt("Link URL", "https://");
  if (url === null) return;
  const label = selected.length > 0 ? selected : "link text";
  const md = `[${label}](${url.trim() || "https://"})`;
  const next = value.slice(0, start) + md + value.slice(end);
  setValue(next);
  queueMicrotask(() => {
    textarea.focus();
    if (selected.length === 0) {
      const labelStart = start + 1;
      const labelEnd = labelStart + "link text".length;
      textarea.setSelectionRange(labelStart, labelEnd);
    } else {
      textarea.setSelectionRange(start + md.length, start + md.length);
    }
  });
}
