"use client";

import { useState } from "react";
import { updatePageContent } from "@/actions/page-actions";
import { useAutoSave } from "@/hooks/use-auto-save";

interface EditorProps {
  pageId: string;
  initialContent: string;
}

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
    <div className="flex flex-col gap-2">
      <textarea
        className="min-h-[60vh] w-full resize-none rounded-md border border-neutral-200 p-4 text-sm leading-relaxed outline-none focus:border-neutral-400"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
      />
      <span className="text-xs text-neutral-400">
        {status === "saving" && "Saving..."}
        {status === "saved" && "Saved"}
        {status === "error" && "Couldn't save — check your connection"}
      </span>
    </div>
  );
}
