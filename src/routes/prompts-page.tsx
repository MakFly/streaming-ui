import { useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { DocsPage } from '@/components/docs/docs-page';
import { PROMPT_POINTS, PromptSample } from '@/components/prompt-sample';
import { paths } from '@/lib/paths';
import { PROMPTS, applyHead } from '@/seo/routes';

/* `/prompts`: what a rebuild prompt is, what it carries, and where each kind lives (every response, template and
 * component page has its own Prompt button). */

const WHERE = [
  { label: 'Responses', text: 'The Prompt button on every card and demo page.', to: paths.gallery(), icon: 'sparkling-line' },
  { label: 'Templates', text: 'Copy prompt on every template page, or download it as .md.', to: paths.templates(), icon: 'robot-2-line' },
  { label: 'Composers', text: 'One prompt per composer, next to its Install button.', to: paths.composers(), icon: 'quill-pen-line' },
  { label: 'Model Picker', text: 'The picker with its effort slider and fast mode.', to: paths.modelPicker(), icon: 'cpu-line' },
  { label: 'Agent Limits Card', text: 'The card and the context ring that opens it.', to: paths.agentLimits(), icon: 'pie-chart-line' },
];

export function PromptsPage() {
  useEffect(() => {
    applyHead(PROMPTS);
  }, []);

  return (
    <DocsPage
      title="Rebuild prompts"
      description="Every piece here comes with a Markdown brief an agent can follow without guessing, so the copy comes out identical instead of inspired."
      actions={
        <Button asChild variant="primary" className="px-3">
          <Link to={paths.galleryPrompt('stream-streaming-response')}>Open a prompt</Link>
        </Button>
      }
      sections={[
        {
          id: 'example',
          title: 'Example',
          lead: 'The opening of the Web Search prompt.',
          children: <PromptSample />,
        },
        {
          id: 'contents',
          title: "What's inside",
          children: (
            <ul className="flex flex-col gap-2.5">
              {PROMPT_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-body-regular text-text-primary">
                  <span className="grid size-5 place-items-center rounded-full bg-badge-new-background text-badge-new-text">
                    <Icon name="check-line" className="size-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          ),
        },
        {
          id: 'where',
          title: 'Where to find them',
          children: (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {WHERE.map((w) => (
                <li key={w.label}>
                  <Link
                    to={w.to}
                    className="group flex items-start gap-3 rounded-2xl border border-border-button-default bg-background-primary-default p-4 outline-none transition-colors hover:border-border-button-hover hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                  >
                    <Icon name={w.icon} className="mt-0.5 size-4 text-foreground-icon-secondary" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-body-medium text-text-primary">{w.label}</span>
                      <span className="text-body-2-regular text-text-secondary">{w.text}</span>
                    </span>
                    <Icon name="arrow-right-s-line" className="size-4 self-center text-foreground-icon-tertiary transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </Link>
                </li>
              ))}
            </ul>
          ),
        },
      ]}
    />
  );
}
