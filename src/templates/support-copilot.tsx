import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCheck, CircleCheck, CornerDownLeft, CreditCard, ListFilter, Lock, Mail, Paperclip, RefreshCw, Send, Sparkles, Tag, UserRound, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copyOf, defineCopy, useCopy } from './kit/i18n';
import { useChatEngine, type ChatScriptApi, type Part } from './kit/engine';
import { CopyButton } from './kit/markdown';
import { AssistantMessage, Avatar, Badge, Canvas, ChatSurface, Composer, Frame, FrameFooter, FrameHeader, FramePanel, HeaderButton, IconButton, Surface, HeaderTools, UserMessage, paneIn, textOf } from './kit/parts';

/* Support Copilot — a help desk in three rounded cards: inbox, the customer thread (message bubbles
 * with bottom-anchored avatars) and the copilot. The copilot reads the ticket, checks billing and the help
 * center, then drafts a reply in a frame you can insert, shorten and send. */

const TICKETS = [
  { name: 'Maya Chen', priority: 'urgent', unread: true },
  { name: 'Jonas Weber', priority: 'high', unread: true },
  { name: 'Priya Nair', priority: 'normal', unread: false },
  { name: 'Lucas Martin', priority: 'normal', unread: false },
  { name: 'Sara Ali', priority: 'low', unread: false },
] as const;

const PRIORITY = {
  urgent: 'danger',
  high: 'warning',
  normal: 'neutral',
  low: 'neutral',
} as const;

type Thread = { from: 'customer' | 'agent'; text: string; time: string };

const COPY = defineCopy({
  en: {
    inbox: 'Inbox',
    filter: 'Filter',
    filters: { open: 'Open', mine: 'Mine', urgent: 'Urgent' },
    tickets: [
      { subject: 'Charged twice for the Pro plan', preview: 'Hi, I just noticed two charges of $24…', time: '2m' },
      { subject: 'SSO login loops back to sign-in', preview: 'Every time I sign in with Okta it…', time: '18m' },
      { subject: 'Export to CSV is missing columns', preview: 'The export only has 6 of the 9…', time: '1h' },
      { subject: 'Can I move seats between teams?', preview: 'We are reorganising and would like…', time: '3h' },
      { subject: 'Invoice needs our VAT number', preview: 'Could you re-issue the March invoice…', time: '5h' },
    ],
    priorities: { urgent: 'Urgent', high: 'High', normal: 'Normal', low: 'Low' },
    thread: [
      'Hi, I just noticed two charges of $24 on my card for the Pro plan this morning. I only have one workspace. Can you refund the duplicate?',
      'The second one says "ACME* PRO 7731". Screenshot attached.',
    ],
    draft: `Hi Maya, thanks for the screenshot. You're right: the upgrade retried after a card timeout and created a second charge of $24. I've refunded the duplicate (ref. RF-7731); it will show on your statement within 5–10 business days. Your Pro plan stays active and nothing else changes. Sorry for the hassle!`,
    now: 'now',
    today: 'Today',
    you: 'You',
    delivered: 'Delivered',
    planLabel: 'Plan',
    planValue: 'Pro · monthly',
    customerSince: 'Customer since',
    customerSinceValue: 'Mar 2023',
    lifetimeValue: 'Lifetime value',
    lifetimeValueValue: '$1,152',
    thanks: 'That was fast, thank you! 🙏',
    suggestedReply: 'Suggested reply',
    writing: 'Writing…',
    ready: 'Ready',
    insert: 'Insert',
    shorter: 'Shorter',
    shorterAsk: 'Make it shorter and friendlier',
    fromHelpCenter: 'From the help center',
    subject: 'Charged twice for the Pro plan',
    ticketMeta: 'Maya Chen · #4821 · via email',
    resolved: 'Resolved',
    urgentBadge: 'Urgent',
    reopen: 'Reopen',
    resolve: 'Resolve',
    copilot: 'Copilot',
    reply: 'Reply',
    note: 'Internal note',
    to: 'to maya.chen@lumen.io',
    replyPlaceholder: 'Write a reply, or insert the copilot draft',
    notePlaceholder: 'Only your team sees internal notes',
    attach: 'Attach file',
    askCopilot: 'Ask Copilot',
    send: 'Send',
    sendTitle: (keys: string) => `Send (${keys})`,
    backToTicket: 'Back to ticket',
    ticketBadge: 'Ticket #4821',
    askPlaceholder: 'Ask Copilot',
    toolBilling: 'Checked billing',
    toolHelp: 'Searched help center',
    billingMeta: '2 charges · 1 retry',
    helpQuery: 'duplicate charge refund',
    helpMeta: '3 articles',
    reading: 'Reading the conversation',
    readingSteps: ['Customer reports a duplicate $24 charge', 'One workspace, one Pro subscription'],
    summary: `**Summary** — Maya was charged twice ($24) when her Pro upgrade retried after a card timeout. One subscription is active, so the second charge is a duplicate.

**Suggested action** — refund charge \`ch_7731\` and reply with the refund reference.`,
    kb: ['Refunding a duplicate charge', 'Why payments are retried', 'Refund timelines by bank'],
    thinking: 'Thinking',
    checking: 'Checking the ticket and billing history',
    shorterReply: `Shorter version:\n\n> Hi Maya, sorry about that! The duplicate $24 charge is refunded (RF-7731) and should appear in 5–10 business days.`,
    found: (q: string) => `Here's what I found for **${q}**: the account has one active Pro subscription, no other open tickets, and a 4.8 CSAT history. Nothing blocks the refund.`,
  },
  fr: {
    inbox: 'Boîte de réception',
    filter: 'Filtrer',
    filters: { open: 'Ouverts', mine: 'Les miens', urgent: 'Urgents' },
    tickets: [
      { subject: 'Prélevée deux fois pour l’offre Pro', preview: 'Bonjour, je viens de remarquer deux prélèvements de 24 $…', time: '2 min' },
      { subject: 'La connexion SSO boucle sur la page de connexion', preview: 'À chaque connexion avec Okta, je…', time: '18 min' },
      { subject: 'L’export CSV n’a pas toutes les colonnes', preview: 'L’export ne contient que 6 des 9…', time: '1 h' },
      { subject: 'Peut-on déplacer des licences d’une équipe à l’autre ?', preview: 'Nous réorganisons nos équipes et souhaiterions…', time: '3 h' },
      { subject: 'La facture doit mentionner notre numéro de TVA', preview: 'Pourriez-vous rééditer la facture de mars…', time: '5 h' },
    ],
    priorities: { urgent: 'Urgent', high: 'Élevée', normal: 'Normale', low: 'Basse' },
    thread: [
      'Bonjour, je viens de remarquer deux prélèvements de 24 $ sur ma carte pour l’offre Pro ce matin. Je n’ai qu’un seul espace de travail. Pouvez-vous rembourser le doublon ?',
      'Le second indique « ACME* PRO 7731 ». Capture d’écran jointe.',
    ],
    draft: `Bonjour Maya, merci pour la capture d’écran. Vous avez raison : la mise à niveau a été relancée après un délai d’expiration de la carte et a créé un second prélèvement de 24 $. J’ai remboursé le doublon (réf. RF-7731) ; il apparaîtra sur votre relevé sous 5 à 10 jours ouvrés. Votre offre Pro reste active et rien d’autre ne change. Désolé pour le désagrément !`,
    now: 'à l’instant',
    today: 'Aujourd’hui',
    you: 'Vous',
    delivered: 'Distribué',
    planLabel: 'Offre',
    planValue: 'Pro · mensuel',
    customerSince: 'Client depuis',
    customerSinceValue: 'mars 2023',
    lifetimeValue: 'Valeur vie client',
    lifetimeValueValue: '1 152 $',
    thanks: 'Quelle rapidité, merci beaucoup ! 🙏',
    suggestedReply: 'Réponse suggérée',
    writing: 'Rédaction…',
    ready: 'Prête',
    insert: 'Insérer',
    shorter: 'Plus court',
    shorterAsk: 'Rends-la plus courte et plus chaleureuse',
    fromHelpCenter: 'Du centre d’aide',
    subject: 'Prélevée deux fois pour l’offre Pro',
    ticketMeta: 'Maya Chen · #4821 · par e-mail',
    resolved: 'Résolu',
    urgentBadge: 'Urgent',
    reopen: 'Rouvrir',
    resolve: 'Résoudre',
    copilot: 'Copilot',
    reply: 'Répondre',
    note: 'Note interne',
    to: 'à maya.chen@lumen.io',
    replyPlaceholder: 'Rédigez une réponse ou insérez le brouillon du copilote',
    notePlaceholder: 'Seule votre équipe voit les notes internes',
    attach: 'Joindre un fichier',
    askCopilot: 'Demander à Copilot',
    send: 'Envoyer',
    sendTitle: (keys: string) => `Envoyer (${keys})`,
    backToTicket: 'Retour au ticket',
    ticketBadge: 'Ticket #4821',
    askPlaceholder: 'Demandez à Copilot',
    toolBilling: 'Facturation vérifiée',
    toolHelp: 'Centre d’aide consulté',
    billingMeta: '2 prélèvements · 1 relance',
    helpQuery: 'remboursement double prélèvement',
    helpMeta: '3 articles',
    reading: 'Lecture de la conversation',
    readingSteps: ['La cliente signale un double prélèvement de 24 $', 'Un seul espace de travail, un seul abonnement Pro'],
    summary: `**Résumé** : Maya a été prélevée deux fois (24 $) quand sa mise à niveau Pro a été relancée après un délai d’expiration de la carte. Un seul abonnement est actif, le second prélèvement est donc un doublon.

**Action suggérée** : rembourser le prélèvement \`ch_7731\` et répondre avec la référence du remboursement.`,
    kb: ['Rembourser un double prélèvement', 'Pourquoi les paiements sont relancés', 'Délais de remboursement selon la banque'],
    thinking: 'Réflexion',
    checking: 'Vérification du ticket et de l’historique de facturation',
    shorterReply: `Version plus courte :\n\n> Bonjour Maya, désolé pour ce souci ! Le doublon de 24 $ est remboursé (RF-7731) et devrait apparaître sous 5 à 10 jours ouvrés.`,
    found: (q: string) => `Voici ce que j’ai trouvé pour **${q}** : le compte a un abonnement Pro actif, aucun autre ticket ouvert et un historique CSAT de 4,8. Rien ne bloque le remboursement.`,
  },
});

async function intro(api: ChatScriptApi) {
  const t = copyOf(COPY);
  await api.sleep(700);
  const a = api.assistant();
  await a.think(t.reading, t.readingSteps, 550);
  await a.tool(t.toolBilling, 'maya.chen@lumen.io', { ms: 900, meta: t.billingMeta });
  await a.tool(t.toolHelp, t.helpQuery, { ms: 800, meta: t.helpMeta });
  await a.stream(t.summary, 30);
  const setDraft = a.custom('draft', { text: t.draft, shown: 0 });
  for (let i = 0; i <= t.draft.length; i += 6) {
    setDraft({ shown: i });
    await api.sleep(30);
  }
  setDraft({ shown: t.draft.length, done: true });
  a.custom('kb', { items: t.kb });
  a.done();
}

async function reply(api: ChatScriptApi, text: string) {
  const t = copyOf(COPY);
  const a = api.assistant();
  await a.think(t.thinking, [t.checking], 600);
  await a.stream(/tone|short|shorter|friend|court|raccourci|chaleureu|sympa|amical/i.test(text) ? t.shorterReply : t.found(text.replace(/[*`]/g, '')), 30);
  a.done();
}

function Inbox({ onPick }: { onPick?: () => void }) {
  const t = useCopy(COPY);
  const [filter, setFilter] = useState('open');
  return (
    <Surface className="h-full w-[300px] shrink-0">
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <span className="text-headline-semibold">{t.inbox}</span>
        <Badge tone="neutral">12</Badge>
        <IconButton label={t.filter} className="ms-auto">
          <ListFilter />
        </IconButton>
      </div>
      <div className="px-3 pb-2">
        <div role="tablist" className="flex rounded-[10px] bg-background-tertiary-default p-0.5">
          {([['open', 12], ['mine', 5], ['urgent', 1]] as const).map(([f, n]) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn('flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg text-caption-1-medium transition-colors', filter === f ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary')}
            >
              {t.filters[f]} <span className="text-text-tertiary tabular-nums">{n}</span>
            </button>
          ))}
        </div>
      </div>
      <ul className="scrollbar-thin flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {TICKETS.map((tk, n) => ({ tk, n }))
          .filter(({ tk }) => filter !== 'urgent' || tk.priority === 'urgent')
          .map(({ tk, n }, i) => {
          const c = t.tickets[n];
          const on = i === 0;
          return (
            <li key={tk.name}>
              <button
                type="button"
                onClick={onPick}
                className={cn('flex w-full gap-3 rounded-2xl p-2.5 text-start transition-colors', on ? 'bg-background-primary-default shadow-xs' : 'hover:bg-background-secondary-hover')}
              >
                <Avatar label={tk.name} className="size-8" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className={cn('truncate text-body-2-semibold', tk.unread ? 'text-text-primary' : 'text-text-secondary')}>{tk.name}</span>
                    {tk.unread && <span className="size-1.5 shrink-0 rounded-full bg-accent-500" />}
                    <span className="ms-auto shrink-0 text-caption-1-regular text-text-tertiary">{c.time}</span>
                  </span>
                  <span className="truncate text-body-2-medium text-text-primary">{c.subject}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-caption-1-regular text-text-tertiary">{c.preview}</span>
                    {tk.priority !== 'normal' && tk.priority !== 'low' && <Badge tone={PRIORITY[tk.priority]} className="h-[18px] px-1 text-[10.5px]">{t.priorities[tk.priority]}</Badge>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}

/** Marker: a centred label between hairlines. */
const isMac = () => typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.platform);

const Marker = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 text-caption-1-medium text-text-tertiary">
    <span className="h-px flex-1 bg-separator-border" />
    {children}
    <span className="h-px flex-1 bg-separator-border" />
  </div>
);

/** Message + Bubble: avatar anchored to the bottom, the row flips for your own replies. */
function Bubble({ m }: { m: Thread }) {
  const t = useCopy(COPY);
  const mine = m.from === 'agent';
  return (
    <div className={cn('animate-in fade-in-0 slide-in-from-bottom-1 flex items-end gap-2 duration-300', mine && 'flex-row-reverse')}>
      {mine ? <Avatar label="Alex Rivera" className="size-7" color="#0f172a" /> : <Avatar label="Maya Chen" className="size-7" />}
      <div className={cn('flex max-w-[80%] flex-col gap-1', mine && 'items-end')}>
        <span className="px-1 text-caption-1-medium text-text-tertiary">
          {mine ? t.you : 'Maya Chen'} · {m.time}
        </span>
        <div className={cn('rounded-2xl px-3.5 py-2.5 text-body-2-regular leading-6', mine ? 'rounded-ee-md bg-accent-500 text-white' : 'rounded-es-md bg-background-primary-default text-text-primary shadow-card')}>{m.text}</div>
        {mine && (
          <span className="flex items-center gap-1 px-1 text-caption-2-regular text-text-tertiary">
            <CheckCheck className="size-3" /> {t.delivered}
          </span>
        )}
      </div>
    </div>
  );
}

function CustomerCard() {
  const t = useCopy(COPY);
  const rows: [React.ReactNode, string, React.ReactNode][] = [
    [<CreditCard key="c" />, t.planLabel, <Badge key="p" tone="purple">{t.planValue}</Badge>],
    [<UserRound key="u" />, t.customerSince, t.customerSinceValue],
    [<Tag key="t" />, t.lifetimeValue, t.lifetimeValueValue],
  ];
  return (
    <Frame className="tpl-reveal">
      <FrameHeader icon={<UserRound />} title="Maya Chen">
        <span className="text-caption-1-regular text-text-tertiary">Lumen</span>
      </FrameHeader>
      <FramePanel>
        <dl className="flex flex-col divide-y divide-separator-border">
          {rows.map(([icon, k, v]) => (
            <div key={k} className="flex items-center gap-2 px-3 py-2 text-body-2-regular">
              <span className="text-foreground-icon-tertiary [&_svg]:size-3.5">{icon}</span>
              <dt className="text-text-secondary">{k}</dt>
              <dd className="ms-auto text-text-primary tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </FramePanel>
    </Frame>
  );
}

export default function SupportCopilotTemplate() {
  const t = useCopy(COPY);
  const copilot = useChatEngine({ intro, reply });
  const [thread, setThread] = useState<Thread[]>(() => t.thread.map((text, i) => ({ from: 'customer', text, time: i ? '9:42' : '9:41' })));
  const [replyText, setReplyText] = useState('');
  const [mode, setMode] = useState<'reply' | 'note'>('reply');
  const [pane, setPane] = useState<'ticket' | 'copilot'>('ticket');
  const [resolved, setResolved] = useState(false);

  // After the agent sends, the customer answers (a small touch that closes the loop).
  useEffect(() => {
    if (thread[thread.length - 1]?.from !== 'agent') return;
    const id = setTimeout(() => setThread((prev) => [...prev, { from: 'customer', text: t.thanks, time: t.now }]), 2200);
    return () => clearTimeout(id);
  }, [thread]);

  const [sendKeys] = useState(() => (isMac() ? '⌘↵' : 'Ctrl ↵'));
  const send = () => {
    if (!replyText.trim()) return;
    setThread((prev) => [...prev, { from: 'agent', text: replyText.trim(), time: t.now }]);
    setReplyText('');
  };

  const renderCustom = (p: Extract<Part, { kind: 'custom' }>) => {
    if (p.type === 'draft') {
      const text = String(p.data.text);
      const shown = Number(p.data.shown);
      return (
        <Frame>
          <FrameHeader icon={<Wand2 />} title={t.suggestedReply}>
            {!p.data.done ? <Badge tone="info">{t.writing}</Badge> : <Badge tone="success">{t.ready}</Badge>}
          </FrameHeader>
          <FramePanel>
            <p className="px-3 py-2.5 text-body-2-regular leading-6 text-text-primary">
              {text.slice(0, shown)}
            </p>
          </FramePanel>
          {Boolean(p.data.done) && (
            <FrameFooter className="animate-in fade-in-0 duration-300">
              <button
                type="button"
                onClick={() => {
                  setReplyText(text);
                  setMode('reply');
                  setPane('ticket');
                }}
                className="flex h-7 items-center gap-1.5 rounded-lg bg-text-primary px-2.5 text-caption-1-medium text-background-primary-default shadow-xs"
              >
                <CornerDownLeft className="size-3.5" /> {t.insert}
              </button>
              <button type="button" onClick={() => copilot.send(t.shorterAsk)} className="flex h-7 items-center gap-1.5 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 text-caption-1-medium text-text-secondary transition-colors hover:text-text-primary">
                <RefreshCw className="size-3.5" /> {t.shorter}
              </button>
              <CopyButton text={text} className="ms-auto" />
            </FrameFooter>
          )}
        </Frame>
      );
    }
    if (p.type === 'kb')
      return (
        <div className="tpl-reveal flex flex-col gap-1">
          <span className="pb-1 text-caption-1-medium text-text-tertiary">{t.fromHelpCenter}</span>
          {(p.data.items as string[]).map((k) => (
            <a key={k} href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-body-2-regular text-text-secondary transition-colors hover:bg-background-secondary-hover hover:text-text-primary">
              <BookOpen className="size-3.5 shrink-0 text-foreground-icon-tertiary" /> {k}
            </a>
          ))}
        </div>
      );
    return null;
  };

  return (
    <Canvas>
      <aside className="hidden xl:flex">
        <Inbox />
      </aside>

      <ChatSurface
        className={cn(pane === 'copilot' ? 'hidden md:flex' : paneIn.mdStart)}
        dep={thread}
        width="max-w-[680px]"
        header={
          <>
            <Avatar label="Maya Chen" className="size-7" />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-body-2-semibold">{t.subject}</span>
              <span className="truncate text-caption-1-regular text-text-tertiary">{t.ticketMeta}</span>
            </div>
            <span className="ms-auto flex items-center gap-1.5">
              {resolved ? <Badge tone="success" dot>{t.resolved}</Badge> : <Badge tone="danger" dot className="hidden sm:inline-flex">{t.urgentBadge}</Badge>}
              <HeaderTools />
              <HeaderButton outline onClick={() => setResolved((r) => !r)} className="hidden sm:flex">
                <CircleCheck /> {resolved ? t.reopen : t.resolve}
              </HeaderButton>
              <HeaderButton outline onClick={() => setPane('copilot')} className="md:hidden">
                <Sparkles className="text-accent-500" /> {t.copilot}
              </HeaderButton>
            </span>
          </>
        }
        footer={
          <div className="flex flex-col rounded-[22px] border border-border-button-default bg-background-primary-default shadow-xs">
            <div className="flex items-center gap-1 px-2 pt-2">
              {([['reply', t.reply, Mail], ['note', t.note, Lock]] as const).map(([k, l, I]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMode(k)}
                  className={cn('flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-caption-1-medium transition-colors', mode === k ? (k === 'note' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-background-tertiary-default text-text-primary') : 'text-text-tertiary hover:text-text-secondary')}
                >
                  <I className="size-3.5" /> {l}
                </button>
              ))}
              <span className="ms-auto pe-1 text-caption-1-regular text-text-tertiary">{t.to}</span>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              // An email reply: Enter starts a new line, Ctrl/⌘ + Enter sends (as in a help desk).
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={mode === 'reply' ? t.replyPlaceholder : t.notePlaceholder}
              className="scrollbar-thin resize-none bg-transparent px-4 py-2 text-body-2-regular leading-6 text-text-primary outline-none placeholder:text-text-tertiary"
            />
            <div className="flex items-center gap-1 px-2 pb-2">
              <IconButton label={t.attach}>
                <Paperclip />
              </IconButton>
              <button type="button" onClick={() => setPane('copilot')} className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-caption-1-medium text-accent-500 transition-colors hover:bg-accent-500/10">
                <Sparkles className="size-3.5" /> {t.askCopilot}
              </button>
              <button type="button" onClick={send} disabled={!replyText.trim()} title={t.sendTitle(sendKeys)} aria-keyshortcuts={isMac() ? 'Meta+Enter' : 'Control+Enter'} className="ms-auto flex h-8 items-center gap-1.5 rounded-full bg-text-primary ps-3.5 pe-3 text-body-2-medium text-background-primary-default transition-opacity disabled:opacity-30">
                {t.send}
                {/* The shortcut, where there is a keyboard to press it. */}
                <kbd className="hidden rounded-md bg-background-primary-default/15 px-1.5 font-sans text-caption-2-medium text-background-primary-default/75 sm:inline">{sendKeys}</kbd>
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        }
      >
        <Marker>{t.today}</Marker>
        {thread.map((m, i) => (
          <Bubble key={i} m={m} />
        ))}
      </ChatSurface>

      <ChatSurface
        className={cn('md:max-w-[360px] xl:max-w-[380px]', pane === 'copilot' ? cn('flex', paneIn.mdEnd) : 'hidden md:flex')}
        dep={copilot.messages}
        width="max-w-none"
        columnClassName="gap-5 px-3"
        header={
          <>
            <IconButton label={t.backToTicket} onClick={() => setPane('ticket')} className="md:hidden">
              <ArrowLeft />
            </IconButton>
            <span className="grid size-6 place-items-center rounded-lg bg-accent-500/10 text-accent-500">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-headline-medium">{t.copilot}</span>
            <Badge tone="outline" className="ms-auto">
              {t.ticketBadge}
            </Badge>
          </>
        }
        footer={<Composer variant="dock" reply={copilot.replyTo} onClearReply={copilot.clearReply} value={copilot.draft} onChange={copilot.setDraft} onSend={copilot.send} onStop={copilot.stop} busy={copilot.busy} placeholder={t.askPlaceholder} />}
      >
        <CustomerCard />
        {copilot.messages.map((m, i) =>
          m.role === 'user' ? (
            <UserMessage key={m.id} replyTo={m.replyTo}>{textOf(m)}</UserMessage>
          ) : (
            <AssistantMessage
              key={m.id}
              message={m}
              isLast={i === copilot.messages.length - 1}
              renderCustom={renderCustom}
              actions={false}
              onReply={(r) => copilot.startReply({ ...r, label: t.copilot })}
              textClassName="text-body-2-regular leading-6"
              toolIcon={(n) => (n === t.toolHelp ? <BookOpen /> : <CreditCard />)}
            />
          ),
        )}
      </ChatSurface>
    </Canvas>
  );
}
