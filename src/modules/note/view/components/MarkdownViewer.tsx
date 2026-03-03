"use client";

import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { common, createLowlight } from "lowlight";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

const lowlight = createLowlight(common);

function HighlightedCode({ lang, code }: { lang: string; code: string }) {
  try {
    const tree = lowlight.highlight(lang, code);
    const content = toJsxRuntime(tree, {
      Fragment,
      jsx: jsx as any,
      jsxs: jsxs as any,
    });
    return (
      <div className="code-viewer-wrapper">
        <div className="code-viewer-header">
          <span className="text-xs font-mono font-medium text-stone-500">
            {lang}
          </span>
        </div>
        <pre>
          <code className={`hljs language-${lang}`}>{content}</code>
        </pre>
      </div>
    );
  } catch {
    return (
      <div className="code-viewer-wrapper">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    );
  }
}

const components: Components = {
  pre({ children }) {
    // O wrapper <pre> padrão é substituído pelo nosso code-viewer-wrapper
    return <>{children}</>;
  },
  code({ className, children }) {
    const lang = /language-(\w+)/.exec(className || "")?.[1];
    const code = String(children).replace(/\n$/, "");

    if (lang) {
      return <HighlightedCode lang={lang} code={code} />;
    }

    if (className) {
      // Bloco sem linguagem definida
      return (
        <div className="code-viewer-wrapper">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    // Código inline
    return <code className="note-inline-code">{children}</code>;
  },
};

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="note-content prose prose-sm max-w-none">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
