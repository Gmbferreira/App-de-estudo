import { useMemo } from 'react';
import { renderInlineMarkdown, renderMarkdown } from '../lib/markdown';

interface Props {
  text: string;
  inline?: boolean;
  className?: string;
}

export default function Markdown({ text, inline = false, className = '' }: Props) {
  const html = useMemo(
    () => (inline ? renderInlineMarkdown(text) : renderMarkdown(text)),
    [text, inline],
  );
  const Tag = inline ? 'span' : 'div';
  return <Tag className={`md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
