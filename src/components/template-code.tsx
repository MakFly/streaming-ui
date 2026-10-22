import { useEffect, useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { cn } from '@/lib/utils';

hljs.registerLanguage('typescript', typescript);

const SOURCES = import.meta.glob(['../templates/kit/*.{ts,tsx}', '../templates/*.tsx'], { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

/** "Code" tab of a template page: the template file and the shared chat kit, highlighted. Lazy-loaded. */
export default function TemplateCode({ file }: { file: string }) {
  const files = useMemo(() => [`../templates/${file}`, '../templates/kit/engine.ts', '../templates/kit/parts.tsx', '../templates/kit/markdown.tsx'], [file]);
  const [active, setActive] = useState(files[0]);
  const [code, setCode] = useState('');

  useEffect(() => setActive(files[0]), [files]);
  useEffect(() => {
    let alive = true;
    setCode('');
    SOURCES[active]?.().then((c) => alive && setCode(c));
    return () => {
      alive = false;
    };
  }, [active]);

  const html = useMemo(() => (code ? hljs.highlight(code, { language: 'typescript', ignoreIllegals: true }).value : ''), [code]);

  return (
    <div className="overflow-hidden rounded-[22px] border border-border-button-default bg-docs-code-background">
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-separator-border p-1.5">
        {files.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActive(f)}
            className={cn('shrink-0 rounded-lg px-2.5 py-1 font-mono text-caption-1-medium transition-colors', f === active ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary')}
          >
            {f.replace('../templates/', '')}
          </button>
        ))}
      </div>
      <pre className="scrollbar-thin h-[720px] overflow-auto p-4 text-[12.5px] leading-5">
        {code ? <code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: html }} /> : <span className="text-text-tertiary">Loading…</span>}
      </pre>
    </div>
  );
}
