import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  BookOpen, Bot, Brain, Check, ChevronDown, Code2, FileText, Globe, HardDrive, Hash, Image, Link2, LoaderCircle, Lock, MessageSquare,
  Plug, Plus, Rocket, Search, Settings2, ShieldCheck, Sparkles, Upload, Wand2, Wrench, X, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useChatEngine, type ChatScriptApi } from './kit/engine';
import { copyOf, defineCopy, intlLocale, useCopy } from './kit/i18n';
import { ThinkingIndicator } from './kit/thinking-style';
import { CodeBlock } from './kit/markdown';
import { BLOUB_NAMES, BLOUBS, Bloub, COLORS, EXPRESSIONS, POSES, SHAPES, stateFor, statesFor, type StateId } from './kit/bloub';
import sentryLogo from './kit/logos/sentry.svg';
import githubLogo from './kit/logos/github_light.svg';
import linearLogo from './kit/logos/linear.svg';
import slackLogo from './kit/logos/slack.svg';
import postgresLogo from './kit/logos/postgresql.svg';
import notionLogo from './kit/logos/notion.svg';
import { AssistantMessage, Badge, Canvas, ChatSurface, Composer, Frame, FrameHeader, FramePanel, HeaderButton, IconButton, ModelPicker, Suggestions, HeaderTools, UserMessage, Welcome, textOf } from './kit/parts';

/* Agent Builder — a normal agent chat, with everything about the agent in a settings dialog: identity,
 * instructions, MCP servers (per-tool switches and Ask / Auto approval), skills, built-in tools, knowledge
 * and deploy, reached from a side menu (tabs on phones). "Generate with AI" redrafts the whole agent as it
 * streams. The chat runs against the live config, so a tool you switch off is really unavailable. All mocked. */

/* ------------------------------------------------------------------ data */

type Approval = 'auto' | 'ask';
type Tool = { id: string; name: string; desc: string; on: boolean; approval: Approval; write?: boolean };
type Server = { id: string; name: string; logo: ReactNode; url: string; status: 'connected' | 'auth' | 'off'; on: boolean; tools: Tool[] };

/** Official brand marks (svgl.app), unmodified. */
const Logo = ({ src }: { src: string }) => <img src={src} alt="" className="size-full object-contain" />;
type Skill = { id: string; name: string; desc: string; by: string; version: string; on: boolean };
type BuiltIn = { id: string; name: string; desc: string; icon: ReactNode; on: boolean };
type Doc = { name: string; size: string; progress: number };

const tool = (id: string, name: string, desc: string, write = false): Tool => ({ id, name, desc, on: false, approval: write ? 'ask' : 'auto', write });

/** What the generator switches on (ids only: the copy carries the words). */
const GEN_IDS = {
  tools: { sentry: ['list_issues', 'get_event'], github: ['search_code', 'get_file'], linear: ['search_issues', 'create_issue'] } as Record<string, string[]>,
  skills: ['incident'],
};

const COPY = defineCopy({
  en: {
    gen: {
      prompt: 'An agent that turns new Sentry errors into Linear issues, with the suspect code from GitHub.',
      name: 'Triage Bot',
      description: 'Turns new production errors into well-written Linear issues.',
      instructions: `You are Triage Bot, the on-call assistant for the web team.

When a new Sentry issue arrives:
1. Read the event and stack trace.
2. Find the code involved on GitHub and the last commit that touched it.
3. Search Linear for duplicates; if none, create an issue in team WEB.

Write issues with: impact, steps to reproduce, suspect commit, and a proposed owner.
Never resolve Sentry issues or merge code yourself. Ask before creating anything.`,
      starters: ['Triage the latest Sentry error', 'Is ERR-4821 a duplicate?', 'What tools can you use?'],
    },
    toolDesc: {
      sentryList: 'New and regressed errors', sentryEvent: 'Stack trace and breadcrumbs', sentryResolve: 'Mark an issue resolved',
      githubSearch: 'Search across repositories', githubFile: 'Read a file at a ref', githubIssue: 'Open an issue', githubPr: 'Open a pull request',
      linearSearch: 'Find existing issues', linearCreate: 'Create an issue', linearUpdate: 'Change state, assignee, labels',
      slackRead: 'Recent messages in a channel', slackPost: 'Post as the agent',
      pgTables: 'Schemas and tables', pgQuery: 'Read-only SQL',
      notionSearch: 'Search pages', notionCreate: 'Write a page',
      ping: 'Health check', call: 'Generic call',
    },
    skills: {
      incident: ['Incident write-up', 'Turns an error into a clear issue: impact, repro, suspect commit.'],
      pdf: ['PDF', 'Read, fill and generate PDF files.'],
      xlsx: ['Spreadsheets', 'Formulas, charts and clean tables in .xlsx.'],
      voice: ['Brand voice', 'House style for every message the agent writes.'],
      sql: ['SQL analyst', 'Writes safe, explained queries against your warehouse.'],
    } as Record<string, [string, string]>,
    by: { team: 'Your team', anthropic: 'Anthropic', community: 'Community' },
    builtins: {
      web: ['Web search', 'Search and read public pages'],
      code: ['Code execution', 'Run Python in a sandbox'],
      memory: ['Memory', 'Remember facts across runs'],
      files: ['File system', 'Read and write a scratch folder'],
      image: ['Image generation', 'Create images from prompts'],
    } as Record<string, [string, string]>,
    thinking: 'Thinking',
    triageThink: ['New error: TypeError in checkout/confirm', 'Plan: read the event, find the code, check for duplicates'],
    stepArgs: { list: 'project:web · last 1h', listMeta: '1 new · ERR-4821', eventMeta: 'TypeError at confirm.ts:42', searchMeta: '2 matches', noDup: 'no duplicate' },
    disabled: 'disabled',
    issueTitle: 'team:WEB · "TypeError in confirmPayment"',
    approved: 'approved · WEB-1288',
    created: (skill: boolean) =>
      `Created **WEB-1288**: "TypeError in confirmPayment".${skill ? '\n\n- **Impact:** 3.1% of checkouts in eu-west since 14:05\n- **Suspect commit:** `a41f9c2` changed the payment client timeout\n- **Owner:** @maya (last touched confirm.ts)' : ' Turn on the **Incident write-up** skill for impact, repro and owner sections.'}`,
    failed: (list: string[]) =>
      `I couldn't finish: ${list.map((m) => `\`${m}\``).join(', ')} ${list.length > 1 ? 'are' : 'is'} switched off. Open **Configure → MCP servers**, turn ${list.length > 1 ? 'them' : 'it'} on and ask again.`,
    checkingPerms: ['Checking what I am allowed to use'],
    whoAmI: (name: string, model: string, tools: string[], skills: string[]) =>
      `I'm **${name || 'your agent'}** on ${model}. Right now I can use ${tools.length ? tools.map((t) => `\`${t}\``).join(', ') : 'no MCP tools'}${skills.length ? `, plus the ${skills.join(', ')} skill${skills.length > 1 ? 's' : ''}` : ''}. Ask me to triage an error to see them in action.`,
    connected: 'Connected',
    needsSignIn: 'Needs sign-in',
    notConnected: 'Not connected',
    toolsCount: (on: number, all: number) => `${on}/${all} tools`,
    hideTools: 'Hide tools',
    showTools: 'Show tools',
    enable: (name: string) => `Enable ${name}`,
    signIn: 'Sign in',
    connect: 'Connect',
    write: 'write',
    askFirst: 'Ask first',
    auto: 'Auto',
    groups: { agent: 'Agent', capabilities: 'Capabilities', publish: 'Publish' },
    menu: {
      identity: ['Identity', 'Name, look and model.'],
      instructions: ['Instructions', 'The system prompt and conversation starters.'],
      mcp: ['MCP servers', 'Connect servers and choose each tool the agent may call.'],
      skills: ['Skills', 'Packaged know-how the agent loads when a task needs it.'],
      builtin: ['Built-in tools', 'Capabilities provided by the platform.'],
      knowledge: ['Knowledge', 'Files and sites the agent can search.'],
      deploy: ['Deploy', 'Check the essentials, pick where it runs, ship it.'],
    } as Record<string, [string, string]>,
    docSizes: ['14 KB', '220 KB', '3 KB'],
    checks: ['Name and model', 'Instructions', 'At least one tool', 'Writes ask before running', 'Tested in chat'],
    avatarOf: (name: string) => `${name || 'Agent'} avatar`,
    describeTitle: 'Describe it, we draft the rest',
    generating: 'Generating',
    promptPlaceholder: 'What should your agent do?',
    generate: 'Generate',
    name: 'Name',
    namePlaceholder: 'e.g. Triage Bot',
    description: 'Description',
    descriptionHint: 'shown to people who use it',
    descriptionPlaceholder: 'One line about what it does',
    model: 'Model',
    temperature: 'Temperature',
    avatar: 'Avatar',
    character: 'Character',
    shape: 'Shape',
    colour: 'Colour',
    expression: 'Expression',
    animations: 'Animations',
    clickToPreview: 'click to preview',
    chars: 'chars',
    instructionsPlaceholder: 'You are…',
    starters: 'Conversation starters',
    startersHint: 'shown on an empty chat',
    removeStarter: 'Remove starter',
    addStarter: 'Add starter',
    toolsOn: 'Tools on',
    servers: 'Servers',
    context: 'Context',
    tok: 'K tok',
    filterPlaceholder: 'Filter servers and tools',
    cancel: 'Cancel',
    addServer: 'Add server',
    serverHint: 'Streamable HTTP or SSE. Tools are discovered on connect.',
    uploadSkill: 'Upload a skill (.zip)',
    dropFiles: 'Drop files or click to upload',
    fileLimits: 'PDF, Markdown, CSV · up to 50 MB each',
    indexed: 'Indexed',
    websites: 'Websites',
    websitesHint: 'crawled weekly',
    add: 'Add',
    checklist: 'Checklist',
    targets: {
      api: ['API', 'REST endpoint with streaming'],
      slack: ['Slack app', 'Mention it in any channel'],
      widget: ['Web widget', 'Embed on your site'],
    } as Record<string, [string, string]>,
    deployTo: (label: string) => `Deploy to ${label}`,
    liveTitle: 'Live · agents.acme.dev',
    deploying: (p: number) => `Deploying… ${p}%`,
    deploy: (name: string) => `Deploy ${name}`,
    agentFallback: 'agent',
    messageTo: (name: string) => `Message ${name}`,
    yourAgentLower: 'your agent',
    toolsSkills: (tools: number, skills: number) => `${tools} tools · ${skills} skill${skills === 1 ? '' : 's'}`,
    live: 'Live',
    draft: 'Draft',
    newAgent: 'New agent',
    configure: 'Configure',
    yourAgent: 'Your agent',
    agentSettings: 'Agent settings',
    draftingAgent: 'Drafting your agent…',
    generateWithAi: 'Generate with AI',
    closeSettings: 'Close settings',
    drafting: 'Drafting…',
    saved: 'Saved',
    testInChat: 'Test in chat',
    test: 'Test',
    done: 'Done',
  },
  fr: {
    gen: {
      prompt: 'Un agent qui transforme les nouvelles erreurs Sentry en tickets Linear, avec le code suspect tiré de GitHub.',
      name: 'Triage Bot',
      description: 'Transforme les nouvelles erreurs de production en tickets Linear bien rédigés.',
      instructions: `Tu es Triage Bot, l’assistant d’astreinte de l’équipe web.

Quand une nouvelle issue Sentry arrive :
1. Lis l’évènement et la stack trace.
2. Trouve le code concerné sur GitHub et le dernier commit qui l’a touché.
3. Cherche des doublons dans Linear ; s’il n’y en a pas, crée un ticket dans l’équipe WEB.

Rédige les tickets avec : impact, étapes de reproduction, commit suspect et responsable proposé.
Ne résous jamais d’issues Sentry et ne fusionne jamais de code toi-même. Demande avant de créer quoi que ce soit.`,
      starters: ['Trier la dernière erreur Sentry', 'ERR-4821 est-elle un doublon ?', 'Quels outils peux-tu utiliser ?'],
    },
    toolDesc: {
      sentryList: 'Erreurs nouvelles et régressées', sentryEvent: 'Stack trace et fil d’Ariane', sentryResolve: 'Marquer une issue comme résolue',
      githubSearch: 'Rechercher dans les dépôts', githubFile: 'Lire un fichier à une référence donnée', githubIssue: 'Ouvrir une issue', githubPr: 'Ouvrir une pull request',
      linearSearch: 'Trouver les tickets existants', linearCreate: 'Créer un ticket', linearUpdate: 'Changer l’état, le responsable, les labels',
      slackRead: 'Messages récents d’un canal', slackPost: 'Publier en tant qu’agent',
      pgTables: 'Schémas et tables', pgQuery: 'SQL en lecture seule',
      notionSearch: 'Rechercher des pages', notionCreate: 'Rédiger une page',
      ping: 'Test de disponibilité', call: 'Appel générique',
    },
    skills: {
      incident: ['Rapport d’incident', 'Transforme une erreur en ticket clair : impact, reproduction, commit suspect.'],
      pdf: ['PDF', 'Lire, remplir et générer des fichiers PDF.'],
      xlsx: ['Tableurs', 'Formules, graphiques et tableaux propres en .xlsx.'],
      voice: ['Ton de marque', 'Le style maison pour chaque message de l’agent.'],
      sql: ['Analyste SQL', 'Écrit des requêtes sûres et expliquées sur votre entrepôt de données.'],
    } as Record<string, [string, string]>,
    by: { team: 'Votre équipe', anthropic: 'Anthropic', community: 'Communauté' },
    builtins: {
      web: ['Recherche web', 'Rechercher et lire des pages publiques'],
      code: ['Exécution de code', 'Exécuter du Python dans un bac à sable'],
      memory: ['Mémoire', 'Retenir des faits d’une exécution à l’autre'],
      files: ['Système de fichiers', 'Lire et écrire dans un dossier temporaire'],
      image: ['Génération d’images', 'Créer des images à partir de prompts'],
    } as Record<string, [string, string]>,
    thinking: 'Réflexion',
    triageThink: ['Nouvelle erreur : TypeError dans checkout/confirm', 'Plan : lire l’évènement, trouver le code, chercher des doublons'],
    stepArgs: { list: 'project:web · dernière heure', listMeta: '1 nouvelle · ERR-4821', eventMeta: 'TypeError à confirm.ts:42', searchMeta: '2 résultats', noDup: 'aucun doublon' },
    disabled: 'désactivé',
    issueTitle: 'team:WEB · "TypeError dans confirmPayment"',
    approved: 'approuvé · WEB-1288',
    created: (skill: boolean) =>
      `**WEB-1288** créé : "TypeError dans confirmPayment".${skill ? '\n\n- **Impact :** 3,1 % des paiements en eu-west depuis 14 h 05\n- **Commit suspect :** `a41f9c2` a modifié le délai d’expiration du client de paiement\n- **Responsable :** @maya (dernière modification de confirm.ts)' : ' Activez la compétence **Rapport d’incident** pour obtenir les sections impact, reproduction et responsable.'}`,
    failed: (list: string[]) =>
      `Je n’ai pas pu terminer : ${list.map((m) => `\`${m}\``).join(', ')} ${list.length > 1 ? 'sont désactivés' : 'est désactivé'}. Ouvrez **Configurer → Serveurs MCP**, activez-${list.length > 1 ? 'les' : 'le'} puis redemandez-moi.`,
    checkingPerms: ['Vérification de ce que je suis autorisé à utiliser'],
    whoAmI: (name: string, model: string, tools: string[], skills: string[]) =>
      `Je suis **${name || 'votre agent'}**, sur ${model}. Pour l’instant, je peux utiliser ${tools.length ? tools.map((t) => `\`${t}\``).join(', ') : 'aucun outil MCP'}${skills.length ? `, ainsi que ${skills.length > 1 ? 'les compétences' : 'la compétence'} ${skills.join(', ')}` : ''}. Demandez-moi de trier une erreur pour me voir à l’œuvre.`,
    connected: 'Connecté',
    needsSignIn: 'Connexion requise',
    notConnected: 'Non connecté',
    toolsCount: (on: number, all: number) => `${on}/${all} outils`,
    hideTools: 'Masquer les outils',
    showTools: 'Afficher les outils',
    enable: (name: string) => `Activer ${name}`,
    signIn: 'Se connecter',
    connect: 'Connecter',
    write: 'écriture',
    askFirst: 'Demander d’abord',
    auto: 'Auto',
    groups: { agent: 'Agent', capabilities: 'Capacités', publish: 'Publication' },
    menu: {
      identity: ['Identité', 'Nom, apparence et modèle.'],
      instructions: ['Instructions', 'Le prompt système et les amorces de conversation.'],
      mcp: ['Serveurs MCP', 'Connectez des serveurs et choisissez chaque outil que l’agent peut appeler.'],
      skills: ['Compétences', 'Savoir-faire packagé que l’agent charge quand une tâche l’exige.'],
      builtin: ['Outils intégrés', 'Capacités fournies par la plateforme.'],
      knowledge: ['Connaissances', 'Fichiers et sites dans lesquels l’agent peut chercher.'],
      deploy: ['Déploiement', 'Vérifiez l’essentiel, choisissez où il tourne, publiez.'],
    } as Record<string, [string, string]>,
    docSizes: ['14 Ko', '220 Ko', '3 Ko'],
    checks: ['Nom et modèle', 'Instructions', 'Au moins un outil', 'Les écritures demandent confirmation', 'Testé dans le chat'],
    avatarOf: (name: string) => `Avatar de ${name || 'l’agent'}`,
    describeTitle: 'Décrivez-le, on rédige le reste',
    generating: 'Génération',
    promptPlaceholder: 'Que doit faire votre agent ?',
    generate: 'Générer',
    name: 'Nom',
    namePlaceholder: 'ex. Triage Bot',
    description: 'Description',
    descriptionHint: 'visible par ceux qui l’utilisent',
    descriptionPlaceholder: 'Une ligne sur ce qu’il fait',
    model: 'Modèle',
    temperature: 'Température',
    avatar: 'Avatar',
    character: 'Personnage',
    shape: 'Forme',
    colour: 'Couleur',
    expression: 'Expression',
    animations: 'Animations',
    clickToPreview: 'cliquez pour prévisualiser',
    chars: 'car.',
    instructionsPlaceholder: 'Tu es…',
    starters: 'Amorces de conversation',
    startersHint: 'affichées dans un chat vide',
    removeStarter: 'Supprimer l’amorce',
    addStarter: 'Ajouter une amorce',
    toolsOn: 'Outils actifs',
    servers: 'Serveurs',
    context: 'Contexte',
    tok: 'K tok',
    filterPlaceholder: 'Filtrer les serveurs et les outils',
    cancel: 'Annuler',
    addServer: 'Ajouter un serveur',
    serverHint: 'HTTP streamable ou SSE. Les outils sont détectés à la connexion.',
    uploadSkill: 'Importer une compétence (.zip)',
    dropFiles: 'Déposez des fichiers ou cliquez pour importer',
    fileLimits: 'PDF, Markdown, CSV · jusqu’à 50 Mo chacun',
    indexed: 'Indexé',
    websites: 'Sites web',
    websitesHint: 'explorés chaque semaine',
    add: 'Ajouter',
    checklist: 'Liste de contrôle',
    targets: {
      api: ['API', 'Point d’accès REST avec streaming'],
      slack: ['App Slack', 'Mentionnez-le dans n’importe quel canal'],
      widget: ['Widget web', 'À intégrer sur votre site'],
    } as Record<string, [string, string]>,
    deployTo: (label: string) => `Déployer sur ${label}`,
    liveTitle: 'En ligne · agents.acme.dev',
    deploying: (p: number) => `Déploiement… ${p} %`,
    deploy: (name: string) => `Déployer ${name}`,
    agentFallback: 'agent',
    messageTo: (name: string) => `Écrire à ${name}`,
    yourAgentLower: 'votre agent',
    toolsSkills: (tools: number, skills: number) => `${tools} outils · ${skills} ${skills > 1 ? 'compétences' : 'compétence'}`,
    live: 'En ligne',
    draft: 'Brouillon',
    newAgent: 'Nouvel agent',
    configure: 'Configurer',
    yourAgent: 'Votre agent',
    agentSettings: 'Réglages de l’agent',
    draftingAgent: 'Rédaction de votre agent…',
    generateWithAi: 'Générer avec l’IA',
    closeSettings: 'Fermer les réglages',
    drafting: 'Rédaction…',
    saved: 'Enregistré',
    testInChat: 'Tester dans le chat',
    test: 'Tester',
    done: 'Terminé',
  },
});

type Strings = (typeof COPY)['en'];

const makeServers = (L: Strings): Server[] => [
  { id: 'sentry', name: 'Sentry', logo: <Logo src={sentryLogo} />, url: 'mcp.sentry.dev/sse', status: 'connected', on: false, tools: [tool('list_issues', 'list_issues', L.toolDesc.sentryList), tool('get_event', 'get_event', L.toolDesc.sentryEvent), tool('resolve_issue', 'resolve_issue', L.toolDesc.sentryResolve, true)] },
  { id: 'github', name: 'GitHub', logo: <Logo src={githubLogo} />, url: 'api.githubcopilot.com/mcp', status: 'connected', on: false, tools: [tool('search_code', 'search_code', L.toolDesc.githubSearch), tool('get_file', 'get_file_contents', L.toolDesc.githubFile), tool('create_issue', 'create_issue', L.toolDesc.githubIssue, true), tool('create_pr', 'create_pull_request', L.toolDesc.githubPr, true)] },
  { id: 'linear', name: 'Linear', logo: <Logo src={linearLogo} />, url: 'mcp.linear.app/sse', status: 'connected', on: false, tools: [tool('search_issues', 'search_issues', L.toolDesc.linearSearch), tool('create_issue', 'create_issue', L.toolDesc.linearCreate, true), tool('update_issue', 'update_issue', L.toolDesc.linearUpdate, true)] },
  { id: 'slack', name: 'Slack', logo: <Logo src={slackLogo} />, url: 'mcp.slack.com', status: 'auth', on: false, tools: [tool('read_channel', 'read_channel', L.toolDesc.slackRead), tool('post_message', 'post_message', L.toolDesc.slackPost, true)] },
  { id: 'postgres', name: 'Postgres', logo: <Logo src={postgresLogo} />, url: 'localhost:5432 · stdio', status: 'connected', on: false, tools: [tool('list_tables', 'list_tables', L.toolDesc.pgTables), tool('query', 'query', L.toolDesc.pgQuery)] },
  { id: 'notion', name: 'Notion', logo: <Logo src={notionLogo} />, url: 'mcp.notion.com/sse', status: 'off', on: false, tools: [tool('search', 'search', L.toolDesc.notionSearch), tool('create_page', 'create_page', L.toolDesc.notionCreate, true)] },
];

/** The servers with the generated agent's tools switched on. */
const generatedServers = (all: Server[]) => all.map((s) => (GEN_IDS.tools[s.id] ? { ...s, on: true, tools: s.tools.map((t) => ({ ...t, on: GEN_IDS.tools[s.id].includes(t.id) })) } : s));

const makeSkills = (L: Strings): Skill[] =>
  [['incident', 'team', '1.3.0'], ['pdf', 'anthropic', '2.1.0'], ['xlsx', 'anthropic', '2.0.4'], ['voice', 'team', '0.9.2'], ['sql', 'community', '1.0.1']].map(([id, by, version]) => ({ id, name: L.skills[id][0], desc: L.skills[id][1], by, version, on: false }));

const makeBuiltins = (L: Strings): BuiltIn[] => [
  { id: 'web', name: L.builtins.web[0], desc: L.builtins.web[1], icon: <Globe />, on: false },
  { id: 'code', name: L.builtins.code[0], desc: L.builtins.code[1], icon: <Code2 />, on: false },
  { id: 'memory', name: L.builtins.memory[0], desc: L.builtins.memory[1], icon: <Brain />, on: true },
  { id: 'files', name: L.builtins.files[0], desc: L.builtins.files[1], icon: <HardDrive />, on: false },
  { id: 'image', name: L.builtins.image[0], desc: L.builtins.image[1], icon: <Image />, on: false },
];

/** The agent's bloub: body shape, colour and resting expression (bloub's customiser). */
type Look = { shape: string; color: string; expression: string };
const GEN_LOOK: Look = { shape: 'galet', color: 'turquoise', expression: 'attentif' };

/* ------------------------------------------------------------------ the chat script reads the live config */

type Config = { name: string; model: string; servers: Server[]; skills: Skill[] };
// Each preview frame is its own document, so module state is per frame.
const live: { config: Config | null } = { config: null };

const isOn = (c: Config, server: string, toolId: string) => {
  const s = c.servers.find((x) => x.id === server);
  return Boolean(s?.on && s.status === 'connected' && s.tools.find((x) => x.id === toolId)?.on);
};

async function triage(api: ChatScriptApi) {
  const c = live.config!;
  const L = copyOf(COPY);
  const a = api.assistant();
  await a.think(L.thinking, L.triageThink, 450);
  const steps: [string, string, string, string, string][] = [
    ['sentry', 'list_issues', 'sentry.list_issues', L.stepArgs.list, L.stepArgs.listMeta],
    ['sentry', 'get_event', 'sentry.get_event', 'ERR-4821', L.stepArgs.eventMeta],
    ['github', 'search_code', 'github.search_code', '"confirmPayment" repo:acme/web', L.stepArgs.searchMeta],
    ['linear', 'search_issues', 'linear.search_issues', '"confirmPayment TypeError"', L.stepArgs.noDup],
  ];
  const missing: string[] = [];
  for (const [server, id, name, arg, meta] of steps) {
    if (isOn(c, server, id)) await a.tool(name, arg, { ms: 650, meta });
    else {
      missing.push(name);
      await a.tool(name, arg, { ms: 250, status: 'error', meta: L.disabled });
    }
  }
  if (isOn(c, 'linear', 'create_issue')) {
    const ask = c.servers.find((s) => s.id === 'linear')!.tools.find((t) => t.id === 'create_issue')!.approval === 'ask';
    await a.tool('linear.create_issue', L.issueTitle, { ms: 800, meta: ask ? L.approved : 'WEB-1288' });
  } else missing.push('linear.create_issue');
  const skill = c.skills.find((s) => s.id === 'incident')?.on;
  await a.stream(missing.length === 0 ? L.created(Boolean(skill)) : L.failed(missing), 30);
  a.done();
}

async function intro(api: ChatScriptApi) {
  await api.sleep(600);
  await api.user(copyOf(COPY).gen.starters[0], { type: true });
  await triage(api);
}

async function reply(api: ChatScriptApi, text: string) {
  if (/triage|trier|tri[ée]|error|erreur|sentry|duplicate|doublon|ERR/i.test(text)) return triage(api);
  const c = live.config!;
  const L = copyOf(COPY);
  const a = api.assistant();
  const tools = c.servers.flatMap((s) => (s.on && s.status === 'connected' ? s.tools.filter((t) => t.on).map((t) => `${s.id}.${t.name}`) : []));
  const skills = c.skills.filter((s) => s.on).map((s) => s.name);
  await a.think(L.thinking, L.checkingPerms, 400);
  await a.stream(L.whoAmI(c.name, c.model, tools, skills), 30);
  a.done();
}

/* ------------------------------------------------------------------ form pieces */

const field = 'w-full rounded-xl border border-border-button-default bg-background-primary-default px-3 text-body-2-regular text-text-primary shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-text-tertiary focus:border-border-button-hover focus:shadow-sm';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-2 text-body-2-medium text-text-primary">
        {label}
        {hint && <span className="text-caption-1-regular text-text-tertiary">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Settings row: icon, title, description, control on the right. */
function Row({ icon, title, desc, children, className }: { icon: ReactNode; title: ReactNode; desc: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl bg-background-primary-default px-3 py-2.5 shadow-xs', className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-background-tertiary-default text-foreground-icon-secondary [&_svg]:size-4">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 text-body-2-semibold text-text-primary">{title}</span>
        <span className="truncate text-caption-1-regular text-text-tertiary">{desc}</span>
      </span>
      {children}
    </div>
  );
}

function Picker({ label, hint, cols = 'grid-cols-4 sm:grid-cols-8', children }: { label: string; hint?: string; cols?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-baseline gap-2 text-body-2-medium text-text-primary">
        {label}
        {hint && <span className="text-caption-1-regular text-text-tertiary">{hint}</span>}
      </span>
      <div className={cn('grid gap-1', cols)}>{children}</div>
    </div>
  );
}

/** A frozen bloub thumbnail (no animation loop) with its name. */
function Thumb({ name, on, onClick, children }: { name: string; on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={name}
      aria-pressed={on}
      onClick={onClick}
      className={cn('flex flex-col items-center rounded-xl pb-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring', on ? 'bg-background-tertiary-default ring-1 ring-text-primary/70' : 'hover:bg-background-tertiary-default/60')}
    >
      {children}
      <span className={cn('w-full truncate px-0.5 text-center text-caption-2-regular', on ? 'text-text-primary' : 'text-text-tertiary')}>{name}</span>
    </button>
  );
}

/** Brief ring on a value the generator just set. */
const flash = (on: boolean) => (on ? 'ring-2 ring-violet-500/40 transition-shadow duration-500' : 'transition-shadow duration-700');

function ServerCard({ s, onChange, highlight }: { s: Server; onChange: (s: Server) => void; highlight: boolean }) {
  const L = useCopy(COPY);
  const [open, setOpen] = useState(false);
  const enabled = s.tools.filter((t) => t.on).length;
  const usable = s.status === 'connected';
  return (
    <FramePanel className={cn('flex flex-col', flash(highlight))}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* White in both themes: brand marks are drawn for a light ground (Sentry's purple vanishes on dark). */}
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-black/[0.08] bg-white p-2 shadow-xs">{s.logo}</span>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 flex-col text-start">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-body-2-semibold text-text-primary">{s.name}</span>
            {s.status === 'connected' ? (
              <Badge tone="success" dot className="h-[18px] px-1">{L.connected}</Badge>
            ) : s.status === 'auth' ? (
              <Badge tone="warning" className="h-[18px] px-1">{L.needsSignIn}</Badge>
            ) : (
              <Badge tone="neutral" className="h-[18px] px-1">{L.notConnected}</Badge>
            )}
          </span>
          <span className="truncate font-mono text-caption-1-regular text-text-tertiary">
            {s.url} · {L.toolsCount(enabled, s.tools.length)}
          </span>
        </button>
        <IconButton label={open ? L.hideTools : L.showTools} onClick={() => setOpen((o) => !o)}>
          <ChevronDown className={cn('transition-transform duration-200', open && 'rotate-180')} />
        </IconButton>
        {usable ? (
          <Switch checked={s.on} onCheckedChange={(on) => onChange({ ...s, on })} aria-label={L.enable(s.name)} />
        ) : (
          <button type="button" onClick={() => onChange({ ...s, status: 'connected' })} className="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-border-button-default bg-background-primary-default px-2 text-caption-1-medium text-text-primary shadow-xs">
            <Plug className="size-3.5" /> {s.status === 'auth' ? L.signIn : L.connect}
          </button>
        )}
      </div>
      {open && (
        <ul className="animate-in fade-in-0 slide-in-from-top-1 flex flex-col border-t border-separator-border duration-200">
          {s.tools.map((t) => (
            <li key={t.id} className={cn('flex items-center gap-3 px-3 py-2', !(s.on && usable) && 'opacity-50')}>
              <Wrench className="size-3.5 shrink-0 text-foreground-icon-tertiary" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 font-mono text-caption-1-medium text-text-primary">
                  {t.name}
                  {t.write && <Badge tone="warning" className="h-4 px-1 font-sans text-[10px]">{L.write}</Badge>}
                </span>
                <span className="truncate text-caption-1-regular text-text-tertiary">{t.desc}</span>
              </span>
              <button
                type="button"
                disabled={!t.on}
                onClick={() => onChange({ ...s, tools: s.tools.map((x) => (x.id === t.id ? { ...x, approval: x.approval === 'ask' ? 'auto' : 'ask' } : x)) })}
                className={cn('flex h-6 items-center gap-1 rounded-md border px-1.5 text-caption-2-medium transition-colors disabled:opacity-40', t.approval === 'ask' ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-border-button-default text-text-secondary')}
              >
                {t.approval === 'ask' ? <Lock className="size-3" /> : <Zap className="size-3" />}
                <span className="hidden sm:inline">{t.approval === 'ask' ? L.askFirst : L.auto}</span>
              </button>
              <Switch
                checked={t.on}
                disabled={!(s.on && usable)}
                onCheckedChange={(on) => onChange({ ...s, tools: s.tools.map((x) => (x.id === t.id ? { ...x, on } : x)) })}
                aria-label={L.enable(t.name)}
                className="scale-90"
              />
            </li>
          ))}
        </ul>
      )}
    </FramePanel>
  );
}

/* ------------------------------------------------------------------ settings menu */

type SectionId = 'identity' | 'instructions' | 'mcp' | 'skills' | 'builtin' | 'knowledge' | 'deploy';
const SECTION_IDS: SectionId[] = ['identity', 'instructions', 'mcp', 'skills', 'builtin', 'knowledge', 'deploy'];
const menuOf = (L: Strings): { group: string; items: { id: SectionId; label: string; icon: ReactNode; sub: string }[] }[] => {
  const it = (id: SectionId, icon: ReactNode) => ({ id, label: L.menu[id][0], icon, sub: L.menu[id][1] });
  return [
    { group: L.groups.agent, items: [it('identity', <Bot />), it('instructions', <MessageSquare />)] },
    { group: L.groups.capabilities, items: [it('mcp', <Plug />), it('skills', <Sparkles />), it('builtin', <Wrench />), it('knowledge', <BookOpen />)] },
    { group: L.groups.publish, items: [it('deploy', <Rocket />)] },
  ];
};

export default function AgentBuilderTemplate() {
  const L = useCopy(COPY);
  const GEN = L.gen;
  const SERVERS = makeServers(L);
  const SKILLS = makeSkills(L);
  const MENU = menuOf(L);
  const ALL = MENU.flatMap((g) => g.items);
  // `?configure=<section>` deep-links straight into the settings.
  const [deepLink] = useState(() => new URLSearchParams(window.location.search).get('configure') as SectionId | null);
  const [open, setOpen] = useState(Boolean(deepLink && SECTION_IDS.includes(deepLink!)));
  const [section, setSection] = useState<SectionId>(deepLink && SECTION_IDS.includes(deepLink!) ? deepLink : 'identity');
  const [prompt, setPrompt] = useState(GEN.prompt);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState(GEN.name);
  const [description, setDescription] = useState(GEN.description);
  const [look, setLook] = useState<Look>(GEN_LOOK);
  const [preview, setPreview] = useState<StateId | null>(null);
  const [after, setAfter] = useState<StateId | null>(null);
  const [model, setModel] = useState('Sonnet 5');
  const [temperature, setTemperature] = useState(0.3);
  const [instructions, setInstructions] = useState(GEN.instructions);
  const [starters, setStarters] = useState<string[]>(GEN.starters);
  const [servers, setServers] = useState<Server[]>(() => generatedServers(SERVERS));
  const [skills, setSkills] = useState<Skill[]>(() => SKILLS.map((s) => ({ ...s, on: GEN_IDS.skills.includes(s.id) })));
  const [builtins, setBuiltins] = useState(() => makeBuiltins(L));
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [deploy, setDeploy] = useState<{ targets: Record<string, boolean>; state: 'idle' | 'deploying' | 'live'; progress: number }>({ targets: { api: true, slack: false, widget: true }, state: 'idle', progress: 0 });
  const timers = useRef<number[]>([]);
  const body = useRef<HTMLDivElement>(null);

  live.config = { name, model, servers, skills };
  const chat = useChatEngine({ intro, reply });

  // The bloub acts out what the agent is doing: thinking, orbiting while a tool runs, a wink when it is done.
  const lastMsg = chat.messages[chat.messages.length - 1];
  const toolRunning = Boolean(chat.busy && lastMsg?.parts.some((p) => p.kind === 'tool' && p.status === 'running'));
  useEffect(() => {
    if (chat.busy || !chat.messages.length) return;
    setAfter('wink');
    const id = window.setTimeout(() => setAfter(null), 1400);
    return () => window.clearTimeout(id);
  }, [chat.busy, chat.messages.length]);
  const mood: StateId = chat.busy ? (toolRunning ? 'orbit' : 'thinking') : (after ?? 'idle');

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // Braces matter: Chromium's scrollTo() now returns a Promise, which React would take for a cleanup.
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [section]);

  const configure = (s: SectionId) => {
    setSection(s);
    setOpen(true);
  };

  /** "Generate with AI": clears the agent and redrafts it, walking through the sections as it streams. */
  const generate = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setGenerating(true);
    setName('');
    setDescription('');
    setInstructions('');
    setStarters([]);
    setServers(SERVERS);
    setSkills(SKILLS);
    setLook({ shape: 'cercle', color: 'gris', expression: 'neutre' });
    let t = 200;
    for (let i = 1; i <= GEN.name.length; i++) later((t += 45), () => setName(GEN.name.slice(0, i)));
    later((t += 200), () => setLook((l) => ({ ...l, shape: GEN_LOOK.shape })));
    later((t += 200), () => setLook((l) => ({ ...l, color: GEN_LOOK.color })));
    later((t += 200), () => setLook(GEN_LOOK));
    for (let i = 4; i <= GEN.description.length + 3; i += 4) later((t += 22), () => setDescription(GEN.description.slice(0, i)));
    later((t += 300), () => setSection('instructions'));
    for (let i = 8; i <= GEN.instructions.length + 7; i += 8) later((t += 14), () => setInstructions(GEN.instructions.slice(0, i)));
    GEN.starters.forEach((_, i) => later((t += 160), () => setStarters(GEN.starters.slice(0, i + 1))));
    later((t += 400), () => setSection('mcp'));
    Object.keys(GEN_IDS.tools).forEach((sid) =>
      later((t += 420), () => {
        setServers((all) => all.map((s) => (s.id === sid ? generatedServers(SERVERS).find((g) => g.id === sid)! : s)));
        setLit((l) => new Set(l).add(sid));
        later(900, () => setLit((l) => (l.delete(sid), new Set(l))));
      }),
    );
    later((t += 500), () => setSection('skills'));
    later((t += 400), () => {
      setSkills((all) => all.map((s) => ({ ...s, on: GEN_IDS.skills.includes(s.id) })));
      setLit((l) => new Set(l).add('incident'));
      later(900, () => setLit(new Set()));
    });
    later((t += 300), () => setGenerating(false));
  };

  const addDoc = () => {
    const n = docs.length;
    const doc = { name: ['runbook-checkout.md', 'oncall-rotation.pdf', 'service-owners.csv'][n % 3], size: L.docSizes[n % 3], progress: 0 };
    setDocs((d) => [...d, doc]);
    for (let p = 20; p <= 100; p += 20) later(p * 9, () => setDocs((d) => d.map((x, i) => (i === n ? { ...x, progress: p } : x))));
  };

  const runDeploy = () => {
    setDeploy((d) => ({ ...d, state: 'deploying', progress: 0 }));
    for (let p = 10; p <= 100; p += 10) later(p * 22, () => setDeploy((d) => ({ ...d, progress: p, state: p === 100 ? 'live' : 'deploying' })));
  };

  const toolsOn = useMemo(() => servers.reduce((n, s) => n + (s.on && s.status === 'connected' ? s.tools.filter((t) => t.on).length : 0), 0), [servers]);
  const toolsAll = servers.reduce((n, s) => n + s.tools.length, 0);
  const skillsOn = skills.filter((s) => s.on).length;
  const builtinsOn = builtins.filter((b) => b.on).length;
  const tokens = toolsOn * 340 + skillsOn * 120 + builtinsOn * 260;
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const count: Partial<Record<SectionId, ReactNode>> = { mcp: toolsOn, skills: skillsOn, builtin: builtinsOn, knowledge: docs.length || undefined, deploy: deploy.state === 'live' ? <span className="size-1.5 rounded-full bg-emerald-500" /> : undefined };
  const checks: [string, boolean][] = [
    [L.checks[0], Boolean(name && model)],
    [L.checks[1], instructions.length > 40],
    [L.checks[2], toolsOn > 0],
    [L.checks[3], servers.every((s) => s.tools.every((t) => !t.on || !t.write || t.approval === 'ask'))],
    [L.checks[4], chat.messages.some((m) => m.role === 'assistant' && m.done)],
  ];
  const current = ALL.find((i) => i.id === section)!;
  // The viewBox leaves room for orbit rings, so the body is ~63% of `size`.
  const avatar = (size: number) => <Bloub size={size} state={mood} {...look} label={L.avatarOf(name)} className="-m-[3px] shrink-0" />;

  const sections: Record<SectionId, ReactNode> = {
    identity: (
      <div className="flex flex-col gap-6">
        <Frame className="border-violet-500/25 bg-violet-500/[0.07]">
          <FrameHeader icon={<Wand2 className="text-violet-600! dark:text-violet-400!" />} title={L.describeTitle}>
            {generating && <ThinkingIndicator label={L.generating} small showTimer={false} />}
          </FrameHeader>
          <FramePanel className="flex flex-col gap-2 p-2 sm:flex-row sm:items-end">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder={L.promptPlaceholder} className="min-h-12 flex-1 resize-none bg-transparent px-1.5 py-1 text-body-2-regular leading-6 outline-none placeholder:text-text-tertiary" />
            <button type="button" disabled={generating || !prompt.trim()} onClick={generate} className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 text-body-2-medium text-white shadow-xs disabled:opacity-40">
              {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />} {L.generate}
            </button>
          </FramePanel>
        </Frame>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Live bloub: follows the pointer at rest, plays whichever animation you pick below. */}
          <div className="flex shrink-0 flex-col items-center gap-1 self-center rounded-3xl bg-background-primary-default px-3 pt-1 pb-2.5 shadow-xs sm:self-start">
            <Bloub size={136} state={preview ?? mood} {...look} paper="panel" follow label={L.avatarOf(name)} />
            <span className="text-caption-1-medium text-text-tertiary">{BLOUB_NAMES[stateFor(preview ?? mood, look.shape)]}</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Field label={L.name}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={L.namePlaceholder} className={cn(field, 'h-9')} />
            </Field>
            <Field label={L.description} hint={L.descriptionHint}>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={L.descriptionPlaceholder} className={cn(field, 'h-9')} />
            </Field>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={L.model}>
            <div className={cn(field, 'flex h-9 items-center px-1')}>
              <ModelPicker value={model} onChange={setModel} className="w-full justify-between" />
            </div>
          </Field>
          <Field label={L.temperature} hint={temperature.toLocaleString(intlLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}>
            <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="h-9 w-full accent-[var(--color-text-primary)]" />
          </Field>
        </div>

        {/* our 4 bloub characters, bloub's customiser: 7 more shapes, 12 colours, 16 resting expressions, and the 14 animations to preview. */}
        <Frame>
          <FrameHeader icon={<Sparkles />} title={L.avatar}>
            <span className="text-caption-1-regular text-text-tertiary">bloub</span>
          </FrameHeader>
          <FramePanel className="flex flex-col gap-4 p-3">
            <Picker label={L.character}>
              {BLOUBS.map((b) => (
                <Thumb key={b.id} name={BLOUB_NAMES[b.id]} on={look.shape === b.shape} onClick={() => setLook({ ...look, shape: b.shape })}>
                  <Bloub size={52} frozenAt={POSES.idle} variant={b.id} color={look.color} expression={look.expression} paper="panel" />
                </Thumb>
              ))}
            </Picker>
            <Picker label={L.shape}>
              {SHAPES.filter((s) => !BLOUBS.some((b) => b.shape === s.id)).map((s) => (
                <Thumb key={s.id} name={BLOUB_NAMES[s.id]} on={look.shape === s.id} onClick={() => setLook({ ...look, shape: s.id })}>
                  <Bloub size={52} frozenAt={POSES.idle} shape={s.id} color={look.color} expression={look.expression} paper="panel" />
                </Thumb>
              ))}
            </Picker>
            <Picker label={L.colour} cols="grid-cols-6 sm:grid-cols-12">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={BLOUB_NAMES[c.id]}
                  aria-label={BLOUB_NAMES[c.id]}
                  aria-pressed={look.color === c.id}
                  onClick={() => setLook({ ...look, color: c.id })}
                  className={cn('mx-auto size-7 rounded-full border border-black/10 ring-offset-2 ring-offset-background-primary-default transition-[box-shadow,scale] hover:scale-110 dark:border-white/15', look.color === c.id && 'ring-2 ring-text-primary')}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </Picker>
            <Picker label={L.expression}>
              {EXPRESSIONS.map((e) => (
                <Thumb key={e.id} name={BLOUB_NAMES[e.id]} on={look.expression === e.id} onClick={() => setLook({ ...look, expression: e.id })}>
                  <Bloub size={52} frozenAt={POSES.idle} shape={look.shape} color={look.color} expression={e.id} paper="panel" />
                </Thumb>
              ))}
            </Picker>
            <Picker label={L.animations} hint={L.clickToPreview}>
              {statesFor(look.shape).map((s) => (
                <Thumb key={s} name={BLOUB_NAMES[s]} on={preview === s} onClick={() => setPreview(preview === s ? null : s)}>
                  <Bloub size={52} state={s} frozenAt={POSES[s]} shape={look.shape} color={look.color} expression={look.expression} paper="panel" />
                </Thumb>
              ))}
            </Picker>
          </FramePanel>
        </Frame>
      </div>
    ),

    instructions: (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default shadow-xs focus-within:border-border-button-hover">
          <div className="flex items-center gap-1.5 border-b border-separator-border px-3 py-1.5">
            {['{{user.name}}', '{{date}}', '{{team}}'].map((v) => (
              <button key={v} type="button" onClick={() => setInstructions((s) => `${s}${v}`)} className="rounded-md bg-background-tertiary-default px-1.5 py-0.5 font-mono text-caption-2-regular text-text-secondary hover:text-text-primary">
                {v}
              </button>
            ))}
            <span className="ms-auto text-caption-1-regular text-text-tertiary tabular-nums">{instructions.length} {L.chars}</span>
          </div>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={12} placeholder={L.instructionsPlaceholder} className="scrollbar-thin resize-none bg-transparent px-3.5 py-3 font-mono text-[12.5px] leading-6 text-text-primary outline-none placeholder:text-text-tertiary" />
        </div>
        <Field label={L.starters} hint={L.startersHint}>
          <div className="flex flex-col gap-1.5">
            {starters.map((s, i) => (
              <div key={i} className="animate-in fade-in-0 slide-in-from-left-1 flex items-center gap-2 duration-300">
                <input value={s} onChange={(e) => setStarters(starters.map((x, j) => (j === i ? e.target.value : x)))} className={cn(field, 'h-8')} />
                <IconButton label={L.removeStarter} onClick={() => setStarters(starters.filter((_, j) => j !== i))}>
                  <X />
                </IconButton>
              </div>
            ))}
            <button type="button" onClick={() => setStarters([...starters, ''])} className="flex h-8 w-fit items-center gap-1.5 rounded-lg px-2 text-body-2-medium text-text-secondary hover:text-text-primary">
              <Plus className="size-4" /> {L.addStarter}
            </button>
          </div>
        </Field>
      </div>
    ),

    mcp: (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            [L.toolsOn, `${toolsOn}/${toolsAll}`],
            [L.servers, `${servers.filter((s) => s.on && s.status === 'connected').length}/${servers.length}`],
            [L.context, `${(tokens / 1000).toLocaleString(intlLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${L.tok}`],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col rounded-2xl bg-background-primary-default px-3 py-2 shadow-xs">
              <span className="text-caption-1-medium text-text-tertiary">{k}</span>
              <span className="text-headline-semibold tabular-nums">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-button-default bg-background-primary-default px-2.5 shadow-xs">
            <Search className="size-4 text-foreground-icon-tertiary" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L.filterPlaceholder} className="min-w-0 flex-1 bg-transparent text-body-2-regular outline-none placeholder:text-text-tertiary" />
          </label>
          <HeaderButton outline onClick={() => setAdding((a) => !a)}>
            {adding ? <X /> : <Plus />} <span className="hidden sm:inline">{adding ? L.cancel : L.addServer}</span>
          </HeaderButton>
        </div>
        {adding && (
          <div className="animate-in fade-in-0 slide-in-from-top-1 flex flex-col gap-2 rounded-2xl bg-background-primary-default p-3 shadow-xs duration-200">
            <div className="flex gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://mcp.example.com/sse" className={cn(field, 'h-8 font-mono text-caption-1-regular')} />
              <button
                type="button"
                disabled={!url.trim()}
                onClick={() => {
                  const host = url.replace(/^https?:\/\//, '');
                  setServers([...servers, { id: `custom-${servers.length}`, name: host.split(/[./]/)[1] ?? host, logo: <Link2 className="size-full text-foreground-icon-secondary" />, url: host, status: 'connected', on: true, tools: [{ ...tool('ping', 'ping', L.toolDesc.ping), on: true }, tool('call', 'call', L.toolDesc.call, true)] }]);
                  setUrl('');
                  setAdding(false);
                }}
                className="h-8 shrink-0 rounded-lg bg-text-primary px-3 text-body-2-medium text-background-primary-default disabled:opacity-30"
              >
                {L.connect}
              </button>
            </div>
            <span className="text-caption-1-regular text-text-tertiary">{L.serverHint}</span>
          </div>
        )}
        <Frame>
          {servers.filter((s) => match(s.name) || s.tools.some((t) => match(t.name))).map((s) => (
            <ServerCard key={s.id} s={s} highlight={lit.has(s.id)} onChange={(n) => setServers(servers.map((x) => (x.id === n.id ? n : x)))} />
          ))}
        </Frame>
      </div>
    ),

    skills: (
      <div className="flex flex-col gap-2">
        {skills.map((s) => (
          <Row
            key={s.id}
            className={flash(lit.has(s.id))}
            icon={<FileText className="text-violet-600 dark:text-violet-400" />}
            title={
              <>
                {s.name}
                <span className="font-mono text-caption-2-regular font-normal text-text-tertiary">v{s.version}</span>
                <Badge tone={s.by === 'anthropic' ? 'info' : s.by === 'team' ? 'purple' : 'neutral'} className="hidden h-[18px] px-1 sm:inline-flex">
                  {L.by[s.by as keyof typeof L.by]}
                </Badge>
              </>
            }
            desc={s.desc}
          >
            <Switch checked={s.on} onCheckedChange={(on) => setSkills(skills.map((x) => (x.id === s.id ? { ...x, on } : x)))} aria-label={L.enable(s.name)} />
          </Row>
        ))}
        <button type="button" className="mt-1 flex h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-border-button-hover text-body-2-medium text-text-secondary transition-colors hover:bg-background-primary-default hover:text-text-primary">
          <Upload className="size-4" /> {L.uploadSkill}
        </button>
      </div>
    ),

    builtin: (
      <div className="flex flex-col gap-2">
        {builtins.map((b) => (
          <Row key={b.id} icon={b.icon} title={b.name} desc={b.desc}>
            <Switch checked={b.on} onCheckedChange={(on) => setBuiltins(builtins.map((x) => (x.id === b.id ? { ...x, on } : x)))} aria-label={L.enable(b.name)} />
          </Row>
        ))}
      </div>
    ),

    knowledge: (
      <div className="flex flex-col gap-5">
        <button type="button" onClick={addDoc} className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-button-hover bg-background-primary-default/60 px-4 py-8 text-center transition-colors hover:bg-background-primary-default">
          <span className="grid size-10 place-items-center rounded-xl bg-background-tertiary-default text-foreground-icon-secondary">
            <Upload className="size-5" />
          </span>
          <span className="text-body-2-medium text-text-primary">{L.dropFiles}</span>
          <span className="text-caption-1-regular text-text-tertiary">{L.fileLimits}</span>
        </button>
        {docs.map((d, i) => (
          <Row key={i} icon={<FileText />} title={d.name} desc={<span className="flex items-center gap-2">{d.size}<span className="h-1 w-24 overflow-hidden rounded-full bg-background-tertiary-default"><span className={cn('block h-full rounded-full transition-[width] duration-300', d.progress === 100 ? 'bg-emerald-500' : 'bg-accent-500')} style={{ width: `${d.progress}%` }} /></span></span>}>
            {d.progress === 100 ? <Badge tone="success">{L.indexed}</Badge> : <Badge tone="info">{d.progress}%</Badge>}
          </Row>
        ))}
        <Field label={L.websites} hint={L.websitesHint}>
          <div className="flex gap-2">
            <input placeholder="https://docs.acme.dev" className={cn(field, 'h-9')} />
            <button type="button" className="h-9 shrink-0 rounded-xl border border-border-button-default bg-background-primary-default px-3 text-body-2-medium shadow-xs">
              {L.add}
            </button>
          </div>
        </Field>
      </div>
    ),

    deploy: (
      <div className="flex flex-col gap-5">
        <Frame>
          <FrameHeader icon={<ShieldCheck />} title={L.checklist}>
            <Badge tone={checks.every(([, ok]) => ok) ? 'success' : 'warning'}>
              {checks.filter(([, ok]) => ok).length}/{checks.length}
            </Badge>
          </FrameHeader>
          <FramePanel>
            <ul className="flex flex-col py-1">
              {checks.map(([k, ok]) => (
                <li key={k} className="flex items-center gap-2.5 px-3 py-1.5 text-body-2-regular">
                  {ok ? (
                    <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-2.5" strokeWidth={3.5} />
                    </span>
                  ) : (
                    <span className="size-4 rounded-full border-[1.5px] border-dashed border-foreground-icon-quaternary" />
                  )}
                  <span className={ok ? 'text-text-primary' : 'text-text-secondary'}>{k}</span>
                </li>
              ))}
            </ul>
          </FramePanel>
        </Frame>
        <div className="flex flex-col gap-2">
          {([['api', <Code2 key="a" />], ['slack', <Hash key="s" />], ['widget', <Globe key="w" />]] as const).map(([id, icon]) => (
            <Row key={id} icon={icon} title={L.targets[id][0]} desc={L.targets[id][1]}>
              <Switch checked={deploy.targets[id]} onCheckedChange={(on) => setDeploy((d) => ({ ...d, targets: { ...d.targets, [id]: on } }))} aria-label={L.deployTo(L.targets[id][0])} />
            </Row>
          ))}
        </div>
        {deploy.state === 'live' ? (
          <CodeBlock className="tpl-reveal" lang="bash" title={L.liveTitle} code={`curl https://agents.acme.dev/v1/${(name || L.agentFallback).toLowerCase().replace(/\s+/g, '-')}/runs \\\n  -H "Authorization: Bearer $ACME_KEY" \\\n  -d '{"input": "${GEN.starters[0]}"}'`} />
        ) : (
          <button type="button" disabled={deploy.state === 'deploying'} onClick={runDeploy} className="relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-text-primary text-body-medium text-background-primary-default shadow-xs disabled:cursor-wait">
            {deploy.state === 'deploying' && <span className="absolute inset-y-0 left-0 bg-white/15 transition-[width] duration-200" style={{ width: `${deploy.progress}%` }} />}
            {deploy.state === 'deploying' ? <LoaderCircle className="size-4 animate-spin" /> : <Rocket className="size-4" />}
            {deploy.state === 'deploying' ? L.deploying(deploy.progress) : L.deploy(name || L.agentFallback)}
          </button>
        )}
      </div>
    ),
  };

  const empty = chat.messages.length === 0;
  const composer = (
    <Composer reply={chat.replyTo} onClearReply={chat.clearReply}
      context={Math.min(95, 14 + Math.round(tokens / 120) + chat.messages.length * 3)}
      branch="Main"
      project={(name || "agent").toLowerCase().replace(/\s+/g, "-")}
      value={chat.draft}
      onChange={chat.setDraft}
      onSend={chat.send}
      onStop={chat.stop}
      busy={chat.busy}
      placeholder={L.messageTo(name || L.yourAgentLower)}
      model={<ModelPicker value={model} onChange={setModel} />}
      status={
        <>
          <button type="button" onClick={() => configure('mcp')} className="flex items-center gap-1 rounded-md px-1 transition-colors hover:text-text-primary">
            <Wrench /> {L.toolsSkills(toolsOn, skillsOn)}
          </button>
          <button type="button" onClick={() => configure('deploy')} className="flex items-center gap-1 rounded-md px-1 transition-colors hover:text-text-primary">
            <Rocket /> {deploy.state === 'live' ? L.live : L.draft}
          </button>
        </>
      }
    />
  );

  return (
    <Canvas>
      <ChatSurface
        dep={chat.messages}
        empty={empty}
        header={
          <>
            {avatar(36)}
            <span className="min-w-0 truncate text-headline-medium">{name || L.newAgent}</span>
            <Badge tone="outline" className="hidden sm:inline-flex">{model}</Badge>
            <span className="ms-auto flex items-center gap-1">
              <HeaderTools />
              <HeaderButton outline onClick={() => configure('identity')}>
                <Settings2 /> <span className="hidden sm:inline">{L.configure}</span>
              </HeaderButton>
            </span>
          </>
        }
        footer={!empty && composer}
      >
        {empty ? (
          <Welcome icon={avatar(96)} title={name || L.yourAgent} subtitle={description}>
            <div className="mt-2 w-full max-w-2xl text-start">{composer}</div>
            <Suggestions className="justify-center" items={starters.filter(Boolean)} onPick={chat.send} />
          </Welcome>
        ) : (
          chat.messages.map((m, i) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} replyTo={m.replyTo} onEdit={() => chat.setDraft(textOf(m))}>
                {textOf(m)}
              </UserMessage>
            ) : (
              <AssistantMessage key={m.id} message={m} onReply={chat.startReply} isLast={i === chat.messages.length - 1} toolIcon={() => <Wrench />} onRegenerate={() => chat.send(GEN.starters[0])} />
            ),
          )
        )}
      </ChatSurface>

      {/* Settings: ~60% of the window on desktop with a side menu; full screen with tabs on phones. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          // Focus the dialog itself rather than the first menu item, which would open with a focus ring.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).focus();
          }}
          aria-describedby={undefined}
          className="bg-background-secondary-default max-md:inset-2 max-md:h-auto max-md:w-auto max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-2xl max-md:border max-md:border-border-button-default md:h-[min(760px,88vh)] md:w-[clamp(min(720px,94vw),60vw,1120px)] md:flex-row md:rounded-3xl md:border md:border-border-button-default"
        >
          {/* Side menu (desktop) */}
          <aside className="hidden w-60 shrink-0 flex-col gap-4 border-e border-separator-border p-3 md:flex">
            <div className="flex items-center gap-2.5 px-1.5 pt-1">
              {avatar(46)}
              <div className="flex min-w-0 flex-col">
                <DialogTitle className="truncate text-body-semibold">{name || L.newAgent}</DialogTitle>
                <span className="text-caption-1-regular text-text-tertiary">{deploy.state === 'live' ? L.live : L.draft} · {model}</span>
              </div>
            </div>
            <nav aria-label={L.agentSettings} className="scrollbar-thin flex flex-1 flex-col gap-4 overflow-y-auto">
              {MENU.map((g) => (
                <div key={g.group} className="flex flex-col gap-0.5">
                  <span className="px-2 pb-1 text-caption-1-medium text-text-tertiary">{g.group}</span>
                  {g.items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setSection(it.id)}
                      aria-current={section === it.id ? 'page' : undefined}
                      className={cn('flex h-9 items-center gap-2.5 rounded-2lg px-2 text-body-2-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring [&>svg]:size-4', section === it.id ? 'bg-background-primary-default text-text-primary shadow-xs' : 'text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary')}
                    >
                      {it.icon}
                      {it.label}
                      {count[it.id] !== undefined && <span className="ms-auto text-caption-1-medium text-text-tertiary tabular-nums">{count[it.id]}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            <button type="button" onClick={() => setSection('identity')} className="flex items-center gap-2 rounded-2xl bg-violet-500/10 px-3 py-2.5 text-start text-body-2-medium text-violet-700 transition-colors hover:bg-violet-500/15 dark:text-violet-300">
              {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              {generating ? L.draftingAgent : L.generateWithAi}
            </button>
          </aside>

          {/* Content */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex shrink-0 items-start gap-3 border-b border-separator-border px-4 pt-3 pb-3 md:px-6 md:pt-5">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-title-3-semibold text-text-primary">
                  <span className="md:hidden">{avatar(30)}</span>
                  {current.label}
                </span>
                <DialogDescription className="text-body-2-regular text-text-secondary">{current.sub}</DialogDescription>
              </div>
              <IconButton label={L.closeSettings} onClick={() => setOpen(false)} className="size-8">
                <X />
              </IconButton>
            </header>
            {/* Tabs (phones) */}
            <nav aria-label={L.agentSettings} className="scrollbar-none flex shrink-0 gap-1 overflow-x-auto border-b border-separator-border px-3 py-2 md:hidden">
              {ALL.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSection(it.id)}
                  className={cn('flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-caption-1-medium transition-colors [&>svg]:size-3.5', section === it.id ? 'bg-text-primary text-background-primary-default' : 'bg-background-primary-default text-text-secondary shadow-xs')}
                >
                  {it.icon} {it.label}
                </button>
              ))}
            </nav>
            <div ref={body} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
              <div key={section} className="animate-in fade-in-0 slide-in-from-bottom-1 mx-auto w-full max-w-2xl px-4 py-5 duration-200 md:px-6">
                {sections[section]}
              </div>
            </div>
            <footer className="flex h-14 shrink-0 items-center gap-2 border-t border-separator-border px-4 md:px-6">
              <span className="flex items-center gap-1.5 text-caption-1-regular text-text-tertiary">
                {generating ? <LoaderCircle className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                {generating ? L.drafting : L.saved}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  chat.send(GEN.starters[0]);
                }}
                className="ms-auto flex h-8 items-center gap-1.5 rounded-lg border border-border-button-default bg-background-primary-default px-3 text-body-2-medium shadow-xs"
              >
                <MessageSquare className="size-4" /> <span className="hidden sm:inline">{L.testInChat}</span>
                <span className="sm:hidden">{L.test}</span>
              </button>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 items-center rounded-lg bg-text-primary px-4 text-body-2-medium text-background-primary-default shadow-xs">
                {L.done}
              </button>
            </footer>
          </section>
        </DialogContent>
      </Dialog>
    </Canvas>
  );
}
