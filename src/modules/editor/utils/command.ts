import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Quote,
  Type,
} from "lucide-react";
import type { ComponentType } from "react";

export interface SlashCommandItem {
  title: string;
  description: string;
  keywords: string[];
  icon: ComponentType<{ size?: number; className?: string }>;
  command: (props: { editor: any; range: any }) => void;
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: "Texto",
    description: "Parágrafo normal",
    keywords: ["texto", "paragrafo", "normal", "p"],
    icon: Type,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Título 1",
    description: "Título grande",
    keywords: ["h1", "titulo", "heading", "grande"],
    icon: Heading1,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Título 2",
    description: "Título médio",
    keywords: ["h2", "subtitulo", "heading", "medio"],
    icon: Heading2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Título 3",
    description: "Título pequeno",
    keywords: ["h3", "secao", "heading", "pequeno"],
    icon: Heading3,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Lista",
    description: "Lista com marcadores",
    keywords: ["lista", "bullet", "ul", "marcadores"],
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Lista Numerada",
    description: "Lista ordenada com números",
    keywords: ["numerada", "ordenada", "ol", "numeros"],
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Bloco de Código",
    description: "Bloco de código com destaque",
    keywords: ["codigo", "code", "bloco", "pre"],
    icon: Code,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Citação",
    description: "Bloco de citação",
    keywords: ["citacao", "quote", "blockquote"],
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Divisor",
    description: "Linha horizontal divisória",
    keywords: ["divisor", "hr", "linha", "separador"],
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

export interface SlashMenuState {
  open: boolean;
  query: string;
  selectedIndex: number;
  position: { top: number; left: number };
  items: SlashCommandItem[];
  executeCommand: ((item: SlashCommandItem) => void) | null;
}

export const defaultSlashMenuState: SlashMenuState = {
  open: false,
  query: "",
  selectedIndex: 0,
  position: { top: 0, left: 0 },
  items: SLASH_COMMANDS,
  executeCommand: null,
};

export function filterCommands(query: string): SlashCommandItem[] {
  if (!query) return SLASH_COMMANDS;
  const lower = query.toLowerCase();
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(lower) ||
      cmd.keywords.some((k) => k.includes(lower)),
  );
}

export function createSlashExtension(
  stateRef: React.RefObject<{
    onOpen: (
      position: { top: number; left: number },
      executeCommand: (item: SlashCommandItem) => void,
    ) => void;
    onUpdate: (query: string, items: SlashCommandItem[]) => void;
    onClose: () => void;
    onMoveDown: () => void;
    onMoveUp: () => void;
    onSelect: () => void;
  }>,
) {
  return Extension.create({
    name: "slashCommands",

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: "/",
          allowSpaces: false,
          startOfLine: false,

          command: ({ editor, range, props }) => {
            props.command({ editor, range });
          },

          items: ({ query }) => filterCommands(query),

          render: () => {
            return {
              onStart: (props) => {
                const rect = props.clientRect?.();
                if (!rect) return;

                const position = {
                  top: rect.bottom + 4,
                  left: rect.left,
                };

                const executeCommand = (item: SlashCommandItem) => {
                  item.command({ editor: props.editor, range: props.range });
                };

                stateRef.current.onOpen(position, executeCommand);
                stateRef.current.onUpdate(
                  props.query,
                  filterCommands(props.query),
                );
              },

              onUpdate: (props) => {
                const rect = props.clientRect?.();
                if (rect) {
                  const position = {
                    top: rect.bottom + 4,
                    left: rect.left,
                  };
                  const executeCommand = (item: SlashCommandItem) => {
                    item.command({ editor: props.editor, range: props.range });
                  };
                  stateRef.current.onOpen(position, executeCommand);
                }
                stateRef.current.onUpdate(
                  props.query,
                  filterCommands(props.query),
                );
              },

              onExit: () => {
                stateRef.current.onClose();
              },

              onKeyDown: ({ event }) => {
                if (event.key === "ArrowDown") {
                  stateRef.current.onMoveDown();
                  return true;
                }
                if (event.key === "ArrowUp") {
                  stateRef.current.onMoveUp();
                  return true;
                }
                if (event.key === "Enter") {
                  stateRef.current.onSelect();
                  return true;
                }
                if (event.key === "Escape") {
                  stateRef.current.onClose();
                  return true;
                }
                return false;
              },
            };
          },
        }),
      ];
    },
  });
}
