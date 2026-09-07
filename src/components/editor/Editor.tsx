"use client";

import { useState } from "react";
import { updatePageContent } from "@/actions/page-actions";
import { useAutoSave } from "@/hooks/use-auto-save";

interface EditorProps {
  pageId: string;
  initialContent: string;
}

const STATUS_STYLES: Record<string, string> = {
  saving: "text-gold",
  saved: "text-moss",
  error: "text-rust",
};

const STATUS_LABELS: Record<string, string> = {
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save — check your connection",
};

/**
 * Minimal starter editor (plain textarea, Markdown-ish).
 * Swap this out for Tiptap/BlockNote once you're ready for a real
 * block-based, Notion-style editing experience — the auto-save wiring
 * below (useAutoSave + updatePageContent) stays the same either way.
 */
export function Editor({ pageId, initialContent }: EditorProps) {
  const [content, setContent] = useState(initialContent);

  const status = useAutoSave(content, async (value) => {
    await updatePageContent(pageId, { text: value });
  });

  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="min-h-[60vh] w-full resize-none bg-transparent font-serif text-lg leading-relaxed text-ink outline-none placeholder:text-ink-faint"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing…"
      />
      <span
        className={`text-xs transition-colors ${
          STATUS_STYLES[status] ?? "text-ink-faint"
        }`}
      >
        {STATUS_LABELS[status] ?? "\u00A0"}
      </span>
    </div>
  );
}
