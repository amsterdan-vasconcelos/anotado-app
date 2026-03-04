"use client";

import type { Editor } from "@tiptap/core";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  Palette,
  Quote,
  Strikethrough,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Markdown } from "tiptap-markdown";
import {
  createSlashExtension,
  defaultSlashMenuState,
  type SlashCommandItem,
  type SlashMenuState,
} from "../utils/command";
import { CodeBlockComponent } from "./CodeBlockComponent";
import { SlashCommandMenu } from "./SlashCommandMenu";

const lowlight = createLowlight(common);

const PREDEFINED_COLORS = [
  "#000000",
  "#4B5563",
  "#9CA3AF",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#F43F5E",
];

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
}

function useSlashCommand() {
  const [slashMenu, setSlashMenu] = useState<SlashMenuState>(
    defaultSlashMenuState,
  );

  const slashMenuRef = useRef<SlashMenuState>(defaultSlashMenuState);

  const slashCallbacksRef = useRef({
    onOpen: (
      _position: { top: number; left: number },
      _executeCommand: (item: SlashCommandItem) => void,
    ) => {},
    onUpdate: (_query: string, _items: SlashCommandItem[]) => {},
    onClose: () => {},
    onMoveDown: () => {},
    onMoveUp: () => {},
    onSelect: () => {},
  });

  const updateSlashMenu = useCallback(
    (updater: (prev: SlashMenuState) => SlashMenuState) => {
      setSlashMenu((prev) => {
        const next = updater(prev);
        slashMenuRef.current = next;
        return next;
      });
    },
    [],
  );

  slashCallbacksRef.current = {
    onOpen: (position, executeCommand) => {
      updateSlashMenu((prev) => ({
        ...prev,
        open: true,
        position,
        executeCommand,
        selectedIndex: 0,
      }));
    },
    onUpdate: (query, items) => {
      updateSlashMenu((prev) => ({
        ...prev,
        query,
        items,
        selectedIndex: 0,
      }));
    },
    onClose: () => {
      updateSlashMenu(() => defaultSlashMenuState);
    },
    onMoveDown: () => {
      updateSlashMenu((prev) => ({
        ...prev,
        selectedIndex:
          prev.items.length > 0
            ? (prev.selectedIndex + 1) % prev.items.length
            : 0,
      }));
    },
    onMoveUp: () => {
      updateSlashMenu((prev) => ({
        ...prev,
        selectedIndex:
          prev.items.length > 0
            ? (prev.selectedIndex - 1 + prev.items.length) % prev.items.length
            : 0,
      }));
    },
    onSelect: () => {
      const current = slashMenuRef.current;
      if (!current.open || current.items.length === 0) return;
      const item = current.items[current.selectedIndex];
      if (item && current.executeCommand) {
        current.executeCommand(item);
      }
      updateSlashMenu(() => defaultSlashMenuState);
    },
  };

  const slashExtension = useMemo(
    () => createSlashExtension(slashCallbacksRef),
    [],
  );

  const handleExecuteCommand = useCallback(
    (item: SlashCommandItem) => {
      if (slashMenu.executeCommand) {
        slashMenu.executeCommand(item);
      }
      updateSlashMenu(() => defaultSlashMenuState);
    },
    [slashMenu, updateSlashMenu],
  );

  const handleSelectIndex = useCallback(
    (index: number) => {
      updateSlashMenu((prev) => ({ ...prev, selectedIndex: index }));
    },
    [updateSlashMenu],
  );

  return {
    slashMenu,
    slashExtension,
    handleExecuteCommand,
    handleSelectIndex,
  };
}

function ToolbarButton({
  isActive,
  onClick,
  title,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const baseClasses =
    "p-1.5 rounded transition-colors hover:bg-accent text-muted-foreground hover:text-accent-foreground flex items-center justify-center";
  const activeClasses = "bg-accent text-foreground";

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`${baseClasses} ${isActive ? activeClasses : ""}`}
      title={title}
    >
      {children}
    </button>
  );
}

function ColorPickerDropdown({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentColor = editor.getAttributes("textStyle").color || "#000000";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorSelect = useCallback(
    (color: string) => {
      editor.chain().focus().setColor(color).run();
      setIsOpen(false);
    },
    [editor],
  );

  const handleRemoveColor = useCallback(() => {
    editor.chain().focus().unsetColor().run();
    setIsOpen(false);
  }, [editor]);

  return (
    <div className="relative flex items-center justify-center">
      <button
        ref={buttonRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        title="Cor do texto"
        className={`p-1.5 rounded transition-colors hover:bg-accent text-muted-foreground hover:text-accent-foreground flex items-center justify-center ${
          isOpen ? "bg-accent text-foreground" : ""
        }`}
      >
        <Palette
          size={15}
          color={editor.isActive("textStyle") ? currentColor : "currentColor"}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-card border border-border rounded-lg shadow-xl z-50 w-48"
        >
          <div className="grid grid-cols-5 gap-1.5">
            {PREDEFINED_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className="w-6 h-6 rounded border border-border flex items-center justify-center hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              >
                {currentColor.toLowerCase() === color.toLowerCase() && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      color === "#FFFFFF" ? "bg-black" : "bg-white"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleRemoveColor}
            className="mt-2 w-full px-2 py-1.5 bg-secondary text-secondary-foreground hover:bg-accent rounded transition-colors font-medium"
          >
            Remover cor
          </button>
        </div>
      )}
    </div>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-4 bg-border mx-0.5" />;
}

function EditorBubbleMenu({
  editor,
  onSetLink,
}: {
  editor: Editor;
  onSetLink: () => void;
}) {
  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top-start" }}
      shouldShow={({ editor: e, state }) => {
        const { selection } = state;
        if (selection.empty) return false;
        if (e.isActive("codeBlock")) return false;
        return true;
      }}
    >
      <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-md p-1">
        <ToolbarButton
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrito (Ctrl+B)"
        >
          <Bold size={15} />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={15} />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Tachado"
        >
          <Strikethrough size={15} />
        </ToolbarButton>

        <ColorPickerDropdown editor={editor} />

        <ToolbarButton
          isActive={editor.isActive("link")}
          onClick={onSetLink}
          title="Adicionar Link"
        >
          <LinkIcon size={15} />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Código inline"
        >
          <Code size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Título 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Título 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Título 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citação"
        >
          <Quote size={15} />
        </ToolbarButton>
      </div>
    </BubbleMenu>
  );
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Escreva aqui... use / para inserir elementos",
  className,
  contentClassName,
}: TipTapEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { slashMenu, slashExtension, handleExecuteCommand, handleSelectIndex } =
    useSlashCommand();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 cursor-pointer",
        },
      }),
      CodeBlockLowlight.configure({ lowlight }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({ placeholder }),
      slashExtension,
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      const storage = ed.storage as unknown as {
        markdown: { getMarkdown: () => string };
      };
      onChangeRef.current(storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class:
          contentClassName ??
          "outline-none min-h-96 prose prose-invert max-w-none px-6 py-4 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div
      className={
        className ??
        "relative border border-border rounded-lg focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 bg-card"
      }
    >
      {editor && <EditorBubbleMenu editor={editor} onSetLink={setLink} />}

      <EditorContent editor={editor} />

      <SlashCommandMenu
        state={slashMenu}
        onSelectIndex={handleSelectIndex}
        onExecute={handleExecuteCommand}
      />
    </div>
  );
}
