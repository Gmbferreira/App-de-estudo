import { Marked, type TokenizerAndRendererExtension } from 'marked';
import katex from 'katex';
import DOMPurify from 'dompurify';

function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false, output: 'html' });
}

/** $$ ... $$ em linha própria: fórmula em destaque. */
const blockMath: TokenizerAndRendererExtension = {
  name: 'blockMath',
  level: 'block',
  start(src) {
    const m = /(^|\n)\$\$/.exec(src);
    return m ? m.index + m[1].length : undefined;
  },
  tokenizer(src) {
    const m = /^\$\$([\s\S]+?)\$\$[^\S\n]*(?:\n+|$)/.exec(src);
    if (m) return { type: 'blockMath', raw: m[0], text: m[1].trim() };
    return undefined;
  },
  renderer(token) {
    return `<div class="math-block">${renderMath(token.text, true)}</div>\n`;
  },
};

/**
 * $ ... $ no meio do texto. Para não confundir com dinheiro ("R$ 50,00"),
 * o $ de abertura não pode vir seguido de espaço e o de fechamento não pode
 * vir precedido de espaço nem seguido de dígito.
 */
const inlineMath: TokenizerAndRendererExtension = {
  name: 'inlineMath',
  level: 'inline',
  start(src) {
    const m = /(?<!\\)\$/.exec(src);
    return m ? m.index : undefined;
  },
  tokenizer(src) {
    const display = /^\$\$(?!\$)([\s\S]+?)\$\$/.exec(src);
    if (display) {
      return { type: 'inlineMath', raw: display[0], text: display[1].trim(), display: true };
    }
    const inline = /^\$(?![\s$])((?:\\[\s\S]|[^\\\n$])+?)(?<!\s)\$(?!\d)/.exec(src);
    if (inline) return { type: 'inlineMath', raw: inline[0], text: inline[1], display: false };
    return undefined;
  },
  renderer(token) {
    return renderMath(token.text, Boolean(token.display));
  },
};

const marked = new Marked({ gfm: true, breaks: true });
marked.use({ extensions: [blockMath, inlineMath] });

export function renderMarkdown(src: string): string {
  return DOMPurify.sanitize(marked.parse(src, { async: false }) as string);
}

export function renderInlineMarkdown(src: string): string {
  return DOMPurify.sanitize(marked.parseInline(src, { async: false }) as string);
}
