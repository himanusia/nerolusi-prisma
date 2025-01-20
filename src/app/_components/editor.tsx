"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import MathExtension from "@aarkue/tiptap-math-extension";

import { cn } from "~/lib/utils";

export default function Editor({
  isEdit,
  content,
  className,
}: {
  isEdit?: boolean;
  content: string;
  className?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      MathExtension,
      Underline,
      TextStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content: content,
    editable: isEdit ?? false,
    immediatelyRender: false,
  });
  return (
    <EditorContent
      editor={editor}
      className={cn(
        "m-0 h-fit overflow-scroll scrollbar scrollbar-thumb-current scrollbar-w-1 hover:scrollbar-thumb-foreground/50",
        className,
      )}
    ></EditorContent>
  );
}
