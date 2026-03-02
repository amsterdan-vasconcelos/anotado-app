"use client";

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
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
} from "../util/command";
import { CodeBlockComponent } from "./CodeBlockComponent";
import { SlashCommandMenu } from "./SlashCommandMenu";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Escreva aqui... use / para inserir elementos",
  className,
  contentClassName,
}: TipTapEditorProps) {
  // ─── Stale-closure fix: sempre chama a versão mais recente de onChange ─────
  // useEditor captura o callback apenas na montagem; ao atualizar o ref a cada
  // render garantimos que o editor sempre use a função atual sem precisar
  // recriar a instância do editor.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // ─── Slash command state ──────────────────────────────────────────────────
  const [slashMenu, setSlashMenu] = useState<SlashMenuState>(
    defaultSlashMenuState,
  );

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

  const slashMenuRef = useRef<SlashMenuState>(defaultSlashMenuState);

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

  // ─── Editor instance ──────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
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
      // Usa o ref para chamar sempre a versão mais recente de onChange,
      // evitando stale closures sem precisar recriar o editor.
      const storage = ed.storage as unknown as {
        markdown: { getMarkdown: () => string };
      };
      onChangeRef.current(storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class:
          contentClassName ??
          "outline-none min-h-96 prose prose-sm max-w-none px-6 py-4 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  // ─── Libera o editor ao desmontar ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  // ─── Slash command handlers ───────────────────────────────────────────────
  function handleExecuteCommand(item: SlashCommandItem) {
    if (slashMenu.executeCommand) {
      slashMenu.executeCommand(item);
    }
    updateSlashMenu(() => defaultSlashMenuState);
  }

  function handleSelectIndex(index: number) {
    updateSlashMenu((prev) => ({ ...prev, selectedIndex: index }));
  }

  // ─── Bubble menu button styles ────────────────────────────────────────────
  const bubbleBtnBase =
    "p-1.5 rounded transition-colors hover:bg-accent text-muted-foreground hover:text-accent-foreground";
  const bubbleBtnActive = "bg-accent text-foreground";

  return (
    <div
      className={
        className ??
        "relative border border-border rounded-lg focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 bg-card"
      }
    >
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "top-start" }}
          shouldShow={({ editor: e, state }) => {
            // Usa o editor e o state vindos dos parâmetros para evitar
            // qualquer problema de closure com a variável externa.
            const { selection } = state;
            if (selection.empty) return false;
            if (e.isActive("codeBlock")) return false;
            return true;
          }}
        >
          <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg shadow-md p-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBold().run();
              }}
              className={`${bubbleBtnBase} ${editor.isActive("bold") ? bubbleBtnActive : ""}`}
              title="Negrito (Ctrl+B)"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleItalic().run();
              }}
              className={`${bubbleBtnBase} ${editor.isActive("italic") ? bubbleBtnActive : ""}`}
              title="Itálico (Ctrl+I)"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleStrike().run();
              }}
              className={`${bubbleBtnBase} ${editor.isActive("strike") ? bubbleBtnActive : ""}`}
              title="Tachado"
            >
              <Strikethrough size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleCode().run();
              }}
              className={`${bubbleBtnBase} ${editor.isActive("code") ? bubbleBtnActive : ""}`}
              title="Código inline"
            >
              <Code size={15} />
            </button>

            <div className="w-px h-4 bg-border mx-0.5" />

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              className={`${bubbleBtnBase} ${editor.isActive("heading", { level: 1 }) ? bubbleBtnActive : ""}`}
              title="Título 1"
            >
              <Heading1 size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }}
              className={`${bubbleBtnBase} ${editor.isActive("heading", { level: 2 }) ? bubbleBtnActive : ""}`}
              title="Título 2"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              className={`${bubbleBtnBase} ${editor.isActive("heading", { level: 3 }) ? bubbleBtnActive : ""}`}
              title="Título 3"
            >
              <Heading3 size={15} />
            </button>

            <div className="w-px h-4 bg-border mx-0.5" />

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBlockquote().run();
              }}
              className={`${bubbleBtnBase} ${editor.isActive("blockquote") ? bubbleBtnActive : ""}`}
              title="Citação"
            >
              <Quote size={15} />
            </button>
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      <SlashCommandMenu
        state={slashMenu}
        onSelectIndex={handleSelectIndex}
        onExecute={handleExecuteCommand}
      />
    </div>
  );
}
