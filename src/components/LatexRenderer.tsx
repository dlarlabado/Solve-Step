import React, { useMemo } from "react";
import katex from "katex";

interface LatexRendererProps {
  content: string;
  block?: boolean;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({
  content,
  block = false,
  className = "",
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return "";

    // If explicit block is requested and the content doesn't contain surrounding markdown delimiters,
    // render it directly as display math
    if (block && !content.includes("$") && !content.includes("\\(") && !content.includes("\\[")) {
      try {
        return katex.renderToString(content, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
      } catch (err) {
        console.warn("KaTeX render error:", err);
        return `<span class="font-mono text-emerald-400">${escapeHtml(content)}</span>`;
      }
    }

    // Process mixed content with $$...$$ (display math) and $...$ (inline math)
    try {
      // First, replace $$...$$ or \[...\] display math
      let text = content;

      // Replace \[...\] with $$...$$
      text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$${math}$$`);
      // Replace \(...\) with $...$
      text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`);

      // Pattern to split by math delimiters
      const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g);

      return parts
        .map((part) => {
          if (part.startsWith("$$") && part.endsWith("$$")) {
            const math = part.slice(2, -2).trim();
            try {
              return katex.renderToString(math, {
                displayMode: true,
                throwOnError: false,
                strict: false,
              });
            } catch {
              return `<div class="p-2 my-2 bg-slate-900/60 rounded font-mono text-emerald-400">${escapeHtml(math)}</div>`;
            }
          } else if (part.startsWith("$") && part.endsWith("$")) {
            const math = part.slice(1, -1).trim();
            try {
              return katex.renderToString(math, {
                displayMode: false,
                throwOnError: false,
                strict: false,
              });
            } catch {
              return `<span class="font-mono text-emerald-400">${escapeHtml(math)}</span>`;
            }
          } else {
            // Escape regular text and preserve linebreaks
            return escapeHtml(part).replace(/\n/g, "<br />");
          }
        })
        .join("");
    } catch (err) {
      console.warn("Mixed KaTeX parse error:", err);
      return escapeHtml(content);
    }
  }, [content, block]);

  return (
    <div
      className={`katex-wrapper inline-block max-w-full leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
