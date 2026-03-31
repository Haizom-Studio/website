"use client";

import React, { RefObject } from "react";
import { Icon } from "@iconify/react";
import {
  insertHorizontalRule,
  insertLink,
  numberLinesInBlock,
  prefixLinesInBlock,
  setHeadingLine,
  wrapCodeBlock,
  wrapSelection,
} from "@/lib/markdown-toolbar";

type MarkdownEditorToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
};

function btnClass() {
  return [
    "inline-flex items-center justify-center rounded-sm px-2 py-1.5 text-sm transition-colors",
    "text-midnight_text dark:text-white border border-transparent",
    "hover:bg-black/5 dark:hover:bg-white/10",
  ].join(" ");
}

export default function MarkdownEditorToolbar({
  textareaRef,
  value,
  onChange,
}: MarkdownEditorToolbarProps) {
  function run(fn: (ta: HTMLTextAreaElement) => void) {
    const ta = textareaRef.current;
    if (!ta) return;
    fn(ta);
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-border dark:border-dark_border bg-section dark:bg-darklight px-2 py-1.5"
      role="toolbar"
      aria-label="Markdown formatting">
      <span className="hidden sm:inline text-xs text-grey dark:text-SereneGray pr-1 mr-1 border-r border-border dark:border-dark_border">
        Format
      </span>

      <button
        type="button"
        className={btnClass()}
        onClick={() =>
          run((ta) => wrapSelection(ta, value, onChange, "**", "**", "bold"))
        }
        title="Bold"
        aria-label="Bold">
        <Icon icon="solar:text-bold-outline" className="text-lg" />
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() =>
          run((ta) => wrapSelection(ta, value, onChange, "*", "*", "italic"))
        }
        title="Italic"
        aria-label="Italic">
        <Icon icon="solar:text-italic-outline" className="text-lg" />
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() =>
          run((ta) =>
            wrapSelection(ta, value, onChange, "~~", "~~", "strikethrough")
          )
        }
        title="Strikethrough"
        aria-label="Strikethrough">
        <Icon icon="solar:text-cross-outline" className="text-lg" />
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() =>
          run((ta) =>
            wrapSelection(ta, value, onChange, "<u>", "</u>", "underline")
          )
        }
        title="Underline (HTML)"
        aria-label="Underline">
        <Icon icon="solar:text-underline-outline" className="text-lg" />
      </button>

      <span className="w-px h-5 bg-border dark:bg-dark_border mx-0.5" aria-hidden />

      <button
        type="button"
        className={btnClass()}
        onClick={() =>
          run((ta) => wrapSelection(ta, value, onChange, "`", "`", "code"))
        }
        title="Inline code"
        aria-label="Inline code">
        <Icon icon="solar:code-outline" className="text-lg" />
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() => run((ta) => wrapCodeBlock(ta, value, onChange))}
        title="Code block"
        aria-label="Code block">
        <Icon icon="solar:code-square-outline" className="text-lg" />
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() => run((ta) => insertLink(ta, value, onChange))}
        title="Link"
        aria-label="Insert link">
        <Icon icon="solar:link-minimalistic-outline" className="text-lg" />
      </button>

      <span className="w-px h-5 bg-border dark:bg-dark_border mx-0.5" aria-hidden />

      <button
        type="button"
        className={btnClass()}
        onClick={() => run((ta) => setHeadingLine(ta, value, onChange, 2))}
        title="Heading 2"
        aria-label="Heading 2">
        <span className="text-xs font-bold px-0.5">H2</span>
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() => run((ta) => setHeadingLine(ta, value, onChange, 3))}
        title="Heading 3"
        aria-label="Heading 3">
        <span className="text-xs font-bold px-0.5">H3</span>
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() => run((ta) => setHeadingLine(ta, value, onChange, 4))}
        title="Heading 4"
        aria-label="Heading 4">
        <span className="text-xs font-bold px-0.5">H4</span>
      </button>

      <span className="w-px h-5 bg-border dark:bg-dark_border mx-0.5" aria-hidden />

      <button
        type="button"
        className={btnClass()}
        onClick={() =>
          run((ta) => prefixLinesInBlock(ta, value, onChange, "- "))
        }
        title="Bullet list"
        aria-label="Bullet list">
        <Icon icon="solar:list-outline" className="text-lg" />
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() => run((ta) => numberLinesInBlock(ta, value, onChange))}
        title="Numbered list"
        aria-label="Numbered list">
        <Icon icon="solar:list-numbers-outline" className="text-lg" />
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() =>
          run((ta) => prefixLinesInBlock(ta, value, onChange, "> "))
        }
        title="Blockquote"
        aria-label="Blockquote">
        <Icon icon="solar:chat-round-line-outline" className="text-lg" />
      </button>
      <button
        type="button"
        className={btnClass()}
        onClick={() =>
          run((ta) => insertHorizontalRule(ta, value, onChange))
        }
        title="Horizontal rule"
        aria-label="Horizontal rule">
        <Icon icon="solar:minus-square-outline" className="text-lg" />
      </button>

      <span className="w-px h-5 bg-border dark:bg-dark_border mx-0.5" aria-hidden />

      <label className="flex items-center gap-1 text-xs text-midnight_text dark:text-white">
        <span className="sr-only">Text size</span>
        <select
          className="max-w-[7.5rem] rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-1.5 py-1 text-xs"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            e.target.value = "";
            if (!v) return;
            run((ta) => {
              if (v === "lg") {
                wrapSelection(
                  ta,
                  value,
                  onChange,
                  '<span style="font-size:1.25em">',
                  "</span>",
                  "text"
                );
              } else if (v === "sm") {
                wrapSelection(ta, value, onChange, "<small>", "</small>", "text");
              } else if (v === "xl") {
                wrapSelection(
                  ta,
                  value,
                  onChange,
                  '<span style="font-size:1.5em">',
                  "</span>",
                  "text"
                );
              }
            });
          }}
          title="Wrap selection with size (HTML)">
          <option value="">Size…</option>
          <option value="sm">Smaller</option>
          <option value="lg">Large</option>
          <option value="xl">Larger</option>
        </select>
      </label>

      <label className="flex items-center gap-1 text-xs text-midnight_text dark:text-white">
        <span className="sr-only">Font</span>
        <select
          className="max-w-[7.5rem] rounded-sm border border-border dark:border-dark_border bg-white dark:bg-darklight px-1.5 py-1 text-xs"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value;
            e.target.value = "";
            if (!v) return;
            run((ta) => {
              if (v === "serif") {
                wrapSelection(
                  ta,
                  value,
                  onChange,
                  '<span style="font-family: Georgia, \'Times New Roman\', serif">',
                  "</span>",
                  "text"
                );
              } else if (v === "mono") {
                wrapSelection(
                  ta,
                  value,
                  onChange,
                  '<span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace">',
                  "</span>",
                  "text"
                );
              } else if (v === "sans") {
                wrapSelection(
                  ta,
                  value,
                  onChange,
                  '<span style="font-family: system-ui, sans-serif">',
                  "</span>",
                  "text"
                );
              }
            });
          }}
          title="Wrap selection with font (HTML)">
          <option value="">Font…</option>
          <option value="sans">Sans</option>
          <option value="serif">Serif</option>
          <option value="mono">Mono</option>
        </select>
      </label>
    </div>
  );
}
