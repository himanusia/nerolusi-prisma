"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Mathematics from "@tiptap/extension-mathematics";
import "katex/dist/katex.min.css";
import katex from "katex";
import { useState, useEffect, useRef } from "react";

import {
  LuBold,
  LuStrikethrough,
  LuItalic,
  LuList,
  LuListOrdered,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuUndo,
  LuRedo,
  LuUnderline,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignJustify,
} from "react-icons/lu";

import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Editor({
  isEdit,
  content,
  onContentChange,
  className,
  fontSize = "text-sm",
  ...props
}: {
  isEdit?: boolean;
  content: string;
  className?: string;
  onContentChange?: (content: string) => void;
  fontSize?: "text-sm" | "text-base" | "text-lg";
} & React.HTMLAttributes<HTMLDivElement>) {
  const [latexInput, setLatexInput] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
          macros: { "\\B": "\\mathbb{B}" },
        },
        inlineOptions: {
          onClick: (node, pos) => {
            setLatexInput(node.attrs.latex);
            setEditingPos(pos);
            setIsPopoverOpen(true);
          },
        },
      }),
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
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-3",
          fontSize === "text-sm" && "text-sm",
          fontSize === "text-sm" && "text-sm",
          fontSize === "text-lg" && "text-lg",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const updatedContent = editor.getHTML().replace(/<p>\s*<\/p>$/, "");
      onContentChange?.(updatedContent);
    },
  });

  // Handle KaTeX preview rendering
  useEffect(() => {
    if (previewRef.current && latexInput) {
      try {
        katex.render(latexInput, previewRef.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (error) {
        // If there's an error, show the raw input
        if (previewRef.current) {
          previewRef.current.textContent = "Invalid LaTeX";
        }
      }
    } else if (previewRef.current) {
      previewRef.current.textContent = "Preview will appear here";
    }
  }, [latexInput]);

  const handleInsertMath = () => {
    if (editor && latexInput.trim()) {
      if (editingPos !== null) {
        // Update existing math node
        editor
          .chain()
          .setNodeSelection(editingPos)
          .updateInlineMath({ latex: latexInput })
          .focus()
          .run();
      } else {
        // Insert new math node
        editor.commands.insertInlineMath({ latex: latexInput });
      }

      setLatexInput("");
      setEditingPos(null);
      setIsPopoverOpen(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col rounded-lg border border-input", className)}
      {...props}
    >
      {/* Toolbar */}
      <div
        className={`flex flex-row overflow-auto border-b bg-muted/30 ${!isEdit && "hidden"}`}
      >
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().undo().run();
          }}
          variant={editor?.isActive("undo") ? "default" : "ghost"}
        >
          <LuUndo className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().redo().run();
          }}
          variant={editor?.isActive("redo") ? "default" : "ghost"}
        >
          <LuRedo className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleBold().run();
          }}
          variant={editor?.isActive("bold") ? "default" : "ghost"}
        >
          <LuBold className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleItalic().run();
          }}
          variant={editor?.isActive("italic") ? "default" : "ghost"}
        >
          <LuItalic className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleStrike().run();
          }}
          variant={editor?.isActive("strike") ? "default" : "ghost"}
        >
          <LuStrikethrough className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleUnderline().run();
          }}
          variant={editor?.isActive("underline") ? "default" : "ghost"}
        >
          <LuUnderline className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().setTextAlign("left").run();
          }}
          variant={
            editor?.isActive({ textAlign: "left" }) ? "default" : "ghost"
          }
        >
          <LuAlignLeft className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().setTextAlign("center").run();
          }}
          variant={
            editor?.isActive({ textAlign: "center" }) ? "default" : "ghost"
          }
        >
          <LuAlignCenter className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().setTextAlign("right").run();
          }}
          variant={
            editor?.isActive({ textAlign: "right" }) ? "default" : "ghost"
          }
        >
          <LuAlignLeft className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().setTextAlign("justify").run();
          }}
          variant={
            editor?.isActive({ textAlign: "justify" }) ? "default" : "ghost"
          }
        >
          <LuAlignJustify className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          variant={
            editor?.isActive("heading", { level: 1 }) ? "default" : "ghost"
          }
        >
          <LuHeading1 className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          variant={
            editor?.isActive("heading", { level: 2 }) ? "default" : "ghost"
          }
        >
          <LuHeading2 className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          variant={
            editor?.isActive("heading", { level: 3 }) ? "default" : "ghost"
          }
        >
          <LuHeading3 className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleBulletList().run();
          }}
          variant={editor?.isActive("bulletList") ? "default" : "ghost"}
        >
          <LuList className="size-4" />
        </Button>
        <Button
          className="h-9 w-9 rounded-none border-r"
          type="button"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleOrderedList().run();
          }}
          variant={editor?.isActive("orderedList") ? "default" : "ghost"}
        >
          <LuListOrdered className="size-4" />
        </Button>
        <Popover
          open={isPopoverOpen}
          onOpenChange={(open) => {
            setIsPopoverOpen(open);
            if (!open) {
              setEditingPos(null);
              setLatexInput("");
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              className="h-9 w-9 rounded-none border-r"
              type="button"
              size="sm"
              variant={editor?.isActive("math") ? "default" : "ghost"}
            >
              ∑
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="latex-input">LaTeX Formula</Label>
                <Input
                  id="latex-input"
                  placeholder="e.g., x^2 + y^2 = z^2"
                  value={latexInput}
                  onChange={(e) => setLatexInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInsertMath();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Live Preview</Label>
                <div
                  ref={previewRef}
                  className="min-h-[60px] rounded-md border border-input bg-muted/30 p-3 text-center"
                >
                  Preview will appear here
                </div>
              </div>
              <Button
                onClick={handleInsertMath}
                className="w-full"
                disabled={!latexInput.trim()}
              >
                Insert Formula
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Content */}
      <div className="min-h-[150px] w-full">
        <EditorContent editor={editor} className="h-full w-full" />
      </div>
    </div>
  );
}
