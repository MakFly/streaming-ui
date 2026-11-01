import { useCallback, useState } from 'react';
import { Ellipsis, Globe, Menu, PanelLeft, Search, Share, Sparkles, SquarePen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copyOf, defineCopy, useCopy } from './kit/i18n';
import { useChatEngine, type ChatScriptApi } from './kit/engine';
import { AssistantMessage, Avatar, ChatSurface, Canvas, Composer, HeaderButton, IconButton, Drawer, ModelPicker, SideRail, Suggestions, Surface, HeaderTools, UserMessage, Welcome, textOf } from './kit/parts';

/* Assistant — a general-purpose chat app laid out as an agent chat: a history rail and the chat
 * as rounded cards on the canvas. The thread keeps answers bubble-less, with an action bar,
 * edit beside your own messages, reasoning that folds to "Thought for Ns", scroll-to-bottom. */

const ANSWER_EN = `For a chat UI, **Server-Sent Events** are usually the right default: the server pushes tokens over one long-lived HTTP response, and the browser reconnects on its own.

## When to pick what
- **SSE**: one-way token streams. Plain HTTP, works through proxies, resumes with \`Last-Event-ID\`.
- **WebSockets**: two-way traffic: live cursors, voice, or interrupting the model mid-answer.
- **Polling**: only when you can't hold a connection open. Every poll adds latency to each token.

## Reading the stream
\`\`\`ts
const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) });
const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();

for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  setAnswer((prev) => prev + value);
}
\`\`\`

Render tokens as they arrive, keep the scroll pinned to the bottom, and swap the send button for **Stop** so people can cut a long answer short.`;

const ANSWER_FR = `Pour une interface de chat, les **Server-Sent Events** sont en général le bon choix par défaut : le serveur pousse les tokens dans une seule réponse HTTP persistante, et le navigateur se reconnecte tout seul.

## Que choisir et quand
- **SSE** : flux de tokens à sens unique. HTTP standard, passe les proxys, reprend avec \`Last-Event-ID\`.
- **WebSockets** : échanges dans les deux sens : curseurs en direct, voix, ou interruption du modèle en pleine réponse.
- **Polling** : seulement si vous ne pouvez pas garder une connexion ouverte. Chaque requête ajoute de la latence à chaque token.

## Lire le flux
\`\`\`ts
const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }) });
const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();

for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  setAnswer((prev) => prev + value);
}
\`\`\`

Affichez les tokens au fil de l'eau, gardez le défilement collé en bas, et remplacez le bouton d'envoi par **Stop** pour que l'on puisse couper une réponse trop longue.`;

const COPY = defineCopy({
  en: {
    history: [
      { group: 'Today', items: [{ t: 'Streaming vs polling for chat', time: 'now' }, { t: 'Rename the billing events', time: '2h', unread: true }] },
      { group: 'Yesterday', items: [{ t: 'Postgres index for search', time: '1d' }, { t: 'Weekly update for the team', time: '1d' }, { t: 'Explain React transitions', time: '1d' }] },
      { group: 'Previous 7 days', items: [{ t: 'Onboarding email sequence', time: '3d' }, { t: 'Fix flaky checkout test', time: '4d' }, { t: 'Name ideas for the CLI', time: '5d' }, { t: 'Pricing page copy', time: '6d' }] },
    ] as { group: string; items: { t: string; time: string; unread?: boolean }[] }[],
    answer: ANSWER_EN,
    introPrompt: 'How should a chat UI stream responses: SSE, WebSockets or polling?',
    thinking: 'Thinking',
    introSteps: ['Comparing transport options for token streams', 'Checking reconnection and proxy behaviour', 'Picking a default and a code example'],
    replySteps: ['Reading your question', 'Drafting a short answer'],
    reply: (topic: string) => `Good question. Here is the short version on **${topic}**:

- Start from the smallest thing that works, then measure.
- Stream partial results so people see progress within a second.
- Keep a visible way out: Stop, Retry and Edit on every message.

Want me to turn this into a checklist or sketch the component?`,
    starters: ['Explain React Server Components', 'Write a haiku about latency', 'Plan a 3-day trip to Lisbon', 'Review my SQL query'],
    followUps: ['Show the server side', 'Handle reconnects', 'Add a Stop button'],
    closeSidebar: 'Close sidebar',
    newChat: 'New chat',
    searchChats: 'Search chats',
    chatHistory: 'Chat history',
    proPlan: 'Pro plan',
    account: 'Account',
    openHistory: 'Open history',
    hideHistory: 'Hide history',
    showHistory: 'Show history',
    share: 'Share',
    webSearchOn: 'Web search on',
    messages: (n: number) => `${n} messages`,
    mayErr: 'Fable can make mistakes',
    welcomeTitle: 'What can I help with?',
    welcomeSubtitle: 'Ask anything, or start from one of these.',
  },
  fr: {
    history: [
      { group: "Aujourd'hui", items: [{ t: 'Streaming ou polling pour le chat', time: 'à l\'instant' }, { t: 'Renommer les événements de facturation', time: '2 h', unread: true }] },
      { group: 'Hier', items: [{ t: 'Index Postgres pour la recherche', time: '1 j' }, { t: "Point hebdo pour l'équipe", time: '1 j' }, { t: 'Expliquer les transitions React', time: '1 j' }] },
      { group: '7 derniers jours', items: [{ t: "Séquence d'e-mails d'onboarding", time: '3 j' }, { t: 'Corriger le test de paiement instable', time: '4 j' }, { t: 'Idées de nom pour la CLI', time: '5 j' }, { t: 'Texte de la page tarifs', time: '6 j' }] },
    ] as { group: string; items: { t: string; time: string; unread?: boolean }[] }[],
    answer: ANSWER_FR,
    introPrompt: 'Comment une interface de chat doit-elle streamer les réponses : SSE, WebSockets ou polling ?',
    thinking: 'Réflexion',
    introSteps: ['Comparaison des transports pour un flux de tokens', 'Vérification de la reconnexion et du comportement des proxys', "Choix d'une option par défaut et d'un exemple de code"],
    replySteps: ['Lecture de votre question', "Rédaction d'une réponse courte"],
    reply: (topic: string) => `Bonne question. Voici la version courte sur **${topic}** :

- Partez de la solution la plus simple qui fonctionne, puis mesurez.
- Streamez les résultats partiels pour que l'on voie la progression en moins d'une seconde.
- Gardez une porte de sortie visible : Stop, Réessayer et Modifier sur chaque message.

Je vous en fais une checklist, ou je vous esquisse le composant ?`,
    starters: ['Expliquer les React Server Components', 'Écrire un haïku sur la latence', 'Organiser 3 jours à Lisbonne', 'Relire ma requête SQL'],
    followUps: ['Montre le côté serveur', 'Gérer les reconnexions', 'Ajouter un bouton Stop'],
    closeSidebar: 'Fermer la barre latérale',
    newChat: 'Nouveau chat',
    searchChats: 'Rechercher un chat',
    chatHistory: 'Historique des chats',
    proPlan: 'Formule Pro',
    account: 'Compte',
    openHistory: "Ouvrir l'historique",
    hideHistory: "Masquer l'historique",
    showHistory: "Afficher l'historique",
    share: 'Partager',
    webSearchOn: 'Recherche web activée',
    messages: (n: number) => `${n} message${n > 1 ? 's' : ''}`,
    mayErr: 'Fable peut se tromper',
    welcomeTitle: 'Comment puis-je vous aider ?',
    welcomeSubtitle: 'Posez une question, ou partez de l’une de ces idées.',
  },
});

async function intro(api: ChatScriptApi) {
  const t = copyOf(COPY);
  await api.sleep(600);
  await api.user(t.introPrompt, { type: true });
  const a = api.assistant();
  await a.think(t.thinking, t.introSteps, 650);
  await a.stream(t.answer, 26);
  a.done();
}

async function reply(api: ChatScriptApi, text: string) {
  const t = copyOf(COPY);
  const a = api.assistant();
  await a.think(t.thinking, t.replySteps, 600);
  await a.stream(t.reply(text.replace(/[*`]/g, '')), 26);
  a.done();
}

/** History rail: date groups, unread dot, the time crossfading to a menu on hover. */
function HistoryRail({ active, onNew, onClose }: { active: string | null; onNew: () => void; onClose?: () => void }) {
  const t = useCopy(COPY);
  const [q, setQ] = useState('');
  return (
    <Surface className="h-full w-[260px] shrink-0 gap-4 p-3">
      <div className="flex items-center gap-2 px-1">
        <span className="grid size-7 place-items-center rounded-lg bg-text-primary text-background-primary-default">
          <Sparkles className="size-4" />
        </span>
        <span className="text-headline-semibold">Fable</span>
        {onClose && (
          <IconButton label={t.closeSidebar} onClick={onClose} className="ms-auto">
            <X />
          </IconButton>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" onClick={onNew} className="flex items-center gap-2 rounded-2lg px-2 py-2 text-body-medium text-text-primary transition-colors hover:bg-background-secondary-hover">
          <SquarePen className="size-[18px] text-foreground-icon-secondary" /> {t.newChat}
        </button>
        <label className="flex h-9 items-center gap-2 rounded-2lg px-2 text-body-2-regular text-text-tertiary transition-colors focus-within:bg-background-secondary-hover hover:bg-background-secondary-hover">
          <Search className="size-[18px] text-foreground-icon-secondary" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchChats} className="min-w-0 flex-1 bg-transparent text-body-medium text-text-primary outline-none placeholder:text-text-secondary" />
        </label>
      </div>
      <nav className="scrollbar-thin -mx-1 flex flex-1 flex-col gap-5 overflow-y-auto px-1" aria-label={t.chatHistory}>
        {t.history.map(({ group, items }) => {
          const shown = items.filter((i) => i.t.toLowerCase().includes(q.toLowerCase()));
          if (!shown.length) return null;
          return (
            <div key={group} className="flex flex-col gap-0.5">
              <p className="px-2 pb-1 text-body-2-medium text-text-tertiary">{group}</p>
              {shown.map((it) => {
                const on = it.t === active;
                return (
                  <a
                    key={it.t}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className={cn('group/row relative flex h-8 items-center gap-2 rounded-2lg ps-2 pe-1 transition-colors', on ? 'bg-background-secondary-hover' : 'hover:bg-background-secondary-hover')}
                  >
                    {it.unread && <span className="size-1.5 shrink-0 rounded-full bg-accent-500" />}
                    <span className={cn('min-w-0 flex-1 truncate text-body-2-regular', on || it.unread ? 'text-text-primary' : 'text-text-secondary')}>{it.t}</span>
                    <span className="relative grid size-7 shrink-0 place-items-center">
                      <span className="text-caption-1-regular text-text-tertiary transition-opacity group-hover/row:opacity-0">{it.time}</span>
                      <span className="absolute inset-0.5 grid place-items-center rounded-md text-foreground-icon-secondary opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-background-tertiary-default dark:hover:bg-background-primary-hover">
                        <Ellipsis className="size-4" />
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-separator-border px-1 pt-3">
        <Avatar label="Alex Rivera" className="size-7" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-2-medium">Alex Rivera</span>
          <span className="text-caption-1-regular text-text-tertiary">{t.proPlan}</span>
        </div>
        <IconButton label={t.account} className="ms-auto">
          <Ellipsis />
        </IconButton>
      </div>
    </Surface>
  );
}

export default function AssistantTemplate() {
  const t = useCopy(COPY);
  const chat = useChatEngine({ intro, reply });
  const [drawer, setDrawer] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const [rail, setRail] = useState(true);
  const [model, setModel] = useState('Fable 5');
  const [fresh, setFresh] = useState(false);
  const empty = chat.messages.length === 0;
  const last = chat.messages[chat.messages.length - 1];
  const lastUser = [...chat.messages].reverse().find((m) => m.role === 'user');
  const current = t.history[0].items[0].t;
  const title = fresh ? (lastUser ? textOf(lastUser).slice(0, 48) : t.newChat) : current;

  const newChat = () => {
    chat.reset();
    setFresh(true);
    setDrawer(false);
  };

  const composer = (
    <Composer reply={chat.replyTo} onClearReply={chat.clearReply}
      context={Math.min(92, 12 + chat.messages.length * 7)}
      value={chat.draft}
      onChange={chat.setDraft}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      model={<ModelPicker value={model} onChange={setModel} />}
      status={
        <>
          <span className="flex items-center gap-1">
            <Globe /> {t.webSearchOn}
          </span>
          <span className="tabular-nums">{chat.messages.length ? t.messages(chat.messages.length) : t.mayErr}</span>
        </>
      }
    />
  );

  return (
    <Canvas>
      <SideRail open={rail} width={260} className="hidden md:block">
        <HistoryRail active={fresh ? null : current} onNew={newChat} />
      </SideRail>
      <Drawer open={drawer} onClose={closeDrawer} className="md:hidden">
        <HistoryRail active={fresh ? null : current} onNew={newChat} onClose={closeDrawer} />
      </Drawer>
      <ChatSurface
        dep={chat.messages}
        empty={empty}
        header={
          <>
            <IconButton label={t.openHistory} onClick={() => setDrawer(true)} className="md:hidden">
              <Menu />
            </IconButton>
            <IconButton label={rail ? t.hideHistory : t.showHistory} onClick={() => setRail((r) => !r)} className="hidden md:grid">
              <PanelLeft />
            </IconButton>
            <span className="min-w-0 truncate px-1 text-headline-medium text-text-primary">{title}</span>
            <span className="ms-auto flex items-center gap-1">
              <HeaderTools />
              <HeaderButton outline>
                <Share /> <span className="hidden sm:inline">{t.share}</span>
              </HeaderButton>
              <IconButton label={t.newChat} onClick={newChat}>
                <SquarePen />
              </IconButton>
            </span>
          </>
        }
        footer={!empty && composer}
      >
        {empty ? (
          <Welcome
            icon={
              <span className="grid size-11 place-items-center rounded-2xl bg-background-primary-default shadow-card">
                <Sparkles className="size-5 text-accent-500" />
              </span>
            }
            title={t.welcomeTitle}
            subtitle={t.welcomeSubtitle}
          >
            <div className="mt-2 w-full max-w-2xl text-start">{composer}</div>
            <Suggestions className="justify-center" items={t.starters} onPick={chat.send} />
          </Welcome>
        ) : (
          chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} replyTo={m.replyTo} onEdit={() => chat.setDraft(textOf(m))}>
                {textOf(m)}
              </UserMessage>
            ) : (
              <AssistantMessage key={m.id} message={m} onReply={chat.startReply} isLast={i === chat.messages.length - 1} onRegenerate={() => lastUser && chat.send(textOf(lastUser))} />
            ),
          )
        )}
        {last?.role === 'assistant' && last.done && !chat.busy && <Suggestions items={t.followUps} onPick={chat.send} />}
      </ChatSurface>
    </Canvas>
  );
}
