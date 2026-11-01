import { Fragment, createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type CSSProperties, type Dispatch, type KeyboardEvent, type ReactNode, type SetStateAction } from 'react';
import { ContextMenu as CM, DropdownMenu as DM, Dialog, Popover, Switch, Tooltip } from 'radix-ui';
import {
  AlarmClock,
  Anchor,
  Aperture,
  Apple,
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Banana,
  Beer,
  Bell,
  Bird,
  Blocks,
  Bookmark,
  BookOpen,
  Box,
  Briefcase,
  Bug,
  Building,
  Calculator,
  Calendar,
  Camera,
  Car,
  Carrot,
  Cat,
  ChefHat,
  Cherry,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CirclePause,
  Clipboard,
  Clock,
  Code,
  Coffee,
  Compass,
  Component,
  Copy,
  Cpu,
  CreditCard,
  CupSoda,
  Database,
  Diamond,
  Dog,
  DollarSign,
  Download,
  Droplet,
  Droplets,
  Ellipsis,
  Eye,
  EyeOff,
  FileDown,
  Files,
  FileText,
  Film,
  Fish,
  Flag,
  Flame,
  FlaskConical,
  FolderPlus,
  Gamepad2,
  Gem,
  Glasses,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  Highlighter,
  History,
  Hourglass,
  House,
  Image,
  Info,
  Key,
  Landmark,
  Languages,
  Laptop,
  LayoutGrid,
  Leaf,
  Lightbulb,
  List,
  LockOpen,
  Mail,
  Maximize2,
  Microscope,
  Minimize2,
  Minus,
  Monitor,
  Moon,
  Mountain,
  Music,
  Music2,
  Paintbrush,
  Palette,
  Pause,
  Phone,
  Pin,
  PinOff,
  Plane,
  Play,
  RefreshCw,
  Reply,
  Rocket,
  RotateCw,
  Sailboat,
  Scale,
  Search,
  Share2,
  Shield,
  Shirt,
  SlidersHorizontal,
  Smartphone,
  Smile,
  Sparkles,
  SquareArrowOutUpRight,
  Star,
  Stethoscope,
  StickyNote,
  Sun,
  Sword,
  Tag,
  ThumbsDown,
  ThumbsUp,
  TimerReset,
  TrainFront,
  Trash2,
  TreePine,
  Truck,
  Umbrella,
  User,
  Users,
  Utensils,
  Video,
  Volume2,
  Webhook,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Bloub, type ColorId } from './kit/bloub';
import { useChatEngine, type AssistantApi, type ChatScriptApi, type Message, type Part } from './kit/engine';
import { AgentFeed, useElapsed } from '@/components/agent-feed';
import { MarkdownTable, Words, parseMarkdown } from './kit/markdown';
import { copyOf, defineCopy, getLocale, intlLocale, useCopy } from './kit/i18n';

/* ---------- Copy: English and French, one block per area ---------- */

const COPY_CORE = defineCopy({
  en: {
    close: 'Close',
    lead: 'Lead',
    searching: 'Searching the web',
    searched: 'Searched the web',
    noResult: '0 results',
    results: (n: number) => `${n} results`,
    visited: 'Visited',
    imagesSearched: 'Searched images',
    thinkingFor: (s: string) => `Thinking for ${s}`,
    thoughtFor: (s: string) => `Thought for ${s}`,
    thinking: 'Thinking',
    agentsThinking: 'Agents thinking',
    thoughts: 'Thoughts',
    sourcesTitle: 'Sources',
    searchesDone: (n: number) => `${n} search${n > 1 ? 'es' : ''} performed`,
    openImage: (c: string) => `Open image: ${c}`,
    edit: 'Edit',
    copy: 'Copy',
    copyAnswer: 'Copy response',
    shareLink: 'Create a share link',
    regenerate: 'Regenerate',
    reportProblem: 'Report an issue',
    exportPdf: 'Export as PDF',
    readAloud: 'Read aloud',
    showMore: 'Show more',
    showLess: 'Show less',
    resultTitles: (Q: string, q: string) => [`${Q}: the complete guide`, `${Q}: ranking and prices`, `Everything you need to know: ${q}`, `${Q} (updated October 2026)`, `The best picks: ${q}`, `${Q}: reviews and comparison`],
    models: { auto: 'Auto', fast: 'Fast', expert: 'Expert', heavy: 'Heavy', build: 'Build', bot: 'Bot' },
    hints: ['Drag and drop folders into the chat (AI Agent)', 'Type @ to search your apps (AI Agent)', 'Switch to Build mode to create apps (AI Agent)', 'Type / to use slash commands (AI Agent)'],
    recentFiles: ['invoice-october-2026.pdf', 'dashboard-screenshot.png', 'product-meeting-notes.pdf', 'team-photo.jpg', 'budget-forecast.pdf'],
  },
  fr: {
    close: 'Fermer',
    lead: 'Responsable',
    searching: 'Recherche sur le web',
    searched: 'Recherché sur le web',
    noResult: '0 résultat',
    results: (n: number) => `${n} résultats`,
    visited: 'Consulté',
    imagesSearched: 'Images recherchées',
    thinkingFor: (s: string) => `Réflexion pendant ${s}`,
    thoughtFor: (s: string) => `Réflexion : ${s}`,
    thinking: 'Réflexion',
    agentsThinking: 'Les agents réfléchissent',
    thoughts: 'Réflexions',
    sourcesTitle: 'Sources',
    searchesDone: (n: number) => `${n} recherche${n > 1 ? 's' : ''} effectuée${n > 1 ? 's' : ''}`,
    openImage: (c: string) => `Ouvrir l’image : ${c}`,
    edit: 'Modifier',
    copy: 'Copier',
    copyAnswer: 'Copier la réponse',
    shareLink: 'Créer un lien de partage',
    regenerate: 'Régénérer',
    reportProblem: 'Signaler un problème',
    exportPdf: 'Exporter en PDF',
    readAloud: 'Lire à voix haute',
    showMore: 'Afficher plus',
    showLess: 'Afficher moins',
    resultTitles: (Q: string, q: string) => [`${Q} : le guide complet`, `${Q} — classement et prix`, `Tout savoir : ${q}`, `${Q} (mise à jour octobre 2026)`, `Les meilleurs choix : ${q}`, `${Q} — avis et comparatif`],
    models: { auto: 'Auto', fast: 'Rapide', expert: 'Expert', heavy: 'Lourd', build: 'Build', bot: 'Bot' },
    hints: ['Glisser-déposer des dossiers dans le chat (Agent IA)', 'Saisir @ pour rechercher vos applications (Agent IA)', 'Passez en mode Build pour créer des applications (Agent IA)', 'Saisir / pour utiliser les commandes slash (Agent IA)'],
    recentFiles: ['facture-octobre-2026.pdf', 'capture-ecran-dashboard.png', 'notes-reunion-produit.pdf', 'photo-equipe.jpg', 'budget-previsionnel.pdf'],
  },
});

const COPY_COMPOSER = defineCopy({
  en: {
    attach: 'Attach',
    uploadFile: 'Upload a file',
    addToProject: 'Add to project',
    createProject: 'Create a project',
    recentFilesLabel: 'Recent files',
    skills: 'Skills',
    createSkill: 'Create a skill',
    manageSkills: 'Manage skills',
    addConnector: 'Add a connector',
    model: (l: string) => `Model: ${l}`,
    ask: 'Ask Grok anything',
    privateChat: 'Private chat',
    dictation: 'Dictation (Ctrl+D)',
    stop: 'Stop',
    send: 'Send',
    voiceMode: 'Switch to voice mode (Ctrl+⇧O)',
    privateNotice: "This chat won't appear in your history and won't be used to train models.",
  },
  fr: {
    attach: 'Joindre',
    uploadFile: 'Importer un fichier',
    addToProject: 'Ajouter au projet',
    createProject: 'Créer un projet',
    recentFilesLabel: 'Fichiers récents',
    skills: 'Compétences',
    createSkill: 'Créer une compétence',
    manageSkills: 'Gérer les compétences',
    addConnector: 'Ajouter un connecteur',
    model: (l: string) => `Modèle : ${l}`,
    ask: 'Poser une question à Grok',
    privateChat: 'Chat privé',
    dictation: 'Dictée (Ctrl+D)',
    stop: 'Arrêter',
    send: 'Envoyer',
    voiceMode: 'Passer en mode vocal (Ctrl+⇧O)',
    privateNotice: "Ce chat n'apparaîtra pas dans votre historique et ne sera pas utilisé pour entraîner des modèles.",
  },
});

const COPY_SIDE = defineCopy({
  en: {
    mainBot: 'Main bot',
    unread: 'Unread',
    markRead: 'Mark as read',
    markUnread: 'Mark as unread',
    deleteBotTitle: 'Delete bot?',
    deleteBotBody: (n: string) => `"${n}" and its conversation will be permanently deleted.`,
    delete: 'Delete',
    optionsFor: (n: string) => `Options for ${n}`,
    unpin: 'Unpin',
    pin: 'Pin',
    moveTo: 'Move to',
    moveNewSection: 'Move to a new section',
    editProfile: 'Edit profile',
    hideSidebar: 'Hide from sidebar',
    replaceBot: 'Replace with a different bot',
    openNewTab: 'Open in new tab',
    rename: 'Rename',
    deleteChatTitle: 'Delete chat?',
    deleteChatBody: (n: string) => `"${n}" will be removed from your history.`,
    renameChat: 'Rename chat',
    unpinChat: 'Unpin chat',
    pinChat: 'Pin chat',
    options: 'Options',
    settings: 'Settings',
    help: 'Help',
    feedback: 'Feedback',
    faq: 'FAQ',
    releaseNotes: 'Release notes',
    community: 'Community',
    sharedLinks: 'Shared links',
    signOut: 'Sign out',
    signOutToast: 'Demo: you stay signed in.',
    home: 'Home page',
    searchTip: 'Search (Ctrl+K)',
    search: 'Search',
    hideTip: 'Hide sidebar',
    toggleSidebar: 'Show/Hide sidebar',
    navChat: 'Chat',
    navLibrary: 'Library',
    navAutomations: 'Automations',
    bots: 'Bots',
    newBot: 'New bot',
    pinned: 'Pinned',
    showMore: 'Show more',
    showLess: 'Show less',
    chats: 'Chats',
    recent: 'Recent',
    seeAll: 'See all',
    projects: 'Projects',
    allProjects: 'All projects',
    addProject: 'Add a project',
    accountMenu: 'Account menu, Alex',
    commandMenu: 'Command menu',
    searchPlaceholder: 'Search…',
    tabChats: 'Chats',
    tabMedia: 'Media',
    actions: 'Actions',
    showAll: 'Show all',
    newPrivate: 'Create a new private chat',
    selectPreview: 'Select a conversation to preview',
    shrink: 'Shrink',
    expand: 'Expand',
    today: 'Today',
    justNow: 'A few seconds ago',
    phrases: ['Writing the answer', 'Reading the instructions', 'Transmogrifying the zorgs', 'Negotiating with photons', 'Calibrating the distortion core', 'Mapping the nebula'],
  },
  fr: {
    mainBot: 'Bot principal',
    unread: 'Non lu',
    markRead: 'Marquer comme lu',
    markUnread: 'Marquer comme non lu',
    deleteBotTitle: 'Supprimer le bot ?',
    deleteBotBody: (n: string) => `« ${n} » et sa conversation seront supprimés définitivement.`,
    delete: 'Supprimer',
    optionsFor: (n: string) => `Options pour ${n}`,
    unpin: 'Détacher',
    pin: 'Épingler',
    moveTo: 'Déplacer vers',
    moveNewSection: 'Déplacer vers une nouvelle section',
    editProfile: 'Modifier le profil',
    hideSidebar: 'Masquer de la barre latérale',
    replaceBot: 'Remplacer par un bot différent',
    openNewTab: 'Ouvrir un nouvel onglet',
    rename: 'Renommer',
    deleteChatTitle: 'Supprimer le chat ?',
    deleteChatBody: (n: string) => `« ${n} » sera supprimé de votre historique.`,
    renameChat: 'Renommer le chat',
    unpinChat: 'Détacher le chat',
    pinChat: 'Épingler le chat',
    options: 'Options',
    settings: 'Paramètres',
    help: 'Aide',
    feedback: 'Votre avis',
    faq: 'FAQ',
    releaseNotes: 'Notes de version',
    community: 'Communauté',
    sharedLinks: 'Liens partagés',
    signOut: 'Se déconnecter',
    signOutToast: 'Démo : la session reste ouverte.',
    home: "Page d'accueil",
    searchTip: 'Rechercher (Ctrl+K)',
    search: 'Rechercher',
    hideTip: 'Masquer la barre latérale',
    toggleSidebar: 'Afficher/Masquer la barre latérale',
    navChat: 'Chat',
    navLibrary: 'Bibliothèque',
    navAutomations: 'Automatisations',
    bots: 'Bots',
    newBot: 'Nouveau bot',
    pinned: 'Épinglés',
    showMore: 'Afficher plus',
    showLess: 'Afficher moins',
    chats: 'Discussions',
    recent: 'Récents',
    seeAll: 'Tout voir',
    projects: 'Projets',
    allProjects: 'Tous les projets',
    addProject: 'Ajouter un projet',
    accountMenu: 'Menu du compte, Alex',
    commandMenu: 'Menu de commandes',
    searchPlaceholder: 'Rechercher…',
    tabChats: 'Discussions',
    tabMedia: 'Médias',
    actions: 'Actions',
    showAll: 'Tout afficher',
    newPrivate: 'Créer un nouveau chat privé',
    selectPreview: 'Sélectionnez une conversation à prévisualiser',
    shrink: 'Réduire',
    expand: 'Agrandir',
    today: "Aujourd'hui",
    justNow: 'Il y a quelques secondes',
    phrases: ['Rédaction de la réponse', 'Lecture des consignes', 'Transmogrification des zorgs', 'Négociation avec les photons', 'Calibration du noyau de distorsion', 'Cartographie de la nébuleuse'],
  },
});

const COPY_BOTS = defineCopy({
  en: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    create: 'Create',
    newSection: 'New section',
    sectionName: 'Section name',
    sectionPlaceholder: 'e.g. Work',
    avatarColor: 'Avatar color',
    avatarShape: 'Avatar shape',
    newBotName: 'New Bot',
    createBot: 'Create a bot',
    editAvatar: 'Edit bot avatar',
    botName: 'Bot name',
    termsPre: 'By using Grok Bot, you also agree to these',
    termsLink: 'Terms',
    settings: 'Settings',
    avatar: 'Avatar',
    tabBot: 'Bot',
    tabGenerate: 'Generate',
    tabImport: 'Import',
    describeAvatar: 'Describe the avatar',
    importAvatarImage: 'Import avatar image',
    importImage: 'Import an image',
    name: 'Name',
    titleOptional: 'Title (optional)',
    titlePlaceholder: 'Research, marketing, administration',
    description: 'Description',
    descPlaceholder: 'How can this bot help you?',
    save: 'Save',
    chooseMain: 'Choose a main bot',
    search: 'Search',
    bots: 'Bots',
    noBots: 'No bots',
    computerView: "Bot's computer view",
    virtualComputer: 'Virtual computer',
    fakeTab: 'research: notes of the week',
    folders: ['Documents', 'Screenshots', 'Notes'],
    demoRunning: 'Demonstration in progress',
    endDemo: 'End demonstration',
    teachTask: 'Teach a task',
    addBot: 'Add a bot',
    searchOrCreate: 'Search or create bots',
    createNamed: (q: string) => `Create "${q}"`,
    showComputer: 'Show computer',
    more: 'More',
    templateCreated: (n: string) => `Template created from "${n}"`,
    createTemplate: 'Create a template',
    firstMessage: 'Send a first message to get started.',
    createProject: 'Create a project',
    projectName: 'Project name',
    newProject: 'New project',
    remove: (f: string) => `Remove ${f}`,
    addFilesOrFolder: 'Add files or a folder',
    add: 'Add',
    chooseFiles: 'Choose files',
    chooseFolder: 'Choose a folder',
    connectDrive: 'Connect Google Drive in Plugins to import your files.',
    connectBox: 'Connect Box in Plugins to import your files.',
    deleteProjectTitle: 'Delete project?',
    deleteProjectBody: (n: string) => `"${n}" and its files will be deleted. Chats stay in your history.`,
    delete: 'Delete',
    startChatIn: (n: string) => `Start a chat in ${n}`,
    startChatHere: 'Start a chat in this project',
    instructions: 'Instructions',
    instructionsPlaceholder: 'How should Grok respond in this project?',
    files: 'Files',
    addFiles: 'Add files',
    noFiles: 'No files yet',
    noFilesHint: "Grok automatically answers using your project's files and instructions.",
    chats: 'Chats',
    noChats: 'Chats started here, or moved to this project, will show up here.',
    preview: 'Preview',
    expand: 'Expand',
    togglePanel: 'Show/Hide panel',
    back: 'Back',
    forward: 'Forward',
    refreshApp: 'Refresh app preview',
    openNewTab: 'Open in new tab',
    mobilePreview: 'Mobile preview',
    appPreview: 'App preview',
    moreIdeas: 'More ideas',
    chipViewer: 'Product viewer',
    chipRipples: 'Fluid ripples',
    thinkMore: 'Think harder',
    reactMsg: 'React to message',
    replyMsg: 'Reply to message',
    moreMsgActions: 'More message actions',
    finished: 'Grok finished responding',
    buildLang: 'en',
    buildTitle: 'Click counter',
    buildHeading: 'Clicks recorded',
    buildReset: 'Reset',
    buildKey: 'clicks',
    buildUrl: 'click-counter.preview.app',
  },
  fr: {
    confirm: 'Confirmer',
    cancel: 'Annuler',
    create: 'Créer',
    newSection: 'Nouvelle section',
    sectionName: 'Nom de la section',
    sectionPlaceholder: 'Ex. Travail',
    avatarColor: "Couleur de l'avatar",
    avatarShape: "Forme de l'avatar",
    newBotName: 'Nouveau Bot',
    createBot: 'Créer un bot',
    editAvatar: "Modifier l'avatar du bot",
    botName: 'Nom du bot',
    termsPre: 'En utilisant Grok Bot, vous acceptez également ces',
    termsLink: 'Conditions',
    settings: 'Paramètres',
    avatar: 'Avatar',
    tabBot: 'Bot',
    tabGenerate: 'Générer',
    tabImport: 'Importer',
    describeAvatar: "Décrire l'avatar",
    importAvatarImage: "Importer l'image de l'avatar",
    importImage: 'Importer une image',
    name: 'Nom',
    titleOptional: 'Titre (facultatif)',
    titlePlaceholder: 'Recherche, marketing, administration',
    description: 'Description',
    descPlaceholder: 'Comment ce bot peut-il vous aider ?',
    save: 'Enregistrer',
    chooseMain: 'Choisir un bot principal',
    search: 'Rechercher',
    bots: 'Bots',
    noBots: 'Aucun bot',
    computerView: "Vue de l'ordinateur du bot",
    virtualComputer: 'Ordinateur virtuel',
    fakeTab: 'recherche — notes de la semaine',
    folders: ['Documents', 'Captures', 'Notes'],
    demoRunning: 'Démonstration en cours',
    endDemo: 'Terminer la démonstration',
    teachTask: 'Enseigner une tâche',
    addBot: 'Ajouter un bot',
    searchOrCreate: 'Rechercher ou créer des bots',
    createNamed: (q: string) => `Créer « ${q} »`,
    showComputer: "Afficher l'ordinateur",
    more: 'Plus',
    templateCreated: (n: string) => `Modèle créé à partir de « ${n} »`,
    createTemplate: 'Créer un modèle',
    firstMessage: 'Envoyez un premier message pour commencer.',
    createProject: 'Créer un projet',
    projectName: 'Nom du projet',
    newProject: 'Nouveau projet',
    remove: (f: string) => `Retirer ${f}`,
    addFilesOrFolder: 'Ajouter des fichiers ou un dossier',
    add: 'Ajouter',
    chooseFiles: 'Choisir des fichiers',
    chooseFolder: 'Choisir un dossier',
    connectDrive: 'Connectez Google Drive dans Plugins pour importer vos fichiers.',
    connectBox: 'Connectez Box dans Plugins pour importer vos fichiers.',
    deleteProjectTitle: 'Supprimer le projet ?',
    deleteProjectBody: (n: string) => `« ${n} » et ses fichiers seront supprimés. Les chats restent dans votre historique.`,
    delete: 'Supprimer',
    startChatIn: (n: string) => `Démarrer un chat dans ${n}`,
    startChatHere: 'Démarrer un chat dans ce projet',
    instructions: 'Instructions',
    instructionsPlaceholder: 'Comment Grok doit-il répondre dans ce projet ?',
    files: 'Fichiers',
    addFiles: 'Ajouter des fichiers',
    noFiles: "Aucun fichier pour l'instant",
    noFilesHint: 'Grok répond automatiquement en utilisant les fichiers et les instructions de votre projet.',
    chats: 'Chats',
    noChats: 'Les chats démarrés ici, ou déplacés vers ce projet, apparaîtront ici.',
    preview: 'Aperçu',
    expand: 'Agrandir',
    togglePanel: 'Afficher/Masquer le panneau',
    back: 'Précédent',
    forward: 'Transférer',
    refreshApp: "Actualiser l'aperçu de l'application",
    openNewTab: 'Ouvrir dans un nouvel onglet',
    mobilePreview: 'Aperçu mobile',
    appPreview: "Aperçu de l'application",
    moreIdeas: "Plus d'idées",
    chipViewer: 'Visualiseur de produit',
    chipRipples: 'Ondulations de fluide',
    thinkMore: 'Réfléchir plus',
    reactMsg: 'Réagir au message',
    replyMsg: 'Répondre au message',
    moreMsgActions: "Plus d'actions sur le message",
    finished: 'Grok a terminé de répondre',
    buildLang: 'fr',
    buildTitle: 'Compteur de clics',
    buildHeading: 'Clics enregistrés',
    buildReset: 'Remettre à zéro',
    buildKey: 'clics',
    buildUrl: 'compteur-de-clics.preview.app',
  },
});

const COPY_MEDIA = defineCopy({
  en: {
    ratios: { '2:3': 'Tall', '3:2': 'Wide', '1:1': 'Square', '9:16': 'Vertical', '16:9': 'Widescreen' } as Record<string, string>,
    countAuto: 'Auto',
    tplEditText: 'Edit text',
    tplEditTextTool: 'Replace the text in this image with "…"',
    tplLoop: 'Loop',
    tplLoopTool: 'A perfectly looping video: ',
    tplRetouch: 'Precise retouch',
    tplRetouchTool: 'Precisely retouch this area: ',
    beta: 'BETA',
    upload: 'Upload',
    mode: 'Mode',
    modeImage: 'Image',
    modeVideo: 'Video',
    modeAgent: 'Agent',
    speed: 'Speed',
    quality: 'Quality 2.0',
    videoAudio: 'Video audio',
    videoRes: 'Video resolution',
    videoDur: 'Video duration',
    imageCount: 'Number of images',
    aspect: 'Aspect ratio',
    dictation: 'Dictation',
    send: 'Send',
    phAgent: 'What do you want to create? (AI Agent)',
    phImage: 'Describe what you imagine (AI Agent)',
    filesImported: (n: number) => `${n} file(s) imported as reference`,
    generating: 'Generating…',
    newCanvas: 'New Canvas',
    headPre: 'What will you',
    headEm: 'imagine?',
    describeChange: (n: string) => `${n}: describe the change in the bar above`,
    dismiss: 'Dismiss',
    back: 'Back',
    copied: 'Copied',
    share: 'Share',
    optional: 'Optional',
    addReference: 'Add a reference',
    kind: { image: 'Image', video: 'Video', pdf: 'PDF', md: 'Markdown' } as Record<string, string>,
    shareState: { Privée: 'Private', Partagée: 'Shared', Publiée: 'Published' } as Record<string, string>,
    shareOnly: { Privée: 'Personal', Partagée: 'Shared', Publiée: 'Published' } as Record<string, string>,
    libNames: ['neon-concert-poster.png', 'workshop-recap.md', 'misty-morning-landscape.png', 'waves-loop.mp4', 'invoice-october-2026.pdf', 'fox-mascot.png', 'product-meeting-notes.pdf', 'weather-app-icon.png', 'budget-forecast.pdf', 'studio-portrait.png', 'weekend-ideas.md'],
    today: 'Today',
    yesterday: 'Yesterday',
    last7: 'Last 7 days',
    earlier: 'Earlier',
    previewOf: (n: string) => `File preview: ${n}`,
    prevItem: 'Previous item',
    nextItem: 'Next item',
    search: 'Search',
    goToPage: 'Go to page',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    download: 'Download',
    downloading: (n: string) => `Downloading ${n}`,
    deleteItem: 'Delete',
    closePreview: 'Close preview',
    tabs: { all: 'All', media: 'Media', projects: 'Projects', apps: 'Apps', files: 'Files' } as Record<string, string>,
    itemDeleted: 'Item deleted',
    habitPrompt: 'Create an app to track my habits',
    libTitle: 'Library',
    libCategories: 'Library categories',
    find: 'Search',
    clearSearch: 'Clear search',
    displayOptions: 'Display options',
    view: 'View',
    grid: 'Grid',
    list: 'List',
    sortBy: 'Sort by',
    byDate: 'Created date',
    byName: 'Name',
    bySize: 'File size',
    orderLabel: 'Order',
    newest: 'Newest',
    oldest: 'Oldest',
    showOnly: 'Show only',
    all: 'All',
    none: 'None',
    createApp: 'Create an app',
    uploadFiles: 'Upload files',
    noApps: 'No apps yet',
    noAppsHint: 'Create an app with Grok to see it here.',
    nFiles: (n: number) => `${n} file${n > 1 ? 's' : ''}`,
    projFeatures: [
      ['Create and customize', 'Create projects, add files and set instructions for Grok.'],
      ['Contextual AI', "Grok automatically answers using your project's files and instructions."],
      ['Team collaboration', 'Share your projects with others while keeping every conversation private.'],
    ] as [string, string][],
    projPitch: 'Projects are designed to make your Grok experience more efficient, collaborative and powerful. Whether you are brainstorming ideas, analyzing data or creating something new, projects keep everything organized and contextual.',
    firstProject: 'Start your first project',
    noResultsFor: (q: string) => `No results for "${q}"`,
    noMedia: 'No media yet',
    noFiles: 'No files yet',
    nothing: 'Nothing yet',
    emptyHint: 'Upload files or create with Imagine to find them here.',
    itemActions: 'Item actions',
    colName: 'Name',
    colType: 'Type',
    colShared: 'Shared',
    colCreated: 'Created',
  },
  fr: {
    ratios: { '2:3': 'Allongé', '3:2': 'Large', '1:1': 'Carré', '9:16': 'Vertical', '16:9': 'Panoramique' } as Record<string, string>,
    countAuto: 'Automatique',
    tplEditText: 'Modifier le texte',
    tplEditTextTool: 'Remplace le texte de cette image par « … »',
    tplLoop: 'Boucle',
    tplLoopTool: 'Une vidéo en boucle parfaite : ',
    tplRetouch: 'Retouche précise',
    tplRetouchTool: 'Retouche précisément cette zone : ',
    beta: 'BÊTA',
    upload: 'Importer',
    mode: 'Mode',
    modeImage: 'Image',
    modeVideo: 'Vidéo',
    modeAgent: 'Agent',
    speed: 'Vitesse',
    quality: 'Qualité 2.0',
    videoAudio: 'Audio de la vidéo',
    videoRes: 'Résolution vidéo',
    videoDur: 'Durée de la vidéo',
    imageCount: "Nombre d'images",
    aspect: 'Proportions',
    dictation: 'Dictée',
    send: 'Envoyer',
    phAgent: 'Que voulez-vous créer ? (Agent IA)',
    phImage: 'Décrivez ce que vous imaginez (Agent IA)',
    filesImported: (n: number) => `${n} fichier(s) importé(s) comme référence`,
    generating: 'Génération…',
    newCanvas: 'Nouveau Canvas',
    headPre: "Qu'allons-nous",
    headEm: 'imaginer ?',
    describeChange: (n: string) => `${n} : décrivez la modification dans la barre ci-dessus`,
    dismiss: 'Ignorer',
    back: 'Retour',
    copied: 'Copié',
    share: 'Partager',
    optional: 'Facultatif',
    addReference: 'Ajouter une référence',
    kind: { image: 'Image', video: 'Vidéo', pdf: 'PDF', md: 'Markdown' } as Record<string, string>,
    shareState: { Privée: 'Privée', Partagée: 'Partagée', Publiée: 'Publiée' } as Record<string, string>,
    shareOnly: { Privée: 'Personnel', Partagée: 'Partagé', Publiée: 'Publié' } as Record<string, string>,
    libNames: ['affiche-concert-neon.png', 'compte-rendu-atelier.md', 'paysage-brume-matinale.png', 'boucle-vagues.mp4', 'facture-octobre-2026.pdf', 'mascotte-renard.png', 'notes-reunion-produit.pdf', 'icone-app-meteo.png', 'budget-previsionnel.pdf', 'portrait-studio.png', 'idees-week-end.md'],
    today: "Aujourd'hui",
    yesterday: 'Hier',
    last7: 'Les 7 derniers jours',
    earlier: 'Plus tôt',
    previewOf: (n: string) => `Aperçu du fichier : ${n}`,
    prevItem: 'Élément précédent',
    nextItem: 'Élément suivant',
    search: 'Rechercher',
    goToPage: 'Aller à la page',
    zoomOut: 'Zoom arrière',
    zoomIn: 'Zoom avant',
    download: 'Télécharger',
    downloading: (n: string) => `Téléchargement de ${n}`,
    deleteItem: 'Supprimée',
    closePreview: "Fermer l'aperçu",
    tabs: { all: 'Tous', media: 'Médias', projects: 'Projets', apps: 'Applications', files: 'Fichiers' } as Record<string, string>,
    itemDeleted: 'Élément supprimé',
    habitPrompt: 'Crée une application de suivi de mes habitudes',
    libTitle: 'Bibliothèque',
    libCategories: 'Catégories de la bibliothèque',
    find: 'Chercher',
    clearSearch: 'Effacer la recherche',
    displayOptions: "Options d'affichage",
    view: 'Afficher',
    grid: 'Grille',
    list: 'Liste',
    sortBy: 'Trier par',
    byDate: 'Date de création',
    byName: 'Nom',
    bySize: 'Taille du fichier',
    orderLabel: 'Ordre',
    newest: 'Plus récent',
    oldest: 'Plus ancien',
    showOnly: 'Afficher uniquement',
    all: 'Tous',
    none: 'Aucun',
    createApp: 'Créer une application',
    uploadFiles: 'Importer des fichiers',
    noApps: "Aucune application pour l'instant",
    noAppsHint: 'Créez une application avec Grok pour la voir ici.',
    nFiles: (n: number) => `${n} fichier${n > 1 ? 's' : ''}`,
    projFeatures: [
      ['Créer et personnaliser', 'Créez des projets, ajoutez des fichiers et définissez les instructions pour Grok.'],
      ['IA contextuelle', 'Grok répond automatiquement en utilisant les fichiers et les instructions de votre projet.'],
      ['Collaboration en équipe', 'Partagez vos projets avec d’autres tout en gardant chaque conversation privée.'],
    ] as [string, string][],
    projPitch: 'Les projets sont conçus pour rendre votre expérience Grok plus efficace, collaborative et puissante. Que vous réfléchissiez à des idées, analysiez des données ou créiez quelque chose de nouveau, les projets gardent tout organisé et contextuel.',
    firstProject: 'Commencez votre premier projet',
    noResultsFor: (q: string) => `Aucun résultat pour « ${q} »`,
    noMedia: "Aucun média pour l'instant",
    noFiles: "Aucun fichier pour l'instant",
    nothing: "Rien pour l'instant",
    emptyHint: 'Importez des fichiers ou créez avec Imagine pour les retrouver ici.',
    itemActions: "Actions de l'élément",
    colName: 'Nom',
    colType: 'Type',
    colShared: 'Partagé',
    colCreated: 'Créée',
  },
});

const COPY_AUTO = defineCopy({
  en: {
    iconNames: {"Ancre": "Anchor", "Ouverture de l'objectif": "Lens aperture", "Pomme": "Apple", "Archive": "Archive", "Banane": "Banana", "Bière": "Beer", "Cloche": "Bell", "Oiseau": "Bird", "Livre ouvert": "Open book", "Signet": "Bookmark", "Boîte": "Box", "Mallette": "Briefcase", "Insecte": "Bug", "Bâtiment": "Building", "Calculatrice": "Calculator", "Calendrier": "Calendar", "Caméra": "Camera", "Voiture": "Car", "Carotte": "Carrot", "Chat": "Cat", "Toque de chef": "Chef hat", "Cerise": "Cherry", "Porte-bloc": "Clipboard", "Horloge": "Clock", "Code": "Code", "Café": "Coffee", "Boussole": "Compass", "Composant": "Component", "Processeur": "Processor", "Gobelet de soda": "Soda cup", "Base de données": "Database", "Diamant": "Diamond", "Chien": "Dog", "Symbole du dollar": "Dollar sign", "Goutte": "Droplet", "Film": "Film", "Poisson": "Fish", "Drapeau": "Flag", "Flamme": "Flame", "Fiole de laboratoire": "Lab flask", "Manette": "Gamepad", "Pierre précieuse": "Gem", "Lunettes": "Glasses", "Globe": "Globe", "Chapeau de diplômé": "Graduation cap", "Écouteurs": "Headphones", "Cœur": "Heart", "Surligneur": "Highlighter", "Maison": "House", "Sablier": "Hourglass", "Clé": "Key", "Ordinateur portable": "Laptop", "Feuille": "Leaf", "Ampoule": "Light bulb", "Courrier": "Mail", "Microscope": "Microscope", "Écran": "Monitor", "Lune": "Moon", "Montagne": "Mountain", "Musique": "Music", "Note de musique": "Music note", "Palette": "Palette", "Téléphone": "Phone", "Épingle": "Pin", "Avion": "Plane", "Lecture": "Play", "Fusée": "Rocket", "Voilier": "Sailboat", "Balance": "Scale", "Partager": "Share", "Bouclier": "Shield", "Chemise": "Shirt", "Sourire": "Smile", "Étincelles": "Sparkles", "Étoile": "Star", "Stéthoscope": "Stethoscope", "Note autocollante": "Sticky note", "Soleil": "Sun", "Épée": "Sword", "Étiquette": "Tag", "Train": "Train", "Arbre": "Tree", "Camion": "Truck", "Parapluie": "Umbrella", "Déverrouiller": "Unlock", "Utilisateur": "User", "Ustensiles": "Utensils", "Vidéo": "Video", "Clé à molette": "Wrench", "Éclair": "Lightning"} as Record<string, string>,
    colorNames: {"Hériter": "Inherit", "Gris": "Gray", "Rouge": "Red", "Orange": "Orange", "Jaune": "Yellow", "Vert citron": "Lime", "Turquoise": "Teal", "Vert": "Green", "Bleu": "Blue", "Violet": "Purple", "Rose": "Pink"} as Record<string, string>,
    catNames: {"Tout": "All", "Actualités": "News", "Productivité": "Productivity", "Finance": "Finance", "Recherche": "Research", "Mode de vie": "Lifestyle"} as Record<string, string>,
    freqs: { once: ['Once', 'At the chosen date and time'], hourly: ['Every hour', 'Every hour at the chosen minutes'], daily: ['Daily', 'Every day at the chosen time'], weekly: ['Weekly', 'Every week on the chosen day'], monthly: ['Monthly', 'Every month on the chosen day'], yearly: ['Yearly', 'Every year on the chosen date'] } as Record<string, [string, string]>,
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    trigPre: 'Triggers when ',
    newEmail: ['New email', 'Triggers when a new email matching your filters arrives'],
    gh: [["Pull request opened", "a pull request is opened"], ["Draft opened", "a draft pull request is opened"], ["Pull request pushed", "new commits are pushed to a pull request"], ["Pull request merged", "a pull request is merged"], ["Comment added", "a comment is added"], ["New push to branch", "commits are pushed to the branch"], ["Label changed", "a label is added or removed"], ["Checks completed", "a commit’s checks complete"], ["Issue comment", "an issue receives a comment"], ["PR review comment", "a PR review receives a comment"], ["PR review submitted", "a PR review is submitted"], ["Discussion thread", "a discussion thread changes"], ["Workflow run completed", "a workflow finishes"]] as [string, string][],
    linear: [['Issue created', 'an issue is created'], ['Issue status changed', 'an issue’s status changes'], ['Issue assigned', 'an issue is assigned to you']] as [string, string][],
    txn: ['New transaction', 'Triggers when a new bank transaction matching your filters arrives (absolute amount)'],
    finance: [['Subscription purchased', 'a subscription is purchased'], ['Subscription canceled', 'a subscription is canceled']] as [string, string][],
    webhook: ['Webhook', 'When this webhook receives a request'],
    advanced: 'Advanced',
    inMin: (n: number) => `in ${n} min`,
    inHours: (n: number) => `in ${n} h`,
    inDays: (n: number) => `in ${n} d`,
    on: 'on',
    at: 'at',
    removeTrigger: 'Remove trigger',
    newName: 'My automation',
    autoList: [
      ['Tech press review', 'The 5 most important tech news items of the day, with one sentence on their impact.'],
      ['Weekly menu', 'Suggest 5 seasonal dinners and a consolidated shopping list.'],
      ['Workout reminder', 'Remind me of today’s session and the target pace.'],
      ['Email summary', 'Read my unread emails and summarize them in 5 points.'],
      ['Competitive watch', 'Competitor launches, prices and hires this week.'],
      ['Monthly budget review', 'Summary of the month’s spending by category.'],
      ['English word of the day', 'One word, its definition, two examples and a mini translation.'],
      ['Plant watering', 'Remind me which plants to water based on today’s weather.'],
      ['PR review', 'Review the PR, flag the risks and suggest a summary.'],
    ] as [string, string][],
    changeIcon: 'Change icon',
    autoName: 'Automation name',
    triggers: 'Triggers',
    addTrigger: 'Add a trigger',
    general: 'General',
    instructions: 'Instructions',
    instrPlaceholder: 'Read my unread emails and summarize them...',
    connectors: 'Connectors',
    skills: 'Skills',
    notifications: 'Notifications',
    notifApp: 'App',
    notifMail: 'Email',
    cancel: 'Cancel',
    save: 'Save',
    noSkills: 'No skills available',
    noConnectors: 'No connectors available',
    manageSkills: 'Manage skills',
    manageConnectors: 'Manage connectors',
    saved: 'Automation saved',
    created: 'Automation created',
    editTitle: 'Edit automation',
    newTitle: 'New automation',
    discardTitle: 'Discard unsaved changes?',
    discardBody: 'Changes made to your automation will be lost.',
    dontShow: "Don't show again",
    keepEditing: 'Keep editing',
    discard: 'Discard',
    autos: 'Automations',
    runs: 'Runs',
    newAuto: 'New automation',
    noRuns: 'No runs yet',
    colAuto: 'Automation',
    colSchedule: 'Schedule',
    colNext: 'Next run',
    colStatus: 'Status',
    noneYet: 'No automations. Create one or start from a template.',
    paused: 'Paused',
    active: 'Active',
    moreActions: 'More automation actions',
    edit: 'Edit',
    resume: 'Resume',
    pause: 'Pause',
    delete: 'Delete',
    range: (a: number, b: number, n: number) => `${a}–${b} of ${n}`,
    prevPage: 'Previous page',
    nextPage: 'Next page',
    templates: 'Templates',
    templateCats: 'Template categories',
    addNamed: (n: string) => `Add ${n}`,
    add: 'Add',
  },
  fr: {
    iconNames: {} as Record<string, string>,
    colorNames: {} as Record<string, string>,
    catNames: {} as Record<string, string>,
    freqs: { once: ['Une seule fois', 'À la date et l’heure choisies'], hourly: ['Toutes les heures', 'Toutes les heures aux heures choisies'], daily: ['Quotidien', 'Tous les jours à l’heure choisie'], weekly: ['Hebdomadaire', 'Toutes les semaines au jour choisi'], monthly: ['Mensuelle', 'Tous les mois au jour choisi'], yearly: ['Annuel', 'Tous les ans à la date choisie'] } as Record<string, [string, string]>,
    weekdays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
    trigPre: 'Se déclenche lorsque ',
    newEmail: ['Nouvel e-mail', 'Se déclenche à la réception d’un nouvel e-mail correspondant à vos filtres'],
    gh: [["Pull request ouverte", "une pull request est ouverte"], ["Brouillon ouvert", "une pull request en brouillon est ouverte"], ["Pull request poussée", "de nouveaux commits sont poussés sur une pull request"], ["Pull request fusionnée", "une pull request est fusionnée"], ["Commentaire ajouté", "un commentaire est ajouté"], ["Nouveau push vers la branche", "des commits sont poussés vers la branche"], ["Changement d’étiquette", "une étiquette est ajoutée ou retirée"], ["Vérifications terminées", "les vérifications d’un commit sont terminées"], ["Commentaire d’issue", "une issue reçoit un commentaire"], ["Commentaire de revue de PR", "une revue de PR reçoit un commentaire"], ["Revue de PR soumise", "une revue de PR est soumise"], ["Fil de discussion", "un fil de discussion change"], ["Exécution de workflow terminée", "un workflow se termine"]] as [string, string][],
    linear: [['Tâche créée', 'une tâche est créée'], ['Statut de la tâche changé', 'le statut d’une tâche change'], ['Tâche assignée', 'une tâche vous est assignée']] as [string, string][],
    txn: ['Nouvelle transaction', 'Se déclenche lorsqu’une nouvelle transaction bancaire arrive correspondant à vos filtres (montant absolu)'],
    finance: [['Abonnement acheté', 'un abonnement est acheté'], ['Abonnement annulé', 'un abonnement est annulé']] as [string, string][],
    webhook: ['Webhook', 'Lorsque ce webhook reçoit une requête'],
    advanced: 'Avancé',
    inMin: (n: number) => `dans ${n} min`,
    inHours: (n: number) => `dans ${n} h`,
    inDays: (n: number) => `dans ${n} j`,
    on: 'le',
    at: 'à',
    removeTrigger: 'Supprimer le déclencheur',
    newName: 'Mon automatisation',
    autoList: [
      ['Revue de presse tech', 'Les 5 actualités tech les plus importantes du jour, avec une phrase sur leur impact.'],
      ['Menu de la semaine', 'Propose 5 dîners de saison et la liste de courses consolidée.'],
      ['Rappel d’entraînement', 'Rappelle la séance du jour et l’allure cible.'],
      ['Résumé des e-mails', 'Lire mes e-mails non lus et les résumer en 5 points.'],
      ['Veille concurrentielle', 'Lancements, prix et recrutements des concurrents cette semaine.'],
      ['Point budget mensuel', 'Synthèse des dépenses du mois par catégorie.'],
      ['Mot anglais du jour', 'Un mot, sa définition, deux exemples et une mini-traduction.'],
      ['Arrosage des plantes', 'Rappelle quelles plantes arroser selon la météo du jour.'],
      ['Relecture des PR', 'Relis la PR, signale les risques et propose un résumé.'],
    ] as [string, string][],
    changeIcon: "Changer d'icône",
    autoName: "Nom de l'automatisation",
    triggers: 'Déclencheurs',
    addTrigger: 'Ajouter un déclencheur',
    general: 'Général',
    instructions: 'Instructions',
    instrPlaceholder: 'Lire mes e-mails non lus et les résumer...',
    connectors: 'Connecteurs',
    skills: 'Compétences',
    notifications: 'Notifications',
    notifApp: 'Application',
    notifMail: 'E-mail',
    cancel: 'Annuler',
    save: 'Enregistrer',
    noSkills: 'Aucune compétence disponible',
    noConnectors: 'Aucun connecteur disponible',
    manageSkills: 'Gérer les compétences',
    manageConnectors: 'Gérer les connecteurs',
    saved: 'Automatisation enregistrée',
    created: 'Automatisation créée',
    editTitle: 'Modifier l’automatisation',
    newTitle: 'Nouvelle automatisation',
    discardTitle: 'Ignorer les modifications non enregistrées ?',
    discardBody: 'Les modifications apportées à votre automatisation seront perdues.',
    dontShow: 'Ne plus afficher',
    keepEditing: 'Continuer à modifier',
    discard: 'Abandonner',
    autos: 'Automatisations',
    runs: 'Exécutions',
    newAuto: 'Nouvelle automatisation',
    noRuns: "Aucune exécution pour l'instant",
    colAuto: 'Automatisation',
    colSchedule: 'Planification',
    colNext: 'Prochaine exécution',
    colStatus: 'Statut',
    noneYet: 'Aucune automatisation. Créez-en une ou partez d’un modèle.',
    paused: 'En pause',
    active: 'Actif',
    moreActions: "Plus d'actions d'automatisation",
    edit: 'Modifier',
    resume: 'Reprendre',
    pause: 'Mettre en pause',
    delete: 'Supprimée',
    range: (a: number, b: number, n: number) => `${a}–${b} sur ${n}`,
    prevPage: 'Page précédente',
    nextPage: 'Page suivante',
    templates: 'Modèles',
    templateCats: 'Catégories de modèles',
    addNamed: (n: string) => `Ajouter ${n}`,
    add: 'Ajouter',
  },
});

const COPY_PLUG = defineCopy({
  en: {
    connDesc: {"Accéder aux données de marché": "Access market data", "Accéder à vos documents": "Access your documents", "Analyser l’usage produit": "Analyze product usage", "Analyser vos campagnes": "Analyze your campaigns", "Consulter les paiements": "View payments", "Consulter vos actifs crypto": "View your crypto assets", "Consulter vos appels": "View your calls", "Consulter vos comptes et transactions": "View your accounts and transactions", "Consulter vos fichiers de design": "View your design files", "Consulter vos paiements": "View your payments", "Consulter votre CRM": "View your CRM", "Consulter votre portefeuille": "View your portfolio", "Créer des présentations": "Create presentations", "Créer des vidéos": "Create videos", "Créer et modifier des designs": "Create and edit designs", "Dessiner des schémas": "Draw diagrams", "Extraire des données financières": "Extract financial data", "Gérer vos produits": "Manage your products", "Gérer vos rendez-vous": "Manage your appointments", "Gérer vos sites": "Manage your sites", "Gérer votre boutique": "Manage your store", "Gérer votre site": "Manage your site", "Interroger vos données": "Query your data", "Programmer vos publications": "Schedule your posts", "Rechercher dans vos conversations": "Search your conversations", "Rechercher dans vos fichiers": "Search your files", "Rechercher dans vos messages": "Search your messages", "Rechercher dans vos pages": "Search your pages", "Rechercher des données de marché": "Search market data", "Rechercher et rédiger des e-mails": "Search and draft emails", "Rechercher les dépôts et les PRs": "Search repositories and PRs", "Suivre les tickets": "Track tickets", "Suivre vos déploiements": "Track your deployments", "Suivre vos mentions": "Track your mentions", "Suivre vos projets et tâches": "Track your projects and tasks", "Suivre vos tâches": "Track your tasks", "Suivre votre patrimoine": "Track your wealth", "Surveiller vos services": "Monitor your services", "Vérifier votre emploi du temps": "Check your schedule"} as Record<string, string>,
    cats: { 'À la une': 'Featured', Personnalisé: 'Custom', Tous: 'All', Autre: 'Other', Communauté: 'Community' } as Record<string, string>,
    connector: 'Connector',
    disconnect: 'Disconnect',
    connect: 'Connect',
    aboutConn: 'About this connector',
    gmail: ['Allow Grok to search your emails.', 'Search your emails', 'Your emails stay in Gmail'] as [string, string, string],
    introOf: (n: string): [string, string, string] => [`Allow Grok to access ${n}.`, `Search ${n}`, `Your data stays in ${n}`],
    connectedToast: (n: string) => `${n} connected`,
    findCite: (n: string) => `Grok can find and cite the relevant items from ${n} in its answers.`,
    noTraining: 'Your data is never used for training',
    noTrainingBody: 'Content accessed through this connector does not train xAI models.',
    revoke: 'You can revoke access at any time from this panel.',
    thirdParty: 'Third-party connectors are not built or managed by xAI. Use is subject to the',
    privacy: 'xAI Privacy Policy',
    newConnector: 'New connector',
    newSkill: 'New skill',
    newBot: 'New Bot',
    name: 'Name',
    myMcp: 'My MCP server',
    mySkill: 'My skill',
    mcpUrl: 'MCP server URL',
    description: 'Description',
    skillPh: 'What this skill does',
    cancel: 'Cancel',
    add: 'Add',
    tabConnectors: 'Connectors',
    tabSkills: 'Skills',
    search: 'Search...',
    addedSidebar: (n: string) => `${n} added to the sidebar`,
    connected: 'Connected',
    personal: 'Personal',
    disabled: 'Disabled',
    botCats: 'Bot categories',
    featured: 'Featured',
    by: (n: string) => `by ${n}`,
    added: 'Added',
    showAll: 'Show all',
    open: 'Open',
    noBots: 'No bots found',
    noConns: 'No connectors found',
    skill: 'Skill',
    enabled: 'Enabled',
    customMcp: 'Custom MCP server',
    personalSkill: 'Personal skill',
    addedToast: (n: string) => `${n} added`,
  },
  fr: {
    connDesc: {} as Record<string, string>,
    cats: {} as Record<string, string>,
    connector: 'Connecteur',
    disconnect: 'Déconnecter',
    connect: 'Connecter',
    aboutConn: 'À propos de ce connecteur',
    gmail: ['Autorisez Grok à faire des recherches dans vos e-mails.', 'Rechercher dans vos e-mails', 'Vos e-mails restent dans Gmail'] as [string, string, string],
    introOf: (n: string): [string, string, string] => [`Autorisez Grok à accéder à ${n}.`, `Rechercher dans ${n}`, `Vos données restent dans ${n}`],
    connectedToast: (n: string) => `${n} connecté`,
    findCite: (n: string) => `Grok peut trouver et citer les éléments pertinents de ${n} dans ses réponses.`,
    noTraining: 'Vos données ne sont jamais utilisées pour l’entraînement',
    noTrainingBody: 'Le contenu consulté via ce connecteur n’entraîne pas les modèles de xAI.',
    revoke: 'Vous pouvez révoquer l’accès à tout moment depuis ce panneau.',
    thirdParty: "Les connecteurs tiers ne sont ni conçus ni gérés par xAI. L'utilisation est soumise à la",
    privacy: 'Politique de confidentialité xAI',
    newConnector: 'Nouveau connecteur',
    newSkill: 'Nouvelle compétence',
    newBot: 'Nouveau Bot',
    name: 'Nom',
    myMcp: 'Mon serveur MCP',
    mySkill: 'Ma compétence',
    mcpUrl: 'URL du serveur MCP',
    description: 'Description',
    skillPh: 'Ce que fait cette compétence',
    cancel: 'Annuler',
    add: 'Ajouter',
    tabConnectors: 'Connecteurs',
    tabSkills: 'Compétences',
    search: 'Rechercher...',
    addedSidebar: (n: string) => `${n} ajouté à la barre latérale`,
    connected: 'Connecté',
    personal: 'Personnel',
    disabled: 'Désactivée',
    botCats: 'Catégories de bots',
    featured: 'À la une',
    by: (n: string) => `par ${n}`,
    added: 'Ajouté',
    showAll: 'Tout afficher',
    open: 'Ouvrir',
    noBots: 'Aucun bot trouvé',
    noConns: 'Aucun connecteur trouvé',
    skill: 'Compétence',
    enabled: 'Activée',
    customMcp: 'Serveur MCP personnalisé',
    personalSkill: 'Compétence personnelle',
    addedToast: (n: string) => `${n} ajouté`,
  },
});

const COPY_SET = defineCopy({
  en: {
    nav: { Général: 'General', Compte: 'Account', Apparence: 'Appearance', Mode: 'Behavior', Notifications: 'Notifications', Personnaliser: 'Personalize', 'Grok Bot': 'Grok Bot', Paiements: 'Payments', Facturation: 'Billing', Utilisation: 'Usage', 'Données et informations': 'Data and information', 'Contrôles de données': 'Data controls' } as Record<string, string>,
    settings: 'Settings',
    demoNA: 'Demo: not available in this mockup',
    manage: 'Manage',
    manageAccount: 'Manage account',
    account: 'Account',
    subscription: 'Subscription',
    manageSub: 'Manage subscription',
    xAccount: 'X account',
    manageX: 'Manage X account',
    language: 'Language',
    changeLanguage: 'Change language',
    change: 'Change',
    birthYear: 'Year of birth',
    theme: 'Theme',
    themeDesc: 'The mockup stays dark; your choice is remembered.',
    themes: { light: 'Light', dark: 'Dark', system: 'System' } as Record<string, string>,
    wrapLabel: 'Wrap long code blocks',
    wrapDesc: 'Wrap long lines in code blocks by default',
    autoscroll: 'Enable auto-scroll',
    cmdEnter: 'Require Cmd + Enter to send',
    cmdEnterDesc: 'When enabled, press Cmd + Enter (or Ctrl + Enter) to submit. Enter will add a new line.',
    refineLabel: 'Dictation refinement',
    refineDesc: 'How much Grok refines your voice transcriptions',
    refine: { none: ['No refinement', 'Exact transcription with no changes'], clean: ['Clean up', 'Fix grammar, filler words and punctuation'], full: ['Full refinement', 'Rewrite for clarity and concision'] } as Record<string, [string, string]>,
    browserNotif: 'Browser notifications',
    browserNotifDesc: 'When a long answer finishes, when a bot ends its turn and when Grok checks a chat',
    productUpdates: 'Product updates',
    productUpdatesDesc: 'New features, tips and the occasional offer',
    updates: { email: 'Email', off: 'Off' } as Record<string, string>,
    personalize: 'Personalize Grok’s answer',
    personalizeTip: 'Customize how Grok answers you.',
    personas: { custom: 'Custom', concise: 'Concise', formal: 'Formal', tutor: 'Tutor', exhaustive: 'Exhaustive' } as Record<string, string>,
    activeAgents: 'Active agents',
    activeAgentsTip: 'These agents will be used in chats.',
    agentN: (i: number) => `Agent ${i}`,
    availableAgents: 'Available agents',
    availableAgentsTip: 'Your custom agents. Drag them into the slots above to use them in your chats.',
    create: 'Create',
    customAgent: (n: number) => `Custom agent ${n}`,
    hiddenBots: 'Hidden bots',
    show: 'Show',
    noHidden: 'No hidden bots.',
    deleteItem: (n: string) => `Delete ${n}`,
    delete: 'Delete',
    ultimate: 'Get Grok, Cursor and 𝕏 in a single subscription, with one shared usage pool.',
    demoNoBuy: 'Demo: purchases are not possible',
    getStarted: 'Get started',
    oldSub: 'Previous subscription',
    cancelScheduled: 'Cancellation scheduled at the end of the cycle',
    nextCycle: 'The next billing cycle starts on Nov 12, 2026',
    billing: 'Billing',
    updateBilling: 'Update billing information',
    billingDesc: 'Card details are managed off platform.',
    manageBilling: 'Manage billing',
    cancelSub: 'Cancel subscription',
    cancelSubDesc: 'Cancel your subscription through Stripe.',
    cancelPlanTitle: 'Cancel plan?',
    cancelPlanBody: 'Your subscription will stay active until the end of the current cycle.',
    cancelPlan: 'Cancel plan',
    prePlan: 'A plan from before the X subscription.',
    demoPlans: 'Demo: plan comparison unavailable',
    seePlans: 'See plans',
    weeklyLimit: 'SuperGrok weekly limit',
    weeklyTip: 'Your usage resets every week.',
    used: (n: number) => `${n}% used`,
    resetsOn: 'Resets on Nov 3 at 09:00',
    extraCredits: 'Additional usage credits',
    extraTip: 'Used when the weekly limit is reached.',
    extraLabel: 'Extra credits',
    buyCredits: 'Buy credits',
    autoReload: 'Auto-reload',
    autoReloadDesc: 'Automatically reload when your credit balance is low.',
    demoReload: 'Demo: auto-reload unavailable',
    configure: 'Configure',
    improveModel: 'Improve the model',
    improveDesc: 'Allow your conversations to be used to train and improve Grok models.',
    personalizeX: 'Personalize Grok using 𝕏',
    personalizeHist: 'Personalize Grok with your conversation history',
    beta: 'Beta',
    allowLinks: 'Allow sharing chat links',
    watermark: 'Watermark Imagine generations',
    fileStorage: 'File storage',
    usedOf: (s: string) => `${s} used of 5 GB`,
    viewFiles: 'View files and assets',
    viewFilesDesc: 'Uploaded and generated files.',
    viewLinks: 'View shared links',
    viewLinksDesc: 'Public links to your conversations.',
    manageLinks: 'Manage shared links',
    noLinks: 'No shared links',
    viewDeleted: 'View deleted conversations',
    viewDeletedDesc: 'Restore or permanently delete.',
    manageDeleted: 'Manage deleted conversations',
    noDeleted: 'No recoverable deleted conversations in the mockup',
    cookies: 'Cookie settings',
    clearCache: 'Clear cache',
    cacheCleared: 'Cache cleared',
    cleared: 'Cleared',
    clear: 'Clear',
    exportData: 'Export account data',
    exportToast: 'Export prepared: you will receive an email (demo)',
    exportBtn: 'Export',
    deleteAllChats: 'Delete all conversations',
    deleteAllChatsTitle: 'Delete all conversations?',
    deleteAllChatsBody: 'Your entire chat history will be deleted.',
    deleteImagine: 'Delete all Imagine data',
    deleteImagineTitle: 'Delete all Imagine data?',
    deleteImagineBody: 'Your Imagine generations and media will be deleted.',
    deleteAccount: 'Delete account',
    deleteAccountDesc: 'Permanently delete your account and data. Deletion is immediate and irreversible.',
    deleteAccountTitle: 'Delete account?',
    deleteAccountBody: 'Demo: the demo account cannot be deleted.',
    accountKept: 'Demo: account kept',
  },
  fr: {
    nav: {} as Record<string, string>,
    settings: 'Paramètres',
    demoNA: 'Démo : non disponible dans cette maquette',
    manage: 'Gérer',
    manageAccount: 'Gérer le compte',
    account: 'Compte',
    subscription: 'Abonnement',
    manageSub: "Gérer l'abonnement",
    xAccount: 'Compte 𝕏',
    manageX: 'Gérer le compte 𝕏',
    language: 'Langue',
    changeLanguage: 'Changer de langue',
    change: 'Changer',
    birthYear: 'Année de naissance',
    theme: 'Thème',
    themeDesc: 'La maquette reste en sombre ; le choix est mémorisé.',
    themes: { light: 'Clair', dark: 'Sombre', system: 'Système' } as Record<string, string>,
    wrapLabel: 'Envelopper les blocs de code longs',
    wrapDesc: 'Envelopper les lignes longues dans les blocs de code par défaut',
    autoscroll: 'Activer le défilement automatique',
    cmdEnter: 'Exiger Cmd + Entrée pour envoyer',
    cmdEnterDesc: 'Lorsque cette option est activée, appuyez sur Cmd + Entrée (ou Ctrl + Entrée) pour soumettre. Entrée ajoutera une nouvelle ligne.',
    refineLabel: 'Affinage de la dictée',
    refineDesc: "Niveau d'affinage de vos transcriptions vocales par Grok",
    refine: { none: ['Aucun affinage', 'Transcription exacte sans aucune modification'], clean: ['Mise au propre', 'Correction de la grammaire, des mots de remplissage et de la ponctuation'], full: ['Affinage complet', 'Réécrire pour plus de clarté et de concision'] } as Record<string, [string, string]>,
    browserNotif: 'Notifications du navigateur',
    browserNotifDesc: 'Quand une longue réponse se termine, quand un bot finit son tour et quand Grok vérifie un chat',
    productUpdates: 'Mises à jour du produit',
    productUpdatesDesc: 'Nouvelles fonctionnalités, astuces et offres occasionnelles',
    updates: { email: 'E-mail', off: 'Désactivées' } as Record<string, string>,
    personalize: 'Personnaliser la réponse de Grok',
    personalizeTip: 'Personnaliser la façon dont Grok vous répond.',
    personas: { custom: 'Personnalisé', concise: 'Concis', formal: 'Formelle', tutor: 'Tuteur', exhaustive: 'Exhaustif' } as Record<string, string>,
    activeAgents: 'Agents actifs',
    activeAgentsTip: 'Ces agents seront utilisés dans les chats.',
    agentN: (i: number) => `Agent ${i}`,
    availableAgents: 'Agents disponibles',
    availableAgentsTip: 'Vos agents personnalisés. Faites-les glisser dans les emplacements ci-dessus pour les utiliser dans vos chats.',
    create: 'Créer',
    customAgent: (n: number) => `Agent personnalisé ${n}`,
    hiddenBots: 'Bots masqués',
    show: 'Afficher',
    noHidden: 'Aucun bot masqué.',
    deleteItem: (n: string) => `Supprimer ${n}`,
    delete: 'Supprimer',
    ultimate: "Obtenez Grok, Cursor et 𝕏 dans un seul abonnement, avec un seul pool d'utilisation partagé.",
    demoNoBuy: 'Démo : aucun achat possible',
    getStarted: 'Commencer',
    oldSub: 'Ancien abonnement',
    cancelScheduled: 'Annulation programmée à la fin du cycle',
    nextCycle: 'Le prochain cycle de facturation commence le 12 nov. 2026',
    billing: 'Facturation',
    updateBilling: 'Mettre à jour les informations de facturation',
    billingDesc: 'Les détails de la carte sont gérés hors plateforme.',
    manageBilling: 'Gérer la facturation',
    cancelSub: "Annuler l'abonnement",
    cancelSubDesc: 'Annulez votre abonnement via Stripe.',
    cancelPlanTitle: 'Annuler le forfait ?',
    cancelPlanBody: 'Votre abonnement restera actif jusqu’à la fin du cycle en cours.',
    cancelPlan: 'Annuler le forfait',
    prePlan: "Un forfait d'avant l'abonnement X.",
    demoPlans: 'Démo : comparaison des forfaits indisponible',
    seePlans: 'Voir les forfaits',
    weeklyLimit: 'Limite hebdomadaire SuperGrok',
    weeklyTip: 'Votre utilisation se réinitialise chaque semaine.',
    used: (n: number) => `${n} % utilisés`,
    resetsOn: 'Réinitialisation le 3 nov. à 09:00',
    extraCredits: "Crédits d'utilisation supplémentaires",
    extraTip: 'Utilisés lorsque la limite hebdomadaire est atteinte.',
    extraLabel: 'Crédits supplémentaires',
    buyCredits: 'Acheter des crédits',
    autoReload: 'Recharge automatique',
    autoReloadDesc: 'Recharger automatiquement lorsque le solde de crédits est faible.',
    demoReload: 'Démo : recharge automatique indisponible',
    configure: 'Configurer',
    improveModel: 'Améliorer le modèle',
    improveDesc: "Autoriser l'utilisation de vos conversations pour entraîner et améliorer les modèles de Grok.",
    personalizeX: 'Personnaliser Grok en utilisant 𝕏',
    personalizeHist: 'Personnaliser Grok avec votre historique de conversation',
    beta: 'Bêta',
    allowLinks: 'Autoriser le partage des liens de chat',
    watermark: 'Filigrane des générations Imagine',
    fileStorage: 'Stockage de fichiers',
    usedOf: (s: string) => `${s} utilisés de 5 GB`,
    viewFiles: 'Consulter les fichiers et les ressources',
    viewFilesDesc: 'Fichiers importés et générés.',
    viewLinks: 'Consulter les liens partagés',
    viewLinksDesc: 'Liens publics vers vos conversations.',
    manageLinks: 'Gérer les liens partagés',
    noLinks: 'Aucun lien partagé',
    viewDeleted: 'Consulter les conversations supprimées',
    viewDeletedDesc: 'Restaurer ou supprimer définitivement.',
    manageDeleted: 'Gérer les conversations supprimées',
    noDeleted: 'Aucune conversation supprimée récupérable dans la maquette',
    cookies: 'Paramètres des cookies',
    clearCache: 'Vider le cache',
    cacheCleared: 'Cache vidé',
    cleared: 'Effacé',
    clear: 'Effacer',
    exportData: 'Exporter les données du compte',
    exportToast: 'Export préparé : vous recevrez un e-mail (démo)',
    exportBtn: 'Exporter',
    deleteAllChats: 'Supprimer toutes les conversations',
    deleteAllChatsTitle: 'Supprimer toutes les conversations ?',
    deleteAllChatsBody: 'Tout votre historique de discussions sera supprimé.',
    deleteImagine: 'Supprimer toutes les données Imagine',
    deleteImagineTitle: 'Supprimer toutes les données Imagine ?',
    deleteImagineBody: 'Vos générations et médias Imagine seront supprimés.',
    deleteAccount: 'Supprimer le compte',
    deleteAccountDesc: 'Supprimez définitivement votre compte et vos données. La suppression est immédiate et irréversible.',
    deleteAccountTitle: 'Supprimer le compte ?',
    deleteAccountBody: 'Démo : le compte de démonstration ne peut pas être supprimé.',
    accountKept: 'Démo : compte conservé',
  },
});

const COPY_SCRIPTS = defineCopy({
  en: {
    pk: {
      q1: 'best current Pokémon card 2026',
      m1: 'The question: "best pokemon card right now". Ambiguous: collection value, competitive meta or modern chase. I will cover all three angles…',
      m2: 'Verified 2026 prices: Rayquaza ☆ Gold Star (EX Deoxys) leads raw buylist prices, and a Pikachu Illustrator PSA 10 set a record at $16.5M in February…',
      m3: "I launched three web searches. The consensus is taking shape: separate collection, competitive and accessible chases. Agent 3, can you confirm the Standard meta?",
      m4: 'Confirmed: Dragapult ex dominates the Standard format after Worlds 2026, present in most regional top 8s…',
      m5: 'Aligned. One addition: Umbreon ex SIR (Prismatic Evolutions) remains the most liquid modern chase, around €900.',
      st2: 'Synthesizing the final answer',
      st3: 'Drafting the final answer',
      answer: `**The "best" Pokémon card right now depends on what you are looking for** (collection value, competitive play or modern chase). [[Pokeinsider]]

### 1. For collecting / the most valuable right now
**Rayquaza ☆ (Gold Star) from EX Deoxys (#107)** is often at the top of raw prices and buylist prices.
- Buylist up to **€5,400** in mint condition at Pokéventes (updated late October 2026).
- High international prices (several thousand euros/dollars depending on condition).
- One of the most sought-after cards of the EX era (Gold Stars are very rare).

**Record context**: the **Pikachu Illustrator PSA 10** (1998 Japanese promo) sold for **$16.5 million** in February 2026. [[Ultraball]]

### 2. For competitive play (Standard format)
**Dragapult ex** (and its variants) clearly dominates the meta. [[Tcgcontender]]
- Strongest and most played deck.
- Won Worlds 2026 and keeps performing at regionals.

### 3. Accessible modern chases (2026)
| Card | Set | Indicative price |
|---|---|---|
| Umbreon ex SIR | Prismatic Evolutions | ~€900 |
| Mega Gengar ex SIR | Ascended Heroes | $780–960 |
| Mew (30th Celebration) | Celebration | several thousand € |

**In short**:
- Grail/collection → **Rayquaza ☆ EX Deoxys**
- Competitive play → **Dragapult ex**
- Accessible modern → **Umbreon SIR** or Mega Gengar SIR

Are you looking for a card to collect (value), to play in tournaments, or a recent chase with a specific budget? I can refine.`,
      follow: ['Pikachu card', 'Gold Star cards analysis', 'What is the best card to collect'],
    },
    expertFinal: 'Formulating the final answer',
    rapideFinal: 'Formulating the response',
    thinking: 'Thinking',
    illustration: 'Here is an illustration:',
    autoThink: (t: string) => `Analysis of "${t}"`,
    filesRead1: '1 file read',
    explored: (a: number, b: number) => `Explored ${a} files, ${b} directories`,
    explored2: 'Explored 2 files, 1 directories, 1 searches',
    explored3: 'Explored 3 files, 1 searches',
    skill1: '1 skill loaded',
    edited1: '1 file edited',
    edited3: '3 files edited',
    edited7: '7 files edited',
    b1: "I'll start by looking at the workspace guidelines, then build an HTML page with a click counter.",
    b2: "It's a click counter page. I'm loading the app foundation and the interface guidelines to build it properly.",
    b3: 'A single page, in English: a big counter, clicks saved on the device, and a button to reset to zero.',
    botHi: 'Hi! What can I help you with?',
    introPrompt: 'best pokemon card right now',
    otherQuery: (t: string) => `${t} expert reviews`,
    other1: (t: string) => `Question received: "${t}". I am gathering recent sources in English and French…`,
    other2: 'Three angles stand out from the sources: the context, the concrete options, and the trade-offs. I am checking the numbers…',
    other3: 'Good consensus between you. Agent 3, a counterpoint before I write?',
    other4: 'Nothing blocking. I just flag that the answer depends on your goal: to be clarified at the end of the answer.',
    otherStatus: 'Synthesizing the final answer',
    otherAnswer: (t: string) => `**Short answer**: on "${t}", the 2026 sources converge on a simple approach, to adapt to your goal. [[Wikipedia]]

### What to remember
- **The context**: recent trends mostly change the details, not the substance. [[Reddit]]
- **The options**: two or three serious choices, each with its strengths.
- **The trade-offs**: cost, time and complexity cannot all be settled at once.

### How to choose
1. **Set your goal** before comparing.
2. **Test small**: a quick first version beats endless analysis.
3. **Adjust** with what you observe.

Do you want me to detail one option in particular?`,
    otherFollow: (t: string) => [`${t}: concrete examples`, 'Compare the options', 'Where to start?'],
    seed: {
      'b-chef': [
        ['Any idea for a quick dinner tonight?', 'A **gnocchi skillet** with brown butter, spinach and parmesan: 15 minutes, one pan.\n\n- 500 g of gnocchi\n- 2 handfuls of spinach\n- 30 g of butter, sage if you have it\n\nWant a lactose-free version?'],
      ],
      'b-run': [['Today’s session?', '**Easy 40-minute jog**, at conversational pace, then 4 strides of 80 m. Hydrate well tonight.']],
    } as Record<string, string[][]>,
    botLines: [
      'Hi! What can I help you with?',
      'Good question. Here is how I would approach it:\n\n- clarify the goal\n- break it into small steps\n- make a first attempt today\n\nWant me to detail one of them?',
      'Noted. I will take care of it and update you as soon as it is ready.',
      'Here is a quick proposal: start small, measure, then adjust. I can prepare a more precise plan if you like.',
    ],
  },
  fr: {
    pk: {
      q1: 'meilleure carte Pokémon actuelle 2026',
      m1: 'La question est en français : « meilleure carte pokemon actuel ». Ambigu : valeur de collection, méta compétitif ou chase moderne. Je couvre les trois angles…',
      m2: 'Cotes 2026 vérifiées : Rayquaza ☆ Gold Star (EX Deoxys) en tête des rachats raw, Pikachu Illustrator PSA 10 record à 16,5 M$ en février…',
      m3: "J'ai lancé trois recherches web. Le consensus se dessine : séparer collection, compétitif et chases accessibles. Agent 3, tu confirmes le méta Standard ?",
      m4: 'Confirmé : Dragapult ex domine le format Standard après les Worlds 2026, présent dans la majorité des top 8 régionaux…',
      m5: 'Aligné. Ajout : Umbreon ex SIR (Prismatic Evolutions) reste la chase moderne la plus liquide, autour de 900 €.',
      st2: 'Synthétisant la réponse finale en français',
      st3: 'Formulant la réponse finale en français',
      answer: `**La « meilleure » carte Pokémon actuelle dépend de ce que tu cherches** (valeur/collection, jeu compétitif ou chase moderne). [[Pokeinsider]]

### 1. Pour la collection / la plus valorisée actuellement
**Rayquaza ☆ (Gold Star) d'EX Deoxys (#107)** est souvent en tête des cotes raw et des prix de rachat en France.
- Rachat jusqu'à **5 400 €** en état neuf chez Pokéventes (mise à jour fin octobre 2026).
- Cotes internationales élevées (plusieurs milliers d'euros/dollars selon l'état).
- Une des cartes les plus recherchées de l'ère EX (Gold Stars très rares).

**Contexte record** : le **Pikachu Illustrator PSA 10** (promo japonaise 1998) a été vendu **16,5 millions $** en février 2026. [[Ultraball]]

### 2. Pour le jeu compétitif (format Standard)
**Dragapult ex** (et ses variantes) domine clairement le meta. [[Tcgcontender]]
- Deck le plus fort et le plus présent.
- A gagné les Worlds 2026 et continue de performer en régionaux.

### 3. Chases modernes accessibles (2026)
| Carte | Set | Prix indicatif |
|---|---|---|
| Umbreon ex SIR | Prismatic Evolutions | ~900 € |
| Mega Gengar ex SIR | Ascended Heroes | 780–960 $ |
| Mew (30th Celebration) | Celebration | plusieurs milliers d'€ |

**En résumé** :
- Grail/collection → **Rayquaza ☆ EX Deoxys**
- Jeu compétitif → **Dragapult ex**
- Moderne accessible → **Umbreon SIR** ou Mega Gengar SIR

Tu cherches plutôt une carte pour la collection (valeur), pour jouer en tournoi, ou une chase récente avec un budget précis ? Je peux affiner.`,
      follow: ['Carte de Pikachu', 'Analyse des cartes Gold Star', 'Quelle est la meilleure carte pour collectionner'],
    },
    expertFinal: 'Formulating the final answer in French',
    rapideFinal: 'Formulating the response in French',
    thinking: 'Réflexion',
    illustration: 'Voici une illustration :',
    autoThink: (t: string) => `Analyse de « ${t} »`,
    filesRead1: '1 fichier lu',
    explored: (a: number, b: number) => `Exploré ${a} files, ${b} directories`,
    explored2: 'Exploré 2 files, 1 directories, 1 searches',
    explored3: 'Exploré 3 files, 1 searches',
    skill1: '1 compétence chargée',
    edited1: '1 fichier modifié',
    edited3: '3 fichiers modifiés',
    edited7: '7 fichiers modifiés',
    b1: 'Je vais d’abord regarder les consignes du workspace, puis faire une page HTML avec un compteur de clics.',
    b2: 'C’est une page compteur de clics. Je charge le socle de l’app et les consignes d’interface pour le construire proprement.',
    b3: 'Une page unique, en français : un grand compteur, des clics enregistrés sur l’appareil, et un bouton pour remettre à zéro.',
    botHi: 'Salut ! Je peux t’aider pour quoi ?',
    introPrompt: 'meilleure carte pokemon actuel',
    otherQuery: (t: string) => `${t} avis experts`,
    other1: (t: string) => `Question reçue : « ${t} ». Je rassemble les sources récentes en français et en anglais…`,
    other2: 'Trois angles ressortent des sources : le contexte, les options concrètes, et les compromis. Je vérifie les chiffres…',
    other3: 'Bon consensus entre vous. Agent 3, un contre-point avant que je rédige ?',
    other4: 'Rien de bloquant. Je signale juste que la réponse dépend de ton objectif : à préciser en fin de réponse.',
    otherStatus: 'Synthétisant la réponse finale en français',
    otherAnswer: (t: string) => `**Réponse courte** : sur « ${t} », les sources de 2026 convergent vers une approche simple, à adapter à ton objectif. [[Wikipedia]]

### Ce qu'il faut retenir
- **Le contexte** : les tendances récentes changent surtout les détails, pas le fond. [[Reddit]]
- **Les options** : deux ou trois choix sérieux, chacun avec ses forces.
- **Les compromis** : coût, temps et complexité ne se règlent pas tous en même temps.

### Comment choisir
1. **Fixe ton objectif** avant de comparer.
2. **Teste petit** : une première version rapide vaut mieux qu'une analyse sans fin.
3. **Ajuste** avec ce que tu observes.

Tu veux que je détaille une option en particulier ?`,
    otherFollow: (t: string) => [`${t} : exemples concrets`, 'Comparer les options', 'Par où commencer ?'],
    seed: {
      'b-chef': [
        ['Une idée de dîner rapide ce soir ?', 'Une **poêlée de gnocchis** au beurre noisette, épinards et parmesan : 15 minutes, une seule poêle.\n\n- 500 g de gnocchis\n- 2 poignées d’épinards\n- 30 g de beurre, sauge si tu en as\n\nTu veux une version sans lactose ?'],
      ],
      'b-run': [['Séance du jour ?', '**Footing facile de 40 minutes**, en aisance respiratoire, puis 4 lignes droites de 80 m. Hydrate-toi bien ce soir.']],
    } as Record<string, string[][]>,
    botLines: [
      'Salut ! Je peux t’aider pour quoi ?',
      'Bonne question. Voici comment je m’y prendrais :\n\n- clarifier l’objectif\n- découper en petites étapes\n- faire un premier essai aujourd’hui\n\nTu veux que je détaille l’une d’elles ?',
      'C’est noté. Je m’en occupe et je te fais un point dès que c’est prêt.',
      'Voilà une proposition rapide : commence petit, mesure, puis ajuste. Je peux te préparer un plan plus précis si tu veux.',
    ],
  },
});

const COPY_APP = defineCopy({
  en: {
    showSidebar: 'Show sidebar',
    more: 'More',
    moveToProject: 'Move to project',
    movedTo: (n: string) => `Moved to ${n}`,
    createProject: 'Create a project',
    deleteChat: 'Delete chat',
    newChat: 'New chat',
    privateStyle: 'Private mode style',
    purple: 'Purple (Grok)',
    gray: 'Gray (Gemini)',
    leavePrivate: 'Leave private chat',
    switchPrivate: 'Switch to private chat',
    private: 'Private',
    shareCopied: 'Share link copied',
    togglePanel: 'Show/Hide right panel',
    scrollDown: 'Scroll to bottom',
    headPre: 'What will you',
    headEm: 'explore?',
    messageBot: 'Message Bot (AI Agent)',
    askAnything: 'Ask anything',
    sendTo: (n: string) => `Send a message to ${n}`,
    gone: 'This item no longer exists.',
    backToChat: 'Back to chat',
    closeMenu: 'Close menu',
  },
  fr: {
    showSidebar: 'Afficher la barre latérale',
    more: 'Plus',
    moveToProject: 'Déplacer vers le projet',
    movedTo: (n: string) => `Déplacé vers ${n}`,
    createProject: 'Créer un projet',
    deleteChat: 'Supprimer le chat',
    newChat: 'Nouvelle discussion',
    privateStyle: 'Style du mode privé',
    purple: 'Violet (Grok)',
    gray: 'Gris (Gemini)',
    leavePrivate: 'Quitter le chat privé',
    switchPrivate: 'Basculer vers le chat privé',
    private: 'Privé',
    shareCopied: 'Lien de partage copié',
    togglePanel: 'Afficher/Masquer le panneau droit',
    scrollDown: 'Défiler vers le bas',
    headPre: "Qu'allons-nous",
    headEm: 'explorer ?',
    messageBot: 'Message Bot (Agent IA)',
    askAnything: "Posez n'importe quelle question",
    sendTo: (n: string) => `Envoyer un message à ${n}`,
    gone: "Cet élément n'existe plus.",
    backToChat: 'Retour au chat',
    closeMenu: 'Fermer le menu',
  },
});


/* Grok — a clone of grok.com's chat. The sidebar (and its icon rail when folded), the pill composer and the thread
 * follow the live site's measured tokens. The composer carries grok's menus: the model picker (Auto, Rapide, Expert,
 * Lourd, Build, Bot), the attach menu with its submenus, a rotating placeholder and the private mode that tints it
 * purple, or grey over a glow that grows in behind it with a dashed focus ring (Gemini's temporary chat). In Lourd a heavy answer opens with "Les agents réfléchissent · Ns": a stack of animated agent avatars, then
 * a rolling feed where web searches, agent messages and status lines blur in from below while the oldest fade out
 * upward, three at a time. Once they agree the feed folds into "Réflexion : Ns" (which opens the agents' log in the
 * right panel) and the answer streams word by word, each word blurring in, with source chips, a sources pill (the
 * same panel, as sources), the action row and follow-ups. Search (Ctrl+K) opens the command menu over the history. */

/* ---------- Tokens (computed styles from grok.com, dark) ---------- */

const C = {
  base: '#131211', // page
  side: '#181716', // sidebar, chips, tables
  raised: '#201f1d', // composer, bubbles
  line: 'rgba(252,252,252,0.06)',
  fg: '#fcfcfc',
  fg2: '#9e9e9e',
  fg3: '#858585',
  blue: '#299fff',
  menu: '#23211f', // dropdown menus (with a 32px backdrop blur)
  danger: '#f2555a',
  // private mode
  incognito: '#23182f',
  incognitoBtn: 'rgba(164,110,240,0.25)',
  incognitoFg: '#b98cee',
  // private mode, grey (Gemini's temporary chat)
  incognitoGrey: '#1e1f20',
  incognitoGreyBtn: 'rgba(196,199,197,0.16)',
  incognitoGreyFg: '#c4c7c5',
  incognitoGlow: '#444746', // the soft cloud behind the grey private composer
};
/** The private mode's look: grok's purple, or Gemini's grey with its glow and a dashed focus ring. */
type PrivateTone = 'violet' | 'gris';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** Gemini's standard easing, used by the private glow as it grows in. */
const EASE_GLOW = 'cubic-bezier(0.2, 0, 0, 1)';
const MONO = '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace';

const CSS = `
.grok-root{font-family:universalSans,Inter,Roboto,"Open Sans",Arial,sans-serif;-webkit-font-smoothing:antialiased}
@keyframes grok-blur-in{0%{opacity:0;filter:blur(4px)}to{opacity:1;filter:blur(0)}}
@keyframes grok-feed-in{0%{opacity:0;transform:translateY(5px) scale(.9);filter:blur(4px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes grok-feed-out{0%{opacity:1;transform:none;filter:blur(0)}to{opacity:0;transform:translateY(-10px) scale(.9);filter:blur(4px)}}
@keyframes grok-enter{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes grok-pop{0%{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes grok-underline-wipe{0%{opacity:0;transform:scaleX(0)}to{opacity:1;transform:scaleX(1)}}
@keyframes grok-underline-shimmer{0%{background-position:150%}to{background-position:-150%}}
.grok-w{animation:grok-blur-in .2s ${EASE} both}
.grok-feed-in{animation:grok-feed-in .45s ${EASE} both;transform-origin:center top}
.grok-feed-out{animation:grok-feed-out .4s ${EASE} both;transform-origin:center top}
.grok-enter{animation:grok-enter .2s ${EASE} both}
.grok-pop{animation:grok-pop .35s cubic-bezier(0.34,1.56,0.64,1) both}
.grok-underline{background:linear-gradient(90deg,rgba(252,252,252,.25) 0%,rgba(252,252,252,.25) 35%,#6366f1 40%,#a855f7 45%,#ec4899 50%,#f97316 55%,rgba(252,252,252,.25) 60%,rgba(252,252,252,.25) 100%);background-size:300% 100%;background-position:-150%;transform-origin:left;animation:grok-underline-wipe .8s cubic-bezier(0.16,1,0.3,1) both,grok-underline-shimmer 3s linear .4s both}
.grok-scroll{scrollbar-width:none}.grok-scroll::-webkit-scrollbar{display:none}
@keyframes grok-row-in{0%{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
@keyframes grok-spring{0%{opacity:0;transform:scale(.6)}38%{opacity:1;transform:scale(1.046)}60%{transform:scale(.99)}to{opacity:1;transform:scale(1)}}
@keyframes grok-dot{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes grok-pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes grok-twinkle{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
.grok-row-in{animation:grok-row-in .15s ease-out both}
.grok-status-in{animation:grok-fade .2s ease-out both}
.grok-spring{animation:grok-spring .4s linear both}
.grok-dot{animation:grok-dot 1.2s ease-in-out infinite}
.grok-pulse{animation:grok-pulse 2s cubic-bezier(.4,0,.6,1) infinite}
.grok-twinkle{animation:grok-twinkle 1.6s ease-in-out infinite;transform-origin:center}
@keyframes grok-menu-in{0%{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
@keyframes grok-ph-in{0%{opacity:0;transform:translateY(60%)}to{opacity:1;transform:none}}
@keyframes grok-ph-out{0%{opacity:1;transform:none}to{opacity:0;transform:translateY(-60%)}}
@keyframes grok-fade{0%{opacity:0}to{opacity:1}}
.grok-menu:not([data-state=closed]){animation:grok-menu-in .2s cubic-bezier(0.23,1,0.32,1) both;transform-origin:var(--radix-dropdown-menu-content-transform-origin)}
.grok-ph-in{animation:grok-ph-in .35s ${EASE} both}
.grok-ph-out{animation:grok-ph-out .35s ${EASE} both}
.grok-dialog:not([data-state=closed]){animation:grok-menu-in .2s cubic-bezier(0.23,1,0.32,1) both}
.grok-fade:not([data-state=closed]){animation:grok-fade .2s ease both}
@media (min-width:768px){.grok-row:is(:hover,:focus-within,:has([data-state=open])) .grok-row-text{-webkit-mask-image:linear-gradient(to right,black calc(100% - 28px),transparent calc(100% - 8px));mask-image:linear-gradient(to right,black calc(100% - 28px),transparent calc(100% - 8px));text-overflow:clip}}
@keyframes shimmer-text-sweep{0%{background-position:200% 50%,0 0}to{background-position:-200% 50%,0 0}}
@keyframes grok-fade-out{0%{opacity:1}to{opacity:0}}
@keyframes grok-swap-out{0%{opacity:1;filter:blur(0)}to{opacity:0;filter:blur(4px)}}
@keyframes grok-swap-in{0%{opacity:0;filter:blur(4px)}to{opacity:1;filter:blur(0)}}
@keyframes grok-slide-up{0%{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes grok-chrome-in{0%{opacity:0;filter:blur(2px)}to{opacity:1;filter:blur(0)}}
@keyframes grok-spin{to{transform:rotate(360deg)}}
@keyframes grok-skel{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes grok-flash{0%{opacity:.35}to{opacity:1}}
.grok-shimmer{color:transparent!important;-webkit-background-clip:text;background-clip:text;background-repeat:no-repeat;background-size:200% 100%,100% 100%;background-image:linear-gradient(90deg,rgba(252,252,252,0) 35%,#fcfcfc 50%,rgba(252,252,252,0) 65%),linear-gradient(#9e9e9e,#9e9e9e);animation:shimmer-text-sweep 2400ms linear infinite}
.grok-f100{animation:grok-fade .1s ease-in-out both}
.grok-f120{animation:grok-fade .12s cubic-bezier(0.16,1,0.3,1) both}
.grok-f180{animation:grok-fade .18s cubic-bezier(0.16,1,0.3,1) both}
.grok-f250{animation:grok-fade .25s cubic-bezier(0,0,0.2,1) both}
.grok-f300{animation:grok-fade .3s ease-out both}
.grok-out120{animation:grok-fade-out .12s cubic-bezier(0.16,1,0.3,1) both}
.grok-swap-out{animation:grok-swap-out .2s cubic-bezier(0.32,0,0.67,0) both}
.grok-swap-in{animation:grok-swap-in .25s cubic-bezier(0.16,1,0.3,1) both}
.grok-char-out{animation:grok-swap-out .2s cubic-bezier(0.16,1,0.3,1) both}
.grok-char-in{animation:grok-swap-in .2s cubic-bezier(0.16,1,0.3,1) both}
.grok-card-in{animation:grok-slide-up .2s ${EASE} both}
.grok-chrome{animation:grok-chrome-in .15s linear both}
.grok-spin{animation:grok-spin 1s linear infinite}
.grok-skel{animation:grok-skel 2s linear infinite}
.grok-flash{animation:grok-flash .18s cubic-bezier(0.23,1,0.32,1) both}
@keyframes grok-tip-in{0%{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
@keyframes grok-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}
@keyframes grok-bob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3%) rotate(-2deg)}}
@keyframes grok-gen{0%{background-position:150% 0}to{background-position:-50% 0}}
@keyframes grok-cursor{0%{transform:translate(0,0)}25%{transform:translate(220px,90px)}50%{transform:translate(420px,40px)}75%{transform:translate(160px,260px)}to{transform:translate(0,0)}}
@keyframes grok-wave{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(1)}}
@keyframes grok-overlay-in{0%{opacity:0}to{opacity:1}}
.grok-tip:not([data-state=closed]){animation:grok-tip-in .15s cubic-bezier(0.23,1,0.32,1) both;transform-origin:var(--radix-tooltip-content-transform-origin)}
.grok-blink{animation:grok-blink 4.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.grok-bob{animation:grok-bob 3.2s ease-in-out infinite;transform-origin:50% 80%}
.grok-gen{background:linear-gradient(100deg,#201f1d 30%,#2c2a27 50%,#201f1d 70%);background-size:200% 100%;animation:grok-gen 1.2s linear infinite}
.grok-cursor{animation:grok-cursor 9s ${EASE} infinite}
.grok-wave{animation:grok-wave 1s ease-in-out infinite;transform-origin:center}
.grok-ctx:not([data-state=closed]){animation:grok-menu-in .2s cubic-bezier(0.23,1,0.32,1) both;transform-origin:var(--radix-context-menu-content-transform-origin)}
.grok-pop-in:not([data-state=closed]){animation:grok-tip-in .15s cubic-bezier(0.23,1,0.32,1) both;transform-origin:var(--radix-popover-content-transform-origin)}
.grok-lightbox:not([data-state=closed]){animation:grok-overlay-in .2s cubic-bezier(0.23,1,0.32,1) both}
.grok-blur-cap{-webkit-mask-image:linear-gradient(to bottom,transparent,black 60%);mask-image:linear-gradient(to bottom,transparent,black 60%)}
@media (prefers-reduced-motion:reduce){.grok-tip,.grok-blink,.grok-bob,.grok-gen,.grok-cursor,.grok-wave,.grok-ctx,.grok-pop-in,.grok-lightbox{animation:none!important}.grok-anim{transition:none!important}}
@media (prefers-reduced-motion:reduce){.grok-shimmer,.grok-f100,.grok-f120,.grok-f180,.grok-f250,.grok-f300,.grok-out120,.grok-swap-out,.grok-swap-in,.grok-char-out,.grok-char-in,.grok-card-in,.grok-chrome,.grok-spin,.grok-skel,.grok-flash,.grok-w,.grok-feed-in,.grok-feed-out,.grok-enter,.grok-pop,.grok-underline,.grok-menu,.grok-ph-in,.grok-ph-out,.grok-dialog,.grok-fade,.grok-row-in,.grok-status-in,.grok-spring,.grok-dot,.grok-pulse,.grok-twinkle{animation:none!important}}
`;

/* ---------- Icons: grok's own glyphs where they ship as plain SVG (the animated Lottie ones fall back to lucide) ---------- */

const P = {
  logo: ['M13.2371 21.0407L24.3186 12.8506C24.8619 12.4491 25.6384 12.6057 25.8973 13.2294C27.2597 16.5185 26.651 20.4712 23.9403 23.1851C21.2297 25.8989 17.4581 26.4941 14.0108 25.1386L10.2449 26.8843C15.6463 30.5806 22.2053 29.6665 26.304 25.5601C29.5551 22.3051 30.562 17.8683 29.6205 13.8673L29.629 13.8758C28.2637 7.99809 29.9647 5.64871 33.449 0.844576C33.5314 0.730667 33.6139 0.616757 33.6964 0.5L29.1113 5.09055V5.07631L13.2343 21.0436', 'M10.9503 23.0313C7.07343 19.3235 7.74185 13.5853 11.0498 10.2763C13.4959 7.82722 17.5036 6.82767 21.0021 8.2971L24.7595 6.55998C24.0826 6.07017 23.215 5.54334 22.2195 5.17313C17.7198 3.31926 12.3326 4.24192 8.67479 7.90126C5.15635 11.4239 4.0499 16.8403 5.94992 21.4622C7.36924 24.9165 5.04257 27.3598 2.69884 29.826C1.86829 30.7002 1.0349 31.5745 0.36364 32.5L10.9474 23.0341'],
  search: 'M10.75 1.75C15.7206 1.75 19.75 5.77944 19.75 10.75C19.75 12.8745 19.0111 14.827 17.7803 16.3662L22.207 20.793L20.793 22.207L16.3662 17.7803C14.827 19.0111 12.8745 19.75 10.75 19.75C5.77944 19.75 1.75 15.7206 1.75 10.75C1.75 5.77944 5.77944 1.75 10.75 1.75ZM10.75 3.75C6.88401 3.75 3.75 6.88401 3.75 10.75C3.75 14.616 6.88401 17.75 10.75 17.75C12.6833 17.75 14.4323 16.968 15.7002 15.7002C16.968 14.4323 17.75 12.6833 17.75 10.75C17.75 6.88401 14.616 3.75 10.75 3.75Z',
  sidebar: 'M9 17H8.09961C7.53982 17 7.25976 16.9996 7.0459 16.8906C6.85793 16.7948 6.70521 16.6421 6.60938 16.4541C6.50041 16.2402 6.5 15.9602 6.5 15.4004V8.59961C6.5 8.03982 6.50041 7.75976 6.60938 7.5459C6.70521 7.35793 6.85793 7.20521 7.0459 7.10938C7.25976 7.00041 7.53982 7 8.09961 7H9V17ZM16.5 3C19.2614 3 21.5 5.23858 21.5 8V16C21.5 18.7614 19.2614 21 16.5 21H7.5C4.73858 21 2.5 18.7614 2.5 16V8C2.5 5.23858 4.73858 3 7.5 3H16.5ZM7.5 5C5.84315 5 4.5 6.34315 4.5 8V16C4.5 17.6569 5.84315 19 7.5 19H16.5C18.1569 19 19.5 17.6569 19.5 16V8C19.5 6.34315 18.1569 5 16.5 5H7.5Z',
  panel: 'M11 17H8.09961C7.53982 17 7.25976 16.9996 7.0459 16.8906C6.85793 16.7948 6.70521 16.6421 6.60938 16.4541C6.50041 16.2402 6.5 15.9602 6.5 15.4004V8.59961C6.5 8.03982 6.50041 7.75976 6.60938 7.5459C6.70521 7.35793 6.85793 7.20521 7.0459 7.10938C7.25976 7.00041 7.53982 7 8.09961 7H11V17ZM16.5 3C19.2614 3 21.5 5.23858 21.5 8V16C21.5 18.7614 19.2614 21 16.5 21H7.5C4.73858 21 2.5 18.7614 2.5 16V8C2.5 5.23858 4.73858 3 7.5 3H16.5ZM7.5 5C5.84315 5 4.5 6.34315 4.5 8V16C4.5 17.6569 5.84315 19 7.5 19H16.5C18.1569 19 19.5 17.6569 19.5 16V8C19.5 6.34315 18.1569 5 16.5 5H7.5Z',
  chevron: 'M19.4141 10L12 17.4141L4.58594 10L6 8.58594L12 14.5859L18 8.58594L19.4141 10Z',
  plus: 'M13 4V11H20V13H13V20H11V13H4V11H11V4H13Z',
  link: 'M7.0483 9.87862L5.63424 11.2927C3.68162 13.2453 3.68162 16.4114 5.63424 18.364C7.58681 20.3163 10.752 20.3163 12.7045 18.364L14.1196 16.9499L15.5337 18.364L14.1196 19.778C11.3859 22.5117 6.95287 22.5117 4.2192 19.778C1.48589 17.0444 1.48581 12.6122 4.2192 9.87862L5.63424 8.46456L7.0483 9.87862ZM16.2417 9.16964L9.17135 16.2409L7.75631 14.8269L14.8276 7.75558L16.2417 9.16964ZM9.87642 4.2214C12.61 1.48801 17.0422 1.48809 19.7758 4.2214C22.5095 6.95506 22.5095 11.3881 19.7758 14.1218L18.3618 15.5358L16.9477 14.1218L18.3618 12.7067C20.3141 10.7542 20.3141 7.58901 18.3618 5.63643C16.4092 3.68381 13.2431 3.68381 11.2905 5.63643L9.87642 7.0505L8.46236 5.63643L9.87642 4.2214Z',
  edit: 'M13.543 4.04269C15.3142 2.27158 18.1858 2.27158 19.957 4.04269C21.7282 5.8139 21.7282 8.68551 19.957 10.4568L11.2314 19.1833C10.4044 20.0103 9.31321 20.5207 8.14844 20.6267L2.89551 21.1042L3.37305 15.8513C3.47901 14.6865 3.99037 13.5953 4.81738 12.7683L13.543 4.04269ZM6.23145 14.1823C5.73523 14.6786 5.42881 15.3341 5.36523 16.0329L5.10449 18.8943L7.9668 18.6345C8.66566 18.5709 9.32018 18.2645 9.81641 17.7683L16.585 10.9987L13 7.41379L6.23145 14.1823ZM18.543 5.45676C17.5528 4.46669 15.9472 4.46669 14.957 5.45676L14.4141 5.99972L17.999 9.58468L18.543 9.04269C19.5331 8.0525 19.5331 6.44691 18.543 5.45676Z',
  bulb: 'M14 17.5C14 17.3293 14.0146 17.1623 14.0391 17H9.96094C9.98539 17.1623 10 17.3293 10 17.5V19.5C10 19.7761 10.2239 20 10.5 20H13.5C13.7761 20 14 19.7761 14 19.5V17.5ZM18 9C18 7.3663 17.3512 6.15451 16.3242 5.33008C15.2733 4.48653 13.7598 4 12 4C10.2402 4 8.72674 4.48653 7.67578 5.33008C6.64878 6.15451 6 7.3663 6 9C6 11.0362 7.01155 13.2034 8.56836 14.584C8.71754 14.7163 8.86281 14.8611 9 15.0176V15H11V11H13V15H15V15.0176C15.1372 14.8611 15.2825 14.7163 15.4316 14.584C16.9885 13.2034 18 11.0362 18 9ZM20 9C20 11.6374 18.7212 14.3397 16.7588 16.0801C16.2632 16.5196 16 17.0311 16 17.5V19.5C16 20.8807 14.8807 22 13.5 22H10.5C9.11929 22 8 20.8807 8 19.5V17.5C8 17.0311 7.7368 16.5196 7.24121 16.0801C5.27876 14.3397 4 11.6374 4 9C4 6.768 4.91767 4.97957 6.42383 3.77051C7.90637 2.58056 9.89385 2 12 2C14.1061 2 16.0936 2.58056 17.5762 3.77051C19.0823 4.97957 20 6.768 20 9Z',
  arrowDownRight: 'M16 14.5859V7.5H18V18H7.49998V16H14.5859L5.58591 7L6.99998 5.58594L16 14.5859Z',
  arrowUp: 'M11 7.41406L6 12.4141L4.58594 11L12 3.58594L19.4141 11L18 12.4141L13 7.41406V20H11V7.41406Z',
  mic: 'M19.0518 12.6826L20.9482 13.3174C20.9467 13.3221 20.8291 13.6328 20.4883 14.3848C20.1819 14.9976 19.7047 15.8173 19.0186 16.6406C17.7807 18.126 15.8326 19.6511 13 19.9473V22H11V19.9473C8.16736 19.6511 6.21926 18.126 4.98145 16.6406C4.2953 15.8173 3.81813 14.9976 3.51172 14.3848C3.1709 13.6328 3.05273 13.3203 3.05176 13.3174L4.94824 12.6826C4.97542 12.7568 5.30078 13.4902 5.30078 13.4902C5.55686 14.0024 5.95474 14.6828 6.51855 15.3594C7.6401 16.7052 9.3811 18 12 18C14.6189 18 16.3599 16.7052 17.4814 15.3594C18.0453 14.6828 18.4431 14.0024 18.6992 13.4902C18.8267 13.2353 19.0371 12.7227 19.0518 12.6826ZM15 7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7V11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V7ZM17 11C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11Z',
  chat: 'M10 4V6H8C6.89543 6 6 6.89543 6 8V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V14H20V16C20 18.2091 18.2091 20 16 20H8C5.79086 20 4 18.2091 4 16V8C4 5.79086 5.79086 4 8 4H10ZM20.0605 5.35352L12.9541 12.46H11.54V11.0459L18.6465 3.93945L20.0605 5.35352Z',
  check: 'M19.4014 6.32129L9.6416 18.9531L4.09082 14.0918L5.40918 12.5879L9.3584 16.0469L17.8184 5.09863L19.4014 6.32129Z',
  browser: 'M12 2.0498C17.4952 2.0498 21.9502 6.50477 21.9502 12C21.9502 17.4952 17.4952 21.9502 12 21.9502C6.50477 21.9502 2.0498 17.4952 2.0498 12C2.0498 6.50477 6.50477 2.0498 12 2.0498ZM9.71973 12.9502C9.79916 14.9651 10.1264 16.7413 10.5957 18.041C10.868 18.7951 11.1695 19.3388 11.457 19.6758C11.7477 20.0163 11.935 20.0498 12 20.0498C12.065 20.0498 12.2523 20.0163 12.543 19.6758C12.8305 19.3388 13.132 18.7951 13.4043 18.041C13.8736 16.7413 14.2008 14.9651 14.2803 12.9502H9.71973ZM4.00781 12.9502C4.36387 15.9775 6.39812 18.4893 9.15625 19.5312C9.03093 19.2635 8.91485 18.9808 8.80859 18.6865C8.25337 17.149 7.8976 15.1462 7.81738 12.9502H4.00781ZM16.1826 12.9502C16.1024 15.1462 15.7466 17.149 15.1914 18.6865C15.0851 18.9809 14.9682 19.2634 14.8428 19.5312C17.6013 18.4895 19.6361 15.9778 19.9922 12.9502H16.1826ZM14.8428 4.46777C14.9683 4.7359 15.085 5.0188 15.1914 5.31348C15.7466 6.85104 16.1024 8.85384 16.1826 11.0498H19.9922C19.6361 8.02211 17.6015 5.50944 14.8428 4.46777ZM12 3.9502C11.935 3.9502 11.7477 3.98373 11.457 4.32422C11.1695 4.66115 10.868 5.2049 10.5957 5.95898C10.1264 7.25873 9.79916 9.03493 9.71973 11.0498H14.2803C14.2008 9.03493 13.8736 7.25873 13.4043 5.95898C13.132 5.2049 12.8305 4.66115 12.543 4.32422C12.2523 3.98373 12.065 3.9502 12 3.9502ZM9.15625 4.46777C6.39796 5.50964 4.36388 8.02242 4.00781 11.0498H7.81738C7.8976 8.85384 8.25337 6.85104 8.80859 5.31348C8.91495 5.01894 9.03079 4.73579 9.15625 4.46777Z',
  chevronRight: 'M17.4141 12L10 19.4141L8.58594 18L14.5859 12L8.58594 6L10 4.58594L17.4141 12Z',
  rocket: [
    'M21.002 5.61133C21.002 8.29981 19.9172 10.8696 18.002 12.748V16.7578C18.0018 17.8185 17.5801 18.8359 16.8301 19.5859L12.5645 23.8516L10.6279 18.04L5.96094 13.373L0.150391 11.4375L4.41602 7.17188C5.16605 6.42184 6.18344 6.00012 7.24414 6H11.2539C13.1324 4.08473 15.7021 3 18.3906 3H21.002V5.61133ZM12.6523 17.79L13.4385 20.1484L15.416 18.1719C15.791 17.7969 16.0018 17.2881 16.002 16.7578V14.6377L12.6523 17.79ZM18.3906 5C16.185 5 14.0772 5.9106 12.5654 7.5166L7.89453 12.4785L11.5225 16.1064L16.4854 11.4365C18.0914 9.92475 19.002 7.81695 19.002 5.61133V5H18.3906ZM7.24414 8C6.71387 8.00012 6.20504 8.21097 5.83008 8.58594L3.85254 10.5625L6.21094 11.3486L9.36426 8H7.24414Z',
    'M5.4707 16.2412C5.4482 16.3366 5.2373 17.4141 5.04883 18.9512C6.14039 18.8381 7.44727 18.6006 7.75781 18.5303L8.24219 20.4697C8.1377 20.4951 6.91504 20.7363 4.00195 21H3.00195V20C3.00195 18.9247 3.13527 17.8653 3.26465 17.0859C3.39501 16.3659 3.52734 15.7676 3.5293 15.7588L5.4707 16.2412Z',
  ],
  flash: 'M11.5432 2.33207C12.8435 0.653108 15.5188 1.8906 15.0813 3.96879L14.2327 8.00004H18.9612C20.6234 8.00004 21.5608 9.91029 20.5432 11.2246L12.4573 21.668C11.157 23.3468 8.48167 22.1094 8.91919 20.0313L9.76782 16H5.03931C3.37709 16 2.43973 14.0898 3.45728 12.7754L11.5432 2.33207ZM5.03931 14H12.2327L10.8762 20.4434L18.9612 10H11.7678L13.1243 3.55668L5.03931 14Z',
  connectors: [
    'M12 12H19V16C19 16.6836 19.0011 17.2566 18.9629 17.7236C18.9238 18.2023 18.8382 18.6571 18.6182 19.0889C18.2826 19.7474 17.7474 20.2826 17.0889 20.6182C16.6571 20.8382 16.2023 20.9238 15.7236 20.9629C15.2566 21.0011 14.6836 21 14 21H8C7.31644 21 6.74342 21.0011 6.27637 20.9629C5.79772 20.9238 5.34294 20.8382 4.91114 20.6182C4.25262 20.2826 3.71739 19.7474 3.38184 19.0889C3.16183 18.6571 3.07623 18.2023 3.03711 17.7236C2.99895 17.2566 3 16.6836 3 16V10C3 9.31644 2.99895 8.74342 3.03711 8.27637C3.07623 7.79772 3.16182 7.34294 3.38184 6.91114C3.71739 6.25262 4.25262 5.71739 4.91114 5.38184C5.34294 5.16182 5.79772 5.07623 6.27637 5.03711C6.74342 4.99895 7.31644 5 8 5H12V12ZM5 16C5 16.7165 5.00032 17.1938 5.03028 17.5605C5.05924 17.9151 5.11072 18.0777 5.16309 18.1807C5.3069 18.4629 5.5371 18.6931 5.81934 18.8369C5.92228 18.8893 6.0849 18.9408 6.43946 18.9697C6.80616 18.9997 7.28347 19 8 19H10V14H5V16ZM12 19H14C14.7165 19 15.1938 18.9997 15.5605 18.9697C15.9151 18.9408 16.0777 18.8893 16.1807 18.8369C16.4629 18.6931 16.6931 18.4629 16.8369 18.1807C16.8893 18.0777 16.9408 17.9151 16.9697 17.5605C16.9997 17.1938 17 16.7165 17 16V14H12V19ZM8 7C7.28347 7 6.80616 7.00032 6.43946 7.03028C6.0849 7.05924 5.92228 7.11072 5.81934 7.16309C5.5371 7.3069 5.3069 7.5371 5.16309 7.81934C5.11072 7.92228 5.05924 8.0849 5.03028 8.43946C5.00032 8.80616 5 9.28347 5 10V12H10V7H8Z',
    'M17 2C17.6836 2 18.2566 1.99895 18.7236 2.03711C19.2023 2.07623 19.6571 2.16183 20.0889 2.38184C20.7474 2.71739 21.2826 3.25262 21.6182 3.91114C21.8382 4.34294 21.9238 4.79772 21.9629 5.27637C22.0011 5.74342 22 6.31644 22 7V10H14V2H17ZM16 8H20V7C20 6.28347 19.9997 5.80616 19.9697 5.43946C19.9408 5.0849 19.8893 4.92228 19.8369 4.81934C19.6931 4.5371 19.4629 4.3069 19.1807 4.16309C19.0777 4.11072 18.9151 4.05924 18.5605 4.03028C18.1938 4.00032 17.7165 4 17 4H16V8Z',
  ],
  hammer: 'M6.55273 4.60517C9.30778 1.96643 12.7289 1.47144 16.748 2.49872L19.1709 3.11787L16.9883 4.34052C16.0286 4.87786 15.0421 5.85039 14.5645 6.87763C14.3308 7.38043 14.2396 7.85117 14.2852 8.26728C14.3289 8.6664 14.5051 9.08437 14.9307 9.50068L20.5068 14.9548C22.0873 16.3103 22.1844 18.7292 20.707 20.2067C19.2281 21.6857 16.8059 21.5867 15.4512 20.0017C15.4468 19.9971 15.4413 19.9919 15.4355 19.986C15.4119 19.9617 15.3773 19.9252 15.332 19.8786C15.2412 19.7851 15.1086 19.6485 14.9424 19.4772C14.6098 19.1346 14.1405 18.653 13.5977 18.0944C12.5116 16.9769 11.1275 15.5535 9.93457 14.3317C9.65277 14.0434 9.32401 13.9826 9.07031 14.0456C8.82894 14.1056 8.57482 14.2967 8.46875 14.7136L8.40137 14.9802L6.5 16.8815L1.08594 11.4675L3.08594 9.46747H3.5C3.84716 9.46747 3.9785 9.37185 4.0752 9.26728C4.22615 9.1039 4.36795 8.82197 4.55371 8.30732C4.8865 7.38517 5.29734 5.80772 6.55273 4.60517ZM11.668 13.2448C12.789 14.3937 14.0363 15.6752 15.0322 16.6999C15.5754 17.2588 16.0441 17.7419 16.377 18.0847C16.5432 18.2559 16.6757 18.3924 16.7666 18.486C16.812 18.5328 16.8474 18.569 16.8711 18.5935C16.8826 18.6053 16.8914 18.6146 16.8975 18.6208C16.9004 18.6238 16.9028 18.627 16.9043 18.6286L16.9062 18.6296L16.9072 18.6306L16.9336 18.6579L16.957 18.6862C17.5529 19.4013 18.6348 19.4509 19.293 18.7927C19.951 18.1345 19.9016 17.0526 19.1865 16.4567L19.1562 16.4313L19.1279 16.404L13.7598 11.153L11.668 13.2448ZM14.1406 4.05244C11.6131 3.80062 9.61076 4.44487 7.93555 6.04951C7.10476 6.84532 6.84901 7.83879 6.43457 8.98701C6.24676 9.5073 5.99495 10.1367 5.54395 10.6247C5.12935 11.0732 4.597 11.349 3.94531 11.4352L3.91406 11.4675L6.5 14.0534L6.61914 13.9333C6.95792 12.978 7.6995 12.326 8.58789 12.1052C9.04163 11.9924 9.51491 11.9981 9.96875 12.1159L12.5625 9.52216C12.4239 9.18685 12.3357 8.83958 12.2969 8.48505C12.2019 7.6178 12.4054 6.77723 12.751 6.03388C13.0875 5.31006 13.578 4.63529 14.1406 4.05244Z',
  docPlus: [
    'M18 17H21V19H18V22H16V19H13V17H16V14H18V17Z',
    'M15.5 2.5C16.1836 2.5 16.7566 2.49895 17.2236 2.53711C17.7023 2.57623 18.1571 2.66183 18.5889 2.88184C19.2474 3.21739 19.7826 3.75262 20.1182 4.41114C20.3382 4.84294 20.4238 5.29772 20.4629 5.77637C20.5011 6.24342 20.5 6.81644 20.5 7.5V11H18.5V7.5C18.5 6.78347 18.4997 6.30616 18.4697 5.93946C18.4408 5.5849 18.3893 5.42228 18.3369 5.31934C18.1931 5.0371 17.9629 4.8069 17.6807 4.66309C17.5777 4.61072 17.4151 4.55924 17.0605 4.53028C16.6938 4.50032 16.2165 4.5 15.5 4.5H12C11.4477 4.5 11 4.94772 11 5.5V6.5C11 8.433 9.433 10 7.5 10H7C6.17158 10 5.5 10.6716 5.5 11.5V16.5C5.5 17.2165 5.50032 17.6938 5.53028 18.0605C5.55924 18.4151 5.61072 18.5777 5.66309 18.6807C5.8069 18.9629 6.0371 19.1931 6.31934 19.3369C6.42228 19.3893 6.5849 19.4408 6.93946 19.4697C7.30616 19.4997 7.78347 19.5 8.5 19.5H10V21.5H8.5C7.81644 21.5 7.24342 21.5011 6.77637 21.4629C6.29772 21.4238 5.84294 21.3382 5.41114 21.1182C4.75262 20.7826 4.21739 20.2474 3.88184 19.5889C3.66183 19.1571 3.57623 18.7023 3.53711 18.2236C3.49895 17.7566 3.5 17.1836 3.5 16.5V10C3.5 5.85787 6.85787 2.5 11 2.5H15.5ZM9.07227 4.84766C7.53969 5.42133 6.33245 6.65927 5.79883 8.21094C6.17339 8.07411 6.57808 8 7 8H7.5C8.32843 8 9 7.32843 9 6.5V5.5C9 5.27589 9.02566 5.05775 9.07227 4.84766Z',
  ],
  doc: 'M15.5 2.5C16.1836 2.5 16.7566 2.49895 17.2236 2.53711C17.7023 2.57623 18.1571 2.66183 18.5889 2.88184C19.2474 3.21739 19.7826 3.75262 20.1182 4.41114C20.3382 4.84294 20.4238 5.29772 20.4629 5.77637C20.5011 6.24342 20.5 6.81644 20.5 7.5V16.5C20.5 17.1836 20.5011 17.7566 20.4629 18.2236C20.4238 18.7023 20.3382 19.1571 20.1182 19.5889C19.7826 20.2474 19.2474 20.7826 18.5889 21.1182C18.1571 21.3382 17.7023 21.4238 17.2236 21.4629C16.7566 21.5011 16.1836 21.5 15.5 21.5H8.5C7.81644 21.5 7.24342 21.5011 6.77637 21.4629C6.29772 21.4238 5.84294 21.3382 5.41114 21.1182C4.75262 20.7826 4.21739 20.2474 3.88184 19.5889C3.66183 19.1571 3.57623 18.7023 3.53711 18.2236C3.49895 17.7566 3.5 17.1836 3.5 16.5V10C3.5 5.85787 6.85787 2.5 11 2.5H15.5ZM12 4.5C11.4477 4.5 11 4.94772 11 5.5V6.5C11 8.433 9.433 10 7.5 10H7C6.17158 10 5.5 10.6716 5.5 11.5V16.5C5.5 17.2165 5.50032 17.6938 5.53028 18.0605C5.55924 18.4151 5.61072 18.5777 5.66309 18.6807C5.8069 18.9629 6.0371 19.1931 6.31934 19.3369C6.42228 19.3893 6.5849 19.4408 6.93946 19.4697C7.30616 19.4997 7.78347 19.5 8.5 19.5H15.5C16.2165 19.5 16.6938 19.4997 17.0605 19.4697C17.4151 19.4408 17.5777 19.3893 17.6807 19.3369C17.9629 19.1931 18.1931 18.9629 18.3369 18.6807C18.3893 18.5777 18.4408 18.4151 18.4697 18.0605C18.4997 17.6938 18.5 17.2165 18.5 16.5V7.5C18.5 6.78347 18.4997 6.30616 18.4697 5.93946C18.4408 5.5849 18.3893 5.42228 18.3369 5.31934C18.1931 5.0371 17.9629 4.8069 17.6807 4.66309C17.5777 4.61072 17.4151 4.55924 17.0605 4.53028C16.6938 4.50032 16.2165 4.5 15.5 4.5H12ZM9.07227 4.84766C7.53969 5.42133 6.33245 6.65927 5.79883 8.21094C6.17339 8.07411 6.57808 8 7 8H7.5C8.32843 8 9 7.32843 9 6.5V5.5C9 5.27589 9.02566 5.05775 9.07227 4.84766Z',
  folder: 'M12.2363 4.5H17C17.6836 4.5 18.2566 4.49895 18.7236 4.53711C19.2023 4.57623 19.6571 4.66183 20.0889 4.88184C20.7474 5.21739 21.2826 5.75262 21.6182 6.41114C21.8382 6.84294 21.9238 7.29772 21.9629 7.77637C22.0011 8.24342 22 8.81644 22 9.5V13.5996C22 14.7032 22.001 15.5914 21.9424 16.3086C21.8828 17.0373 21.7567 17.6773 21.4551 18.2695C20.9757 19.2103 20.2103 19.9757 19.2695 20.4551C18.6773 20.7567 18.0373 20.8828 17.3086 20.9424C16.5914 21.001 15.7032 21 14.5996 21H9.40039C8.29681 21 7.40858 21.001 6.69141 20.9424C5.96271 20.8828 5.32266 20.7567 4.73047 20.4551C3.78966 19.9757 3.02429 19.2103 2.54492 18.2695C2.24327 17.6773 2.11716 17.0373 2.05762 16.3086C1.99903 15.5914 2 14.7032 2 13.5996V8C2 7.31644 1.99895 6.74342 2.03711 6.27637C2.07623 5.79772 2.16182 5.34294 2.38184 4.91114C2.71739 4.25262 3.25262 3.71739 3.91114 3.38184C4.34294 3.16182 4.79772 3.07623 5.27637 3.03711C5.74342 2.99895 6.31644 3 7 3H9.23633L12.2363 4.5ZM4 11V13.5996C4 14.736 4.00041 15.5287 4.05078 16.1455C4.10023 16.7507 4.19297 17.099 4.32715 17.3623C4.61473 17.9265 5.07348 18.3853 5.6377 18.6729C5.90105 18.807 6.24933 18.8998 6.8545 18.9492C7.4713 18.9996 8.26396 19 9.40039 19H14.5996C15.736 19 16.5287 18.9996 17.1455 18.9492C17.7507 18.8998 18.099 18.807 18.3623 18.6729C18.9265 18.3853 19.3853 17.9265 19.6729 17.3623C19.807 17.099 19.8998 16.7507 19.9492 16.1455C19.9996 15.5287 20 14.736 20 13.5996V11H4ZM7 5C6.28347 5 5.80616 5.00032 5.43946 5.03028C5.0849 5.05924 4.92228 5.11072 4.81934 5.16309C4.5371 5.3069 4.3069 5.5371 4.16309 5.81934C4.11072 5.92228 4.05924 6.0849 4.03028 6.43946C4.00032 6.80616 4 7.28347 4 8V9H19.998C19.9965 8.54903 19.9921 8.21338 19.9697 7.93946C19.9408 7.5849 19.8893 7.42228 19.8369 7.31934C19.6931 7.0371 19.4629 6.8069 19.1807 6.66309C19.0777 6.61072 18.9151 6.55924 18.5605 6.53028C18.1938 6.50032 17.7165 6.5 17 6.5H11.7637L8.76367 5H7Z',
  skills: [
    'M17.2522 12.75C19.5994 12.75 21.5022 14.6528 21.5022 17C21.5022 19.3472 19.5994 21.25 17.2522 21.25C14.905 21.25 13.0022 19.3472 13.0022 17C13.0022 14.6528 14.905 12.75 17.2522 12.75ZM17.2522 14.75C16.0096 14.75 15.0022 15.7574 15.0022 17C15.0022 18.2426 16.0096 19.25 17.2522 19.25C18.4948 19.25 19.5022 18.2426 19.5022 17C19.5022 15.7574 18.4948 14.75 17.2522 14.75Z',
    'M7.85083 12.75C9.50759 12.7501 10.8508 14.0932 10.8508 15.75V17.9502C10.8507 19.6069 9.50753 20.9501 7.85083 20.9502H5.65063C3.99385 20.9502 2.65074 19.607 2.65063 17.9502V15.75C2.65064 14.0931 3.99378 12.75 5.65063 12.75H7.85083ZM5.65063 14.75C5.09835 14.75 4.65064 15.1977 4.65063 15.75V17.9502C4.65074 18.5024 5.09841 18.9502 5.65063 18.9502H7.85083C8.40296 18.9501 8.85072 18.5023 8.85083 17.9502V15.75C8.85083 15.1978 8.40303 14.7501 7.85083 14.75H5.65063Z',
    'M6.7522 2.75C9.09941 2.75 11.0022 4.65279 11.0022 7C11.0022 9.34721 9.09941 11.25 6.7522 11.25C4.40499 11.25 2.5022 9.34721 2.5022 7C2.5022 4.65279 4.40499 2.75 6.7522 2.75ZM6.7522 4.75C5.50956 4.75 4.5022 5.75736 4.5022 7C4.5022 8.24264 5.50956 9.25 6.7522 9.25C7.99484 9.25 9.0022 8.24264 9.0022 7C9.0022 5.75736 7.99484 4.75 6.7522 4.75Z',
    'M15.5071 3.82031C16.2707 2.45656 18.2337 2.45656 18.9973 3.82031L21.4055 8.12305C22.1516 9.45614 21.188 11.0994 19.6604 11.0996H14.844C13.3164 11.0994 12.3528 9.45614 13.0989 8.12305L15.5071 3.82031ZM14.844 9.09961H19.6604L17.2522 4.79785L14.844 9.09961Z',
  ],
  connectorsPlus: [
    'M12 12H19V16C19 16.6836 19.0011 17.2566 18.9629 17.7236C18.9238 18.2023 18.8382 18.6571 18.6182 19.0889C18.2826 19.7474 17.7474 20.2826 17.0889 20.6182C16.6571 20.8382 16.2023 20.9238 15.7236 20.9629C15.2566 21.001 14.6836 21 14 21H8C7.31644 21 6.74342 21.001 6.27637 20.9629C5.79772 20.9238 5.34294 20.8382 4.91114 20.6182C4.25262 20.2826 3.71739 19.7474 3.38184 19.0889C3.16182 18.6571 3.07623 18.2023 3.03711 17.7236C2.99895 17.2566 3 16.6836 3 16V10C3 9.31644 2.99895 8.74341 3.03711 8.27637C3.07623 7.79771 3.16182 7.34294 3.38184 6.91113C3.71739 6.25262 4.25262 5.71738 4.91114 5.38184C5.34294 5.16182 5.79772 5.07623 6.27637 5.03711C6.74342 4.99895 7.31644 5 8 5H12V12ZM5 16C5 16.7165 5.00032 17.1938 5.03028 17.5605C5.05924 17.9151 5.11072 18.0777 5.16309 18.1807C5.3069 18.4629 5.5371 18.6931 5.81934 18.8369C5.92228 18.8893 6.0849 18.9408 6.43946 18.9697C6.80616 18.9997 7.28347 19 8 19H10V14H5V16ZM12 19H14C14.7165 19 15.1938 18.9997 15.5605 18.9697C15.9151 18.9408 16.0777 18.8893 16.1807 18.8369C16.4629 18.6931 16.6931 18.4629 16.8369 18.1807C16.8893 18.0777 16.9408 17.9151 16.9697 17.5605C16.9997 17.1938 17 16.7165 17 16V14H12V19ZM8 7C7.28347 7 6.80616 7.00032 6.43946 7.03027C6.0849 7.05924 5.92228 7.11072 5.81934 7.16309C5.5371 7.3069 5.3069 7.53709 5.16309 7.81934C5.11072 7.92228 5.05924 8.0849 5.03028 8.43945C5.00032 8.80616 5 9.28347 5 10V12H10V7H8Z',
    'M19 5H22V7H19V10H17V7H14V5H17V2H19V5Z',
  ],
  photo: [
    'M15 7C16.1046 7 17 7.89543 17 9C17 10.1046 16.1046 11 15 11C13.8954 11 13 10.1046 13 9C13 7.89543 13.8954 7 15 7Z',
    'M14.0996 2.5C15.2032 2.5 16.0914 2.49903 16.8086 2.55762C17.5373 2.61716 18.1773 2.74327 18.7695 3.04492C19.7103 3.52429 20.4757 4.28966 20.9551 5.23047C21.2567 5.82266 21.3828 6.4627 21.4424 7.19141C21.501 7.90857 21.5 8.79681 21.5 9.90039V14.0996C21.5 15.2032 21.501 16.0914 21.4424 16.8086C21.3828 17.5373 21.2567 18.1773 20.9551 18.7695C20.4757 19.7103 19.7103 20.4757 18.7695 20.9551C18.1773 21.2567 17.5373 21.3828 16.8086 21.4424C16.0914 21.501 15.2032 21.5 14.0996 21.5H9.90039C8.79681 21.5 7.90857 21.501 7.19141 21.4424C6.4627 21.3828 5.82266 21.2567 5.23047 20.9551C4.28966 20.4757 3.52429 19.7103 3.04492 18.7695C2.74327 18.1773 2.61716 17.5373 2.55762 16.8086C2.49903 16.0914 2.5 15.2032 2.5 14.0996V9.90039C2.5 8.79681 2.49903 7.90857 2.55762 7.19141C2.61716 6.4627 2.74327 5.82266 3.04492 5.23047C3.52429 4.28966 4.28966 3.52429 5.23047 3.04492C5.82266 2.74327 6.4627 2.61716 7.19141 2.55762C7.90857 2.49903 8.79681 2.5 9.90039 2.5H14.0996ZM4.50586 15.4424C4.51159 15.915 4.52312 16.3068 4.55078 16.6455C4.60023 17.2507 4.69296 17.599 4.82715 17.8623C5.11472 18.4265 5.57347 18.8853 6.1377 19.1729C6.40105 19.307 6.74933 19.3998 7.35449 19.4492C7.97129 19.4996 8.76396 19.5 9.90039 19.5H14.0996C14.4595 19.5 14.7848 19.4968 15.0811 19.4951L7.95899 12.373L4.50586 15.4424ZM9.90039 4.5C8.76396 4.5 7.97129 4.50041 7.35449 4.55078C6.74933 4.60023 6.40105 4.69296 6.1377 4.82715C5.57347 5.11472 5.11472 5.57347 4.82715 6.1377C4.69296 6.40105 4.60023 6.74933 4.55078 7.35449C4.50041 7.97129 4.5 8.76396 4.5 9.90039V12.7734L8.04004 9.62598L17.6699 19.2559C17.7395 19.23 17.8032 19.203 17.8623 19.1729C18.4265 18.8853 18.8853 18.4265 19.1729 17.8623C19.307 17.599 19.3998 17.2507 19.4492 16.6455C19.4996 16.0287 19.5 15.236 19.5 14.0996V9.90039C19.5 8.76396 19.4996 7.97129 19.4492 7.35449C19.3998 6.74933 19.307 6.40105 19.1729 6.1377C18.8853 5.57347 18.4265 5.11472 17.8623 4.82715C17.599 4.69296 17.2507 4.60023 16.6455 4.55078C16.0287 4.50041 15.236 4.5 14.0996 4.5H9.90039Z',
  ],
  pie: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM11 4.06348C7.05378 4.55566 4 7.92045 4 12C4 16.4183 7.58172 20 12 20C16.0795 20 19.4433 16.9462 19.9355 13H11V4.06348ZM13 11H19.9355C19.4842 7.3815 16.6185 4.51479 13 4.06348V11Z',
  sheet: 'M14.0996 2.5C15.2032 2.5 16.0914 2.49903 16.8086 2.55762C17.5373 2.61716 18.1773 2.74327 18.7695 3.04492C19.7103 3.52429 20.4757 4.28966 20.9551 5.23047C21.2567 5.82266 21.3828 6.4627 21.4424 7.19141C21.501 7.90857 21.5 8.79681 21.5 9.90039V14.0996C21.5 15.2032 21.501 16.0914 21.4424 16.8086C21.3828 17.5373 21.2567 18.1773 20.9551 18.7695C20.4757 19.7103 19.7103 20.4757 18.7695 20.9551C18.1773 21.2567 17.5373 21.3828 16.8086 21.4424C16.0914 21.501 15.2032 21.5 14.0996 21.5H9.90039C8.79681 21.5 7.90857 21.501 7.19141 21.4424C6.4627 21.3828 5.82266 21.2567 5.23047 20.9551C4.28966 20.4757 3.52429 19.7103 3.04492 18.7695C2.74327 18.1773 2.61716 17.5373 2.55762 16.8086C2.49903 16.0914 2.5 15.2032 2.5 14.0996V9.90039C2.5 8.79681 2.49903 7.90857 2.55762 7.19141C2.61716 6.4627 2.74327 5.82266 3.04492 5.23047C3.52429 4.28966 4.28966 3.52429 5.23047 3.04492C5.82266 2.74327 6.4627 2.61716 7.19141 2.55762C7.90857 2.49903 8.79681 2.5 9.90039 2.5H14.0996ZM10 10.2002V19.5H14.0996C15.236 19.5 16.0287 19.4996 16.6455 19.4492C17.2507 19.3998 17.5989 19.307 17.8623 19.1729C18.4265 18.8853 18.8853 18.4265 19.1729 17.8623C19.307 17.5989 19.3998 17.2507 19.4492 16.6455C19.4996 16.0287 19.5 15.236 19.5 14.0996V10.2002H10ZM4.5 10.2002V14.0996C4.5 15.236 4.50041 16.0287 4.55078 16.6455C4.60023 17.2507 4.69296 17.5989 4.82715 17.8623C5.11472 18.4265 5.57347 18.8853 6.1377 19.1729C6.40105 19.307 6.74933 19.3998 7.35449 19.4492C7.55016 19.4652 7.76359 19.4739 8 19.4814V10.2002H4.5ZM8 4.51758C7.76357 4.52508 7.55016 4.5348 7.35449 4.55078C6.74933 4.60023 6.40105 4.69296 6.1377 4.82715C5.57347 5.11472 5.11472 5.57347 4.82715 6.1377C4.69296 6.40105 4.60023 6.74933 4.55078 7.35449C4.53041 7.60392 4.52 7.88215 4.5127 8.2002H8V4.51758ZM10 8.2002H19.4873C19.48 7.88215 19.4696 7.60392 19.4492 7.35449C19.3998 6.74933 19.307 6.40105 19.1729 6.1377C18.8853 5.57347 18.4265 5.11472 17.8623 4.82715C17.5989 4.69296 17.2507 4.60023 16.6455 4.55078C16.0287 4.50041 15.236 4.5 14.0996 4.5H10V8.2002Z',
  settings: 'M13.4556 1.75L13.7524 2.19531C14.5837 3.44222 14.9502 3.84862 15.3101 4.0127C15.6313 4.15902 16.13 4.18467 17.5522 3.85645L18.0923 3.73242L20.2632 5.90332L20.1392 6.44336C19.8109 7.86565 19.8366 8.36431 19.9829 8.68555C20.147 9.04543 20.5534 9.41189 21.8003 10.2432L22.2456 10.54V13.46L21.8003 13.7568C20.5534 14.5881 20.147 14.9546 19.9829 15.3145C19.8366 15.6357 19.8109 16.1344 20.1392 17.5566L20.2632 18.0967L18.0923 20.2676L17.5522 20.1436C16.13 19.8153 15.6313 19.841 15.3101 19.9873C14.9502 20.1514 14.5837 20.5578 13.7524 21.8047L13.4556 22.25H10.5356L10.2388 21.8047C9.4075 20.5578 9.04104 20.1514 8.68115 19.9873C8.35992 19.841 7.86125 19.8153 6.43896 20.1436L5.89893 20.2676L3.72803 18.0967L3.85205 17.5566C4.18027 16.1344 4.15462 15.6357 4.0083 15.3145C3.84423 14.9546 3.43782 14.5881 2.19092 13.7568L1.74561 13.46V10.54L2.19092 10.2432C3.43782 9.41189 3.84423 9.04543 4.0083 8.68555C4.15462 8.36431 4.18027 7.86565 3.85205 6.44336L3.72803 5.90332L5.89893 3.73242L6.43896 3.85645C7.86125 4.18467 8.35991 4.15902 8.68115 4.0127C9.04104 3.84862 9.4075 3.44222 10.2388 2.19531L10.5356 1.75H13.4556ZM11.603 3.75C10.9664 4.68045 10.3543 5.44866 9.51123 5.83301C8.63554 6.23218 7.66598 6.15682 6.53369 5.9248L5.92041 6.53809C6.15242 7.67037 6.22778 8.63994 5.82861 9.51562C5.44433 10.3585 4.67585 10.97 3.74561 11.6064V12.3926C4.67605 13.0292 5.44427 13.6413 5.82861 14.4844C6.22767 15.3598 6.15227 16.3291 5.92041 17.4609L6.53369 18.0742C7.66589 17.8422 8.63559 17.7678 9.51123 18.167C10.3543 18.5513 10.9664 19.3196 11.603 20.25H12.3882C13.0248 19.3196 13.6369 18.5513 14.48 18.167C15.3554 17.768 16.3247 17.8424 17.4565 18.0742L18.0698 17.4609C17.838 16.3291 17.7636 15.3598 18.1626 14.4844C18.5469 13.6413 19.3152 13.0292 20.2456 12.3926V11.6064C19.3154 10.97 18.5469 10.3585 18.1626 9.51562C17.7635 8.63999 17.8378 7.67029 18.0698 6.53809L17.4565 5.9248C16.3247 6.15667 15.3554 6.23207 14.48 5.83301C13.6369 5.44866 13.0248 4.68045 12.3882 3.75H11.603ZM14.0005 12C14.0005 10.8956 13.1048 10.0003 12.0005 10C10.8959 10 10.0005 10.8954 10.0005 12C10.0005 13.1046 10.8959 14 12.0005 14C13.1048 13.9997 14.0005 13.1044 14.0005 12ZM16.0005 12C16.0005 14.209 14.2094 15.9997 12.0005 16C9.79135 16 8.00049 14.2091 8.00049 12C8.00049 9.79086 9.79135 8 12.0005 8C14.2094 8.00026 16.0005 9.79102 16.0005 12Z',
  signout: [
    'M12 5H8.15039C7.36123 5 6.835 5.001 6.43262 5.03711C6.04387 5.07201 5.86839 5.13364 5.75684 5.19727C5.52355 5.33035 5.33035 5.52355 5.19727 5.75684C5.13364 5.86839 5.07201 6.04387 5.03711 6.43262C5.001 6.835 5 7.36123 5 8.15039V15.8496C5 16.6388 5.001 17.165 5.03711 17.5674C5.07201 17.9561 5.13364 18.1316 5.19727 18.2432C5.33035 18.4765 5.52355 18.6697 5.75684 18.8027C5.86839 18.8664 6.04387 18.928 6.43262 18.9629C6.835 18.999 7.36123 19 8.15039 19H12V21H8.15039C7.39765 21 6.76643 21.0011 6.25391 20.9551C5.72789 20.9079 5.22982 20.8048 4.76563 20.54C4.22138 20.2295 3.77046 19.7786 3.45996 19.2344C3.19519 18.7702 3.09214 18.2721 3.04492 17.7461C2.99893 17.2336 3 16.6024 3 15.8496V8.15039C3 7.39765 2.99893 6.76643 3.04492 6.25391C3.09214 5.72789 3.19519 5.22982 3.45996 4.76563C3.77046 4.22138 4.22138 3.77046 4.76563 3.45996C5.22982 3.19519 5.72789 3.09214 6.25391 3.04492C6.76643 2.99893 7.39765 3 8.15039 3H12V5Z',
    'M21.4141 12L16.707 16.707L15.293 15.293L17.5859 13H9V11H17.5859L15.293 8.70703L16.707 7.29297L21.4141 12Z',
  ],
  privacy: [
    'M17 12.5C19.2091 12.5 21 14.2909 21 16.5C21 18.7091 19.2091 20.5 17 20.5C14.8606 20.5 13.1131 18.8205 13.0049 16.708C12.3187 16.5166 11.6804 16.5164 10.9941 16.708C10.8859 18.8205 9.13936 20.5 7 20.5C4.79086 20.5 3 18.7091 3 16.5C3 14.2909 4.79086 12.5 7 12.5C8.58028 12.5 9.94592 13.4167 10.5957 14.7471C11.5407 14.5061 12.4583 14.5063 13.4033 14.7471C14.053 13.4165 15.4196 12.5 17 12.5ZM7 14.5C5.89543 14.5 5 15.3954 5 16.5C5 17.6046 5.89543 18.5 7 18.5C8.10457 18.5 9 17.6046 9 16.5C9 15.3954 8.10457 14.5 7 14.5ZM17 14.5C15.8954 14.5 15 15.3954 15 16.5C15 17.6046 15.8954 18.5 17 18.5C18.1046 18.5 19 17.6046 19 16.5C19 15.3954 18.1046 14.5 17 14.5Z',
    'M15.0107 2.5C16.6405 2.5 18.0554 3.62485 18.4219 5.21289L19.2959 9H22V11H2V9H4.7041L5.57812 5.21289C5.94461 3.62485 7.35947 2.5 8.98926 2.5H15.0107ZM8.98926 4.5C8.29077 4.5 7.6844 4.98249 7.52734 5.66309L6.75684 9H17.2432L16.4727 5.66309C16.3156 4.98249 15.7092 4.5 15.0107 4.5H8.98926Z',
  ],
  ghost: 'M12.0024 2.18994C15.8985 2.19004 19.1142 5.23702 19.3246 9.12744L19.3354 9.32178C19.4331 11.1274 20.0462 12.8674 21.102 14.3354L22.0659 15.6753C23.2474 17.3189 21.9376 19.5883 19.9233 19.3872L19.5541 19.3501C18.9061 19.2854 18.2748 19.5836 17.9135 20.1255C17.0319 21.4479 15.4144 22.0732 13.8725 21.688L12.8071 21.4224C12.2787 21.2903 11.726 21.2903 11.1977 21.4224L10.1323 21.688C8.59036 22.0733 6.97291 21.4479 6.09125 20.1255C5.72998 19.5836 5.09868 19.2854 4.45063 19.3501L4.08149 19.3872C2.06706 19.5885 0.757172 17.319 1.93891 15.6753L2.90277 14.3354C3.95857 12.8675 4.57166 11.1274 4.66938 9.32178L4.68012 9.12744C4.89057 5.23696 8.10621 2.18994 12.0024 2.18994ZM10.0024 8.18994C9.31203 8.18994 8.75238 8.97344 8.75238 9.93994C8.75238 10.9064 9.31203 11.6899 10.0024 11.6899C10.6926 11.6898 11.2524 10.9063 11.2524 9.93994C11.2524 8.97353 10.6926 8.19009 10.0024 8.18994ZM14.0024 8.18994C13.312 8.18994 12.7524 8.97344 12.7524 9.93994C12.7524 10.9064 13.312 11.6899 14.0024 11.6899C14.6926 11.6898 15.2524 10.9063 15.2524 9.93994C15.2524 8.97353 14.6926 8.19009 14.0024 8.18994Z',
  voice: 'M9 3V21H7V3H9ZM17 5V19H15V5H17ZM13 7V17H11V7H13ZM5 9V15H3V9H5ZM21 9V15H19V9H21Z',
  help: 'M16.712 4.33a9 9 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.01 9.01 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.01 9.01 0 0 1 0 9.424m-4.138-5.976a3.7 3.7 0 0 0-.88-1.388 3.7 3.7 0 0 0-1.388-.88m2.268 2.268a3.77 3.77 0 0 1 0 2.528m-2.268-4.796a3.77 3.77 0 0 0-2.528 0m4.796 4.796a3.75 3.75 0 0 1-.88 1.388 3.7 3.7 0 0 1-1.388.88m2.268-2.268 4.138 3.448m0 0a9 9 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0-3.448-4.138m3.448 4.138a9.01 9.01 0 0 1-9.424 0m5.976-4.138a3.77 3.77 0 0 1-2.528 0m0 0a3.7 3.7 0 0 1-1.388-.88 3.7 3.7 0 0 1-.88-1.388m2.268 2.268L7.288 19.67m0 0a9 9 0 0 1-1.652-1.306 9 9 0 0 1-1.306-1.652m0 0 4.138-3.448M4.33 16.712a9.01 9.01 0 0 1 0-9.424m4.138 5.976a3.77 3.77 0 0 1 0-2.528m0 0c.181-.506.475-.982.88-1.388a3.7 3.7 0 0 1 1.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9 9 0 0 0-1.652 1.306A9 9 0 0 0 4.33 7.288',
} as const;

function G({ d, className, viewBox = '0 0 24 24' }: { d: string | readonly string[]; className?: string; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} fill="currentColor" aria-hidden="true" className={cn('shrink-0', className)}>
      {(typeof d === 'string' ? [d] : d).map((p) => (
        <path key={p.slice(0, 24)} d={p} fillRule="evenodd" clipRule="evenodd" />
      ))}
    </svg>
  );
}

/* ---------- Bot marks: grok's 14 avatar shapes (svg.grok-bot-mark), approximated as polar curves and rounded polygons ---------- */

const SHAPE_IDS = ['blob', 'cloud', 'square', 'sparkle', 'clover', 'heart', 'flower', 'teardrop', 'tablet', 'wedge', 'house', 'star', 'hex', 'pumpkin'] as const;
type BotShape = (typeof SHAPE_IDS)[number];

type Pt = [number, number];
/** Scales a closed outline into the 100×100 box (4px margin) and returns its path. */
const fitPath = (raw: Pt[]) => {
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = 92 / Math.max(x1 - x0, y1 - y0);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return `M${raw.map(([x, y]) => `${(50 + (x - cx) * k).toFixed(1)} ${(50 + (y - cy) * k).toFixed(1)}`).join('L')}Z`;
};
const polar = (f: (t: number) => number, sx = 1, sy = 1) =>
  fitPath(
    Array.from({ length: 120 }, (_, i) => {
      const t = (i / 120) * Math.PI * 2;
      const r = f(t);
      return [Math.cos(t) * r * sx, Math.sin(t) * r * sy] as Pt;
    }),
  );
const param = (f: (t: number) => Pt) => fitPath(Array.from({ length: 120 }, (_, i) => f((i / 120) * Math.PI * 2)));
/** A polygon whose corners are rounded with quadratic curves (`rad` px along each edge). */
const roundPoly = (pts: Pt[], rad: number) => {
  const n = pts.length;
  const toward = (p: Pt, q: Pt) => {
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const k = Math.min(rad / len, 0.5);
    return `${(p[0] + (q[0] - p[0]) * k).toFixed(1)} ${(p[1] + (q[1] - p[1]) * k).toFixed(1)}`;
  };
  return `${pts.map((p, i) => `${i ? 'L' : 'M'}${toward(p, pts[(i - 1 + n) % n])}Q${p[0]} ${p[1]} ${toward(p, pts[(i + 1) % n])}`).join('')}Z`;
};
const ring = (n: number, r: number, rot: number, inner?: number): Pt[] =>
  Array.from({ length: inner ? n * 2 : n }, (_, i) => {
    const a = rot + (i * Math.PI * 2) / (inner ? n * 2 : n);
    const rr = inner && i % 2 ? inner : r;
    return [50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr] as Pt;
  });

/** `eye`: where the face sits (y of the eyes' centre); `stem`: the pumpkin's extra stalk. */
const SHAPES: Record<BotShape, { d: string; eye: number; stem?: string }> = {
  blob: { d: polar((t) => 1 + 0.07 * Math.sin(2 * t + 0.5) + 0.05 * Math.cos(3 * t)), eye: 50 },
  cloud: { d: polar((t) => 0.84 + 0.16 * Math.sqrt(Math.abs(Math.cos(3 * t))), 1.12, 1), eye: 52 },
  square: { d: roundPoly([[6, 6], [94, 6], [94, 94], [6, 94]], 24), eye: 50 },
  sparkle: { d: polar((t) => 0.64 + 0.36 * Math.pow(Math.abs(Math.cos(2 * t)), 2.2)), eye: 50 },
  clover: { d: polar((t) => 0.66 + 0.34 * Math.sqrt(Math.abs(Math.sin(2 * t)))), eye: 50 },
  heart: { d: param((t) => [16 * Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]), eye: 44 },
  flower: { d: polar((t) => 0.74 + 0.26 * Math.sqrt(Math.abs(Math.cos(2.5 * t + Math.PI / 2)))), eye: 51 },
  teardrop: { d: param((t) => [Math.sin(t) * Math.pow(Math.abs(Math.sin(t / 2)), 1.1), -Math.cos(t)]), eye: 60 },
  tablet: { d: roundPoly([[16, 4], [84, 4], [84, 96], [16, 96]], 20), eye: 48 },
  wedge: { d: roundPoly([[50, 5], [96, 90], [4, 90]], 20), eye: 62 },
  house: { d: roundPoly([[50, 5], [95, 40], [95, 95], [5, 95], [5, 40]], 14), eye: 62 },
  star: { d: roundPoly(ring(5, 50, -Math.PI / 2, 31), 9), eye: 54 },
  hex: { d: roundPoly(ring(6, 49, -Math.PI / 2), 14), eye: 50 },
  pumpkin: { d: polar((t) => 0.88 + 0.12 * Math.sqrt(Math.abs(Math.cos(2.5 * t))), 1.18, 1), eye: 54, stem: 'M46 4h8v14h-8z' },
};

/** The bot mark grok draws for bots, with its two slanted eyes. Without `shape` it is the original rounded blob
 *  (the model picker's Bot glyph); `live` blinks the eyes and bobs (the dialogs' idle animation). */
function BotMark({ color, shape, live, className }: { color: string; shape?: BotShape; live?: boolean; className?: string }) {
  if (!shape)
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
        <path fill={color} d="M1.7 43.88L1.97 41.53L3.14 38.3L4.98 35.08L15.8 21.58L22.47 13.36L27.93 7.27L30.84 5.17L33.96 3.68L37.55 3.14L41.67 3.72L61.05 8.84L71.48 11.6L75.55 13.17L78.03 14.76L80.84 17.54L82.48 20.03L87.89 31.25L96.66 49.62L98.04 53.63L98.23 57.32L96.86 61.7L95.02 64.92L86.7 75.31L77.53 86.64L72.06 92.73L69.16 94.83L66.04 96.32L62.45 96.86L58.33 96.28L38.95 91.16L28.52 88.4L24.45 86.83L21.97 85.24L19.16 82.46L17.52 79.97L14.12 72.99L5.37 54.62L2.75 49.01L1.76 45.11Z" />
        <rect x="40" y="38" width="12" height="25" rx="6" fill={C.base} transform="rotate(-25 46 50)" />
        <rect x="65" y="31" width="12" height="25" rx="6" fill={C.base} transform="rotate(-25 71 43)" />
      </svg>
    );
  const s = SHAPES[shape];
  const eye = (x: number) => (
    <g transform={`rotate(-14 ${x} ${s.eye})`}>
      <rect x={x - 5.5} y={s.eye - 11} width="11" height="22" rx="5.5" fill={C.base} className={live ? 'grok-blink' : undefined} />
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn('grok-bot-mark', className)}>
      <g className={live ? 'grok-bob' : undefined}>
        {s.stem && <path d={s.stem} fill={color} />}
        <path fill={color} d={s.d} />
        {eye(41)}
        {eye(61)}
      </g>
    </svg>
  );
}

/** Aide's glyph is grok's one stroked icon. */
function HelpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('shrink-0', className)}>
      <path d={P.help} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Menus: Radix underneath, grok's measured surface on top (#23211f, 16px radius, 6px padding,
 * 32px backdrop blur, 10px-radius rows, a 0.2s scale-in) ---------- */

const MENU = 'grok-root grok-menu z-50 rounded-2xl border p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] backdrop-blur-[32px] outline-none';
const SURFACE = { background: C.menu, borderColor: C.line, color: C.fg };
const ROW = 'flex h-[30px] w-full cursor-pointer select-none items-center gap-2 rounded-[10px] px-2 py-[3px] text-[14px] leading-5 outline-none transition-colors data-[highlighted]:bg-[rgba(252,252,252,0.06)] data-[state=open]:bg-[rgba(252,252,252,0.06)]';

function Menu({ trigger, children, className, ...props }: { trigger: ReactNode; children: ReactNode; className?: string } & Omit<ComponentProps<typeof DM.Content>, 'children' | 'className'>) {
  return (
    <DM.Root modal={false}>
      <DM.Trigger asChild>{trigger}</DM.Trigger>
      <DM.Portal>
        <DM.Content sideOffset={4} collisionPadding={8} {...props} className={cn(MENU, 'w-[198px]', className)} style={SURFACE}>
          {children}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

function MenuIcon({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <span className="grid size-4 shrink-0 place-items-center" style={{ color: danger ? undefined : C.fg2 }}>
      {children}
    </span>
  );
}

function MenuItem({ icon, children, onSelect, tall, danger }: { icon?: ReactNode; children: ReactNode; onSelect?: () => void; tall?: boolean; danger?: boolean }) {
  return (
    <DM.Item onSelect={onSelect} className={cn(ROW, tall && 'h-8')} style={danger ? { color: C.danger } : undefined}>
      {icon && <MenuIcon danger={danger}>{icon}</MenuIcon>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </DM.Item>
  );
}

function SubMenu({ icon, label, children, width = 256 }: { icon: ReactNode; label: string; children: ReactNode; width?: number }) {
  return (
    <DM.Sub>
      <DM.SubTrigger className={cn(ROW, 'h-8')}>
        <MenuIcon>{icon}</MenuIcon>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span style={{ color: C.fg2 }}>
          <G d={P.chevronRight} className="size-4" />
        </span>
      </DM.SubTrigger>
      <DM.Portal>
        <DM.SubContent sideOffset={12} alignOffset={-7} collisionPadding={8} className={MENU} style={{ ...SURFACE, width }}>
          {children}
        </DM.SubContent>
      </DM.Portal>
    </DM.Sub>
  );
}

function MenuSep() {
  return <DM.Separator className="-mx-1.5 my-1 h-px" style={{ background: C.line }} />;
}

/** A radio row with grok's trailing checkmark (menuitemradio, 32px). `hint`: a secondary second label (Proportions' names). */
function RadioRow({ value, children, hint, onHover }: { value: string; children: ReactNode; hint?: ReactNode; onHover?: () => void }) {
  return (
    <DM.RadioItem value={value} onMouseEnter={onHover} onFocus={onHover} className={cn(ROW, 'h-8')}>
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
        {children}
        {hint && <span style={{ color: C.fg2 }}>{hint}</span>}
      </span>
      <DM.ItemIndicator>
        <G d={P.check} className="size-4" />
      </DM.ItemIndicator>
    </DM.RadioItem>
  );
}

/* ---------- Shared chrome: tooltips, dialogs, switches, pill tabs, collapsibles, toasts ---------- */

/** grok's Radix tooltip: #23211f, 13px, 6px 10px, 8px radius, a 0.15s scale-in, shown ~0.7s after hover. */
function Tip({ label, children, side = 'top', align = 'center', delay = 700 }: { label: ReactNode; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left'; align?: 'start' | 'center' | 'end'; delay?: number }) {
  return (
    <Tooltip.Root delayDuration={delay}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={side} align={align} sideOffset={6} collisionPadding={8} className="grok-root grok-tip z-[80] max-w-[320px] rounded-lg px-2.5 py-1.5 text-[13px] leading-[18px] break-words shadow-[0_2px_8px_rgba(0,0,0,0.25)]" style={{ background: C.menu, color: C.fg }}>
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

const CLOSE_BTN = 'grid size-8 shrink-0 place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]';

/** The measured modal shell: #131211, a 1px 6% border, 16px (or 24px) radius, the 0.2s scale-in, ✕ "Fermer" at the top right.
 *  `title` is always the dialog's name (sr-only unless `showTitle`). */
function GDialog({
  open,
  onOpenChange,
  title,
  showTitle,
  width,
  height,
  radius = 16,
  close = true,
  className,
  children,
  onEscapeKeyDown,
  onInteractOutside,
  overlay = 'bg-black/50',
  z = 50,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  showTitle?: boolean;
  width: number | string;
  height?: number | string;
  radius?: number;
  close?: boolean;
  className?: string;
  children: ReactNode;
  onEscapeKeyDown?: (e: globalThis.KeyboardEvent) => void;
  onInteractOutside?: (e: Event) => void;
  overlay?: string;
  z?: number;
}) {
  const tc = useCopy(COPY_CORE);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn('grok-fade fixed inset-0', overlay)} style={{ zIndex: z }} />
        <Dialog.Content
          aria-describedby={undefined}
          onEscapeKeyDown={onEscapeKeyDown}
          onInteractOutside={onInteractOutside}
          className={cn('grok-root grok-dialog fixed top-1/2 left-1/2 flex max-h-[calc(100dvh-32px)] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border outline-none', className)}
          style={{ zIndex: z, width, height, borderRadius: radius, background: C.base, borderColor: C.line, color: C.fg }}
        >
          <Dialog.Title className={showTitle ? 'shrink-0 px-5 pt-5 pb-1 text-[15px] leading-[22.5px] font-[550]' : 'sr-only'}>{title}</Dialog.Title>
          {close && (
            <Dialog.Close asChild>
              <button type="button" aria-label={tc.close} className={cn(CLOSE_BTN, 'absolute end-3 top-3 z-10')} style={{ color: C.fg2 }}>
                <X className="size-[18px]" strokeWidth={2} />
              </button>
            </Dialog.Close>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Buttons as grok draws them: the white pill, the 8% secondary fill, the 1px outline. */
const BTN_WHITE = 'inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-[rgba(5,5,5,0.06)] bg-[#fcfcfc] px-2.5 text-[14px] leading-5 font-medium text-[#050505] transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40';
const BTN_SOFT = 'inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full bg-[rgba(252,252,252,0.08)] px-3 text-[14px] leading-5 font-medium text-[#fcfcfc] transition-colors hover:bg-[rgba(252,252,252,0.12)] disabled:opacity-40';
const BTN_LINE = 'inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl border border-[rgba(252,252,252,0.1)] px-2.5 text-[14px] leading-5 font-medium text-[#fcfcfc] transition-colors hover:bg-[rgba(252,252,252,0.06)] disabled:opacity-40';
const INPUT = 'w-full rounded-xl border border-[rgba(252,252,252,0.06)] bg-transparent px-3 text-[14px] leading-5 text-[#fcfcfc] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#9e9e9e] focus:border-[#299fff]';

/** 32×18 switch, 14px white thumb (on: grok's blue). */
function Toggle({ checked, onChange, label, on = C.blue }: { checked: boolean; onChange: (v: boolean) => void; label: string; on?: string }) {
  return (
    <Switch.Root checked={checked} onCheckedChange={onChange} aria-label={label} className="grok-anim relative h-[18px] w-8 shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-150" style={{ background: checked ? on : C.raised }}>
      <Switch.Thumb className="grok-anim block size-[14px] rounded-full bg-white shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-[14px]" />
    </Switch.Root>
  );
}

/** Pill tabs (32px, 0 14px, 14px/500) over a sliding 8% indicator. */
function PillTabs<T extends string>({ tabs, value, onChange, label, size = 32, className }: { tabs: readonly (readonly [T, string])[]; value: T; onChange: (v: T) => void; label: string; size?: number; className?: string }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const el = refs.current[value];
    if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, tabs]);
  return (
    <div role="tablist" aria-label={label} className={cn('relative flex shrink-0 items-center gap-0.5', className)}>
      {box && <span aria-hidden="true" className="grok-anim absolute top-0 rounded-full transition-[left,width] duration-200" style={{ ...box, height: size, background: 'rgba(252,252,252,0.08)', transitionTimingFunction: EASE }} />}
      {tabs.map(([id, text]) => (
        <button
          key={id}
          ref={(el) => {
            refs.current[id] = el;
          }}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className="relative z-[1] shrink-0 rounded-full px-3.5 text-[14px] leading-5 font-medium whitespace-nowrap transition-colors hover:text-[#fcfcfc]"
          style={{ height: size, color: value === id ? C.fg : C.fg2, fontSize: size < 30 ? 13 : 14, paddingInline: size < 30 ? 12 : 14 }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

/** Animated height (grid rows 1fr ↔ 0fr, 200ms); the closed side is inert. */
function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className="grok-anim grid transition-[grid-template-rows] duration-200" style={{ gridTemplateRows: open ? '1fr' : '0fr', transitionTimingFunction: EASE }}>
      <div className="min-h-0 overflow-hidden" inert={!open} aria-hidden={!open}>
        {children}
      </div>
    </div>
  );
}

/** Feedback for mocked side effects (downloads, purchases…): a short toast at the bottom. */
let pushToast: ((m: string) => void) | null = null;
const toast = (m: string) => pushToast?.(m);
function Toaster() {
  const [items, setItems] = useState<{ id: number; m: string }[]>([]);
  useEffect(() => {
    let n = 0;
    pushToast = (m) => {
      const id = ++n;
      setItems((x) => [...x.slice(-2), { id, m }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2600);
    };
    return () => {
      pushToast = null;
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2">
      {items.map((i) => (
        <div key={i.id} className="grok-root grok-card-in rounded-xl border px-3.5 py-2 text-[14px] leading-5 shadow-lg" style={{ background: C.menu, borderColor: C.line, color: C.fg }}>
          {i.m}
        </div>
      ))}
    </div>
  );
}

/** Escape inside a field must not bubble to the preview host (which leaves the page on a bare Escape). */
const keepEscape = (e: KeyboardEvent<HTMLElement>, then?: () => void) => {
  if (e.key !== 'Escape') return;
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
  then?.();
};

/* ---------- Agents: who speaks in the heavy feed, each with a living avatar ---------- */

type AgentId = 'grok' | 'a1' | 'a2' | 'a3';
const AGENTS: Record<AgentId, { name: string; color: ColorId }> = {
  grok: { name: 'Grok', color: 'creme' },
  a1: { name: 'Agent 1', color: 'vert' },
  a2: { name: 'Agent 2', color: 'bleu' },
  a3: { name: 'Agent 3', color: 'turquoise' },
};
const ORDER: AgentId[] = ['grok', 'a1', 'a2', 'a3'];

/** Each agent is a living bloub (the kit's mascot) in its own colour, blinking at rest. The bloub's viewBox
 *  leaves room for its rings, so its body is ~63% of the SVG: it is drawn 1.58× larger and pulled back so the
 *  body fills the `size` slot. */
function AgentOrb({ agent, size }: { agent: AgentId; size: number }) {
  const big = Math.round(size * 1.58);
  const pull = -(big - size) / 2;
  return (
    <span aria-hidden="true" className="relative block shrink-0" style={{ width: size, height: size }}>
      <span className="pointer-events-none absolute" style={{ left: pull, top: pull }}>
        <Bloub size={big} color={AGENTS[agent].color} paper={C.base} label={AGENTS[agent].name} className="block max-w-none" />
      </span>
    </span>
  );
}

/* ---------- The heavy feed ---------- */

/** `agent` on searches, visits and status lines says whose log they belong to in the side panel (Grok by default). */
type FeedItem =
  | { id: string; kind: 'search'; query: string; results: number; favicons: string[]; agent?: AgentId; pending?: boolean }
  | { id: string; kind: 'visit'; url: string; agent?: AgentId }
  | { id: string; kind: 'msg'; agent: AgentId; text: string }
  | { id: string; kind: 'status'; text: string; agent?: AgentId };

const ownerOf = (it: FeedItem): AgentId => it.agent ?? 'grok';

/** `pre`: the first beat, "Réflexion pendant 1s" behind the bulb, before the agents take over.
 *  `solo`: Expert thinks alone — no avatars, no feed, just "Réflexion · Ns" folding into "Réflexion : Ns". */
type AgentsData = { items: FeedItem[]; joined: AgentId[]; started: number; done: boolean; seconds?: number; solo?: boolean; pre?: boolean };

/** A favicon stand-in: the site's initial on its brand colour (real favicons are third-party assets). */
function Favicon({ site, size = 16 }: { site: string; size?: number }) {
  const [letter, color] = site.split(':');
  return (
    <span className="grid shrink-0 place-items-center rounded-full leading-none font-semibold text-white" style={{ width: size, height: size, background: color, fontSize: size * 0.55 }}>
      {letter}
    </span>
  );
}

function FaviconStack({ sites }: { sites: string[] }) {
  return (
    <span className="flex">
      {sites.map((s, i) => (
        <span key={i} className="grid size-[18px] place-items-center rounded-full" style={{ background: C.raised, boxShadow: `0 0 0 1px ${C.base}`, marginLeft: i ? -10 : 0 }}>
          <Favicon site={s} />
        </span>
      ))}
    </span>
  );
}

/** `full`: the side panel shows whole messages; the live feed clamps them to two lines and slides each row's
 *  content down from -10px (150ms ease-out) inside the blurring wrapper, as grok does. */
function FeedRow({ item, full }: { item: FeedItem; full?: boolean }) {
  const t = useCopy(COPY_CORE);
  const slide = full ? '' : 'grok-row-in';
  if (item.kind === 'search') {
    const pending = !full && item.pending;
    return (
      <div className={cn('flex items-center gap-[10px] py-[3px] ps-0.5', slide)}>
        <G d={P.browser} className={cn('size-4 shrink-0', pending && 'grok-pulse')} />
        <div className={cn('min-w-0 flex-1', pending && 'grok-pulse')}>
          <div className="truncate text-[13px] leading-[16.25px]" style={{ color: C.fg2 }}>
            {pending ? t.searching : t.searched}
          </div>
          <div className="truncate text-[13px] leading-[16.25px]" style={{ color: C.fg, fontFamily: MONO }}>
            {item.query}
          </div>
        </div>
        <span className={cn('flex shrink-0 items-center gap-2 text-[14px] leading-[21px] tabular-nums transition-opacity duration-150', pending && 'opacity-0')} style={{ color: C.fg2 }}>
          <span className="max-sm:hidden">{pending ? t.noResult : t.results(item.results)}</span>
          {!pending && <FaviconStack sites={item.favicons} />}
        </span>
      </div>
    );
  }
  if (item.kind === 'visit')
    return (
      <div className={cn('flex items-center gap-[10px] py-[3px] ps-0.5', slide)}>
        <G d={P.browser} className="size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] leading-[16.25px]" style={{ color: C.fg2 }}>
            {t.visited}
          </div>
          <div className="truncate text-[13px] leading-[16.25px]" style={{ color: C.fg, fontFamily: MONO }}>
            {item.url}
          </div>
        </div>
      </div>
    );
  if (item.kind === 'status')
    return (
      <p className={cn('py-[2px] text-[15px] leading-[22.5px]', !full && 'grok-status-in')} style={{ color: C.fg2 }}>
        {item.text}
      </p>
    );
  const a = AGENTS[item.agent];
  return (
    <div className={cn('flex gap-[10px] py-[3px] ps-0.5', slide)}>
      <div className="pt-0.5">
        <AgentOrb agent={item.agent} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-[5px] text-[13px] leading-4 font-bold" style={{ color: C.fg2 }}>
          {a.name}
          {item.agent === 'grok' && <span className="ms-1.5 font-normal opacity-70">{t.lead}</span>}
        </div>
        <div className="px-[10px] py-[7px]" style={{ background: C.raised, borderRadius: '4px 16px 16px 16px' }}>
          <p className={cn('text-[14px] leading-[19.25px] whitespace-pre-line', !full && 'line-clamp-2')} style={{ color: C.fg }}>
            {item.text}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Grok's 3×3 dot loader (a Lottie on the site): a wave of opacity runs across the grid while the agents are
 *  still being called. */
function DotsLoader() {
  const xs = [5.6, 12, 18.4];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="currentColor">
      {xs.flatMap((y, r) =>
        xs.map((x, c) => (
          <circle key={`${r}${c}`} cx={x} cy={y} r={1.6} className="grok-dot" style={{ animationDelay: `${(r + c) * 150}ms` }} />
        )),
      )}
    </svg>
  );
}

/** Four sparks twinkling at the corners of the lead avatar while the agents work (grok's second Lottie). */
function Sparks() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute -top-[3px] -left-[3px] size-6" fill="currentColor" style={{ color: C.fg }}>
      {[
        [5.6, 5.6],
        [18.4, 5.6],
        [5.6, 18.4],
        [18.4, 18.4],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.3} className="grok-twinkle" style={{ animationDelay: `${i * 400}ms`, transformOrigin: `${x}px ${y}px` }} />
      ))}
    </svg>
  );
}

/** "Réflexion pendant 1s" behind the bulb for a beat, then "Les agents réfléchissent • Ns" with the dot loader
 *  until the avatars fade in (500ms ease-out, each one springing to size), then "Réflexions" while the answer
 *  streams, then "Réflexion : Ns" (hover swaps the bulb for the panel glyph; a click opens the log). */
function AgentsHeader({ data, streaming, onOpen }: { data: AgentsData; streaming: boolean; onOpen: () => void }) {
  const t = useCopy(COPY_CORE);
  const running = !data.done;
  const secs = useElapsed(data.started, running);
  const openable = !running && data.items.length > 0;
  const joined = data.joined.length > 0;
  return (
    <button type="button" onClick={openable ? onOpen : undefined} className={cn('group flex h-[23px] w-full items-center text-start text-[15px] leading-[22.5px]', openable ? 'cursor-pointer' : 'cursor-default')} style={{ color: C.fg2 }}>
      {(data.solo || data.pre) && running ? (
        <span className="me-1 grid size-4 place-items-center">
          <G d={P.bulb} className="size-4" />
        </span>
      ) : running ? (
        <span className="relative me-1.5 flex h-[22px] items-center transition-[width] duration-300" style={{ width: 22 + Math.max(0, data.joined.length - 1) * 12 }}>
          <span className={cn('absolute inset-y-0 -left-1 flex items-center transition-opacity duration-150', joined && 'opacity-0')} style={{ color: C.fg }}>
            <DotsLoader />
          </span>
          <span className={cn('absolute inset-0 transition-opacity duration-500 ease-out', joined ? 'opacity-100' : 'opacity-0')}>
            {data.joined.map((a, i) => (
              <span key={a} className="grok-spring absolute top-0 grid size-[22px] place-items-center rounded-full" style={{ left: i * 12, background: C.base, zIndex: 10 - i }}>
                <AgentOrb agent={a} size={18} />
                {i === 0 && <Sparks />}
              </span>
            ))}
          </span>
        </span>
      ) : (
        <span className="relative me-1 grid size-4 place-items-center">
          <G d={P.bulb} className={cn('size-4 transition-opacity duration-150', openable && 'group-hover:opacity-0')} />
          {openable && <G d={P.panel} className="absolute size-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />}
        </span>
      )}
      <span className={cn('transition-colors', openable && 'group-hover:text-[#fcfcfc]')}>{running ? (data.pre ? t.thinkingFor(`${secs}s`) : data.solo ? t.thinking : t.agentsThinking) : streaming ? t.thoughts : t.thoughtFor(`${data.seconds ?? secs}s`)}</span>
      {running && !data.pre && (
        <>
          <span className="mx-1">•</span>
          <span className="tabular-nums">{secs}s</span>
        </>
      )}
    </button>
  );
}

/* ---------- Single-agent steps: the timeline Expert, Rapide and Auto share (and Build's tool rows) ---------- */

// Rail colours: --border-l2 for the line, --border-l3 for the sub-step dot. Only their role was measured, not the values.
const RAIL = 'rgba(252,252,252,0.1)';
const RAIL3 = 'rgba(252,252,252,0.16)';

type StepRow = {
  id: string;
  kind: 'think' | 'search' | 'visit' | 'images' | 'tool';
  /** think: the (model-written) sentence; visit: the url; images: the query; tool: the whole label. */
  text?: string;
  /** search: "N recherche(s) effectuée(s)". */
  count?: number;
  /** The label shimmers while the step runs. */
  active?: boolean;
  icon?: 'read' | 'explore' | 'skill' | 'edit';
  /** Dot sub-steps under a reasoning row. */
  subs?: string[];
  /** Fading out (120ms) before the script drops it. */
  leaving?: boolean;
};
/** `collapsed`: the script's call (Expert ~9s into the answer, Rapide ~1s, Auto at its end); the reader's click wins. */
type StepsData = { started: number; rows: StepRow[]; phase: 'live' | 'final'; seconds?: number; finalText?: string; collapsed: boolean };
type StepsTail = { kind: 'live'; started: number } | { kind: 'done'; seconds: number } | null;

const fmtDur = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const searchLabel = (n: number) => copyOf(COPY_CORE).searchesDone(n);

/** A label that cross-fades in place when its text changes: the old one leaves in 200ms (opacity + 4px blur, ease-in),
 *  the new one arrives in 250ms. Both share one grid cell. */
function SwapLabel({ text, className }: { text: string; className?: string }) {
  const [out, setOut] = useState<{ t: string; k: number }[]>([]);
  const prev = useRef(text);
  const first = useRef(text);
  const seq = useRef(0);
  useEffect(() => {
    if (prev.current === text) return;
    const gone = { t: prev.current, k: ++seq.current };
    prev.current = text;
    setOut((o) => [...o, gone]);
    setTimeout(() => setOut((o) => o.filter((x) => x !== gone)), 200);
  }, [text]);
  const base = 'min-w-0 max-w-full [grid-area:1/1] will-change-[transform,opacity]';
  return (
    <>
      {out.map((o) => (
        <span key={`o${o.k}`} aria-hidden="true" className={cn(base, 'grok-swap-out pointer-events-none')}>
          <span className={className}>{o.t}</span>
        </span>
      ))}
      <span key={text} className={cn(base, text !== first.current && 'grok-swap-in')}>
        <span className={className}>{text}</span>
      </span>
    </>
  );
}

function StepIcon({ row }: { row: StepRow }) {
  const c = 'size-3.5';
  if (row.kind === 'think') return <G d={P.bulb} className={c} />;
  if (row.kind === 'visit') return <G d={P.link} className={c} />;
  if (row.kind === 'images') return <Image className={c} strokeWidth={2} />;
  if (row.kind === 'search') return <G d={P.search} className={c} />;
  const d = row.icon === 'read' ? P.doc : row.icon === 'skill' ? P.skills : row.icon === 'edit' ? P.edit : P.search;
  return <G d={d} className={c} />;
}

/** One row: a 28px rail column (1px line joining the neighbours), a 24px icon slot and 14px/24px grey text. */
function RowShell({ icon, first, tail, children }: { icon: ReactNode; first: boolean; tail: boolean; children: ReactNode }) {
  return (
    <div className="group/row relative z-[2] flex items-start gap-0.5" style={{ background: C.base }}>
      <div className="relative flex w-7 shrink-0 justify-center self-stretch">
        {!first && <i aria-hidden="true" className="pointer-events-none absolute w-px" style={{ left: 13.5, top: -4, height: 5, background: RAIL }} />}
        {tail && <i aria-hidden="true" className="pointer-events-none absolute w-px" style={{ left: 13.5, top: 23, bottom: -4, background: RAIL }} />}
        <div className="relative z-[2] flex size-6 shrink-0 items-center justify-center" style={{ color: C.fg2 }}>
          {icon}
        </div>
      </div>
      <div className="min-w-0 flex-1 ps-0.5 pe-2">{children}</div>
    </div>
  );
}

function StepText({ row }: { row: StepRow }) {
  const t = useCopy(COPY_CORE);
  if (row.kind === 'think')
    return (
      <span className="line-clamp-3 block text-sm leading-6" style={{ color: C.fg2 }}>
        {row.text}
      </span>
    );
  if (row.kind === 'visit' || row.kind === 'images')
    return (
      <div className="flex min-w-0 items-baseline gap-1.5 text-sm leading-6" style={{ color: C.fg2 }}>
        <span className="shrink-0 whitespace-nowrap">{row.kind === 'visit' ? t.visited : t.imagesSearched}</span>
        <span className="truncate" style={{ fontFamily: MONO }}>
          {row.text}
        </span>
      </div>
    );
  const label = row.kind === 'search' ? searchLabel(row.count ?? 1) : (row.text ?? '');
  return (
    <div className="flex min-w-0 items-baseline gap-1.5 text-sm leading-6">
      <span className="grid min-w-0 max-w-full shrink-0 overflow-x-clip overflow-y-visible">
        <SwapLabel text={label} className={cn('whitespace-nowrap text-[#9e9e9e] transition-colors group-hover/row:text-[#fcfcfc]', row.active && 'grok-shimmer')} />
      </span>
    </div>
  );
}

function StepRowView({ row, first, last }: { row: StepRow; first: boolean; last: boolean }) {
  const subs = row.subs ?? [];
  return (
    <div className={row.leaving ? 'grok-out120' : 'grok-f180'}>
      <RowShell icon={<StepIcon row={row} />} first={first} tail={!last || subs.length > 0}>
        <StepText row={row} />
      </RowShell>
      {subs.length > 0 && (
        <div className="relative" style={{ paddingInlineStart: 32 }}>
          <div className="relative grid">
            {!last && <i aria-hidden="true" className="pointer-events-none absolute w-px" style={{ left: -18.5, top: -1, bottom: -4, background: RAIL }} />}
            <div className="col-start-1 row-start-1 overflow-x-visible overflow-y-clip">
              <div className="flex flex-col gap-2 pt-2">
                {subs.map((s) => (
                  <div key={s} className="grok-f180 relative">
                    <div className="absolute rounded-full" style={{ left: -26.5, top: 1.5, width: 17, height: 17, background: C.base }} />
                    <div data-canvas-dot="" className="absolute z-[1] rounded-full border" style={{ left: -22.5, top: 5.5, width: 9, height: 9, background: C.base, borderColor: RAIL3 }} />
                    <span className="block text-sm leading-snug" style={{ color: C.fg2 }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** The bottom row: "Réflexion pendant Ns" while it runs (the counter reads "1m 12s" past a minute), "Réflexion : Ns" once done. */
function TailRow({ tail, first }: { tail: NonNullable<StepsTail>; first: boolean }) {
  const t = useCopy(COPY_CORE);
  const secs = useElapsed(tail.kind === 'live' ? tail.started : 0, tail.kind === 'live');
  return (
    <RowShell icon={<G d={P.bulb} className="size-3.5" />} first={first} tail={false}>
      <span className="block text-sm leading-6" style={{ color: C.fg2 }}>
        {tail.kind === 'live' ? t.thinkingFor(fmtDur(secs)) : t.thoughtFor(fmtDur(tail.seconds))}
      </span>
    </RowShell>
  );
}

/** The steps container (fades in over 120ms; every row over 180ms). */
function StepsList({ rows, tail }: { rows: StepRow[]; tail: StepsTail }) {
  return (
    <div className="grok-f120 relative mb-2">
      <div className="relative flex flex-col gap-3">
        <div className="not-prose relative flex flex-col gap-2 text-sm">
          {rows.map((r, i) => (
            <StepRowView key={r.id} row={r} first={i === 0} last={i === rows.length - 1 && !tail} />
          ))}
          {tail && <TailRow tail={tail} first={rows.length === 0} />}
        </div>
      </div>
    </div>
  );
}

/** "Réflexion pendant Ns" alone, then the steps list with the counter as its last row; once the answer is on its way the
 *  list folds into a "Réflexion : Ns" button (chevron-down) that opens it again. */
function StepsBlock({ data }: { data: StepsData }) {
  const t = useCopy(COPY_CORE);
  const final = data.phase === 'final';
  const secs = useElapsed(data.started, !final);
  const [manual, setManual] = useState<boolean | null>(null);
  const open = manual ?? !data.collapsed;
  const shown: StepRow[] = final && data.finalText ? [...data.rows, { id: 'final', kind: 'think', text: data.finalText }] : data.rows;
  const lone = !final && shown.length === 0;
  return (
    <div className="thinking-container mb-1">
      {lone ? (
        <div className="-ms-1.5 text-sm">
          <TailRow tail={{ kind: 'live', started: data.started }} first />
        </div>
      ) : (
        <div className={cn('grid transition-[grid-template-rows] duration-300', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')} style={{ transitionTimingFunction: EASE }}>
          <div className="-ms-1.5 min-h-0 overflow-hidden" aria-hidden={!open}>
            <StepsList rows={shown} tail={final ? null : { kind: 'live', started: data.started }} />
          </div>
        </div>
      )}
      {final && (
        <div className="not-prose relative mb-2 text-sm">
          <button type="button" data-testid="canvas-trigger" aria-expanded={open} onClick={() => setManual(!open)} className={cn('flex w-fit cursor-pointer flex-row items-center gap-1 pb-0 text-sm leading-6 transition-colors hover:text-[#fcfcfc]', open ? 'pt-0.5' : 'pt-3')} style={{ color: C.fg2 }}>
            <span>{t.thoughtFor(fmtDur(data.seconds ?? secs))}</span>
            <G d={P.chevron} className={cn('size-3.5 transition-transform duration-200', open && 'rotate-180')} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Streamed answer: a small markdown renderer whose every word blurs in ---------- */

/** **bold** and [[Source]] chips. A half-written chip stays hidden until its closing brackets arrive. */
function Inline({ text, k }: { text: string; k: string }) {
  const clean = text.replace(/\[\[[^\]]*\]?$/, '');
  return (
    <>
      {clean.split('**').map((seg, i) => {
        const bits = seg.split(/\[\[([^\]]+)\]\]/);
        const body = bits.map((b, j) =>
          j % 2 ? (
            <a key={`${k}-${i}-c${j}`} href="#" onClick={(e) => e.preventDefault()} className="grok-w ms-1 inline-flex h-5 translate-y-[-1px] items-center rounded-full px-2 align-middle text-[13px] leading-[13px] font-medium transition-colors hover:text-[#fcfcfc]" style={{ background: C.side, color: C.fg2 }}>
              {b}
            </a>
          ) : (
            <Words key={`${k}-${i}-${j}`} text={b} keyPrefix={`${k}-${i}-${j}`} className="grok-w" />
          ),
        );
        return i % 2 ? (
          <strong key={`${k}-${i}`} className="font-[550]">
            {body}
          </strong>
        ) : (
          <Fragment key={`${k}-${i}`}>{body}</Fragment>
        );
      })}
    </>
  );
}

/** Rapide's inline image: grok loads a third-party photo; we keep its geometry (8px radius, --surface-l2 backdrop, max-h 448px,
 *  12px caption, source link on hover) around a neutral block. It enters over 200ms, rising 8px. */
function ImageCard({ caption, className }: { caption: string; className?: string }) {
  const t = useCopy(COPY_CORE);
  return (
    <div data-card-entrance="animated" className={cn('grok-card-in', className)}>
      <div data-testid="image-viewer" aria-label={caption} className="clear-both mx-auto flex w-full flex-col justify-center gap-1">
        <div className="group/image relative w-full">
          <button type="button" aria-label={t.openImage(caption)} className="relative block w-full cursor-pointer overflow-hidden rounded-lg" style={{ background: C.raised }}>
            <span className="grid w-full place-items-center" style={{ aspectRatio: '16 / 9', maxHeight: 448, background: 'linear-gradient(135deg,#2b2927,#1b1a18)', color: C.fg3 }}>
              <Image className="size-8 opacity-50" strokeWidth={1.5} />
            </span>
          </button>
          <div className="absolute right-1 bottom-1 opacity-0 transition-opacity group-focus-within/image:opacity-100 group-hover/image:opacity-100">
            <a href="#" onClick={(e) => e.preventDefault()} className="line-clamp-1 rounded-3xl px-2 text-xs transition-colors hover:bg-[#201f1d]" style={{ background: C.side, color: C.fg }}>
              en.wikipedia.org
            </a>
          </div>
        </div>
        <div className="pb-2 text-xs leading-normal" style={{ color: C.fg3 }} title={caption}>
          {caption}
        </div>
      </div>
    </div>
  );
}

function Answer({ text }: { text: string }) {
  const blocks = parseMarkdown(text);
  return (
    <div className="text-[15px] leading-[22.5px]" style={{ color: C.fg }}>
      {blocks.map((b, i) => {
        const k = `b${i}`;
        const gap = i === 0 ? '' : b.t === 'h' ? 'mt-[30px]' : blocks[i - 1].t === 'h' ? 'mt-[10px]' : 'mt-[15px]';
        if (b.t === 'h')
          return (
            <h3 key={k} className={cn('text-[20px] leading-[28px] font-[550]', gap)}>
              <Inline text={b.text} k={k} />
            </h3>
          );
        if ('text' in b)
          return (
            <p key={k} className={gap}>
              <Inline text={b.text} k={k} />
            </p>
          );
        if (b.t === 'img') return <ImageCard key={k} caption={b.alt} className={gap} />;
        if (b.t === 'table')
          return (
            <MarkdownTable
              key={k}
              rows={b.rows}
              cell={(c, ri, ci) => <Inline text={c} k={`${k}-${ri}-${ci}`} />}
              className={cn('rounded-2xl border-[rgba(252,252,252,0.06)] bg-[#181716]', gap)}
              classNames={{ table: 'text-[14px] leading-[21px]', head: 'bg-transparent', row: 'border-[rgba(252,252,252,0.06)]', cell: 'px-4 py-2.5 text-inherit', th: 'font-[550]' }}
            />
          );
        if (b.t === 'code')
          return (
            <pre key={k} className={cn('overflow-x-auto rounded-2xl border px-4 py-3 text-[13px] leading-5', gap)} style={{ background: C.side, borderColor: C.line, fontFamily: MONO }}>
              {b.code}
            </pre>
          );
        const List = b.t;
        return (
          <List key={k} className={cn('flex flex-col gap-[7px] ps-6', b.t === 'ul' ? 'list-disc' : 'list-decimal', gap)}>
            {b.items.map((it, j) => (
              <li key={j} className="ps-0.5">
                <Inline text={it} k={`${k}-${j}`} />
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

/* ---------- Thread pieces ---------- */

/** Extra props (and the ref) pass through, so a Radix trigger can wrap it with asChild. */
function IconBtn({ label, children, className, active, ...rest }: { label: string; children: ReactNode; className?: string; active?: boolean } & Omit<ComponentProps<'button'>, 'children' | 'className'>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cn('grid size-8 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc] data-[state=open]:bg-[rgba(252,252,252,0.06)] data-[state=open]:text-[#fcfcfc]', active && 'text-[#fcfcfc]', className)}
      style={active ? undefined : { color: C.fg2 }}
    >
      {children}
    </button>
  );
}

function UserTurn({ text }: { text: string }) {
  const t = useCopy(COPY_CORE);
  return (
    <div className="group flex flex-col items-end">
      <div className="max-w-[85%] rounded-2xl px-4 py-2 text-[15px] leading-[22.5px] break-words whitespace-pre-wrap" style={{ background: C.raised, color: C.fg }}>
        {text}
      </div>
      <div className="mt-0.5 flex h-8 opacity-0 transition-opacity group-hover:opacity-100">
        <IconBtn label={t.edit}>
          <G d={P.edit} className="size-4" />
        </IconBtn>
        <IconBtn label={t.copy} onClick={() => void navigator.clipboard?.writeText(text)}>
          <Copy className="size-4" strokeWidth={2} />
        </IconBtn>
      </div>
    </div>
  );
}

const dataOf = <T,>(m: Message | undefined, type: string) => (m?.parts.find((p) => p.kind === 'custom' && p.type === type) as Extract<Part, { kind: 'custom' }> | undefined)?.data as T | undefined;
const textPart = (m: Message) => m.parts.find((p): p is Extract<Part, { kind: 'text' }> => p.kind === 'text');

/** "Lire à voix haute": the browser's own French voice. */
function speak(text: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\*\*|\[\[|\]\]|^#+ |^\|.*$/gm, ''));
  u.lang = intlLocale();
  synth.speak(u);
}

function AssistantTurn({ m, onOpenLog, onOpenSources, onAsk, onRegenerate }: { m: Message; onOpenLog: () => void; onOpenSources: () => void; onAsk: (q: string) => void; onRegenerate: () => void }) {
  const t = useCopy(COPY_CORE);
  const agents = dataOf<AgentsData>(m, 'agents');
  const steps = dataOf<StepsData>(m, 'steps');
  const sources = dataOf<{ count: number; favicons: string[] }>(m, 'sources');
  const follow = dataOf<{ items: string[] }>(m, 'followups');
  const text = textPart(m);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  return (
    <div className="flex flex-col">
      {agents && (
        <div className={cn(text && 'mb-3')}>
          <AgentsHeader data={agents} streaming={!m.done} onOpen={onOpenLog} />
          {!agents.solo && <AgentFeed items={agents.items} running={!agents.done} renderItem={(it) => <FeedRow item={it} />} enterClassName="grok-feed-in" exitClassName="grok-feed-out" easing={EASE} />}
        </div>
      )}
      {steps && <StepsBlock data={steps} />}
      {text && <Answer text={text.text} />}
      {sources && (
        <div className="grok-enter mt-2 -ms-2">
          <button type="button" aria-label={`${sources.count} sources`} onClick={onOpenSources} className="flex h-[31px] items-center gap-2 rounded-full border py-[5px] ps-[5px] pe-2.5 text-[14px] leading-[21px] transition-colors hover:bg-[#201f1d]" style={{ background: C.side, borderColor: C.line, color: C.fg }}>
            <span className="flex">
              {sources.favicons.map((s, i) => (
                <span key={i} className="grid size-5 place-items-center rounded-full border" style={{ background: C.base, borderColor: C.line, marginLeft: i ? -8 : 0 }}>
                  <Favicon site={s} />
                </span>
              ))}
            </span>
            {sources.count} sources
          </button>
        </div>
      )}
      {(m.done || sources) && text && (
        <div className="grok-enter mt-0.5 -ms-1.5 flex h-8">
          <IconBtn label={t.copyAnswer} onClick={() => void navigator.clipboard?.writeText(text.text)}>
            <Copy className="size-4" strokeWidth={2} />
          </IconBtn>
          <IconBtn label={t.shareLink}>
            <G d={P.link} className="size-4" />
          </IconBtn>
          <IconBtn label="Like" active={vote === 'up'} onClick={() => setVote((v) => (v === 'up' ? null : 'up'))}>
            <ThumbsUp className="size-4" strokeWidth={2} fill={vote === 'up' ? 'currentColor' : 'none'} />
          </IconBtn>
          <IconBtn label="Dislike" active={vote === 'down'} onClick={() => setVote((v) => (v === 'down' ? null : 'down'))}>
            <ThumbsDown className="size-4" strokeWidth={2} fill={vote === 'down' ? 'currentColor' : 'none'} />
          </IconBtn>
          <IconBtn label={t.regenerate} onClick={onRegenerate}>
            <RefreshCw className="size-4" strokeWidth={2} />
          </IconBtn>
          <Menu
            align="start"
            trigger={
              <IconBtn label="More actions">
                <Ellipsis className="size-4" strokeWidth={2} />
              </IconBtn>
            }
          >
            <MenuItem icon={<Flag className="size-4" strokeWidth={2} />}>{t.reportProblem}</MenuItem>
            <MenuItem icon={<FileDown className="size-4" strokeWidth={2} />}>{t.exportPdf}</MenuItem>
            <MenuItem icon={<Volume2 className="size-4" strokeWidth={2} />} onSelect={() => speak(text.text)}>
              {t.readAloud}
            </MenuItem>
          </Menu>
        </div>
      )}
      {follow && (
        <div className={cn('mt-3 flex flex-col items-start gap-1', steps && 'grok-f100')}>
          {follow.items.map((q, i) => (
            <button key={q} type="button" onClick={() => onAsk(q)} className={cn('flex h-10 items-center gap-2 rounded-xl ps-[17px] pe-4 text-start text-[14px] leading-[19.6px] font-medium transition-colors hover:bg-[rgba(252,252,252,0.04)] hover:text-[#fcfcfc]', !steps && 'grok-enter')} style={{ color: C.fg2, animationDelay: steps ? undefined : `${i * 60}ms` }}>
              <G d={P.arrowDownRight} className="size-4 opacity-60" />
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- The right panel: "Réflexions" (the agents' log, run by run) or "Sources" (every search, per agent) ---------- */

/** What a search row unfolds into: the pages it found (titles worded from the query, sites from its favicons). */
function resultsFor(query: string, favicons: string[], n: number) {
  const Q = query.charAt(0).toUpperCase() + query.slice(1);
  const titles = copyOf(COPY_CORE).resultTitles(Q, query);
  return titles.slice(0, Math.min(n, titles.length)).map((t, i) => {
    const site = favicons[i % favicons.length];
    return { title: `${t} | ${site.split(':')[2]}`, site };
  });
}

function PanelRow({ item }: { item: Extract<FeedItem, { kind: 'search' | 'visit' }> }) {
  const t = useCopy(COPY_CORE);
  const [open, setOpen] = useState(false);
  const search = item.kind === 'search';
  return (
    <div>
      <button type="button" disabled={!search} onClick={() => setOpen((o) => !o)} className="group/srow flex w-full items-center gap-2 px-1 py-1.5 text-start disabled:cursor-default">
        <span className="relative grid size-5 shrink-0 place-items-center" style={{ color: C.fg2 }}>
          <Globe className={cn('size-3.5 transition-opacity duration-150', search && (open ? 'opacity-0' : 'group-hover/srow:opacity-0'))} strokeWidth={2} />
          {search && <ChevronDown className={cn('absolute size-3.5 transition-all duration-150', open ? 'rotate-180 opacity-100' : 'opacity-0 group-hover/srow:opacity-100')} strokeWidth={2} />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] leading-[19.5px]" style={{ color: C.fg2 }}>
            {search ? t.searched : t.visited}
          </span>
          <span className={cn('line-clamp-1 text-[14px] leading-[21px] font-medium', search && 'italic')} style={{ color: C.fg }}>
            {search ? item.query : item.url}
          </span>
        </span>
        {search && (
          <span className="shrink-0 rounded border px-1.5 py-0.5 text-[13px] leading-[19.5px] tabular-nums" style={{ borderColor: C.line, color: C.fg2, fontFamily: MONO }}>
            {item.results}
          </span>
        )}
      </button>
      {search && open && (
        <div className="grok-enter ms-7 mb-2 overflow-hidden rounded-xl border" style={{ borderColor: C.line }}>
          {resultsFor(item.query, item.favicons, item.results).map((r, i) => (
            <a key={i} href="#" onClick={(e) => e.preventDefault()} className={cn('block px-3 py-2.5 transition-colors hover:bg-[rgba(252,252,252,0.04)]', i > 0 && 'border-t')} style={{ borderColor: C.line }}>
              <span className="line-clamp-2 text-[14px] leading-[20px] font-[550]" style={{ color: C.fg }}>
                {r.title}
              </span>
              <span className="mt-1.5 flex items-center gap-1.5 text-[13px] leading-4" style={{ color: C.fg2 }}>
                <Favicon site={r.site} size={14} />
                {r.site.split(':')[2]}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** An agent's message in the log: its bubble, folded to six lines behind "Afficher plus". */
function PanelBubble({ text }: { text: string }) {
  const t = useCopy(COPY_CORE);
  const [more, setMore] = useState(false);
  const long = text.length > 280;
  return (
    <div className="my-1 ms-7 px-[10px] py-[7px]" style={{ background: C.raised, borderRadius: '4px 16px 16px 16px' }}>
      <p className={cn('text-[14px] leading-[19.25px] whitespace-pre-line', long && !more && 'line-clamp-6')} style={{ color: C.fg }}>
        {text}
      </p>
      {long && (
        <button type="button" onClick={() => setMore((v) => !v)} className="mt-1 text-[13px] font-medium hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
          {more ? t.showLess : t.showMore}
        </button>
      )}
    </div>
  );
}

function PanelGroup({ agent, items }: { agent: AgentId; items: FeedItem[] }) {
  const t = useCopy(COPY_CORE);
  const [open, setOpen] = useState(true);
  const a = AGENTS[agent];
  return (
    <section className="pb-2">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-1 py-2 text-start">
        <AgentOrb agent={agent} size={14} />
        <span className="flex-1 text-[13px] leading-[19.5px] font-[550]" style={{ color: C.fg }}>
          {a.name}
          {agent === 'grok' && (
            <span className="ms-1.5 font-normal" style={{ color: C.fg2 }}>
              {t.lead}
            </span>
          )}
        </span>
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} style={{ color: C.fg2 }} strokeWidth={2} />
      </button>
      {open &&
        items.map((it) =>
          it.kind === 'search' || it.kind === 'visit' ? (
            <PanelRow key={it.id} item={it} />
          ) : it.kind === 'msg' ? (
            <PanelBubble key={it.id} text={it.text} />
          ) : (
            <div key={it.id} className="flex items-center gap-2 px-1 py-1.5 text-[14px] leading-[21px]" style={{ color: C.fg }}>
              <span className="grid size-5 shrink-0 place-items-center" style={{ color: C.fg2 }}>
                <G d={P.bulb} className="size-3.5" />
              </span>
              {it.text}
            </div>
          ),
        )}
    </section>
  );
}

type PanelMode = 'thoughts' | 'sources';

/** Réflexions keeps the log's order, one group per run of the same speaker; Sources gathers each agent's searches. */
function groupsFor(items: FeedItem[], mode: PanelMode) {
  const out: { agent: AgentId; items: FeedItem[] }[] = [];
  if (mode === 'sources') {
    for (const id of ORDER) {
      const mine = items.filter((it) => (it.kind === 'search' || it.kind === 'visit') && ownerOf(it) === id);
      if (mine.length) out.push({ agent: id, items: mine });
    }
    return out;
  }
  for (const it of items) {
    const who = ownerOf(it);
    const last = out[out.length - 1];
    if (last?.agent === who) last.items.push(it);
    else out.push({ agent: who, items: [it] });
  }
  return out;
}

function SidePanel({ mode, data, onClose }: { mode: PanelMode; data: AgentsData; onClose: () => void }) {
  const t = useCopy(COPY_CORE);
  const groups = groupsFor(data.items, mode);
  return (
    <aside className="flex h-full w-full flex-col border-s" style={{ background: C.base, borderColor: C.line }}>
      <div className="flex h-16 shrink-0 items-center gap-2 ps-4 pe-3">
        <span className="flex">
          {ORDER.map((a, i) => (
            <span key={a} className="grid size-[22px] place-items-center rounded-full" style={{ background: C.base, marginLeft: i ? -8 : 0, zIndex: 10 - i }}>
              <AgentOrb agent={a} size={18} />
            </span>
          ))}
        </span>
        <span className="flex-1 text-[15px] leading-[22.5px] font-[550]" style={{ color: C.fg }}>
          {mode === 'sources' ? t.sourcesTitle : t.thoughts}
        </span>
        <IconBtn label={t.close} onClick={onClose}>
          <X className="size-[18px]" />
        </IconBtn>
      </div>
      <div className="grok-scroll flex-1 overflow-y-auto px-4 pb-6">
        {groups.map((g, i) => (
          <PanelGroup key={`${mode}-${i}`} agent={g.agent} items={g.items} />
        ))}
      </div>
    </aside>
  );
}

/* ---------- Composer ---------- */

type ModelId = 'auto' | 'fast' | 'expert' | 'heavy' | 'build' | 'bot';
const MODELS: { id: ModelId; icon: ReactNode }[] = [
  { id: 'auto', icon: <G d={P.rocket} className="size-[18px]" /> },
  { id: 'fast', icon: <G d={P.flash} className="size-[18px]" /> },
  { id: 'expert', icon: <G d={P.bulb} className="size-[18px]" /> },
  { id: 'heavy', icon: <G d={P.connectors} className="size-[18px]" /> },
  { id: 'build', icon: <G d={P.hammer} className="size-[18px]" /> },
  { id: 'bot', icon: <BotMark color={C.fg2} className="size-[18px]" /> },
];

/** The home composer's placeholder: one hint at a time, the next sliding up from below every few seconds. */
function RotatingHint() {
  const t = useCopy(COPY_CORE);
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => n + 1), 3200);
    return () => clearInterval(id);
  }, []);
  const at = (n: number) => t.hints[n % t.hints.length];
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-[18px] top-3.5 h-7 overflow-hidden text-[16px] leading-[28px]" style={{ color: C.fg2 }}>
      {i > 0 && (
        <span key={`out-${i}`} className="grok-ph-out absolute inset-0 truncate">
          {at(i - 1)}
        </span>
      )}
      <span key={`in-${i}`} className={cn('absolute inset-0 truncate', i > 0 && 'grok-ph-in')}>
        {at(i)}
      </span>
    </span>
  );
}

function AttachMenu({ onPick }: { onPick: () => void }) {
  const t = useCopy(COPY_COMPOSER);
  const tc = useCopy(COPY_CORE);
  return (
    <Menu
      align="start"
      className="w-[208px]"
      trigger={
        <button type="button" aria-label={t.attach} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)] data-[state=open]:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg }}>
          <G d={P.plus} className="size-[22px]" />
        </button>
      }
    >
      <MenuItem tall icon={<G d={P.docPlus} className="size-4" />} onSelect={onPick}>
        {t.uploadFile}
      </MenuItem>
      <SubMenu icon={<G d={P.folder} className="size-4" />} label={t.addToProject}>
        <MenuSep />
        <MenuItem tall icon={<G d={P.plus} className="size-4" />}>
          {t.createProject}
        </MenuItem>
      </SubMenu>
      <SubMenu icon={<G d={P.doc} className="size-4" />} label={t.recentFilesLabel} width={286}>
        {tc.recentFiles.map((f) => (
          <MenuItem key={f} tall icon={<G d={/\.(png|jpe?g)$/.test(f) ? P.photo : P.doc} className="size-4" />}>
            {f}
          </MenuItem>
        ))}
      </SubMenu>
      <MenuSep />
      <SubMenu icon={<G d={P.skills} className="size-4" />} label={t.skills}>
        <MenuItem tall icon={<G d={P.doc} className="size-4" />}>
          docx
        </MenuItem>
        <MenuItem tall icon={<G d={P.doc} className="size-4" />}>
          pdf
        </MenuItem>
        <MenuItem tall icon={<G d={P.pie} className="size-4" />}>
          pptx
        </MenuItem>
        <MenuItem tall icon={<G d={P.sheet} className="size-4" />}>
          xlsx
        </MenuItem>
        <MenuSep />
        <MenuItem tall icon={<G d={P.plus} className="size-4" />}>
          {t.createSkill}
        </MenuItem>
        <MenuItem tall icon={<G d={P.settings} className="size-4" />}>
          {t.manageSkills}
        </MenuItem>
      </SubMenu>
      <MenuItem tall icon={<G d={P.connectorsPlus} className="size-4" />}>
        {t.addConnector}
      </MenuItem>
    </Menu>
  );
}

function ModelMenu({ model, onModel }: { model: ModelId; onModel: (m: ModelId) => void }) {
  const t = useCopy(COPY_COMPOSER);
  const tc = useCopy(COPY_CORE);
  const label = tc.models[model];
  return (
    <Menu
      align="end"
      trigger={
        <button type="button" aria-label={t.model(label)} className="group flex h-10 items-center gap-2 rounded-full px-4 text-[14px] leading-[19.6px] font-medium transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc] data-[state=open]:bg-[rgba(252,252,252,0.06)] data-[state=open]:text-[#fcfcfc]" style={{ color: C.fg2 }}>
          {model === 'bot' && <span aria-hidden="true" className="size-4 shrink-0 rounded-full" style={{ background: 'rgba(252,252,252,0.22)' }} />}
          {label}
          {model === 'build' && (
            <span className="rounded-full border px-[5px] text-[10px] leading-[16px] font-normal" style={{ borderColor: C.line, color: C.fg2 }}>
              Beta
            </span>
          )}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true">
            <polyline points="4,6 8,10 12,6" />
          </svg>
        </button>
      }
    >
      <DM.RadioGroup value={model} onValueChange={(v) => onModel(v as ModelId)}>
        {MODELS.map((m) => (
          <DM.RadioItem key={m.id} value={m.id} className={ROW}>
            <span className="grid size-[18px] shrink-0 place-items-center" style={{ color: C.fg2 }}>
              {m.icon}
            </span>
            <span className="flex-1">{tc.models[m.id]}</span>
            <DM.ItemIndicator>
              <G d={P.check} className="size-4" />
            </DM.ItemIndicator>
          </DM.RadioItem>
        ))}
      </DM.RadioGroup>
    </Menu>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  busy,
  onStop,
  placeholder,
  model,
  onModel,
  incognito,
  hideModel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  onStop: () => void;
  /** None: the home's rotating hints. */
  placeholder?: string;
  model: ModelId;
  onModel: (m: ModelId) => void;
  /** The private mode's tone, when it is on. */
  incognito?: PrivateTone | false;
  /** A bot thread has no model picker. */
  hideModel?: boolean;
}) {
  const t = useCopy(COPY_COMPOSER);
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }, [value]);
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!busy) onSend();
    }
  };
  const has = value.trim().length > 0;
  const grey = incognito === 'gris';
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy) onSend();
      }}
      className={cn('relative w-full overflow-hidden rounded-[24px] border transition-colors', grey ? 'border-transparent focus-within:border-dashed focus-within:border-[rgba(196,199,197,0.5)]' : 'focus-within:border-[rgba(252,252,252,0.1)]')}
      style={{ background: grey ? C.incognitoGrey : incognito ? C.incognito : C.raised, borderColor: grey ? undefined : incognito ? 'transparent' : C.line }}
    >
      <div className="relative ps-2.5 pe-3.5">
        <textarea
          ref={ta}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          aria-label={t.ask}
          className="grok-scroll block max-h-[400px] min-h-[42px] w-full resize-none bg-transparent px-2 pt-3.5 text-[16px] leading-[28px] outline-none placeholder:text-[#9e9e9e]"
          style={{ color: C.fg }}
        />
        {placeholder === undefined && !value && <RotatingHint />}
      </div>
      <input ref={file} type="file" multiple hidden onChange={(e) => (e.target.value = '')} />
      <div className="flex items-center justify-between px-2.5 pt-2.5 pb-2.5">
        <div className="flex items-center gap-1">
          <AttachMenu onPick={() => file.current?.click()} />
          {incognito && (
            <span role="img" aria-label={t.privateChat} title={t.privateChat} className="grok-fade grid size-8 place-items-center" style={{ color: grey ? C.incognitoGreyFg : C.incognitoFg }}>
              <G d={P.privacy} className="size-[18px]" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!hideModel && <ModelMenu model={model} onModel={onModel} />}
          <button type="button" aria-label={t.dictation} title={t.dictation} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
            <G d={P.mic} className="size-[18px]" />
          </button>
          {busy ? (
            <button type="button" onClick={onStop} aria-label={t.stop} className="grid size-10 place-items-center rounded-full bg-[#fcfcfc] transition-opacity hover:opacity-90">
              <span className="size-3 rounded-[2px] bg-[#131211]" />
            </button>
          ) : incognito ? (
            <button type="submit" aria-label={t.send} disabled={!has} className="grid size-10 place-items-center rounded-full transition-opacity hover:opacity-90" style={grey ? { background: C.incognitoGreyBtn, color: C.incognitoGreyFg } : { background: C.incognitoBtn, color: C.incognitoFg }}>
              <G d={P.arrowUp} className="size-5" />
            </button>
          ) : has ? (
            <button type="submit" aria-label={t.send} className="grok-pop grid size-10 place-items-center rounded-full text-[#fcfcfc] transition-opacity hover:opacity-90" style={{ background: C.blue }}>
              <G d={P.arrowUp} className="size-5" />
            </button>
          ) : (
            <button type="button" aria-label={t.voiceMode} title={t.voiceMode} className="grid size-10 place-items-center rounded-full" style={{ background: C.base, boxShadow: `inset 0 0 0 1px ${C.line}`, color: C.blue }}>
              <G d={P.voice} className="size-[18px]" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

/** Under the private composer: this chat stays out of the history. */
function PrivateNotice() {
  const t = useCopy(COPY_COMPOSER);
  return (
    <p className="grok-fade flex items-center justify-center gap-1 px-6 py-4 text-center text-[14px] leading-[21px]" style={{ color: C.fg2 }}>
      <G d={P.ghost} className="size-4" />
      {t.privateNotice}
    </p>
  );
}

/* ---------- App state: what the sidebar lists and every page and dialog edits (no routing: a `view`) ---------- */

type Bot = { id: string; name: string; color: string; shape: BotShape; group: string; pinned?: boolean; main?: boolean; unread?: boolean; hidden?: boolean; title?: string; desc?: string; img?: string };
type BotGroup = { name: string; open: boolean };
type ChatRec = { id: string; title: string; when: string; group: string; snippet: string; answer: string; pinned?: boolean; project?: string };
type Project = { id: string; name: string; files: string[]; instructions: string };
type LibKind = 'image' | 'video' | 'pdf' | 'md';
type Share = 'Privée' | 'Partagée' | 'Publiée';
type LibItem = { id: string; name: string; kind: LibKind; at: number; size: number; share: Share; hue: number; ratio?: number };
type LibTab = 'all' | 'media' | 'projects' | 'apps' | 'files';
type View =
  | { kind: 'chat' }
  | { kind: 'history'; id: string }
  | { kind: 'imagine' }
  | { kind: 'template'; slug: string }
  | { kind: 'library'; tab: LibTab }
  | { kind: 'automations' }
  | { kind: 'bot'; id: string }
  | { kind: 'project'; id: string };
type PluginTab = 'connectors' | 'skills' | 'bots';
type SettingsSection = 'home' | 'appearance' | 'behavior' | 'notifications' | 'personality' | 'grok-bot' | 'billing' | 'usage' | 'data';
type ConfirmOpts = { title: string; body: string; action: string; onConfirm: () => void; danger?: boolean };
type Freq = 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
type Trigger = { id: string; freq?: Freq; event?: { group: string; label: string }; h: number; m: number; day: number };
type Auto = { id: string; name: string; icon: number; color: string; bot: string; triggers: Trigger[]; instructions: string; app: boolean; mail: boolean; model: string; paused?: boolean };
type ImagineMode = 'image' | 'video' | 'agent';
type ImagineRun = { id: string; prompt: string; mode: ImagineMode; ratio: string; n: number; hues: number[]; done: boolean };
type ImagineOpts = { mode: ImagineMode; speed: 'fast' | 'quality'; count: string; ratio: string; res: string; dur: string; audio: boolean };
type SetS<T> = Dispatch<SetStateAction<T>>;

type Store = {
  view: View;
  go: (v: View) => void;
  bots: Bot[];
  setBots: SetS<Bot[]>;
  patchBot: (id: string, p: Partial<Bot> | null) => void;
  openBot: (id: string) => void;
  groups: BotGroup[];
  setGroups: SetS<BotGroup[]>;
  /** The live chat (id "live", when it has a title) first, then the history. */
  chats: ChatRec[];
  patchChat: (id: string, p: Partial<ChatRec> | null) => void;
  openChat: (id: string) => void;
  projects: Project[];
  setProjects: SetS<Project[]>;
  lib: LibItem[];
  setLib: SetS<LibItem[]>;
  autos: Auto[];
  setAutos: SetS<Auto[]>;
  connected: string[];
  setConnected: SetS<string[]>;
  runs: ImagineRun[];
  setRuns: SetS<ImagineRun[]>;
  imagine: ImagineOpts;
  setImagine: SetS<ImagineOpts>;
  clearChats: () => void;
  /** Starts a fresh live chat with this question (the streaming engine), optionally in a model and a project. */
  ask: (q: string, model?: ModelId, project?: string) => void;
  ui: {
    createBot: (name?: string) => void;
    botSettings: (id: string) => void;
    chooseMain: () => void;
    newSection: (botId: string) => void;
    createProject: (then?: (id: string) => void) => void;
    plugins: (tab?: PluginTab) => void;
    settings: (section?: SettingsSection) => void;
    confirm: (o: ConfirmOpts) => void;
    computer: (botId: string) => void;
  };
};
const StoreCtx = createContext<Store | null>(null);
const useStore = () => useContext(StoreCtx)!;

let idSeq = 0;
const newId = (p = 'x') => `${p}${Date.now().toString(36)}${(++idSeq).toString(36)}`;

/** grok's 11 avatar colours ("Noir" draws a white dot on the dark theme). */
const BOT_COLORS: { hex: string }[] = [
  { hex: '#ffffff' },
  { hex: '#936439' },
  { hex: '#ff263c' },
  { hex: '#ff6700' },
  { hex: '#ff9800' },
  { hex: '#00c972' },
  { hex: '#00bca6' },
  { hex: '#1084fe' },
  { hex: '#9159fe' },
  { hex: '#ff309b' },
  { hex: '#777777' },
];

const COPY_DATA = defineCopy({
  en: {
    groups: ["Sports", "Work", "Learning", "Home"],
    bots: [
      { name: "Head chef", title: "Cooking", desc: "Seasonal recipes, weekly menus and shopping lists." },
      { name: "Running coach", title: "Sports", desc: "Training plans and recovery tips." },
      { name: "Morning yoga", title: "", desc: "" },
      { name: "CTO Advisor", title: "Architecture, hiring", desc: "A CTO’s take on your technical choices." },
      { name: "Spec reviewer", title: "", desc: "" },
      { name: "Language tutor", title: "", desc: "" },
      { name: "Gardener", title: "", desc: "" },
    ],
    history: [
      { title: "Best architecture in Rust", when: "19 hours ago", group: "Yesterday", snippet: "For a Rust web service, a hexagonal architecture remains the safest choice: a pure domain, ports as traits and adapters (axum, sqlx) at the edge.", answer: "For a Rust web service, a **hexagonal architecture** remains the safest choice: a pure domain at the center, ports expressed as traits and adapters at the edge. [[Rust Book]]\n\n### Suggested layout\n- **domain**: business types and rules, no external dependency\n- **ports**: `Repository`, `Notifier`, `Clock` traits\n- **adapters**: axum for HTTP, sqlx for PostgreSQL\n- **app**: wiring and configuration\n\n### Why\nTraits make the domain testable without a database, and the compiler guarantees that every adapter honors the contract. [[axum Blog]]" },
      { title: "Homemade ramen recipe", when: "2 days ago", group: "Last 7 days", snippet: "A tonkotsu broth takes 10 to 12 hours of simmering pork bones at a rolling boil; for a weeknight version, a chicken shoyu broth takes 2 hours.", answer: "A **tonkotsu** broth takes 10 to 12 hours of cooking; for a weeknight, a **chicken shoyu** takes 2 hours.\n\n### Express shoyu (4 bowls)\n1. Simmer 1 kg of chicken wings, ginger and scallion for 2 h\n2. Mix the tare: soy sauce, mirin, sake\n3. Cook the noodles for 2 minutes, then drain\n4. Assemble: tare, broth, noodles, marinated soft-boiled egg\n\nAdd a garlic-infused oil for depth. [[Just One Cookbook]]" },
      { title: "12-week half marathon plan", when: "Sep 12", group: "This year", snippet: "Twelve weeks are enough from a base of 25 km a week: three easy runs, one threshold session and a long run that builds up to 18 km.", answer: "Twelve weeks are enough from a base of **25 km a week**.\n\n### Structure of a week\n- 3 easy runs at base endurance pace\n- 1 threshold session (e.g. 3 × 10 min)\n- 1 long run, from 12 to 18 km\n\n### Progression\n| Weeks | Volume | Long run |\n|---|---|---|\n| 1–4 | 25–30 km | 12 km |\n| 5–8 | 30–38 km | 15 km |\n| 9–11 | 38–42 km | 18 km |\n| 12 | 20 km | race |\n\nKeep an easier week every four weeks. [[Runner's World]]" },
      { title: "2026 GPU comparison", when: "Sep 11", group: "This year", snippet: "In 2026, the best value at 1440p comes down to two mid-range cards; beyond that, the gain per dollar drops sharply.", answer: "In 2026, the best **value at 1440p** comes down to two mid-range cards; beyond that, the gain per dollar drops sharply.\n\n- **1080p**: entry-level is enough, favor 12 GB of memory\n- **1440p**: mid-range delivers 90% of high-end performance\n- **4K**: only high-end holds 60 fps without upscaling\n\nCheck power draw and case size before buying. [[Tom's Hardware]]" },
      { title: "Weekend ideas in Brittany", when: "Sep 8", group: "This year", snippet: "Three itineraries: the Pink Granite Coast, the Crozon peninsula and the Gulf of Morbihan.", answer: "Three itineraries for a weekend:\n\n- **Pink Granite Coast**: the customs officers' path between Perros-Guirec and Ploumanac'h\n- **Crozon peninsula**: Pen-Hir point and the beaches of Morgat\n- **Gulf of Morbihan**: Île aux Moines by boat, then Vannes\n\nIn September the light is beautiful and the trails are quieter. [[Brittany Tourism]]" },
      { title: "Explain transformers simply", when: "Sep 2", group: "This year", snippet: "A transformer reads all the words of a sentence in parallel and learns, for each one, which other words to pay attention to.", answer: "A **transformer** reads all the words of a sentence in parallel and learns, for each one, which other words to pay attention to.\n\n### The key idea: attention\nTo understand \"she\" in \"Mary took the train because she was in a hurry\", the model gives \"Mary\" a heavy weight.\n\n### The building blocks\n1. A vector for each word (embeddings)\n2. Several attention heads in parallel\n3. Stacked layers that refine the representation\n\n[[Attention Is All You Need]]" },
      { title: "Monthly student budget", when: "Aug 28", group: "This year", snippet: "The 50/30/20 rule adapted to a student budget: needs, wants and savings.", answer: "The **50/30/20** rule adapts well to a student budget:\n\n| Item | Share | Example on $900 |\n|---|---|---|\n| Needs | 50% | $450 |\n| Wants | 30% | $270 |\n| Savings | 20% | $180 |\n\nStart by listing fixed expenses (rent, transport, phone plan), then set a weekly cap for groceries." },
      { title: "Python script to rename photos", when: "Aug 19", group: "This year", snippet: "Read the EXIF date of each photo and rename the file to the YYYY-MM-DD_HHMMSS format.", answer: "The idea: read each photo's **EXIF date** and rename the file to the `YYYY-MM-DD_HHMMSS` format.\n\n1. Walk the folder with `pathlib`\n2. Read the date with Pillow (`DateTimeOriginal`)\n3. Add a suffix in case of duplicates\n4. Run in dry-run mode first\n\nKeep a copy of the folder before the first real run. [[Pillow docs]]" },
      { title: "Difference between excl. and incl. tax", when: "Aug 3", group: "This year", snippet: "The price including tax is the price excluding tax plus VAT: incl. = excl. × (1 + rate).", answer: "The price **including tax** is the price **excluding tax** plus VAT: incl. = excl. × (1 + rate).\n\n- Standard rate: 20%\n- Intermediate rate: 10%\n- Reduced rate: 5.5%\n\nExample: 100 excl. tax at the standard rate gives 120 incl. tax. [[Service-Public]]" },
      { title: "Easy plants for a balcony", when: "Jul 27", group: "This year", snippet: "Lavender, geranium, thyme and sedum handle sun and irregular watering.", answer: "For a sunny balcony and irregular watering:\n\n- **Lavender**: fragrant, very little water\n- **Geranium**: blooms all summer\n- **Thyme** and **rosemary**: useful in the kitchen\n- **Sedum**: nearly indestructible\n\nA draining potting mix and pots with holes avoid most problems." },
      { title: "Preparing for a product interview", when: "Mar 2, 2025", group: "Older", snippet: "Product interviews test prioritization, user understanding and communication.", answer: "Product interviews test three things: **prioritization**, **user understanding** and **communication**.\n\n### Common exercises\n- Improve a product you love\n- Define a success metric\n- Prioritize a roadmap under constraints\n\nStructure every answer: context, users, problems, solutions, metrics." },
    ],
    colors: ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Magenta', 'Gray'],
  },
  fr: {
    groups: ["Sport", "Travail", "Apprentissage", "Maison"],
    bots: [
      { name: 'Chef cuisine', title: 'Cuisine', desc: 'Recettes de saison, menus de la semaine et listes de courses.' },
      { name: 'Coach running', title: 'Sport', desc: 'Plans d’entraînement et conseils de récupération.' },
      { name: 'Yoga du matin', title: '', desc: '' },
      { name: 'CTO Advisor', title: 'Architecture, recrutement', desc: 'Un regard de CTO sur vos choix techniques.' },
      { name: 'Relecteur de specs', title: '', desc: '' },
      { name: 'Tuteur d’anglais', title: '', desc: '' },
      { name: 'Jardinier', title: '', desc: '' },
    ],
    history: [
      { title: 'Meilleure architecture en Rust', when: 'Il y a 19 heures', group: 'Hier', snippet: "Pour un service web en Rust, une architecture hexagonale reste le choix le plus sûr : un domaine pur, des ports en traits et des adaptateurs (axum, sqlx) à la périphérie.", answer: "Pour un service web en Rust, une **architecture hexagonale** reste le choix le plus sûr : un domaine pur au centre, des ports exprimés en traits et des adaptateurs à la périphérie. [[Rust Book]]\n\n### Découpage conseillé\n- **domain** : types métier et règles, sans dépendance externe\n- **ports** : traits `Repository`, `Notifier`, `Clock`\n- **adapters** : axum pour HTTP, sqlx pour PostgreSQL\n- **app** : l'assemblage et la configuration\n\n### Pourquoi\nLes traits rendent le domaine testable sans base de données, et le compilateur garantit que chaque adaptateur respecte le contrat. [[Blog axum]]", },
      { title: 'Recette de ramen maison', when: 'Avant-hier', group: 'Les 7 derniers jours', snippet: 'Un bouillon tonkotsu demande 10 à 12 heures de cuisson des os de porc à gros bouillons ; pour une version du soir, un bouillon shoyu au poulet se prépare en 2 heures.', answer: "Un bouillon **tonkotsu** demande 10 à 12 heures de cuisson ; pour un soir de semaine, un **shoyu au poulet** se prépare en 2 heures.\n\n### Shoyu express (4 bols)\n1. Faire mijoter 1 kg d'ailes de poulet, gingembre et oignon vert pendant 2 h\n2. Mélanger le tare : sauce soja, mirin, saké\n3. Cuire les nouilles 2 minutes, les égoutter\n4. Assembler : tare, bouillon, nouilles, œuf mollet mariné\n\nAjoutez une huile parfumée à l'ail pour la profondeur. [[Just One Cookbook]]", },
      { title: 'Plan semi-marathon 12 semaines', when: '12 sept.', group: 'Cette année', snippet: "Douze semaines suffisent à partir d'une base de 25 km par semaine : trois sorties faciles, une séance de seuil et une sortie longue qui monte progressivement à 18 km.", answer: "Douze semaines suffisent à partir d'une base de **25 km par semaine**.\n\n### Structure d'une semaine\n- 3 sorties faciles en endurance fondamentale\n- 1 séance de seuil (ex. 3 × 10 min)\n- 1 sortie longue, de 12 à 18 km\n\n### Progression\n| Semaines | Volume | Sortie longue |\n|---|---|---|\n| 1–4 | 25–30 km | 12 km |\n| 5–8 | 30–38 km | 15 km |\n| 9–11 | 38–42 km | 18 km |\n| 12 | 20 km | course |\n\nGardez une semaine allégée toutes les quatre semaines. [[Runner's World]]", },
      { title: 'Comparatif GPU 2026', when: '11 sept.', group: 'Cette année', snippet: 'En 2026, le meilleur rapport qualité-prix en 1440p se joue entre deux cartes milieu de gamme ; au-delà, le gain par euro chute nettement.', answer: "En 2026, le meilleur **rapport qualité-prix en 1440p** se joue entre deux cartes milieu de gamme ; au-delà, le gain par euro chute nettement.\n\n- **1080p** : l'entrée de gamme suffit, privilégiez 12 Go de mémoire\n- **1440p** : le milieu de gamme offre 90 % des performances haut de gamme\n- **4K** : seul le haut de gamme tient 60 images/s sans upscaling\n\nVérifiez la consommation et la taille du boîtier avant d'acheter. [[Tom's Hardware]]", },
      { title: 'Idées de week-end en Bretagne', when: '8 sept.', group: 'Cette année', snippet: 'Trois itinéraires : la côte de Granit rose, la presqu’île de Crozon et le golfe du Morbihan.', answer: "Trois itinéraires pour un week-end :\n\n- **Côte de Granit rose** : le sentier des douaniers entre Perros-Guirec et Ploumanac'h\n- **Presqu'île de Crozon** : pointe de Pen-Hir et plages de Morgat\n- **Golfe du Morbihan** : île aux Moines en bateau, puis Vannes\n\nEn septembre, la lumière est belle et les sentiers moins fréquentés. [[Bretagne Tourisme]]", },
      { title: 'Expliquer les transformers simplement', when: '2 sept.', group: 'Cette année', snippet: 'Un transformer lit tous les mots d’une phrase en parallèle et apprend, pour chacun, à quels autres mots prêter attention.', answer: "Un **transformer** lit tous les mots d'une phrase en parallèle et apprend, pour chacun, à quels autres mots prêter attention.\n\n### L'idée clé : l'attention\nPour comprendre « elle » dans « Marie a pris le train car elle était pressée », le modèle pondère fortement « Marie ».\n\n### Les briques\n1. Des vecteurs pour chaque mot (embeddings)\n2. Plusieurs têtes d'attention en parallèle\n3. Des couches empilées qui affinent la représentation\n\n[[Attention Is All You Need]]", },
      { title: 'Budget mensuel étudiant', when: '28 août', group: 'Cette année', snippet: 'La règle 50/30/20 adaptée à un budget étudiant : besoins, envies et épargne.', answer: "La règle **50/30/20** s'adapte bien à un budget étudiant :\n\n| Poste | Part | Exemple sur 900 € |\n|---|---|---|\n| Besoins | 50 % | 450 € |\n| Envies | 30 % | 270 € |\n| Épargne | 20 % | 180 € |\n\nCommencez par lister les dépenses fixes (loyer, transport, forfait), puis fixez un plafond hebdomadaire pour les courses.", },
      { title: 'Script Python pour renommer des photos', when: '19 août', group: 'Cette année', snippet: 'Lire la date EXIF de chaque photo et renommer le fichier au format AAAA-MM-JJ_HHMMSS.', answer: "L'idée : lire la **date EXIF** de chaque photo et renommer le fichier au format `AAAA-MM-JJ_HHMMSS`.\n\n1. Parcourir le dossier avec `pathlib`\n2. Lire la date avec Pillow (`DateTimeOriginal`)\n3. Ajouter un suffixe en cas de doublon\n4. Lancer d'abord en mode simulation\n\nGardez une copie du dossier avant le premier vrai passage. [[Pillow docs]]", },
      { title: 'Différence entre HT et TTC', when: '3 août', group: 'Cette année', snippet: 'Le prix TTC est le prix HT auquel on ajoute la TVA : TTC = HT × (1 + taux).', answer: "Le prix **TTC** est le prix **HT** auquel on ajoute la TVA : TTC = HT × (1 + taux).\n\n- Taux normal : 20 %\n- Taux intermédiaire : 10 %\n- Taux réduit : 5,5 %\n\nExemple : 100 € HT au taux normal donnent 120 € TTC. [[Service-Public]]", },
      { title: 'Plantes faciles pour balcon', when: '27 juil.', group: 'Cette année', snippet: 'Lavande, géranium, thym et sedum supportent le soleil et un arrosage irrégulier.', answer: "Pour un balcon ensoleillé et un arrosage irrégulier :\n\n- **Lavande** : parfumée, très peu d'eau\n- **Géranium** : fleurit tout l'été\n- **Thym** et **romarin** : utiles en cuisine\n- **Sedum** : presque indestructible\n\nUn terreau drainant et des pots percés évitent l'essentiel des problèmes.", },
      { title: 'Préparer un entretien produit', when: '2 mars 2025', group: 'Ancien', snippet: 'Les entretiens produit testent la priorisation, la compréhension utilisateur et la communication.', answer: "Les entretiens produit testent trois choses : **priorisation**, **compréhension utilisateur** et **communication**.\n\n### Exercices fréquents\n- Améliorer un produit que vous aimez\n- Définir une métrique de succès\n- Prioriser une feuille de route sous contrainte\n\nStructurez chaque réponse : contexte, utilisateurs, problèmes, solutions, métriques.", },
    ],
    colors: ['Noir', 'Marron', 'Rouge', 'Orange', 'Jaune', 'Vert', 'cyan', 'Bleu', 'violet', 'Magenta', 'Gris'],
  },
});

const BOT_DEFS: (Omit<Bot, 'name' | 'group' | 'title' | 'desc'> & { gi: number })[] = [
  { id: 'b-chef', color: '#f97316', shape: 'blob', gi: -1, pinned: true, main: true, unread: true },
  { id: 'b-run', color: '#22c55e', shape: 'sparkle', gi: 0 },
  { id: 'b-yoga', color: '#00bca6', shape: 'flower', gi: 0 },
  { id: 'b-cto', color: '#ef4444', shape: 'hex', gi: 1 },
  { id: 'b-spec', color: '#1084fe', shape: 'tablet', gi: 1 },
  { id: 'b-en', color: '#9159fe', shape: 'cloud', gi: 2 },
  { id: 'b-garden', color: '#84cc16', shape: 'clover', gi: 3 },
];
const HISTORY_IDS = ["c-rust", "c-ramen", "c-semi", "c-gpu", "c-bzh", "c-transfo", "c-budget", "c-py", "c-tva", "c-balcon", "c-pm"];
const makeGroups = (): BotGroup[] => copyOf(COPY_DATA).groups.map((name) => ({ name, open: true }));
const makeBots = (): Bot[] => {
  const d = copyOf(COPY_DATA);
  return BOT_DEFS.map(({ gi, ...b }, i) => ({ ...b, name: d.bots[i].name, group: gi < 0 ? '' : d.groups[gi], title: d.bots[i].title || undefined, desc: d.bots[i].desc || undefined }));
};
const makeHistory = (): ChatRec[] => copyOf(COPY_DATA).history.map((h, i) => ({ id: HISTORY_IDS[i], ...h }));

/* ---------- Sidebar ---------- */

const ROW_HOVER = 'transition-colors hover:bg-[rgba(252,252,252,0.06)]';
const GHOST_20 = 'grid size-5 shrink-0 place-items-center rounded-md transition-colors hover:bg-[rgba(252,252,252,0.08)] hover:text-[#fcfcfc] data-[state=open]:text-[#fcfcfc]';
const SIDE_ROW = 'grok-row relative flex h-9 items-center gap-2 rounded-xl px-2 text-[14px] leading-5 transition-colors hover:bg-[rgba(252,252,252,0.08)] has-[[data-state=open]]:bg-[rgba(252,252,252,0.08)]';

function NavItem({ icon, label, active, dot, kbd, onClick }: { icon: ReactNode; label: string; active?: boolean; dot?: boolean; kbd?: string; onClick?: () => void }) {
  return (
    <li className="group relative">
      <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined} className={cn('flex h-9 w-full items-center gap-1 rounded-xl px-1.5 text-[14px] leading-[21px]', ROW_HOVER, active && 'bg-[rgba(252,252,252,0.08)] hover:bg-[rgba(252,252,252,0.08)]')} style={{ color: C.fg }}>
        <span className="grid size-6 place-items-center">{icon}</span>
        {label}
      </button>
      {kbd && (
        <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-[13px] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: C.fg2 }}>
          {kbd}
        </span>
      )}
      {dot && <span className="absolute end-[11px] top-1/2 size-1.5 -translate-y-1/2 rounded-full group-hover:opacity-0" style={{ background: C.blue }} />}
    </li>
  );
}

/** A section header (Bots, Discussions, Projets): the label toggles the section; its chevron fades in (150ms) only while
 *  the section is hovered and turns −90° (200ms) when folded. */
function SectionHeader({ label, open, onToggle, action, small }: { label: string; open: boolean; onToggle: () => void; action?: ReactNode; small?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-1', small ? 'h-[34px] items-end ps-[9px] pe-2 pb-1' : 'pt-4 pe-2 pb-1 ps-[9px]')}>
      <button type="button" aria-expanded={open} onClick={onToggle} className="group/sh flex items-center gap-1 rounded-md outline-none select-none focus-visible:ring-1 focus-visible:ring-[#299fff]" style={{ color: C.fg3, fontSize: small ? 13 : 14, lineHeight: small ? '19.5px' : '21px', fontWeight: small ? 400 : 500 }}>
        {label}
        <span className="grid opacity-0 transition-opacity duration-150 group-hover/section:opacity-100 group-focus-visible/sh:opacity-100" style={{ color: C.fg2 }}>
          <G d={P.chevron} className={cn('grok-anim size-3.5 transition-transform duration-200', !open && '-rotate-90')} />
        </span>
      </button>
      {action}
    </div>
  );
}

/** The main bot's 12px orange star badge, cut out of the avatar by a ring of the sidebar's colour. */
function MainBadge({ ring = C.side }: { ring?: string }) {
  const t = useCopy(COPY_SIDE);
  return (
    <span role="img" aria-label={t.mainBot} className="absolute -end-0.5 -bottom-0.5 grid size-3 place-items-center rounded-full" style={{ background: '#e76113', boxShadow: `0 0 0 2px ${ring}` }}>
      <Star className="size-[7px] fill-white text-white" strokeWidth={0} />
    </span>
  );
}

function BotAvatar({ bot, size = 24, badge, live, ring }: { bot: Pick<Bot, 'color' | 'shape' | 'main'>; size?: number; badge?: boolean; live?: boolean; ring?: string }) {
  return (
    <span className="relative block shrink-0" style={{ width: size, height: size }}>
      <BotMark color={bot.color} shape={bot.shape} live={live} className="block size-full" />
      {badge && bot.main && <MainBadge ring={ring} />}
    </span>
  );
}

/** Bot rows: name, unread dot, and the "Options pour …" menu in its two variants (the pinned main bot vs the others). */
function BotRow({ bot, active }: { bot: Bot; active: boolean }) {
  const s = useStore();
  const t = useCopy(COPY_SIDE);

  const ic = 'size-4';
  const read = (
    <MenuItem tall icon={<Bell className={ic} strokeWidth={2} />} onSelect={() => s.patchBot(bot.id, { unread: !bot.unread })}>
      {bot.unread ? t.markRead : t.markUnread}
    </MenuItem>
  );
  const del = () =>
    s.ui.confirm({
      title: t.deleteBotTitle,
      body: t.deleteBotBody(bot.name),
      action: t.delete,
      danger: true,
      onConfirm: () => s.patchBot(bot.id, null),
    });
  return (
    <div className={cn(SIDE_ROW, 'group/bot mt-px', active && 'bg-[rgba(252,252,252,0.08)]')} style={{ color: C.fg }}>
      <BotAvatar bot={bot} badge />
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          s.openBot(bot.id);
        }}
        className={cn('grok-row-text min-w-0 flex-1 truncate outline-none after:absolute after:inset-0', bot.unread && 'font-[550]')}
      >
        {bot.name}
      </a>
      {bot.unread && <span aria-label={t.unread} className="size-1.5 shrink-0 rounded-full md:group-hover/bot:hidden md:group-focus-within/bot:hidden md:group-has-[[data-state=open]]/bot:hidden" style={{ background: C.blue }} />}
      <span className="relative z-10 flex h-5 min-w-5 shrink-0 items-center justify-center md:hidden md:group-hover/bot:flex md:group-focus-within/bot:flex md:group-has-[[data-state=open]]/bot:flex">
        <Menu
          align="start"
          className="w-[262px]"
          trigger={
            <button type="button" aria-label={t.optionsFor(bot.name)} className={GHOST_20} style={{ color: C.fg2 }}>
              <Ellipsis className="size-3.5" strokeWidth={2} />
            </button>
          }
        >
          {bot.pinned ? (
            <>
              <MenuItem tall icon={<PinOff className={ic} strokeWidth={2} />} onSelect={() => s.patchBot(bot.id, { pinned: false, main: false })}>
                {t.unpin}
              </MenuItem>
              {read}
            </>
          ) : (
            <>
              <MenuItem tall icon={<Pin className={ic} strokeWidth={2} />} onSelect={() => s.patchBot(bot.id, { pinned: true })}>
                {t.pin}
              </MenuItem>
              <SubMenu icon={<G d={P.folder} className={ic} />} label={t.moveTo} width={208}>
                {s.groups.map((g) => (
                  <DM.Item key={g.name} onSelect={() => s.patchBot(bot.id, { group: g.name })} className={cn(ROW, 'h-8')}>
                    <MenuIcon>
                      <G d={P.folder} className={ic} />
                    </MenuIcon>
                    <span className="min-w-0 flex-1 truncate">{g.name}</span>
                    {bot.group === g.name && <G d={P.check} className="size-4" />}
                  </DM.Item>
                ))}
              </SubMenu>
              <MenuItem tall icon={<FolderPlus className={ic} strokeWidth={2} />} onSelect={() => s.ui.newSection(bot.id)}>
                {t.moveNewSection}
              </MenuItem>
              {read}
            </>
          )}
          <MenuSep />
          <MenuItem tall icon={<G d={P.edit} className={ic} />} onSelect={() => s.ui.botSettings(bot.id)}>
            {t.editProfile}
          </MenuItem>
          <MenuSep />
          <MenuItem tall icon={<EyeOff className={ic} strokeWidth={2} />} onSelect={() => s.patchBot(bot.id, { hidden: true })}>
            {t.hideSidebar}
          </MenuItem>
          {bot.main ? (
            <MenuItem tall icon={<ArrowLeftRight className={ic} strokeWidth={2} />} onSelect={s.ui.chooseMain}>
              {t.replaceBot}
            </MenuItem>
          ) : (
            <MenuItem tall danger icon={<Trash2 className={ic} strokeWidth={2} />} onSelect={del}>
              {t.delete}
            </MenuItem>
          )}
        </Menu>
      </span>
    </div>
  );
}

/** The row menu of a chat, shared by "Options" (dropdown) and the right-click context menu. */
function ChatMenuItems({ ctx, rec, onRename }: { ctx?: boolean; rec: ChatRec; onRename: () => void }) {
  const s = useStore();
  const t = useCopy(COPY_SIDE);

  const Item = (ctx ? CM.Item : DM.Item) as typeof DM.Item;
  const Sep = (ctx ? CM.Separator : DM.Separator) as typeof DM.Separator;
  const row = (icon: ReactNode, label: string, on: () => void, danger?: boolean) => (
    <Item onSelect={on} className={cn(ROW, 'h-8')} style={danger ? { color: C.danger } : undefined}>
      <MenuIcon danger={danger}>{icon}</MenuIcon>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Item>
  );
  return (
    <>
      {/* No tabs inside the preview: "Ouvrir un nouvel onglet" opens the chat in place. */}
      {row(<SquareArrowOutUpRight className="size-4" strokeWidth={2} />, t.openNewTab, () => s.openChat(rec.id))}
      {row(<G d={P.edit} className="size-4" />, t.rename, onRename)}
      {row(rec.pinned ? <PinOff className="size-4" strokeWidth={2} /> : <Pin className="size-4" strokeWidth={2} />, rec.pinned ? t.unpin : t.pin, () => s.patchChat(rec.id, { pinned: !rec.pinned }))}
      <Sep className="-mx-1.5 my-1 h-px" style={{ background: C.line }} />
      {row(
        <Trash2 className="size-4" strokeWidth={2} />,
        t.delete,
        () =>
          s.ui.confirm({
            title: t.deleteChatTitle,
            body: t.deleteChatBody(rec.title),
            action: t.delete,
            danger: true,
            onConfirm: () => s.patchChat(rec.id, null),
          }),
        true,
      )}
    </>
  );
}

/** A history row: tooltip with the full title to the right after ~0.7s, "Épingler le chat" + "Options" on hover,
 *  the same menu on right-click, and inline renaming (Enter keeps, Escape cancels). */
function ChatRow({ rec, active }: { rec: ChatRec; active: boolean }) {
  const s = useStore();
  const t = useCopy(COPY_SIDE);

  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(rec.title);
  // The menu hands focus back to its trigger as it closes: the field mounts just after, so that does not blur it.
  const rename = () => setTimeout(() => (setVal(rec.title), setEditing(true)), 40);
  const commit = () => {
    const t = val.trim();
    if (t && t !== rec.title) s.patchChat(rec.id, { title: t });
    setEditing(false);
  };
  if (editing)
    return (
      <li>
        <input
          autoFocus
          value={val}
          aria-label={t.renameChat}
          onChange={(e) => setVal(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
            keepEscape(e, () => setEditing(false));
          }}
          className="h-9 w-full rounded-xl border px-2 text-[14px] outline-none"
          style={{ background: C.raised, borderColor: C.blue, color: C.fg }}
        />
      </li>
    );
  return (
    <CM.Root modal={false}>
      <CM.Trigger asChild>
        <li className={cn(SIDE_ROW, 'group/chat px-0', active && 'bg-[rgba(252,252,252,0.08)]')}>
          <Tip label={rec.title} side="right">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                s.openChat(rec.id);
              }}
              className="grok-row-text block h-9 min-w-0 flex-1 truncate px-2 leading-9 outline-none"
              style={{ color: C.fg }}
            >
              {rec.title}
            </a>
          </Tip>
          <span className="absolute end-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 md:hidden md:group-hover/chat:flex md:group-focus-within/chat:flex md:group-has-[[data-state=open]]/chat:flex">
            <button type="button" aria-label={rec.pinned ? t.unpinChat : t.pinChat} onClick={() => s.patchChat(rec.id, { pinned: !rec.pinned })} className={GHOST_20} style={{ color: C.fg2 }}>
              {rec.pinned ? <PinOff className="size-3.5" strokeWidth={2} /> : <Pin className="size-3.5" strokeWidth={2} />}
            </button>
            <Menu
              side="right"
              align="start"
              sideOffset={8}
              className="w-[256px]"
              trigger={
                <button type="button" aria-label={t.options} className={GHOST_20} style={{ color: C.fg2 }}>
                  <Ellipsis className="size-3.5" strokeWidth={2} />
                </button>
              }
            >
              <ChatMenuItems rec={rec} onRename={rename} />
            </Menu>
          </span>
        </li>
      </CM.Trigger>
      <CM.Portal>
        <CM.Content collisionPadding={8} className={cn(MENU, 'grok-ctx w-[256px]')} style={SURFACE}>
          <ChatMenuItems ctx rec={rec} onRename={rename} />
        </CM.Content>
      </CM.Portal>
    </CM.Root>
  );
}

function AccountMenu({ trigger }: { trigger: ReactNode }) {
  const s = useStore();
  const t = useCopy(COPY_SIDE);

  return (
    <Menu side="top" align="start" className="w-[208px]" trigger={trigger}>
      <div className="px-2 pt-1 pb-1.5 text-[12px] leading-[15.6px]" style={{ color: C.fg2 }}>
        alex@example.com
      </div>
      <MenuItem icon={<G d={P.settings} className="size-4" />} onSelect={() => s.ui.settings('home')}>
        {t.settings}
      </MenuItem>
      <SubMenu icon={<HelpIcon className="size-4" />} label={t.help} width={198}>
        <MenuItem icon={<Flag className="size-4" strokeWidth={2} />}>{t.feedback}</MenuItem>
        <MenuItem icon={<CircleHelp className="size-4" strokeWidth={2} />}>{t.faq}</MenuItem>
        <MenuItem icon={<History className="size-4" strokeWidth={2} />}>{t.releaseNotes}</MenuItem>
        <MenuItem icon={<Users className="size-4" strokeWidth={2} />}>{t.community}</MenuItem>
        <MenuItem icon={<Share2 className="size-4" strokeWidth={2} />}>{t.sharedLinks}</MenuItem>
      </SubMenu>
      <MenuItem icon={<G d={P.signout} className="size-4" />} onSelect={() => toast(t.signOutToast)}>
        {t.signOut}
      </MenuItem>
    </Menu>
  );
}

function Avatar({ size = 28 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#57534e] to-[#292524] text-[12px] font-[550]" style={{ color: C.fg, width: size, height: size }}>
      A
    </span>
  );
}

/** Bots in display order: Épinglés, then the ungrouped ones, then each custom section. */
function botSections(bots: Bot[], groups: BotGroup[]) {
  const vis = bots.filter((b) => !b.hidden);
  return [{ group: '', bots: vis.filter((b) => !b.pinned && !b.group) }, ...groups.map((g) => ({ group: g.name, bots: vis.filter((b) => !b.pinned && b.group === g.name) }))].filter((x) => x.bots.length > 0);
}

function Sidebar({ onNew, onClose, onSearch }: { onNew: () => void; onClose: () => void; onSearch: () => void }) {
  const s = useStore();
  const t = useCopy(COPY_SIDE);

  const v = s.view;
  const [open, setOpen] = useState({ bots: true, chats: true, projects: true });
  const [more, setMore] = useState(false);
  const flip = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const pinnedBots = s.bots.filter((b) => b.pinned && !b.hidden).sort((a, b) => Number(!!b.main) - Number(!!a.main));
  const sections = botSections(s.bots, s.groups);
  const total = pinnedBots.length + sections.reduce((n, x) => n + x.bots.length, 0);
  // Folded: the pinned bots plus the first bot of the next sections, three rows in all (as grok shows it).
  let budget = Math.max(0, 3 - pinnedBots.length);
  const shown = more
    ? sections
    : sections.flatMap((x) => {
        if (budget <= 0) return [];
        budget--;
        return [{ ...x, bots: x.bots.slice(0, 1) }];
      });
  const shownCount = pinnedBots.length + shown.reduce((n, x) => n + x.bots.length, 0);
  const activeBot = v.kind === 'bot' ? v.id : undefined;

  const chatPinned = s.chats.filter((c) => c.pinned);
  const chatRest = s.chats.filter((c) => !c.pinned).slice(0, 10);
  const activeChat = v.kind === 'history' ? v.id : v.kind === 'chat' ? 'live' : undefined;

  const label = (text: string) => (
    <div className="flex h-[34px] items-end ps-[9px] pe-3 pb-1 text-[13px] leading-[19.5px] select-none" style={{ color: C.fg3 }}>
      {text}
    </div>
  );

  return (
    <div className="flex h-full w-64 shrink-0 flex-col" style={{ background: C.side }}>
      <div className="flex h-14 shrink-0 items-center justify-between px-2">
        <button type="button" onClick={onNew} aria-label={t.home} className="ms-1 grid size-8 place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg }}>
          <G d={P.logo} viewBox="0 0 35 33" className="size-[18px]" />
        </button>
        <div className="flex">
          <Tip label={t.searchTip} side="bottom">
            <button type="button" onClick={onSearch} aria-label={t.search} className="grid size-8 place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
              <G d={P.search} className="size-[18px]" />
            </button>
          </Tip>
          <Tip label={t.hideTip} side="bottom">
            <button type="button" onClick={onClose} aria-label={t.toggleSidebar} className="grid size-8 place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
              <G d={P.sidebar} className="size-[18px]" />
            </button>
          </Tip>
        </div>
      </div>
      <ul className="flex flex-col gap-1 px-2.5 py-0.5">
        <NavItem icon={<G d={P.chat} className="size-[18px]" />} label={t.navChat} kbd="Ctrl+J" active={v.kind === 'chat' && !s.chats.some((c) => c.id === 'live')} onClick={onNew} />
        <NavItem icon={<Image className="size-[18px]" strokeWidth={2} />} label="Imagine" dot={v.kind !== 'imagine' && v.kind !== 'template'} active={v.kind === 'imagine' || v.kind === 'template'} onClick={() => s.go({ kind: 'imagine' })} />
        <NavItem icon={<Archive className="size-[18px]" strokeWidth={2} />} label={t.navLibrary} active={v.kind === 'library'} onClick={() => s.go({ kind: 'library', tab: 'all' })} />
        <NavItem icon={<TimerReset className="size-[18px]" strokeWidth={2} />} label={t.navAutomations} active={v.kind === 'automations'} onClick={() => s.go({ kind: 'automations' })} />
      </ul>
      <div className="grok-scroll mt-0.5 min-h-0 flex-1 overflow-y-auto ps-1.5 pe-2.5 pb-2">
        {/* Bots */}
        <section className="group/section">
          <SectionHeader
            label={t.bots}
            open={open.bots}
            onToggle={() => flip('bots')}
            action={
              <Tip label={t.newBot}>
                <button type="button" aria-label={t.newBot} onClick={() => s.ui.createBot()} className="grid size-5 place-items-center rounded-md transition-colors hover:bg-[rgba(252,252,252,0.08)] hover:text-[#fcfcfc]" style={{ color: C.fg3 }}>
                  <G d={P.plus} className="size-3.5" />
                </button>
              </Tip>
            }
          />
          <Collapse open={open.bots}>
            <ul className="flex flex-col gap-px px-1">
              {pinnedBots.length > 0 && (
                <li>
                  {label(t.pinned)}
                  {pinnedBots.map((b) => (
                    <BotRow key={b.id} bot={b} active={activeBot === b.id} />
                  ))}
                </li>
              )}
              {shown.map((x) => {
                const g = s.groups.find((gg) => gg.name === x.group);
                const isOpen = !g || g.open;
                return (
                  <li key={x.group || '-'} className="group/section">
                    {!x.group && pinnedBots.length > 0 && label(t.bots)}
                    {x.group && <SectionHeader small label={x.group}open={isOpen} onToggle={() => s.setGroups((gs) => gs.map((gg) => (gg.name === x.group ? { ...gg, open: !gg.open } : gg)))} />}
                    <Collapse open={isOpen}>
                      {x.bots.map((b) => (
                        <BotRow key={b.id} bot={b} active={activeBot === b.id} />
                      ))}
                    </Collapse>
                  </li>
                );
              })}
              {(more || shownCount < total) && (
                <li className="pt-px">
                  <button type="button" onClick={() => setMore((m) => !m)} className="flex h-9 w-full items-center gap-2 rounded-xl px-2 text-[14px] font-[550] transition-colors hover:bg-[rgba(252,252,252,0.08)]" style={{ color: C.fg2 }}>
                    <span className="size-6" />
                    {more ? t.showLess : t.showMore}
                  </button>
                </li>
              )}
            </ul>
          </Collapse>
        </section>
        {/* Discussions */}
        <section className="group/section">
          <SectionHeader label={t.chats} open={open.chats} onToggle={() => flip('chats')} />
          <Collapse open={open.chats}>
            <ul className="flex flex-col gap-px px-1">
              {chatPinned.length > 0 && label(t.pinned)}
              {chatPinned.map((c) => (
                <ChatRow key={c.id} rec={c} active={activeChat === c.id} />
              ))}
              {chatPinned.length > 0 && chatRest.length > 0 && label(t.recent)}
              {chatRest.map((c) => (
                <ChatRow key={c.id} rec={c} active={activeChat === c.id} />
              ))}
              <li>
                <button type="button" onClick={onSearch} className="flex h-9 w-full items-center gap-2 rounded-xl px-2 text-[14px] font-[550] transition-colors hover:bg-[rgba(252,252,252,0.08)]" style={{ color: C.fg2 }}>
                  {t.seeAll}
                </button>
              </li>
            </ul>
          </Collapse>
        </section>
        {/* Projets */}
        <section className="group/section">
          <SectionHeader
            label={t.projects}
            open={open.projects}
            onToggle={() => flip('projects')}
            action={
              <Tip label={t.allProjects}>
                <button type="button" aria-label={t.allProjects} onClick={() => s.go({ kind: 'library', tab: 'projects' })} className="grid size-5 place-items-center rounded-md transition-colors hover:bg-[rgba(252,252,252,0.08)] hover:text-[#fcfcfc]" style={{ color: C.fg3 }}>
                  <G d={P.folder} className="size-3.5" />
                </button>
              </Tip>
            }
          />
          <Collapse open={open.projects}>
            <ul className="flex flex-col gap-px px-1">
              {s.projects.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => s.go({ kind: 'project', id: p.id })} className={cn(SIDE_ROW, 'w-full ps-1.5 text-start', v.kind === 'project' && v.id === p.id && 'bg-[rgba(252,252,252,0.08)]')} style={{ color: C.fg }}>
                    <span className="grid size-6 place-items-center" style={{ color: C.fg2 }}>
                      <G d={P.folder} className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  </button>
                </li>
              ))}
              <li>
                <div
                  role="button"
                  tabIndex={0}
                  data-sidebar="menu-button"
                  onClick={() => s.ui.createProject()}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), s.ui.createProject())}
                  className={cn(SIDE_ROW, 'cursor-pointer ps-1.5')}
                  style={{ color: C.fg2 }}
                >
                  <span className="grid size-6 place-items-center">
                    <G d={P.plus} className="size-[18px]" />
                  </span>
                  {t.addProject}
                </div>
              </li>
            </ul>
          </Collapse>
        </section>
      </div>
      <ul className="px-2.5 pt-0.5">
        <NavItem icon={<Blocks className="size-[18px]" strokeWidth={2} />} label="Plugins" onClick={() => s.ui.plugins('connectors')} />
      </ul>
      <div className="px-2 pt-0.5 pb-2">
        <AccountMenu
          trigger={
            <button type="button" aria-label={t.accountMenu} className="flex h-10 w-full items-center gap-1.5 rounded-xl px-1.5 transition-colors hover:bg-[rgba(252,252,252,0.06)] data-[state=open]:bg-[rgba(252,252,252,0.06)]">
              <Avatar />
              <span className="truncate text-[14px] leading-[17.5px] font-medium" style={{ color: C.fg }}>
                Alex
              </span>
            </button>
          }
        />
      </div>
    </div>
  );
}

/** The folded sidebar: a 56px rail of icons (grok keeps it rather than hiding the sidebar); each routes like its row. */
function Rail({ onOpen, onNew, onSearch }: { onOpen: () => void; onNew: () => void; onSearch: () => void }) {
  const s = useStore();
  const t = useCopy(COPY_SIDE);

  const v = s.view;
  const btn = (label: string, icon: ReactNode, onClick?: () => void, active?: boolean) => (
    <Tip label={label} side="right">
      <button type="button" aria-label={label} onClick={onClick} className={cn('grid size-9 place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)]', active && 'bg-[rgba(252,252,252,0.08)]')} style={{ color: C.fg }}>
        {icon}
      </button>
    </Tip>
  );
  return (
    <div className="flex h-full w-14 shrink-0 flex-col items-center pb-2" style={{ background: C.side }}>
      <div className="flex h-14 w-full items-center px-3">
        <button type="button" onClick={onOpen} aria-label={t.toggleSidebar} className="grid size-8 place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
          <G d={P.sidebar} className="size-[18px]" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {btn(t.search, <G d={P.search} className="size-[18px]" />, onSearch)}
        {btn(t.navChat, <G d={P.chat} className="size-[18px]" />, onNew, v.kind === 'chat' || v.kind === 'history')}
        {btn('Imagine', <Image className="size-[18px]" strokeWidth={2} />, () => s.go({ kind: 'imagine' }), v.kind === 'imagine' || v.kind === 'template')}
        {btn(t.navLibrary, <Archive className="size-[18px]" strokeWidth={2} />, () => s.go({ kind: 'library', tab: 'all' }), v.kind === 'library' && v.tab !== 'projects')}
        {btn(t.navAutomations, <TimerReset className="size-[18px]" strokeWidth={2} />, () => s.go({ kind: 'automations' }), v.kind === 'automations')}
        {btn(t.chats, <History className="size-[18px]" strokeWidth={2} />, onSearch)}
        {btn(t.projects, <G d={P.folder} className="size-[18px]" />, () => s.go({ kind: 'library', tab: 'projects' }), (v.kind === 'library' && v.tab === 'projects') || v.kind === 'project')}
      </div>
      <div className="mt-auto flex flex-col items-center gap-1">
        {btn('Plugins', <Blocks className="size-[18px]" strokeWidth={2} />, () => s.ui.plugins('connectors'))}
        <AccountMenu
          trigger={
            <button type="button" aria-label={t.accountMenu} className="grid size-10 place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)] data-[state=open]:bg-[rgba(252,252,252,0.06)]">
              <Avatar />
            </button>
          }
        />
      </div>
    </div>
  );
}

/* ---------- Command menu (Rechercher / Ctrl+K): actions, the history by day and a preview pane ---------- */

/** `chats`: the sidebar's list (the live chat, id "live", first); picking one opens it (the live thread, or a past chat). */
function SearchDialog({ open, onOpenChange, chats, thread, onPick, onPrivate }: { open: boolean; onOpenChange: (o: boolean) => void; chats: ChatRec[]; thread: Message[]; onPick: (id: string) => void; onPrivate: () => void }) {
  const t = useCopy(COPY_SIDE);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'chats' | 'media'>('chats');
  const [sel, setSel] = useState<string | null>(null);
  const [big, setBig] = useState(false);
  useEffect(() => {
    if (open) {
      setQ('');
      setSel(null);
      setTab('chats');
    }
  }, [open]);

  const entries = chats;
  const shown = tab === 'chats' ? entries.filter((e) => e.title.toLowerCase().includes(q.trim().toLowerCase())) : [];
  const groups = shown.reduce<{ group: string; items: typeof shown }[]>((acc, e) => {
    const g = acc.find((x) => x.group === e.group);
    if (g) g.items.push(e);
    else acc.push({ group: e.group, items: [e] });
    return acc;
  }, []);
  const picked = shown.find((e) => e.id === sel);
  const answer = picked && picked.id === 'live' ? thread.map((m) => (m.role === 'assistant' ? textPart(m)?.text : undefined)).find(Boolean) : picked?.snippet;

  const go = (id: string) => {
    onOpenChange(false);
    onPick(id);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
    e.preventDefault();
    if (e.key === 'Enter') return sel && go(sel);
    const i = shown.findIndex((x) => x.id === sel);
    const next = e.key === 'ArrowDown' ? Math.min(shown.length - 1, i + 1) : Math.max(0, i - 1);
    if (shown[next]) setSel(shown[next].id);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="grok-fade fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn('grok-root grok-dialog fixed left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border p-[2px] outline-none', big ? 'h-[calc(100dvh-32px)] w-[calc(100vw-32px)]' : 'h-[min(670px,calc(100dvh-32px))] w-[min(1000px,calc(100vw-32px))]')}
          // grok sits the dialog a little above centre (its middle at ~44% of the viewport), never closer than 16px to the top.
          style={{ top: big ? '50%' : 'max(calc(16px + min(335px, 50dvh - 16px)), 44.5dvh)', background: C.base, borderColor: 'rgba(252,252,252,0.1)', color: C.fg }}
        >
          <Dialog.Title className="sr-only">{t.commandMenu}</Dialog.Title>
          <div className="flex h-14 shrink-0 items-center gap-3 border-b px-5" style={{ borderColor: C.line }}>
            <span style={{ color: C.fg2 }}>
              <G d={P.search} className="size-[18px]" />
            </span>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder={t.searchPlaceholder} aria-label={t.search} className="min-w-0 flex-1 bg-transparent text-[15px] leading-[22.5px] outline-none placeholder:text-[#9e9e9e]" />
            <div className="flex rounded-full" role="tablist">
              {(
                [
                  ['chats', t.tabChats],
                  ['media', t.tabMedia],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn('h-[33px] rounded-full px-2.5 text-[14px] leading-[21px] transition-colors hover:text-[#fcfcfc]', tab === id && 'bg-[rgba(252,252,252,0.08)]')} style={{ color: tab === id ? C.fg : C.fg2 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex min-h-0 flex-1">
            <div className="grok-scroll w-full shrink-0 overflow-y-auto px-3 py-3 md:w-[363px] md:border-e" style={{ borderColor: C.line }}>
              {tab === 'chats' && (
                <>
                  <div className="flex items-center justify-between gap-3 px-3 pb-2 text-[14px] leading-[21px]" style={{ color: C.fg2 }}>
                    {t.actions}
                    <span className="text-[13px] leading-[19.5px]">{t.showAll}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onPrivate();
                    }}
                    className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-[15px] leading-[22.5px] transition-colors hover:bg-[rgba(252,252,252,0.06)]"
                  >
                    <G d={P.privacy} className="size-4" />
                    {t.newPrivate}
                  </button>
                </>
              )}
              {groups.map((g) => (
                <div key={g.group}>
                  <div className="px-3 pt-2 pb-1.5 text-[14px] leading-[21px]" style={{ color: C.fg2 }}>
                    {g.group}
                  </div>
                  {g.items.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onMouseEnter={() => setSel(e.id)}
                      onFocus={() => setSel(e.id)}
                      onClick={() => go(e.id)}
                      className={cn('flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-[15px] leading-[22.5px] transition-colors', sel === e.id && 'bg-[rgba(252,252,252,0.06)]')}
                    >
                      <span className="min-w-0 flex-1 truncate">{e.title}</span>
                      <span className="shrink-0 text-[14px] leading-4" style={{ color: C.fg2 }}>
                        {e.when}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="hidden min-w-0 flex-1 md:flex">
              {picked ? (
                <div key={picked.id} className="grok-fade grok-scroll flex w-full flex-col gap-4 overflow-y-auto px-8 py-8">
                  <div className="self-end rounded-2xl px-4 py-2 text-[15px] leading-[22.5px]" style={{ background: C.raised }}>
                    {picked.title}
                  </div>
                  {answer && (
                    <p className="line-clamp-[12] text-[15px] leading-[22.5px] whitespace-pre-line" style={{ color: C.fg }}>
                      {answer.replace(/\*\*|\[\[[^\]]*\]\]|^#+ /gm, '')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="m-auto text-[15px] leading-[22.5px]" style={{ color: C.fg2 }}>
                  {t.selectPreview}
                </div>
              )}
            </div>
          </div>
          <div className="flex h-10 shrink-0 items-center border-t px-3" style={{ borderColor: C.line }}>
            <IconBtn label={big ? t.shrink : t.expand} onClick={() => setBig((b) => !b)} className="size-7">
              {big ? <Minimize2 className="size-3.5" strokeWidth={2} /> : <Maximize2 className="size-3.5" strokeWidth={2} />}
            </IconBtn>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ---------- Build: tool rows between prose, the live preview panel on the right ---------- */

/** `panel`: the 659px preview opens beside the thread; `preview`: the generated page replaces the loader. */
type BuildData = { started: number; live: boolean; done: boolean; seconds?: number; panel: boolean; preview: boolean };

/** Build's thread is one continuous interleave of streamed prose and grey tool rows (all in one `thinking-container`),
 *  with the live counter at the very bottom. Rows only join their rail with an adjacent row, never across prose. */
function BuildTurn({ m, build }: { m: Message; build: BuildData }) {
  type Group = { kind: 'rows'; rows: StepRow[] } | { kind: 'text'; id: string; text: string };
  const groups: Group[] = [];
  for (const p of m.parts) {
    if (p.kind === 'custom' && p.type === 'brow') {
      const last = groups[groups.length - 1];
      const row = p.data as unknown as StepRow;
      if (last?.kind === 'rows') last.rows.push(row);
      else groups.push({ kind: 'rows', rows: [row] });
    } else if (p.kind === 'text') groups.push({ kind: 'text', id: p.id, text: p.text });
  }
  const tail: StepsTail = build.done ? { kind: 'done', seconds: build.seconds ?? 1 } : build.live ? { kind: 'live', started: build.started } : null;
  if (tail && groups[groups.length - 1]?.kind !== 'rows') groups.push({ kind: 'rows', rows: [] });
  return (
    <div className="thinking-container mb-1 flex flex-col gap-3">
      {groups.map((g, i) =>
        g.kind === 'text' ? (
          <div key={g.id} className="grok-f180">
            <Answer text={g.text} />
          </div>
        ) : (
          <div key={`g${i}`} className="-ms-1.5">
            <StepsList rows={g.rows} tail={i === groups.length - 1 ? tail : null} />
          </div>
        ),
      )}
    </div>
  );
}

/** The synthwave floor behind the loader: lines converging on a vanishing point at 56% height, horizontals denser
 *  toward the horizon, faded by a mask; a few lines carry a streak (orange, yellow, indigo, purple) sliding along them. */
const VW = 641;
const VH = 1160;
const VPX = VW / 2;
const VPY = Math.round(VH * 0.56);
const RADIAL = Array.from({ length: 33 }, (_, i) => VPX + (i - 16) * 76);
const HORIZ = Array.from({ length: 24 }, (_, k) => VPY + (VH - VPY) * Math.pow((k + 1) / 24, 2.2));
const STREAK_RADIAL = [5, 10, 14, 19, 24, 28].map((i, n) => ({ x: RADIAL[i], dur: 3.4 + (n % 3) * 0.9, begin: -n * 1.1 }));
const STREAK_HORIZ = [11, 17, 21].map((k, n) => ({ y: HORIZ[k], dur: 4.6 + n * 0.8, begin: -n * 1.7 }));

function Streak({ id, x1, y1, x2, y2, dur, begin }: { id: string; x1: number; y1: number; x2: number; y2: number; dur: number; begin: number }) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x1 + vx * 0.45} y2={y1 + vy * 0.45}>
      <stop offset="0" stopColor="#f97316" stopOpacity="0" />
      <stop offset="0.4" stopColor="#eab308" stopOpacity="1" />
      <stop offset="0.6" stopColor="#6366f1" stopOpacity="1" />
      <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
      <animateTransform attributeName="gradientTransform" type="translate" from={`${-vx * 0.45} ${-vy * 0.45}`} to={`${vx} ${vy}`} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
    </linearGradient>
  );
}

function SynthGrid() {
  const mask = 'linear-gradient(transparent 52%, #000 59%, #000 94%, transparent 100%)';
  const base = 'rgba(252,252,252,0.1)';
  return (
    <div aria-hidden="true" className="absolute inset-0" style={{ background: '#0a0a0a' }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="size-full" style={{ maskImage: mask, WebkitMaskImage: mask }}>
        <defs>
          {STREAK_RADIAL.map((s, i) => (
            <Streak key={`r${i}`} id={`syn-r${i}`} x1={VPX} y1={VPY} x2={s.x} y2={VH} dur={s.dur} begin={s.begin} />
          ))}
          {STREAK_HORIZ.map((s, i) => (
            <Streak key={`h${i}`} id={`syn-h${i}`} x1={0} y1={s.y} x2={VW} y2={s.y} dur={s.dur} begin={s.begin} />
          ))}
        </defs>
        {RADIAL.map((x) => (
          <line key={x} x1={VPX} y1={VPY} x2={x} y2={VH} stroke={base} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {HORIZ.map((y) => (
          <line key={y} x1={0} y1={y} x2={VW} y2={y} stroke={base} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {STREAK_RADIAL.map((s, i) => (
          <line key={`sr${i}`} x1={VPX} y1={VPY} x2={s.x} y2={VH} stroke={`url(#syn-r${i})`} strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
        ))}
        {STREAK_HORIZ.map((s, i) => (
          <line key={`sh${i}`} x1={0} y1={s.y} x2={VW} y2={s.y} stroke={`url(#syn-h${i})`} strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  );
}

/** The loader's centred status: every ~4s each character blurs out (200ms, staggered), then the next phrase blurs in,
 *  while the box eases to the new phrase's width. */
function StatusLabel() {
  const PHRASES = useCopy(COPY_SIDE).phrases;
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [w, setW] = useState<number>();
  const sizer = useRef<HTMLSpanElement>(null);
  const phrase = PHRASES[i];
  useEffect(() => {
    const id = setInterval(() => setPhase('out'), 4000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (phase !== 'out') return;
    const id = setTimeout(() => {
      setI((n) => (n + 1) % PHRASES.length);
      setPhase('in');
    }, 200 + 14 * 30);
    return () => clearTimeout(id);
  }, [phase]);
  useLayoutEffect(() => setW(sizer.current?.offsetWidth), [i]);
  return (
    <div className="pointer-events-none relative z-10 flex flex-col items-center px-8 text-center" style={{ textShadow: 'rgba(0,0,0,0.6) 0 1px 16px' }}>
      <span role="status" aria-label={phrase} className="inline-flex overflow-hidden text-sm font-medium text-white" style={{ width: w, clipPath: 'inset(-6px 0)', transition: 'width 300ms cubic-bezier(0.16,1,0.3,1)' }}>
        <span ref={sizer} aria-hidden="true" className="invisible absolute whitespace-nowrap">
          {phrase}
        </span>
        <span aria-hidden="true" className="flex whitespace-nowrap">
          {[...phrase].map((ch, k) => (
            <span key={`${i}-${k}`} className={cn('inline-block', phase === 'out' ? 'grok-char-out' : 'grok-char-in')} style={{ animationDelay: `${k * (phase === 'out' ? 14 : 18)}ms` }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}

/** ASSUMPTION: the real generation never finished while it was observed (>105s), so no generated page was ever seen.
 *  This stand-in is what the prose in the thread describes: a big counter, a "+1" button, a reset button, in the UI language. */
const buildPage = () => {
  const t = copyOf(COPY_BOTS);
  return `<!doctype html><html lang="${t.buildLang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t.buildTitle}</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#f8fafc;font-family:system-ui,sans-serif}
main{text-align:center;padding:24px}h1{margin:0 0 8px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#94a3b8;font-weight:600}
#n{font-size:clamp(88px,24vw,192px);font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.row{display:flex;gap:12px;justify-content:center;margin-top:32px;flex-wrap:wrap}
button{font:inherit;border:0;border-radius:999px;padding:14px 28px;cursor:pointer;font-weight:600;transition:transform .12s}button:active{transform:scale(.96)}
#plus{background:#6366f1;color:#fff;font-size:20px}#reset{background:#1e293b;color:#cbd5e1}
</style></head><body><main><h1>${t.buildHeading}</h1><div id="n" aria-live="polite">0</div><div class="row"><button id="plus">+1</button><button id="reset">${t.buildReset}</button></div></main>
<script>var c=0,n=document.getElementById('n');try{c=+localStorage.getItem('${t.buildKey}')||0}catch(e){}
function show(){n.textContent=c;try{localStorage.setItem('${t.buildKey}',c)}catch(e){}}
document.getElementById('plus').onclick=function(){c++;show()};document.getElementById('reset').onclick=function(){c=0;show()};show();<\/script></body></html>`;
};

/** The right panel: 8px padding, a rounded card with a 44px header (Aperçu / Fichiers, expand, panel) and a 44px toolbar
 *  (all disabled while loading), then the body. `width` is fixed so the card never reflows while the wrapper opens. */
function BuildPanel({ width, preview }: { width: number; preview: boolean }) {
  const t = useCopy(COPY_BOTS);
  const [tab, setTab] = useState<'preview' | 'files'>('preview');
  const [turns, setTurns] = useState(0);
  const loading = !preview;
  const tool = (label: string, icon: ReactNode, onClick?: () => void) => (
    <button type="button" aria-label={label} title={label} disabled={loading} onClick={onClick} className="grid size-8 place-items-center rounded-lg transition-colors enabled:hover:bg-[rgba(252,252,252,0.06)] enabled:hover:text-[#fcfcfc] disabled:cursor-default disabled:opacity-40" style={{ color: C.fg2 }}>
      {icon}
    </button>
  );
  const toggle = (id: 'preview' | 'files', label: string, icon: ReactNode) => (
    <button type="button" aria-label={label} title={label} aria-pressed={tab === id} onClick={() => setTab(id)} className={cn('grid size-8 place-items-center rounded-lg transition-colors hover:text-[#fcfcfc]', tab === id && 'bg-[rgba(252,252,252,0.08)]')} style={{ color: tab === id ? C.fg : C.fg2 }}>
      {icon}
    </button>
  );
  return (
    <div className="h-full p-2" style={{ width }}>
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[14px] border" style={{ background: C.base, borderColor: C.line }}>
        <div className="flex h-11 shrink-0 items-center gap-1.5 border-b p-1.5" style={{ borderColor: C.line }}>
          <div className="grok-chrome flex flex-1 items-center gap-0.5">
            {toggle('preview', t.preview, <Eye className="size-[18px]" strokeWidth={2} />)}
            {toggle('files', t.files, <Files className="size-[18px]" strokeWidth={2} />)}
          </div>
          <div className="grok-chrome flex items-center">
            <IconBtn label={t.expand}>
              <Maximize2 className="size-4" strokeWidth={2} />
            </IconBtn>
            <IconBtn label={t.togglePanel} active>
              <G d={P.panel} className="size-[18px] -scale-x-100" />
            </IconBtn>
          </div>
        </div>
        <div className="grok-chrome relative z-20 flex h-11 shrink-0 items-center gap-1 border-b px-1.5" style={{ borderColor: C.line }}>
          {tool(t.back, <ArrowLeft className="size-4" strokeWidth={2} />)}
          {tool(t.forward, <ArrowRight className="size-4" strokeWidth={2} />)}
          {tool(t.refreshApp, <RotateCw className="size-4" strokeWidth={2} style={{ transform: `rotate(${turns * 360}deg)`, transition: 'transform 400ms cubic-bezier(0.23,1,0.32,1)' }} />, () => setTurns((t) => t + 1))}
          <span className="ms-2 min-w-0 flex-1 truncate text-[13px] leading-[18px]" style={{ color: C.fg2 }}>
            {preview ? t.buildUrl : ''}
          </span>
          {tool(t.openNewTab, <SquareArrowOutUpRight className="size-4" strokeWidth={2} />)}
          {tool(t.mobilePreview, <Smartphone className="size-4" strokeWidth={2} />)}
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-b-[13px]" style={{ background: '#0a0a0a' }}>
          {preview ? (
            <iframe title={t.appPreview} srcDoc={buildPage()} sandbox="allow-scripts" className="grok-f250 absolute inset-0 size-full border-0" />
          ) : (
            <>
              <SynthGrid />
              <StatusLabel />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Build, before sending: a ghost "Plus d'idées" and two filled suggestions above the composer. */
function BuildChips({ onPick }: { onPick: (t: string) => void }) {
  const tr = useCopy(COPY_BOTS);
  const chip = 'inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full text-sm transition-colors';
  return (
    <div className="grok-scroll mb-3 flex w-full items-center gap-2 overflow-x-auto">
      <button type="button" className={cn(chip, 'gap-2 px-3 hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]')} style={{ color: C.fg2 }}>
        <RefreshCw className="size-4" strokeWidth={2} />
        {tr.moreIdeas}
      </button>
      {(
        [
          [tr.chipViewer, <Box key="b" className="size-4" strokeWidth={2} />],
          [tr.chipRipples, <Droplets key="d" className="size-4" strokeWidth={2} />],
        ] as const
      ).map(([label, icon]) => (
        <button key={label} type="button" onClick={() => onPick(label)} className={cn(chip, 'gap-2 ps-2 pe-3 hover:bg-[#2a2926]')} style={{ background: C.raised, color: C.fg }}>
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Auto: the "Réfléchir plus" chip over the composer ---------- */

function SteerChip({ onClose }: { onClose: () => void }) {
  const t = useCopy(COPY_BOTS);
  const tc = useCopy(COPY_CORE);
  return (
    <div className="grok-f300 pointer-events-none absolute inset-x-0 bottom-full flex w-full justify-start gap-2 pb-3">
      <div className="group/steer relative ms-3 ps-3.5 pt-2">
        <span className="pointer-events-auto inline-flex rounded-full" style={{ background: C.base }}>
          <button type="button" data-slot="button" className="inline-flex h-8 items-center justify-center gap-1 rounded-full px-[10px] text-sm leading-[1.4] font-medium tracking-[-0.2px] whitespace-nowrap transition-colors hover:bg-[rgba(252,252,252,0.12)]" style={{ background: 'rgba(252,252,252,0.08)', color: C.fg }}>
            <span className="inline-flex" style={{ color: '#7970db' }}>
              <G d={P.bulb} className="size-4" />
            </span>
            <span>{t.thinkMore}</span>
            <span aria-hidden="true" className="w-0 transition-[width] duration-200 ease-out group-hover/steer:w-4" />
          </button>
        </span>
        <span className="pointer-events-auto absolute end-1 bottom-1 inline-flex opacity-0 transition-opacity duration-200 group-focus-within/steer:opacity-100 group-hover/steer:opacity-100">
          <button type="button" aria-label={tc.close} onClick={onClose} className="grid size-6 place-items-center rounded-full transition-colors hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
            <X className="size-3.5" strokeWidth={2} />
          </button>
        </span>
      </div>
    </div>
  );
}

/* ---------- Bot: a different thread component (accent bubbles, no thinking block) ---------- */

/** The bot's accent as the user bubble paints it (Chef cuisine's orange measured as #c24e00). */
const accentOf = (color: string) => (color === '#f97316' ? '#c24e00' : `color-mix(in srgb, ${color} 72%, black)`);

function SmileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8M9 9.5h.01M15 9.5h.01" />
    </svg>
  );
}

/** Hover-only actions beside a message (100ms fade; always visible on touch screens). */
function EntryActions() {
  const t = useCopy(COPY_BOTS);
  return (
    <div data-testid="bot-entry-actions-slot" className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-100 group-focus-within/bot-entry:opacity-100 group-hover/bot-entry:opacity-100 [@media(hover:none)]:opacity-100">
      <IconBtn label={t.reactMsg}>
        <SmileIcon className="size-4" />
      </IconBtn>
      <IconBtn label={t.replyMsg}>
        <Reply className="size-4" strokeWidth={2} />
      </IconBtn>
      <IconBtn label={t.moreMsgActions}>
        <Ellipsis className="size-4" strokeWidth={2} />
      </IconBtn>
    </div>
  );
}

/** Spinner (1s), shimmering "Réflexion" and a pulsing skeleton (opacity 1 → .5 → 1 over 2s); the block fades in over 250ms. */
function BotWorking() {
  const t = useCopy(COPY_CORE);
  return (
    <div className="grok-f250 flex w-full flex-col items-start gap-2">
      <div className="group/working flex w-fit items-center gap-2 text-sm" style={{ color: C.fg2 }}>
        <span aria-hidden="true" className="grok-spin size-4 shrink-0 rounded-full border-2" style={{ borderColor: 'rgba(252,252,252,0.18)', borderTopColor: C.fg }} />
        <span className="grok-shimmer overflow-hidden whitespace-nowrap">{t.thinking}</span>
      </div>
      {/* The skeleton's size is a guess: one line of reply, in the grey bubble's shape. */}
      <div className="relative h-[38px] w-full max-w-[60%] overflow-hidden rounded-3xl">
        <div className="grok-skel absolute inset-0" style={{ background: C.raised }} />
      </div>
    </div>
  );
}

function BotThread({ msgs, bot, busy }: { msgs: Message[]; bot: Bot; busy: boolean }) {
  const tr = useCopy(COPY_BOTS);
  const last = msgs[msgs.length - 1];
  const working = busy && (!last || last.role === 'user' || !textPart(last));
  const lastBot = [...msgs].reverse().find((m) => m.role === 'assistant' && textPart(m));
  const finished = !!lastBot?.done;
  const root = useRef<HTMLDivElement>(null);
  const was = useRef(finished);
  // Once the reply is complete the whole thread flashes from .35 to full opacity in 180ms.
  useEffect(() => {
    if (finished && !was.current) root.current?.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 180, easing: 'cubic-bezier(0.23,1,0.32,1)' });
    was.current = finished;
  }, [finished]);
  return (
    <div ref={root} className="flex flex-col gap-3">
      {msgs.map((m) => {
        const t = textPart(m);
        if (m.role === 'user')
          return (
            <div key={m.id} className="group/bot-entry flex w-full items-center justify-end gap-2">
              <EntryActions />
              <div className="grok-f250 max-w-[80%] min-w-0 overflow-x-auto rounded-3xl px-4 py-3 text-[15px] leading-[22.5px] break-words whitespace-pre-wrap" style={{ background: accentOf(bot.color), color: '#fff' }}>
                {t?.text}
              </div>
            </div>
          );
        if (!t) return null;
        return (
          <div key={m.id} className="group/bot-entry flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center gap-2">
              <div data-bot-message-text="true" className="max-w-[80%] min-w-0 overflow-x-auto rounded-3xl px-4 py-2" style={{ background: C.raised }}>
                <Answer text={t.text} />
              </div>
              <EntryActions />
            </div>
            {m === lastBot && m.done && <BotMark color={bot.color} shape={bot.shape} className="grok-f180 mt-1 size-6" />}
          </div>
        );
      })}
      {working && <BotWorking />}
      {finished && (
        <span role="status" className="sr-only">
          {tr.finished}
        </span>
      )}
    </div>
  );
}

/* ---------- Small dialogs: confirm, new section ---------- */

const BTN_DANGER = 'inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[#e5484d] px-2.5 text-[14px] leading-5 font-medium text-white transition-opacity hover:opacity-90';

function ConfirmDialog({ opts, onClose }: { opts: ConfirmOpts | null; onClose: () => void }) {
  const t = useCopy(COPY_BOTS);
  return (
    <GDialog open={!!opts} onOpenChange={(o) => !o && onClose()} title={opts?.title ?? t.confirm} width={400} z={70}>
      {opts && (
        <div className="flex flex-col gap-2 p-4">
          <p aria-hidden="true" className="pe-9 text-[15px] leading-[22.5px] font-[550]">
            {opts.title}
          </p>
          <p className="text-[14px] leading-5" style={{ color: C.fg2 }}>
            {opts.body}
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className={BTN_LINE} onClick={onClose}>
              {t.cancel}
            </button>
            <button
              type="button"
              autoFocus
              className={opts.danger ? BTN_DANGER : cn(BTN_WHITE, 'rounded-xl')}
              onClick={() => {
                opts.onConfirm();
                onClose();
              }}
            >
              {opts.action}
            </button>
          </div>
        </div>
      )}
    </GDialog>
  );
}

/** "Déplacer vers une nouvelle section": the section's name, then the bot moves into it. */
function NewSectionDialog({ botId, onClose }: { botId: string | null; onClose: () => void }) {
  const t = useCopy(COPY_BOTS);
  const s = useStore();
  const [name, setName] = useState('');
  useEffect(() => {
    if (botId) setName('');
  }, [botId]);
  const create = () => {
    const n = name.trim();
    if (!n || !botId) return;
    s.setGroups((gs) => (gs.some((g) => g.name === n) ? gs : [...gs, { name: n, open: true }]));
    s.patchBot(botId, { group: n, pinned: false, main: false });
    onClose();
  };
  return (
    <GDialog open={!!botId} onOpenChange={(o) => !o && onClose()} title={t.newSection} showTitle width={400}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
        className="flex flex-col gap-3 px-5 pt-2 pb-5"
      >
        <label className="flex flex-col gap-1.5 text-[14px]" style={{ color: C.fg2 }}>
          {t.sectionName}
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t.sectionPlaceholder} maxLength={40} className={cn(INPUT, 'h-9')} />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={BTN_LINE}>
            {t.cancel}
          </button>
          <button type="submit" disabled={!name.trim()} className={cn(BTN_WHITE, 'rounded-xl')}>
            {t.create}
          </button>
        </div>
      </form>
    </GDialog>
  );
}

/* ---------- Bots: create, profile ("Paramètres"), choose the main bot ---------- */

/** Colour radios (two rows of 40px, a 28px dot, a 1.5px ring in the colour when selected) and the 14 shape radios. */
function AvatarPicker({ color, shape, onColor, onShape, compact }: { color: string; shape: BotShape; onColor: (c: string) => void; onShape: (s: BotShape) => void; compact?: boolean }) {
  const t = useCopy(COPY_BOTS);
  const names = useCopy(COPY_DATA).colors;
  return (
    <div className={cn('flex w-full flex-col gap-3 rounded-xl', compact ? 'p-0' : 'px-5 py-4')} style={compact ? undefined : { background: C.side }}>
      <div role="radiogroup" aria-label={t.avatarColor} className="grid grid-cols-6 justify-items-center gap-y-1">
        {BOT_COLORS.map((c, ci) => (
          <button key={c.hex} type="button" role="radio" aria-checked={color === c.hex} aria-label={names[ci]} onClick={() => onColor(c.hex)} className={cn('relative grid place-items-center rounded-full', compact ? 'size-9' : 'size-10')}>
            <span className={cn('rounded-full transition-transform hover:scale-105', compact ? 'size-6' : 'size-7')} style={{ background: c.hex }} />
            {color === c.hex && <span data-testid="bot-avatar-color-selection-ring" className="absolute inset-[2px] rounded-full" style={{ boxShadow: `0 0 0 1.5px ${c.hex}` }} />}
          </button>
        ))}
      </div>
      <div className="h-px" style={{ background: C.line }} />
      <div role="radiogroup" aria-label={t.avatarShape} className="grid grid-cols-5 justify-items-center gap-2">
        {SHAPE_IDS.map((id) => (
          <button key={id} type="button" role="radio" aria-checked={shape === id} aria-label={id} onClick={() => onShape(id)} className={cn('grid place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)]', compact ? 'size-9' : 'size-10', shape === id && 'bg-[rgba(252,252,252,0.1)]')}>
            <BotMark color={color} shape={id} className={compact ? 'size-7' : 'size-8'} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** The round avatar (bot colour at 18% behind the living mark); an imported picture replaces the mark. */
function AvatarDisc({ color, shape, img, size, mark }: { color: string; shape: BotShape; img?: string; size: number; mark: number }) {
  return img ? (
    <img src={img} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="grid place-items-center rounded-full" style={{ width: size, height: size, background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
      <span className="block" style={{ width: mark, height: mark }}>
        <BotMark color={color} shape={shape} live className="block size-full" />
      </span>
    </span>
  );
}

function CreateBotDialog({ open, initialName, onClose, onCreate }: { open: boolean; initialName?: string; onClose: () => void; onCreate: (b: { name: string; color: string; shape: BotShape }) => void }) {
  const t = useCopy(COPY_BOTS);
  const [name, setName] = useState(t.newBotName);
  const [color, setColor] = useState('#777777');
  const [shape, setShape] = useState<BotShape>('sparkle');
  useEffect(() => {
    if (!open) return;
    setName(initialName || t.newBotName);
    setColor('#777777');
    setShape('sparkle');
  }, [open, initialName]);
  const shuffle = () => {
    setColor(BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)].hex);
    setShape(SHAPE_IDS[Math.floor(Math.random() * SHAPE_IDS.length)]);
  };
  return (
    <GDialog open={open} onOpenChange={(o) => !o && onClose()} title={t.createBot} width={520} height={600} radius={24}>
      <div className="grok-scroll flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-6 pt-6 pb-3">
        <button type="button" aria-label={t.editAvatar} onClick={shuffle} className="grid size-[100px] shrink-0 place-items-center rounded-full transition-transform hover:scale-[1.03]" style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
          <BotMark color={color} shape={shape} live className="size-[76px]" />
        </button>
        <input aria-label={t.botName} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && name.trim() && onCreate({ name: name.trim(), color, shape })} className={cn(INPUT, 'h-11 shrink-0 text-center text-[15px]')} />
        <AvatarPicker color={color} shape={shape} onColor={setColor} onShape={setShape} />
        <p className="text-center text-[14px] leading-5" style={{ color: C.fg2 }}>
          {t.termsPre}{' '}
          <a href="#" onClick={(e) => e.preventDefault()} className="underline underline-offset-2 hover:text-[#fcfcfc]">
            {t.termsLink}
          </a>
          .
        </p>
      </div>
      <div className="shrink-0 px-6 pt-2 pb-4">
        <button type="button" disabled={!name.trim()} onClick={() => onCreate({ name: name.trim(), color, shape })} className={cn(BTN_WHITE, 'h-10 w-full')}>
          {t.createBot}
        </button>
      </div>
    </GDialog>
  );
}

/** "Paramètres" of a bot (title button on its page, or "Modifier le profil"): avatar popover (Bot / Générer / Importer), Nom,
 *  Titre (facultatif), Description; Enregistrer stays disabled until something changes. */
function BotSettingsDialog({ bot, onClose }: { bot: Bot | null; onClose: () => void }) {
  const s = useStore();
  const t = useCopy(COPY_BOTS);

  const blank = { name: '', title: '', desc: '', color: '#777777', shape: 'sparkle' as BotShape, img: undefined as string | undefined };
  const [d, setD] = useState(blank);
  const [tab, setTab] = useState<'bot' | 'gen' | 'import'>('bot');
  const [prompt, setPrompt] = useState('');
  const [gen, setGen] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (bot) setD({ name: bot.name, title: bot.title ?? '', desc: bot.desc ?? '', color: bot.color, shape: bot.shape, img: bot.img });
    setTab('bot');
    setPrompt('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot?.id]);
  const dirty = !!bot && (d.name !== bot.name || d.title !== (bot.title ?? '') || d.desc !== (bot.desc ?? '') || d.color !== bot.color || d.shape !== bot.shape || d.img !== bot.img);
  const set = (p: Partial<typeof d>) => setD((x) => ({ ...x, ...p }));
  const generate = () => {
    setGen(true);
    setTimeout(() => {
      set({ color: BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)].hex, shape: SHAPE_IDS[Math.floor(Math.random() * SHAPE_IDS.length)], img: undefined });
      setGen(false);
    }, 1200);
  };
  const field = 'h-8 rounded-lg';
  return (
    <GDialog open={!!bot} onOpenChange={(o) => !o && onClose()} title={t.settings} width={520} radius={24}>
      <div className="flex flex-col gap-4 px-6 pt-6 pb-2">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" aria-label={t.editAvatar} aria-haspopup="dialog" className="mx-auto grid size-[84px] place-items-center rounded-full transition-transform hover:scale-[1.03]">
              <AvatarDisc color={d.color} shape={d.shape} img={d.img} size={84} mark={64} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="bottom" sideOffset={8} collisionPadding={8} className="grok-root grok-pop-in z-[60] flex w-[280px] flex-col gap-3 rounded-2xl border p-3 outline-none" style={SURFACE}>
              <PillTabs
                label={t.avatar}
                size={28}
                value={tab}
                onChange={setTab}
                tabs={[
                  ['bot', t.tabBot],
                  ['gen', t.tabGenerate],
                  ['import', t.tabImport],
                ]}
              />
              {tab === 'bot' && <AvatarPicker compact color={d.color} shape={d.shape} onColor={(c) => set({ color: c, img: undefined })} onShape={(x) => set({ shape: x, img: undefined })} />}
              {tab === 'gen' && (
                <div className="flex flex-col gap-2">
                  <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.describeAvatar} className={cn(INPUT, 'h-8 rounded-lg')} />
                  <button type="button" disabled={!prompt.trim() || gen} onClick={generate} className={cn(BTN_WHITE, 'rounded-xl')}>
                    {gen ? <span aria-hidden="true" className="grok-spin size-3.5 rounded-full border-2 border-black/20 border-t-black" /> : null}
                    {t.tabGenerate}
                  </button>
                </div>
              )}
              {tab === 'import' && (
                <>
                  <input
                    ref={file}
                    type="file"
                    hidden
                    aria-label={t.importAvatarImage}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) set({ img: URL.createObjectURL(f) });
                      e.target.value = '';
                    }}
                  />
                  <button type="button" onClick={() => file.current?.click()} className={cn(BTN_SOFT, 'w-full rounded-xl')}>
                    {t.importImage}
                  </button>
                </>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <label className="flex flex-col gap-1.5 text-[13px]" style={{ color: C.fg2 }}>
          {t.name}
          <input value={d.name} maxLength={80} onChange={(e) => set({ name: e.target.value })} className={cn(INPUT, field)} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px]" style={{ color: C.fg2 }}>
          {t.titleOptional}
          <input value={d.title} maxLength={80} onChange={(e) => set({ title: e.target.value })} placeholder={t.titlePlaceholder} className={cn(INPUT, field)} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px]" style={{ color: C.fg2 }}>
          {t.description}
          <textarea value={d.desc} onChange={(e) => set({ desc: e.target.value })} placeholder={t.descPlaceholder} className={cn(INPUT, 'h-[102px] resize-none rounded-lg py-2')} />
        </label>
      </div>
      <div className="flex justify-end px-6 pt-2 pb-5">
        <button
          type="button"
          disabled={!dirty || !d.name.trim()}
          onClick={() => {
            if (!bot) return;
            s.patchBot(bot.id, { name: d.name.trim(), title: d.title.trim() || undefined, desc: d.desc.trim() || undefined, color: d.color, shape: d.shape, img: d.img });
            onClose();
          }}
          className={BTN_WHITE}
        >
          {t.save}
        </button>
      </div>
    </GDialog>
  );
}

/** "Remplacer par un bot différent": every bot, searchable; picking one makes it the pinned main bot. */
function ChooseMainDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const t = useCopy(COPY_BOTS);

  const [q, setQ] = useState('');
  useEffect(() => {
    if (open) setQ('');
  }, [open]);
  const list = s.bots.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase()));
  const pick = (id: string) => {
    s.setBots((bs) => bs.map((b) => (b.id === id ? { ...b, main: true, pinned: true, hidden: false } : b.main ? { ...b, main: false, pinned: false } : b)));
    onClose();
  };
  return (
    <GDialog open={open} onOpenChange={(o) => !o && onClose()} title={t.chooseMain} showTitle width={520} height={478}>
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-5 pt-2 pb-4">
        <div className="flex h-[34px] shrink-0 items-center gap-2 rounded-xl border px-3" style={{ borderColor: C.line }}>
          <Search className="size-4 shrink-0" strokeWidth={2} style={{ color: C.fg2 }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9e9e9e]" />
        </div>
        <div role="listbox" aria-label={t.bots} className="grok-scroll -mx-1 flex min-h-0 flex-1 flex-col gap-px overflow-y-auto px-1">
          {list.map((b) => (
            <button key={b.id} type="button" role="option" aria-selected={!!b.main} onClick={() => pick(b.id)} className={cn('flex h-9 shrink-0 items-center gap-2 rounded-[10px] px-2 text-start text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.06)]', b.main && 'bg-[rgba(252,252,252,0.08)]')}>
              <BotAvatar bot={b} badge ring={C.base} />
              <span className="min-w-0 flex-1 truncate">{b.name}</span>
              {b.main && <G d={P.check} className="size-4" />}
            </button>
          ))}
          {!list.length && (
            <p className="px-2 py-6 text-center text-[14px]" style={{ color: C.fg3 }}>
              {t.noBots}
            </p>
          )}
        </div>
      </div>
    </GDialog>
  );
}

/* ---------- Bot page: a DM-like thread with the bot ---------- */

/** "Afficher l'ordinateur": the bot's remote desktop, mocked as a wallpaper, a browser window and a wandering cursor. */
function ComputerDialog({ bot, onClose }: { bot: Bot | null; onClose: () => void }) {
  const t = useCopy(COPY_BOTS);
  const tc = useCopy(COPY_CORE);
  const [teach, setTeach] = useState(false);
  useEffect(() => setTeach(false), [bot?.id]);
  return (
    <Dialog.Root open={!!bot} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="grok-fade fixed inset-0 z-50 bg-black/80" />
        <Dialog.Content aria-describedby={undefined} className="grok-root grok-lightbox fixed inset-0 z-50 flex items-center justify-center p-5 outline-none" style={{ color: C.fg }}>
          <Dialog.Title className="sr-only">{t.computerView}</Dialog.Title>
          <div className="relative aspect-[1080/675] w-[min(1080px,calc(100vw-40px),calc((100dvh-120px)*1.6))] overflow-hidden rounded-2xl bg-black">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 20% 10%, #2b3a55 0%, #141a26 55%, #0b0d12 100%)' }} />
            <div className="absolute inset-x-0 top-0 flex h-[3.5%] items-center justify-between bg-black/40 px-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <span>{bot?.name} · {t.virtualComputer}</span>
              <span className="tabular-nums">10:42</span>
            </div>
            <div className="absolute top-[9%] left-[8%] flex h-[78%] w-[70%] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#1c1c1e] shadow-2xl">
              <div className="flex h-8 shrink-0 items-center gap-1.5 border-b border-white/10 px-3">
                {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                  <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />
                ))}
                <span className="ms-3 h-5 flex-1 rounded-md bg-white/10 px-2 text-[11px] leading-5 text-white/60">{t.fakeTab}</span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="h-4 w-1/3 rounded bg-white/25" />
                {[92, 80, 86, 60, 74, 88, 50].map((w, i) => (
                  <span key={i} className="h-2.5 rounded bg-white/10" style={{ width: `${w}%` }} />
                ))}
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {[210, 160, 30].map((h) => (
                    <span key={h} className="aspect-video rounded-md" style={{ background: `linear-gradient(135deg, hsl(${h} 50% 35%), hsl(${h + 40} 60% 18%))` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute top-[30%] right-[6%] flex w-[14%] flex-col gap-2">
              {t.folders.map((n) => (
                <span key={n} className="flex flex-col items-center gap-1 text-[10px] text-white/70">
                  <span className="size-9 rounded-lg bg-white/15" />
                  {n}
                </span>
              ))}
            </div>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="grok-cursor absolute top-[22%] left-[20%] size-5 drop-shadow">
              <path d="M4 2l15 11-6.5 1.2L9 21z" fill="#fff" stroke="#000" strokeWidth="1.2" />
            </svg>
            {teach && (
              <span className="grok-fade absolute top-[6%] right-[3%] flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[12px]">
                <span className="grok-pulse size-2 rounded-full bg-[#ef4444]" />
                {t.demoRunning}
              </span>
            )}
          </div>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border p-[2px] backdrop-blur" style={{ background: 'rgba(19,18,17,0.95)', borderColor: C.line }}>
            <button type="button" onClick={() => setTeach((t) => !t)} className="h-8 rounded-[10px] px-3 text-[14px] font-medium transition-colors hover:bg-[rgba(252,252,252,0.06)]" style={{ color: teach ? C.fg : C.fg2 }}>
              {teach ? t.endDemo : t.teachTask}
            </button>
            <Dialog.Close asChild>
              <button type="button" aria-label={tc.close} className={CLOSE_BTN} style={{ color: C.fg2 }}>
                <X className="size-[18px]" strokeWidth={2} />
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** "Ajouter un bot" next to the title: search the bots (or create one with that name). */
function BotSwitcher({ current }: { current: Bot }) {
  const s = useStore();
  const t = useCopy(COPY_BOTS);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const list = s.bots.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase()));
  const exact = s.bots.some((b) => b.name.toLowerCase() === q.trim().toLowerCase());
  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setQ('');
      }}
    >
      <Tip label={t.addBot} side="bottom">
        <Popover.Trigger asChild>
          <button type="button" aria-label={t.addBot} className="grid size-6 place-items-center rounded-lg transition-colors hover:bg-[rgba(252,252,252,0.08)] hover:text-[#fcfcfc] data-[state=open]:bg-[rgba(252,252,252,0.08)]" style={{ color: C.fg2 }}>
            <G d={P.plus} className="size-4" />
          </button>
        </Popover.Trigger>
      </Tip>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={6} collisionPadding={8} className="grok-root grok-pop-in z-50 flex w-[420px] max-w-[calc(100vw-16px)] flex-col rounded-2xl border p-1.5 outline-none" style={SURFACE}>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchOrCreate} aria-label={t.searchOrCreate} className="h-8 bg-transparent px-2 text-[14px] outline-none placeholder:text-[#9e9e9e]" />
          <div role="listbox" className="grok-scroll mt-1 flex max-h-[220px] flex-col gap-px overflow-y-auto">
            {list.map((b) => (
              <button
                key={b.id}
                type="button"
                role="option"
                aria-selected={b.id === current.id}
                onClick={() => {
                  setOpen(false);
                  s.openBot(b.id);
                }}
                className={cn('flex h-8 shrink-0 items-center gap-2 rounded-[10px] px-2 text-start text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.06)]', b.id === current.id && 'bg-[rgba(252,252,252,0.08)]')}
              >
                <BotAvatar bot={b} />
                <span className="min-w-0 flex-1 truncate">{b.name}</span>
                {b.id === current.id && <G d={P.check} className="size-4" />}
              </button>
            ))}
            {q.trim() && !exact && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  s.ui.createBot(q.trim());
                }}
                className="flex h-8 shrink-0 items-center gap-2 rounded-[10px] px-2 text-start text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.06)]"
              >
                <span className="grid size-6 place-items-center" style={{ color: C.fg2 }}>
                  <G d={P.plus} className="size-4" />
                </span>
                {t.createNamed(q.trim())}
              </button>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** The bot's own page: title button (→ Paramètres), "Ajouter un bot", "Afficher l'ordinateur", "Plus" → "Créer un modèle";
 *  its thread keeps the bot-thread visuals; each bot keeps its own messages and draft. */
function BotPage({ bot, msgs, busy, composer, lead }: { bot: Bot; msgs: Message[]; busy: boolean; composer: ReactNode; lead?: ReactNode }) {
  const s = useStore();
  const t = useCopy(COPY_BOTS);

  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  });
  return (
    <>
      <h1 className="sr-only">{bot.name}</h1>
      <div className="absolute inset-x-3 top-3 z-20 flex h-9 items-center justify-between">
        <div className="flex min-w-0 items-center gap-1">
          {lead}
          <button type="button" onClick={() => s.ui.botSettings(bot.id)} className="flex h-8 min-w-0 items-center gap-2 rounded-xl px-2.5 text-[14px] leading-5 font-medium transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
            {bot.img ? <img src={bot.img} alt="" className="size-5 rounded-full object-cover" /> : <BotMark color={bot.color} shape={bot.shape} className="size-5 shrink-0" />}
            <span className="truncate">{bot.name}</span>
          </button>
          <BotSwitcher current={bot} />
        </div>
        <div className="flex items-center gap-0.5">
          <Tip label={t.showComputer} side="bottom">
            <button type="button" aria-label={t.showComputer} onClick={() => s.ui.computer(bot.id)} className={CLOSE_BTN} style={{ color: C.fg2 }}>
              <Monitor className="size-[18px]" strokeWidth={2} />
            </button>
          </Tip>
          <Menu
            align="end"
            className="w-[208px]"
            trigger={
              <button type="button" aria-label={t.more} className={cn(CLOSE_BTN, 'data-[state=open]:bg-[rgba(252,252,252,0.06)]')} style={{ color: C.fg2 }}>
                <Ellipsis className="size-[18px]" strokeWidth={2} />
              </button>
            }
          >
            <MenuItem tall icon={<Share2 className="size-4" strokeWidth={2} />} onSelect={() => toast(t.templateCreated(bot.name))}>
              {t.createTemplate}
            </MenuItem>
          </Menu>
        </div>
      </div>
      <div ref={scroller} className="grok-scroll flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col px-4 pt-20 pb-48">
          {msgs.length ? (
            <BotThread msgs={msgs} bot={bot} busy={busy} />
          ) : (
            // Not observed on grok.com (the visited bot had history): a quiet introduction instead of an empty column.
            <div className="grok-fade m-auto flex flex-col items-center gap-3 pb-10 text-center">
              <AvatarDisc color={bot.color} shape={bot.shape} img={bot.img} size={72} mark={54} />
              <div className="text-[18px] leading-6 font-[550]">{bot.name}</div>
              {bot.title && (
                <div className="text-[14px]" style={{ color: C.fg2 }}>
                  {bot.title}
                </div>
              )}
              <p className="max-w-[420px] text-[14px] leading-5" style={{ color: C.fg3 }}>
                {bot.desc ?? t.firstMessage}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-2 pb-3 sm:px-4 sm:pb-5" style={{ background: `linear-gradient(to bottom, transparent, ${C.base} 40%)` }}>
        <div className="pointer-events-auto relative mx-auto w-full max-w-[752px] pt-6">{composer}</div>
      </div>
    </>
  );
}

/* ---------- Projects ---------- */

function CreateProjectDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, files: string[]) => void }) {
  const t = useCopy(COPY_BOTS);
  const [name, setName] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const pick = useRef<HTMLInputElement>(null);
  const dir = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setName('');
    setFiles([]);
  }, [open]);
  useEffect(() => {
    dir.current?.setAttribute('webkitdirectory', '');
  });
  const add = (l: FileList | null) => l && setFiles((f) => [...f, ...Array.from(l, (x) => x.webkitRelativePath || x.name)]);
  const tile = (letter: string, bg: string) => (
    <span className="grid size-4 place-items-center rounded-[4px] text-[9px] font-bold text-white" style={{ background: bg }}>
      {letter}
    </span>
  );
  return (
    <GDialog open={open} onOpenChange={(o) => !o && onClose()} title={t.createProject} showTitle width={520}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCreate(name.trim() || t.newProject, files);
        }}
        className="flex flex-col gap-4 px-5 pt-3 pb-5"
      >
        <label className="flex flex-col gap-2 text-[14px]" style={{ color: C.fg2 }}>
          {t.projectName}
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t.newProject} className={cn(INPUT, 'h-9 py-1')} />
        </label>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((f, i) => (
              <span key={`${f}-${i}`} className="flex h-7 max-w-full items-center gap-1.5 rounded-lg px-2 text-[13px]" style={{ background: C.raised }}>
                <FileText className="size-3.5 shrink-0" strokeWidth={2} style={{ color: C.fg2 }} />
                <span className="truncate">{f}</span>
                <button type="button" aria-label={t.remove(f)} onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} style={{ color: C.fg2 }}>
                  <X className="size-3" strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        )}
        <input ref={pick} type="file" multiple hidden onChange={(e) => (add(e.target.files), (e.target.value = ''))} />
        <input ref={dir} type="file" hidden onChange={(e) => (add(e.target.files), (e.target.value = ''))} />
        <div className="flex items-center justify-between">
          <Menu
            align="start"
            className="w-[256px]"
            trigger={
              <button type="button" aria-label={t.addFilesOrFolder} className={cn(BTN_LINE, 'rounded-full data-[state=open]:bg-[rgba(252,252,252,0.06)]')}>
                <G d={P.docPlus} className="size-4" />
                {t.add}
              </button>
            }
          >
            <MenuItem tall icon={<G d={P.docPlus} className="size-4" />} onSelect={() => pick.current?.click()}>
              {t.chooseFiles}
            </MenuItem>
            <MenuItem tall icon={<G d={P.folder} className="size-4" />} onSelect={() => dir.current?.click()}>
              {t.chooseFolder}
            </MenuItem>
            <MenuItem tall icon={tile('G', '#1a73e8')} onSelect={() => toast(t.connectDrive)}>
              Google Drive
            </MenuItem>
            <MenuItem tall icon={tile('b', '#0061d5')} onSelect={() => toast(t.connectBox)}>
              Box
            </MenuItem>
          </Menu>
          <button type="submit" className={BTN_WHITE}>
            {t.create}
          </button>
        </div>
      </form>
    </GDialog>
  );
}

/** grok.com's project page could not be observed (the surveyed account had no project), so this page reuses the library's
 *  empty-state language: the project's instructions, its files in a dashed box, its chats, and a box to start one. */
function ProjectPage({ project }: { project: Project }) {
  const s = useStore();
  const t = useCopy(COPY_BOTS);
  const tc = useCopy(COPY_COMPOSER);

  const [q, setQ] = useState('');
  const [instr, setInstr] = useState(project.instructions);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => setInstr(project.instructions), [project.id, project.instructions]);
  const patch = (p: Partial<Project>) => s.setProjects((ps) => ps.map((x) => (x.id === project.id ? { ...x, ...p } : x)));
  const chats = s.chats.filter((c) => c.project === project.id);
  return (
    <div className="grok-scroll flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[752px] flex-col gap-6 px-4 pt-20 pb-16">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl" style={{ background: C.raised, color: C.fg2 }}>
            <G d={P.folder} className="size-5" />
          </span>
          <h1 className="min-w-0 flex-1 truncate text-[24px] leading-[32.4px] font-[550] tracking-[-0.48px]">{project.name}</h1>
          <button
            type="button"
            onClick={() =>
              s.ui.confirm({
                title: t.deleteProjectTitle,
                body: t.deleteProjectBody(project.name),
                action: t.delete,
                danger: true,
                onConfirm: () => {
                  s.setProjects((ps) => ps.filter((x) => x.id !== project.id));
                  s.go({ kind: 'library', tab: 'projects' });
                },
              })
            }
            className={BTN_LINE}
          >
            <Trash2 className="size-4" strokeWidth={2} />
            {t.delete}
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim()) return;
            s.ask(q.trim(), undefined, project.id);
            setQ('');
          }}
          className="flex items-center gap-2 rounded-[24px] border p-2.5 ps-4"
          style={{ background: C.raised, borderColor: C.line }}
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.startChatIn(project.name)} aria-label={t.startChatHere} className="min-w-0 flex-1 bg-transparent text-[16px] leading-7 outline-none placeholder:text-[#9e9e9e]" />
          <button type="submit" aria-label={tc.send} disabled={!q.trim()} className="grid size-10 place-items-center rounded-full text-white transition-opacity disabled:opacity-40" style={{ background: C.blue }}>
            <G d={P.arrowUp} className="size-5" />
          </button>
        </form>
        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] leading-[22.5px] font-[550]">{t.instructions}</h2>
          <textarea value={instr} onChange={(e) => setInstr(e.target.value)} onBlur={() => instr !== project.instructions && patch({ instructions: instr })} placeholder={t.instructionsPlaceholder} className={cn(INPUT, 'h-24 resize-none py-2')} />
        </section>
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] leading-[22.5px] font-[550]">{t.files}</h2>
            <button type="button" onClick={() => file.current?.click()} className={BTN_SOFT}>
              <G d={P.docPlus} className="size-4" />
              {t.addFiles}
            </button>
            <input ref={file} type="file" multiple hidden onChange={(e) => (e.target.files && patch({ files: [...project.files, ...Array.from(e.target.files, (f) => f.name)] }), (e.target.value = ''))} />
          </div>
          {project.files.length ? (
            <ul className="flex flex-col rounded-2xl border p-1.5" style={{ background: C.side, borderColor: C.line }}>
              {project.files.map((f, i) => (
                <li key={`${f}-${i}`} className="flex h-10 items-center gap-2 rounded-[10px] px-2.5 text-[14px] hover:bg-[rgba(252,252,252,0.04)]">
                  <FileText className="size-4" strokeWidth={2} style={{ color: C.fg2 }} />
                  <span className="min-w-0 flex-1 truncate">{f}</span>
                  <button type="button" aria-label={t.remove(f)} onClick={() => patch({ files: project.files.filter((_, j) => j !== i) })} className={GHOST_20} style={{ color: C.fg2 }}>
                    <X className="size-3.5" strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-3xl border border-dashed px-6 py-12 text-center" style={{ background: C.side, borderColor: 'rgba(252,252,252,0.1)' }}>
              <div className="text-[15px] font-medium">{t.noFiles}</div>
              <div className="text-[14px]" style={{ color: C.fg2 }}>
                {t.noFilesHint}
              </div>
            </div>
          )}
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] leading-[22.5px] font-[550]">{t.chats}</h2>
          {chats.length ? (
            chats.map((c) => (
              <button key={c.id} type="button" onClick={() => s.openChat(c.id)} className="flex h-10 items-center rounded-xl px-3 text-start text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.06)]">
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
                <span className="text-[13px]" style={{ color: C.fg2 }}>
                  {c.when}
                </span>
              </button>
            ))
          ) : (
            <p className="text-[14px]" style={{ color: C.fg3 }}>
              {t.noChats}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- Imagine: hero, prompt bar (Image / Vidéo / Agent), results, template gallery, template page, promo ---------- */

const RATIOS = ['2:3', '3:2', '1:1', '9:16', '16:9'] as const;
const COUNTS = [
  ['auto', ''],
  ['2', '×2'],
  ['4', '×4'],
  ['8', '×8'],
  ['12', '×12'],
] as const;
const ratioParts = (r: string) => r.split(':').map(Number) as [number, number];
/** Gradient stand-ins for media (no third-party pictures): a lit corner over a two-tone wash. */
const mediaBg = (h: number) => `radial-gradient(circle at 28% 22%, hsl(${h} 75% 66% / .85), transparent 52%), radial-gradient(circle at 78% 80%, hsl(${(h + 70) % 360} 70% 45% / .7), transparent 55%), linear-gradient(150deg, hsl(${h} 42% 34%), hsl(${(h + 40) % 360} 48% 14%))`;

type Tpl = { id?: string; name: string; slug?: string; tool?: string; beta?: boolean; ar: number; hue: number; desc?: string; video?: boolean };
const templateCols = (): Tpl[][] => {
  const m = copyOf(COPY_MEDIA);
  return [
  [
    { name: m.tplEditText, tool: m.tplEditTextTool, beta: true, ar: 1, hue: 212 },
    { name: 'Photo Edit', slug: 'photo-edit', ar: 2 / 3, hue: 24, video: true, desc: 'Enhance, retouch or transform any photo in one step: pick an edit, add details if you like, and send.' },
    { name: 'E-Commerce Photos', slug: 'ecommerce-listing', ar: 1, hue: 322, desc: 'Turn one product shot into a clean set of listing photos on studio backgrounds.' },
    { name: 'Hero Product Reveal', slug: 'hero-product-reveal', ar: 3 / 2, hue: 262, video: true, desc: 'A cinematic reveal of your product, lit like a launch film.' },
    { name: 'Character Sprite', slug: 'living-sprite', ar: 1, hue: 140, video: true, desc: 'Bring a character to life as a looping animated sprite.' },
    { name: 'Mascot Maker', slug: 'mascot-maker', ar: 2 / 3, hue: 44, desc: 'Design a friendly mascot for your brand from a short description.' },
  ],
  [
    { id: 'loop', name: m.tplLoop, tool: m.tplLoopTool, ar: 3 / 2, hue: 190 },
    { name: 'Smart Resize', slug: 'aspect-ratio', ar: 1, hue: 8, desc: 'Extend any image to a new aspect ratio without cropping the subject.' },
    { name: 'Profile Picture', slug: 'profile-picture', ar: 2 / 3, hue: 282, desc: 'A polished profile picture from a casual selfie.' },
    { name: 'Product Color Change', slug: 'product-color-change', ar: 1, hue: 338, desc: 'Show your product in every colourway, perfectly consistent.' },
    { name: 'UGC Photos', slug: 'ugc-photos', ar: 3 / 2, hue: 100, desc: 'Authentic, user-style photos of your product in real settings.' },
    { name: 'Professional Headshot', slug: 'professional-headshot', ar: 2 / 3, hue: 222, desc: 'Studio-quality headshots with natural light and a neutral backdrop.' },
  ],
  [
    { name: m.tplRetouch, tool: m.tplRetouchTool, ar: 1, hue: 160 },
    { name: 'Reimagine', slug: 'restyle', ar: 3 / 2, hue: 300, desc: 'Reimagine a photo in a new style while keeping its composition.' },
    { name: 'BG Removal & Change', slug: 'background-removal', ar: 2 / 3, hue: 200, desc: 'Remove the background, or swap it for any scene you describe.' },
    { name: 'Photo Collage', slug: 'collage', ar: 1, hue: 30, desc: 'Arrange several photos into one balanced collage.' },
    { name: 'Icon Maker', slug: 'icon-maker', ar: 1, hue: 250, desc: 'App-ready icons in a consistent style.' },
    { name: 'Emoji Creator', slug: 'emoji-creator', ar: 3 / 2, hue: 52, desc: 'Custom emoji from a word or a photo.' },
    { name: 'Editorial Product Poster', slug: 'editorial-poster', ar: 2 / 3, hue: 0, desc: 'A magazine-style poster around your product.' },
  ],
  ];
};
const TEMPLATE_EDITS = ['Photo enhance', 'Remove Object', 'Relight', 'Colorize', 'Sharpen', 'Change Background'];

/** The progressive blur under a card caption: four stacked backdrop blurs, each masked lower than the last. */
function ProgressiveBlur() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20">
      {[1.25, 2.5, 5, 10].map((b, i) => (
        <span key={b} className="absolute inset-0" style={{ backdropFilter: `blur(${b}px)`, WebkitBackdropFilter: `blur(${b}px)`, maskImage: `linear-gradient(to bottom, transparent ${i * 22}%, black ${30 + i * 22}%)`, WebkitMaskImage: `linear-gradient(to bottom, transparent ${i * 22}%, black ${30 + i * 22}%)` }} />
      ))}
      <span className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/25" />
    </span>
  );
}

const BETA_BADGE = 'rounded-full border px-2 py-[3px] text-[13px] leading-4 font-[550] backdrop-blur';
const betaStyle = { color: '#427eff', background: 'rgba(66,126,255,0.10)', borderColor: 'rgba(66,126,255,0.15)' };

function TemplateCard({ t, onOpen }: { t: Tpl; onOpen: () => void }) {
  const ti = useCopy(COPY_MEDIA);
  return (
    <button type="button" onClick={onOpen} aria-label={t.name} className="relative block w-full overflow-hidden rounded-2xl transition-opacity duration-150 hover:opacity-90" style={{ aspectRatio: t.ar, background: C.raised }}>
      <span className="absolute inset-0" style={{ background: mediaBg(t.hue) }} />
      {t.video && (
        <span className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-black/35 text-white backdrop-blur">
          <Play className="size-3 fill-white" strokeWidth={0} />
        </span>
      )}
      {t.beta && (
        <span className={cn(BETA_BADGE, 'absolute top-3 left-3')} style={betaStyle}>
          {ti.beta}
        </span>
      )}
      <ProgressiveBlur />
      <span className="absolute inset-x-0 bottom-0 truncate p-3 text-start text-[14px] leading-5 text-white">{t.name}</span>
    </button>
  );
}

/** Speaker with its two waves (they fade/scale in over 300ms when the audio is on). */
function SpeakerIcon({ on }: { on: boolean }) {
  const wave = (d: string, delay: number): ReactNode => (
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="grok-anim" style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'scale(.6)', transformOrigin: '11px 12px', transition: `opacity 300ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 300ms cubic-bezier(0.22,1,0.36,1) ${delay}ms` }} />
  );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
      <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
      {wave('M15.5 9.5a3.5 3.5 0 0 1 0 5', 0)}
      {wave('M18 7a7 7 0 0 1 0 10', 60)}
      <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="grok-anim" style={{ opacity: on ? 0 : 1, transition: 'opacity 300ms cubic-bezier(0.22,1,0.36,1)' }} />
    </svg>
  );
}

const BAR_CHIP = 'flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px] leading-5 font-medium transition-colors duration-150 hover:bg-[#2b2927] data-[state=open]:bg-[#2b2927]';
const TRACK = 'flex h-10 shrink-0 items-center rounded-full p-[2px]';

/** The Imagine prompt bar: 752×102, Importer, the mode switch (active segment = icon + label, others icon only), Vitesse /
 *  Qualité 2.0, Nombre d'images, Proportions (with its animated preview), Vidéo's audio / résolution / durée, Dictée. */
function ImagineBar({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  const s = useStore();
  const ti = useCopy(COPY_MEDIA);
  const tc = useCopy(COPY_COMPOSER);

  const o = s.imagine;
  const set = (p: Partial<ImagineOpts>) => s.setImagine((x) => ({ ...x, ...p }));
  const [text, setText] = useState('');
  const [hov, setHov] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [text]);
  const send = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };
  const modes = [
    ['image', ti.modeImage, <Image key="i" className="size-[18px]" strokeWidth={2} />],
    ['video', ti.modeVideo, <Video key="v" className="size-[18px]" strokeWidth={2} />],
    ['agent', ti.modeAgent, <Sparkles key="a" className="size-[18px]" strokeWidth={2} />],
  ] as const;
  const [rw, rh] = ratioParts(hov ?? o.ratio);
  const big = Math.max(rw, rh);
  const ratioName = ti.ratios[hov ?? o.ratio];
  const countLabel = COUNTS.find((c) => c[0] === o.count)?.[1] || ti.countAuto;
  const ratioIcon = (r: string, size = 14) => {
    const [a, b] = ratioParts(r);
    const m = Math.max(a, b);
    return <span aria-hidden="true" className="rounded-[2px] border-[1.5px] border-current" style={{ width: (size * a) / m, height: (size * b) / m }} />;
  };
  return (
    <div className="query-bar w-full rounded-[24px] border transition-[background-color,box-shadow,border-color] duration-100 focus-within:border-[rgba(252,252,252,0.1)]" style={{ background: C.raised, borderColor: C.line }}>
      <div className="ps-2.5 pe-3.5">
        <textarea
          ref={ta}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          aria-label={tc.ask}
          placeholder={o.mode === 'agent' ? ti.phAgent : ti.phImage}
          className="grok-scroll block min-h-[42px] w-full resize-none bg-transparent px-2 pt-3.5 text-[16px] leading-[28px] outline-none placeholder:text-[#9e9e9e]"
          style={{ color: C.fg }}
        />
      </div>
      <input ref={file} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => (e.target.files?.length && toast(ti.filesImported(e.target.files.length)), (e.target.value = ''))} />
      <div className="flex items-center gap-1.5 overflow-x-auto px-2.5 pt-2 pb-2.5 [scrollbar-width:none]">
        <Tip label={ti.upload}>
          <button type="button" aria-label={ti.upload} onClick={() => file.current?.click()} className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg2 }}>
            <G d={P.plus} className="size-[22px]" />
          </button>
        </Tip>
        <div role="radiogroup" aria-label={ti.mode} className={TRACK} style={{ background: 'rgba(252,252,252,0.08)' }}>
          {modes.map(([id, label, icon]) => {
            const on = o.mode === id;
            return (
              <Tip key={id} label={label}>
                <button type="button" role="radio" aria-checked={on} aria-label={label} onClick={() => set({ mode: id })} className={cn('grok-anim flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-full text-[14px] leading-5 font-medium transition-[width,background-color,color] duration-200', on ? 'bg-[rgba(252,252,252,0.1)]' : 'hover:text-[#fcfcfc]')} style={{ width: on ? (id === 'video' ? 88 : 90) : 42, color: on ? C.fg : C.fg2, transitionTimingFunction: EASE }}>
                  {icon}
                  {on && <span className="grok-f180">{label}</span>}
                </button>
              </Tip>
            );
          })}
        </div>
        {o.mode === 'image' && (
          <div role="radiogroup" aria-label={ti.speed} className={TRACK} style={{ background: 'rgba(252,252,252,0.08)' }}>
            {(
              [
                ['fast', ti.speed],
                ['quality', ti.quality],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={o.speed === id} onClick={() => set({ speed: id, count: id === 'quality' ? (o.count === 'auto' ? '4' : o.count) : o.count === '4' ? 'auto' : o.count })} className={cn('h-9 rounded-full px-3 text-[14px] leading-5 font-medium whitespace-nowrap transition-colors', o.speed === id ? 'bg-[rgba(252,252,252,0.1)]' : 'hover:text-[#fcfcfc]')} style={{ color: o.speed === id ? C.fg : C.fg2 }}>
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="ms-auto flex shrink-0 items-center gap-1.5">
          {o.mode === 'video' && (
            <>
              <Tip label={ti.videoAudio}>
                <button type="button" aria-label={ti.videoAudio} aria-pressed={o.audio} onClick={() => set({ audio: !o.audio })} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-[#2b2927]" style={{ background: C.raised, color: o.audio ? C.fg : C.fg2 }}>
                  <SpeakerIcon on={o.audio} />
                </button>
              </Tip>
              <Menu
                side="top"
                align="start"
                className="w-[208px]"
                trigger={
                  <button type="button" aria-label={ti.videoRes} className={BAR_CHIP} style={{ background: C.raised, color: C.fg }}>
                    <Video className="size-4" strokeWidth={2} />
                    {o.res}
                  </button>
                }
              >
                <DM.RadioGroup value={o.res} onValueChange={(v) => set({ res: v })}>
                  {['480p', '720p', '1080p'].map((r) => (
                    <RadioRow key={r} value={r}>
                      {r}
                    </RadioRow>
                  ))}
                </DM.RadioGroup>
              </Menu>
              <Menu
                side="top"
                align="start"
                className="w-[208px]"
                trigger={
                  <button type="button" aria-label={ti.videoDur} className={BAR_CHIP} style={{ background: C.raised, color: C.fg }}>
                    <Clock className="size-4" strokeWidth={2} />
                    {o.dur}
                  </button>
                }
              >
                <DM.RadioGroup value={o.dur} onValueChange={(v) => set({ dur: v })}>
                  {['6s', '10s', '15s'].map((r) => (
                    <RadioRow key={r} value={r}>
                      {r}
                    </RadioRow>
                  ))}
                </DM.RadioGroup>
              </Menu>
            </>
          )}
          {o.mode === 'image' && (
            <Menu
              side="top"
              align="start"
              className="w-[208px]"
              trigger={
                <button type="button" aria-label={ti.imageCount} className={BAR_CHIP} style={{ background: C.raised, color: C.fg }}>
                  <Copy className="size-4" strokeWidth={2} />
                  {countLabel}
                </button>
              }
            >
              <DM.RadioGroup value={o.count} onValueChange={(v) => set({ count: v })}>
                {COUNTS.map(([id, label]) => (
                  <RadioRow key={id} value={id}>
                    {label || ti.countAuto}
                  </RadioRow>
                ))}
              </DM.RadioGroup>
            </Menu>
          )}
          {o.mode !== 'agent' && (
            <DM.Root modal={false} onOpenChange={(op) => !op && setHov(null)}>
              <DM.Trigger asChild>
                <button type="button" aria-label={ti.aspect} className={BAR_CHIP} style={{ background: C.raised, color: C.fg }}>
                  <span className="grid size-4 place-items-center">{ratioIcon(o.ratio)}</span>
                  {o.ratio}
                </button>
              </DM.Trigger>
              <DM.Portal>
                <DM.Content side="top" align="start" sideOffset={4} collisionPadding={8} className={cn(MENU, 'relative w-[208px]')} style={SURFACE}>
                  <div aria-hidden="true" className="absolute top-0 right-[calc(100%+8px)] hidden h-[172px] w-[172px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border sm:flex" style={{ background: C.menu, borderColor: C.line }}>
                    <svg className="absolute inset-0 size-full opacity-[0.07]" viewBox="0 0 172 172" fill="none" stroke="#fcfcfc">
                      <path d="M86 0v172M0 86h172M0 0l172 172M172 0L0 172" />
                    </svg>
                    <div className="relative grid h-[110px] w-full place-items-center">
                      <span className="grok-anim block rounded-[2px] border-[1.5px] transition-[width,height,opacity] duration-200" style={{ borderColor: C.fg, width: `${(54 * rw) / big}%`, height: `${(((54 * rh) / big) * 172) / 110}%`, transitionTimingFunction: EASE }} />
                    </div>
                    <span className="relative text-[13px]" style={{ color: C.fg2 }}>
                      {ratioName}
                    </span>
                  </div>
                  <DM.RadioGroup value={o.ratio} onValueChange={(v) => set({ ratio: v })}>
                    {RATIOS.map((r) => (
                      <RadioRow key={r} value={r} hint={ti.ratios[r]} onHover={() => setHov(r)}>
                        {r}
                      </RadioRow>
                    ))}
                  </DM.RadioGroup>
                </DM.Content>
              </DM.Portal>
            </DM.Root>
          )}
          <Tip label={ti.dictation}>
            <button type="button" aria-label={ti.dictation} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)]" style={{ color: C.blue }}>
              <G d={P.mic} className="size-[18px]" />
            </button>
          </Tip>
          {text.trim() && (
            <button type="button" aria-label={tc.send} onClick={send} className="grok-pop grid size-10 place-items-center rounded-full text-white transition-opacity hover:opacity-90" style={{ background: C.blue }}>
              <G d={P.arrowUp} className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** One generation: the prompt, then N tiles in the chosen aspect ratio that shimmer for ~2s before their (gradient) result. */
function RunGrid({ run }: { run: ImagineRun }) {
  const ti = useCopy(COPY_MEDIA);
  const [a, b] = ratioParts(run.ratio);
  const cols = Math.min(run.n, 4);
  return (
    <div className="grok-card-in flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[14px]" style={{ color: C.fg2 }}>
        {run.mode === 'video' ? <Video className="size-4" strokeWidth={2} /> : <Image className="size-4" strokeWidth={2} />}
        <span className="min-w-0 flex-1 truncate">{run.prompt}</span>
        {!run.done && <span className="grok-shimmer shrink-0">{ti.generating}</span>}
      </div>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {run.hues.map((h, i) => (
          <div key={i} className={cn('relative overflow-hidden rounded-2xl', !run.done && 'grok-gen')} style={{ aspectRatio: `${a} / ${b}`, background: run.done ? mediaBg(h) : undefined }}>
            {run.done && run.mode === 'video' && (
              <span className="grok-fade absolute inset-0 grid place-items-center">
                <span className="grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
                  <Play className="size-4 fill-white" strokeWidth={0} />
                </span>
              </span>
            )}
            {!run.done && (
              <span className="absolute inset-0 grid place-items-center" style={{ color: C.fg3 }}>
                <Image className="size-7 opacity-60" strokeWidth={1.5} />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImaginePage({ lead }: { lead?: ReactNode }) {
  const s = useStore();
  const ti = useCopy(COPY_MEDIA);

  const submit = (prompt: string) => {
    const o = s.imagine;
    const n = o.mode === 'video' ? 1 : o.count === 'auto' ? 4 : Number(o.count);
    const ratio = o.mode === 'agent' ? '1:1' : o.ratio;
    const base = Math.floor(Math.random() * 360);
    const run: ImagineRun = { id: newId('r'), prompt, mode: o.mode, ratio, n, hues: Array.from({ length: n }, (_, i) => (base + i * 37) % 360), done: false };
    s.setRuns((r) => [run, ...r]);
    setTimeout(() => {
      s.setRuns((r) => r.map((x) => (x.id === run.id ? { ...x, done: true } : x)));
      const [a, b] = ratioParts(ratio);
      const stem = clip(prompt, 32).replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() || 'imagine';
      s.setLib((l) => [...run.hues.map((h, i) => ({ id: newId('m'), name: `${stem}-${i + 1}.${run.mode === 'video' ? 'mp4' : 'png'}`, kind: (run.mode === 'video' ? 'video' : 'image') as LibKind, at: Date.now(), size: run.mode === 'video' ? 4_800_000 + i * 1000 : 1_200_000 + i * 53_000, share: 'Privée' as Share, hue: h, ratio: a / b })), ...l]);
    }, 2200);
  };
  return (
    <div className="grok-scroll relative h-full overflow-y-auto [scrollbar-gutter:stable]">
      <div className="absolute inset-x-3 top-[11px] z-10 flex items-center justify-between">
        <div>{lead}</div>
        <button type="button" onClick={() => s.setRuns([])} className="flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] leading-5 font-medium transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
          <G d={P.plus} className="size-4" />
          {ti.newCanvas}
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-[784px] flex-col items-center px-4 pt-[min(30vh,300px)] pb-24">
        <h1 className="mb-7 text-center text-[24px] leading-[32.4px] font-[550] tracking-[-0.48px]">
          {ti.headPre}{' '}
          <span className="relative inline-block">
            {ti.headEm}
            <span aria-hidden="true" className="grok-underline absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full" />
          </span>
        </h1>
        <ImagineBar onSubmit={submit} />
        {s.runs.length > 0 && (
          <div className="mt-8 flex w-full flex-col gap-8">
            {s.runs.map((r) => (
              <RunGrid key={r.id} run={r} />
            ))}
          </div>
        )}
        <div className="mt-10 flex w-full gap-2.5">
          {templateCols().map((col, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col gap-2.5">
              {col.map((t) => (
                <TemplateCard
                  key={t.name}
                  t={t}
                  onOpen={() => {
                    if (t.slug) return s.go({ kind: 'template', slug: t.slug });
                    // In-place tools: the right mode and a starter prompt.
                    s.setImagine((x) => ({ ...x, mode: t.id === 'loop' ? 'video' : 'image' }));
                    toast(ti.describeChange(t.name));
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Bottom-left promo over the sidebar (~360×343): media, title, body, "Try it now", "Ignorer". */
function PromoCard({ onClose, onTry }: { onClose: () => void; onTry: () => void }) {
  const ti = useCopy(COPY_MEDIA);
  return (
    <div className="grok-card-in absolute bottom-6 left-6 z-30 flex w-[360px] flex-col overflow-hidden rounded-3xl border shadow-2xl" style={{ background: C.menu, borderColor: C.line }}>
      <div className="relative h-[180px] overflow-hidden">
        <div className="absolute inset-0" style={{ background: mediaBg(18) }} />
        <div className="grok-gen absolute inset-0 opacity-30 mix-blend-screen" />
        <button type="button" aria-label={ti.dismiss} onClick={onClose} className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60">
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="text-[15px] leading-[22.5px] font-[550]">Shape your scene, start to finish</div>
        <p className="text-[14px] leading-5" style={{ color: C.fg2 }}>
          Choose your first and last frames, or create seamless loops. Every video now follows your instructions more closely.
        </p>
        <button type="button" onClick={onTry} className={cn(BTN_WHITE, 'mt-2 h-10 w-24 px-4')}>
          Try it now
        </button>
      </div>
    </div>
  );
}

/** /imagine/template/imagine-<slug>: thumbnails strip, large preview, and the 360px panel (Your photo, Edit, Details, Envoyer). */
function TemplatePage({ slug }: { slug: string }) {
  const s = useStore();
  const ti = useCopy(COPY_MEDIA);
  const tc = useCopy(COPY_COMPOSER);
  const cols = templateCols();
  const t = cols.flat().find((x) => x.slug === slug) ?? cols[0][1];
  const [thumb, setThumb] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [edit, setEdit] = useState(0);
  const [details, setDetails] = useState('');
  const [phase, setPhase] = useState<'idle' | 'gen' | 'done'>('idle');
  const [copied, setCopied] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const hue = (t.hue + thumb * 45) % 360;
  const send = () => {
    setPhase('gen');
    setTimeout(() => {
      setPhase('done');
      s.setLib((l) => [{ id: newId('m'), name: `${slug}-${TEMPLATE_EDITS[edit].toLowerCase().replace(/\s+/g, '-')}.png`, kind: 'image', at: Date.now(), size: 1_650_000, share: 'Privée', hue: (hue + 120) % 360, ratio: 2 / 3 }, ...l]);
    }, 1800);
  };
  return (
    <div className="flex h-full min-h-0">
      <div className="relative flex min-w-0 flex-1 items-center gap-4 px-4 pt-16 pb-6">
        <Tip label={ti.back} side="right">
          <button type="button" aria-label={ti.back} onClick={() => s.go({ kind: 'imagine' })} className="absolute top-3 left-3 grid size-10 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg }}>
            <ArrowLeft className="size-5" strokeWidth={2} />
          </button>
        </Tip>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(`grok.com/imagine/template/imagine-${slug}`).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className={cn(BTN_SOFT, 'absolute top-3 right-4 h-10 w-[104px] rounded-full')}
        >
          <Share2 className="size-4" strokeWidth={2} />
          {copied ? ti.copied : ti.share}
        </button>
        <div className="hidden shrink-0 flex-col gap-2 md:flex">
          {Array.from({ length: 6 }, (_, i) => (
            <button key={i} type="button" aria-label={`Thumbnail ${i + 1}`} aria-pressed={thumb === i} onClick={() => setThumb(i)} className={cn('relative size-[50px] overflow-hidden rounded-lg border-2 transition-colors', thumb === i ? 'border-[#fcfcfc]' : 'border-transparent opacity-70 hover:opacity-100')} style={{ background: mediaBg((t.hue + i * 45) % 360) }}>
              {i === 0 && t.video && (
                <span className="absolute inset-0 grid place-items-center text-white">
                  <Video className="size-4 fill-white" strokeWidth={1.5} />
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex h-full min-w-0 flex-1 items-center justify-center">
          <div className={cn('relative h-full max-h-[901px] max-w-full overflow-hidden rounded-2xl', phase === 'gen' && 'grok-gen')} style={{ aspectRatio: '601 / 901', background: phase === 'gen' ? undefined : mediaBg(phase === 'done' ? (hue + 120) % 360 : hue) }}>
            {phase === 'done' && (
              <span className={cn(BETA_BADGE, 'grok-fade absolute top-3 left-3')} style={betaStyle}>
                {TEMPLATE_EDITS[edit]}
              </span>
            )}
            {phase === 'gen' && <span className="grok-shimmer absolute inset-x-0 bottom-6 text-center text-[14px]">{ti.generating}</span>}
          </div>
        </div>
      </div>
      <aside className="flex w-[360px] shrink-0 flex-col border-s max-lg:hidden" style={{ borderColor: C.line }}>
        <div className="grok-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pt-16 pb-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[15px] leading-[22.5px] font-[550]">{t.name}</h1>
            <p className="text-[14px] leading-5" style={{ color: C.fg2 }}>
              {t.desc}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between text-[14px] font-medium">
              Your photo
              <span className="text-[13px] font-normal" style={{ color: C.fg2 }}>
                1 image
              </span>
            </div>
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => (e.target.files?.[0] && setPhoto(URL.createObjectURL(e.target.files[0])), (e.target.value = ''))} />
            <button type="button" aria-label={ti.addReference} onClick={() => file.current?.click()} className="grid size-16 place-items-center overflow-hidden rounded-xl border border-dashed transition-colors hover:bg-[rgba(252,252,252,0.04)]" style={{ borderColor: 'rgba(252,252,252,0.15)', color: C.fg2 }}>
              {photo ? <img src={photo} alt="" className="size-full object-cover" /> : <G d={P.plus} className="size-5" />}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[14px] font-medium">Edit</div>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATE_EDITS.map((e, i) => (
                <button key={e} type="button" aria-pressed={edit === i} onClick={() => setEdit(i)} className="flex w-[104px] flex-col gap-1 text-start">
                  <span className={cn('aspect-square w-full rounded-xl border-2 transition-colors', edit === i ? 'border-[#fcfcfc]' : 'border-transparent')} style={{ background: mediaBg((t.hue + 60 + i * 30) % 360) }} />
                  <span className="truncate text-[13px]" style={{ color: edit === i ? C.fg : C.fg2 }}>
                    {e}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="flex items-baseline justify-between text-[14px] font-medium">
              Details
              <span className="text-[13px] font-normal" style={{ color: C.fg2 }}>
                {ti.optional}
              </span>
            </span>
            <input value={details} onChange={(e) => setDetails(e.target.value)} className={cn(INPUT, 'h-10')} />
          </label>
        </div>
        <div className="shrink-0 p-4">
          <button type="button" disabled={phase === 'gen'} onClick={send} className={cn(BTN_WHITE, 'h-10 w-full')}>
            {tc.send}
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ---------- Bibliothèque: pill tabs, search, display options, date-grouped grid or table, empty states, lightbox ---------- */

const DAY = 86_400_000;
const LIB_DEFS: Omit<LibItem, 'name'>[] = [
  { id: 'l1', kind: 'image', at: Date.now() - 2 * 3600_000, size: 1_480_000, share: 'Privée', hue: 300, ratio: 2 / 3 },
  { id: 'l2', kind: 'md', at: Date.now() - 5 * 3600_000, size: 6_200, share: 'Partagée', hue: 0 },
  { id: 'l3', kind: 'image', at: Date.now() - DAY - 3600_000, size: 1_920_000, share: 'Publiée', hue: 200, ratio: 3 / 2 },
  { id: 'l4', kind: 'video', at: Date.now() - DAY - 7200_000, size: 5_400_000, share: 'Privée', hue: 190, ratio: 16 / 9 },
  { id: 'l5', kind: 'pdf', at: Date.now() - 3 * DAY, size: 20_480, share: 'Privée', hue: 0 },
  { id: 'l6', kind: 'image', at: Date.now() - 4 * DAY, size: 1_120_000, share: 'Privée', hue: 24, ratio: 1 },
  { id: 'l7', kind: 'pdf', at: Date.now() - 18 * DAY, size: 88_000, share: 'Partagée', hue: 0 },
  { id: 'l8', kind: 'image', at: Date.now() - 24 * DAY, size: 640_000, share: 'Privée', hue: 210, ratio: 1 },
  { id: 'l9', kind: 'pdf', at: Date.now() - 31 * DAY, size: 142_000, share: 'Privée', hue: 0 },
  { id: 'l10', kind: 'image', at: Date.now() - 40 * DAY, size: 2_050_000, share: 'Publiée', hue: 330, ratio: 2 / 3 },
  { id: 'l11', kind: 'md', at: Date.now() - 47 * DAY, size: 3_100, share: 'Privée', hue: 0 },
];
const makeLib = (): LibItem[] => LIB_DEFS.map((d, i) => ({ ...d, name: copyOf(COPY_MEDIA).libNames[i] }));
const fmtSize = (n: number) => (n < 1024 ? `${n} B` : n < 1_048_576 ? `${Math.round(n / 1024)} KB` : `${(n / 1_048_576).toFixed(1)} MB`);
const fmtDay = (t: number) => new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'short' }).format(t);
const bucketOf = (t: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = today.getTime() - t;
  const m = copyOf(COPY_MEDIA);
  return t >= today.getTime() ? m.today : d < DAY ? m.yesterday : d < 7 * DAY ? m.last7 : m.earlier;
};
const kindOf = (name: string): LibKind => (/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(name) ? 'image' : /\.(mp4|mov|webm)$/i.test(name) ? 'video' : /\.pdf$/i.test(name) ? 'pdf' : 'md');

/** A first-page preview for documents (lines on a white page), a gradient for media. */
function Thumb({ item, className, page, style }: { item: LibItem; className?: string; page?: boolean; style?: CSSProperties }) {
  if (item.kind === 'image' || item.kind === 'video')
    return (
      <span className={cn('relative block overflow-hidden', className)} style={{ background: mediaBg(item.hue), ...style }}>
        {item.kind === 'video' && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-7 place-items-center rounded-full bg-black/40 text-white">
              <Play className="size-3 fill-white" strokeWidth={0} />
            </span>
          </span>
        )}
      </span>
    );
  return (
    <span className={cn('block overflow-hidden', className)} style={{ background: C.raised }}>
      <span className={cn('mx-auto flex flex-col gap-[5%] bg-white', page ? 'w-full p-[8%]' : 'mt-[6%] w-[78%] p-[7%]')} style={{ aspectRatio: '1 / 1.3' }}>
        <span className="h-[6%] w-1/2 rounded-sm bg-[#1f2937]" />
        {[90, 82, 95, 70, 88, 60, 84, 76].map((w, i) => (
          <span key={i} className="h-[2.4%] rounded-sm bg-[#d1d5db]" style={{ width: `${w}%` }} />
        ))}
      </span>
    </span>
  );
}

function ItemMenu({ item, onDelete, trigger }: { item: LibItem; onDelete: () => void; trigger: ReactNode }) {
  const ti = useCopy(COPY_MEDIA);
  return (
    <Menu align="end" className="w-[208px]" trigger={trigger}>
      <DM.Item onSelect={() => toast(ti.downloading(item.name))} className={cn(ROW, 'h-8 gap-1.5')}>
        <MenuIcon>
          <Download className="size-4" strokeWidth={2} />
        </MenuIcon>
        {ti.download}
      </DM.Item>
      <DM.Item onSelect={onDelete} className={cn(ROW, 'h-8 gap-1.5')} style={{ color: '#f2787e' }}>
        <MenuIcon danger>
          <Trash2 className="size-4" strokeWidth={2} />
        </MenuIcon>
        {ti.deleteItem}
      </DM.Item>
    </Menu>
  );
}

const DOTS_20 = 'grid size-5 place-items-center rounded-md transition-colors hover:bg-[rgba(252,252,252,0.08)] hover:text-[#fcfcfc] data-[state=open]:text-[#fcfcfc]';

/** Fullscreen preview: previous / next at the edges, a floating toolbar (Télécharger, Supprimée, Fermer l'aperçu); documents
 *  get the PDF viewer's zoom bar. Arrow keys move, Escape closes. */
function Lightbox({ items, index, onIndex, onClose, onDelete }: { items: LibItem[]; index: number | null; onIndex: (i: number) => void; onClose: () => void; onDelete: (id: string) => void }) {
  const ti = useCopy(COPY_MEDIA);
  const item = index === null ? undefined : items[index];
  const [zoom, setZoom] = useState(100);
  useEffect(() => setZoom(100), [item?.id]);
  const go = (d: number) => index !== null && items.length && onIndex((index + d + items.length) % items.length);
  const navBtn = 'absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60';
  const tool = 'grid size-8 place-items-center rounded-[10px] transition-colors hover:bg-[rgba(252,252,252,0.08)]';
  return (
    <Dialog.Root open={!!item} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="grok-fade fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.8)' }} />
        <Dialog.Content
          aria-describedby={undefined}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') go(-1);
            if (e.key === 'ArrowRight') go(1);
          }}
          className="grok-root grok-lightbox fixed inset-0 z-50 flex items-center justify-center p-5 outline-none"
          style={{ color: C.fg }}
        >
          {item && (
            <>
              <Dialog.Title className="sr-only">{ti.previewOf(item.name)}</Dialog.Title>
              <button type="button" aria-label={ti.prevItem} onClick={() => go(-1)} className={cn(navBtn, 'left-5')}>
                <ChevronLeft className="size-5" strokeWidth={2} />
              </button>
              <button type="button" aria-label={ti.nextItem} onClick={() => go(1)} className={cn(navBtn, 'right-5')}>
                <ChevronRight className="size-5" strokeWidth={2} />
              </button>
              <div className="flex max-h-full max-w-full flex-col items-center gap-3 pb-14">
                {item.kind === 'pdf' || item.kind === 'md' ? (
                  <div className="grok-scroll max-h-[calc(100dvh-140px)] overflow-auto rounded-lg">
                    <div className="grok-anim transition-[width] duration-150" style={{ width: `min(${6.2 * zoom}px, calc(100vw - 160px))` }}>
                      <Thumb item={item} page className="rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <Thumb key={item.id} item={item} className="grok-fade rounded-xl" style={{ aspectRatio: item.ratio ?? 1, width: `min(calc(100vw - 160px), calc((100dvh - 160px) * ${item.ratio ?? 1}), 900px)` }} />
                )}
                <div className="text-[14px]" style={{ color: C.fg2 }}>
                  {item.name}
                </div>
              </div>
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
                {(item.kind === 'pdf' || item.kind === 'md') && (
                  <div className="flex items-center gap-0.5 rounded-xl border p-[2px]" style={{ background: 'rgba(19,18,17,0.95)', borderColor: C.line }}>
                    <button type="button" aria-label={ti.search} className={tool} style={{ color: C.fg2 }}>
                      <Search className="size-4" strokeWidth={2} />
                    </button>
                    <input aria-label={ti.goToPage} defaultValue="1" className="h-7 w-9 rounded-md bg-[rgba(252,252,252,0.06)] text-center text-[13px] outline-none" />
                    <button type="button" aria-label={ti.zoomOut} onClick={() => setZoom((z) => Math.max(50, z - 25))} className={tool} style={{ color: C.fg2 }}>
                      <Minus className="size-4" strokeWidth={2} />
                    </button>
                    <span className="w-11 text-center text-[13px] tabular-nums" style={{ color: C.fg2 }}>
                      {zoom}%
                    </span>
                    <button type="button" aria-label={ti.zoomIn} onClick={() => setZoom((z) => Math.min(200, z + 25))} className={tool} style={{ color: C.fg2 }}>
                      <G d={P.plus} className="size-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-0.5 rounded-xl border p-[2px]" style={{ background: 'rgba(19,18,17,0.95)', borderColor: C.line }}>
                  <Tip label={ti.download}>
                    <button type="button" aria-label={ti.download} onClick={() => toast(ti.downloading(item.name))} className={tool} style={{ color: C.fg2 }}>
                      <Download className="size-4" strokeWidth={2} />
                    </button>
                  </Tip>
                  <Tip label={ti.deleteItem}>
                    <button type="button" aria-label={ti.deleteItem} onClick={() => onDelete(item.id)} className={tool} style={{ color: C.fg2 }}>
                      <Trash2 className="size-4" strokeWidth={2} />
                    </button>
                  </Tip>
                  <Dialog.Close asChild>
                    <button type="button" aria-label={ti.closePreview} className={tool} style={{ color: C.fg2 }}>
                      <X className="size-4" strokeWidth={2} />
                    </button>
                  </Dialog.Close>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** A submenu row of "Options d'affichage": label left, current value right (secondary), chevron. */
function OptionSub({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <DM.Sub>
      <DM.SubTrigger className={cn(ROW, 'h-8')}>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="truncate text-[14px]" style={{ color: C.fg2 }}>
          {value}
        </span>
        <span style={{ color: C.fg2 }}>
          <G d={P.chevronRight} className="size-4" />
        </span>
      </DM.SubTrigger>
      <DM.Portal>
        <DM.SubContent sideOffset={8} alignOffset={-7} collisionPadding={8} className={cn(MENU, 'w-[208px]')} style={SURFACE}>
          {children}
        </DM.SubContent>
      </DM.Portal>
    </DM.Sub>
  );
}

const LIB_TABS = ['all', 'media', 'projects', 'apps', 'files'] as const;

function LibraryPage({ tab, lead }: { tab: LibTab; lead?: ReactNode }) {
  const s = useStore();
  const ti = useCopy(COPY_MEDIA);

  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'date' | 'name' | 'size'>('date');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [only, setOnly] = useState<Record<Share, boolean>>({ Privée: true, Partagée: true, Publiée: true });
  const [open, setOpen] = useState<number | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);

  const del = (id: string) => {
    s.setLib((l) => l.filter((x) => x.id !== id));
    toast(ti.itemDeleted);
  };
  const items = s.lib
    .filter((x) => (tab === 'media' ? x.kind === 'image' || x.kind === 'video' : tab === 'files' ? x.kind === 'pdf' || x.kind === 'md' : true))
    .filter((x) => only[x.share])
    .filter((x) => x.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => {
      const d = sort === 'name' ? b.name.localeCompare(a.name, intlLocale()) : sort === 'size' ? a.size - b.size : a.at - b.at;
      return order === 'asc' ? d : -d;
    });
  const groups = sort === 'date' ? items.reduce<{ label: string; items: LibItem[] }[]>((acc, it) => {
    const label = bucketOf(it.at);
    const g = acc.find((x) => x.label === label);
    if (g) g.items.push(it);
    else acc.push({ label, items: [it] });
    return acc;
  }, []) : [{ label: '', items }];
  const onlyLabel = Object.values(only).every(Boolean) ? ti.all : (Object.keys(only) as Share[]).filter((k) => only[k]).map((k) => ti.shareOnly[k]).join(', ') || ti.none;
  const projects = s.projects.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()));

  const empty = (title: string, body: string, cta: string, on: () => void) => (
    <div className="flex flex-col items-center gap-1 rounded-3xl border border-dashed px-6 py-16 text-center" style={{ background: C.side, borderColor: 'rgba(252,252,252,0.1)' }}>
      <div className="text-[15px] font-medium">{title}</div>
      <div className="text-[14px]" style={{ color: C.fg2 }}>
        {body}
      </div>
      <button type="button" onClick={on} className={cn(BTN_SOFT, 'mt-4 h-10 px-4')}>
        {cta}
      </button>
    </div>
  );

  return (
    <div className="grok-scroll h-full overflow-y-auto">
      <h1 className="sr-only">{ti.libTitle}</h1>
      <div className="mx-auto flex w-full max-w-[1024px] flex-col px-5 pt-[60px] pb-16 md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {lead}
            <PillTabs label={ti.libCategories} tabs={LIB_TABS.map((id) => [id, ti.tabs[id]] as const)} value={tab} onChange={(t) => s.go({ kind: 'library', tab: t })} />
          </div>
          <div className="flex items-center gap-1">
            {searching ? (
              <div className="grok-f180 flex h-8 w-[220px] items-center gap-2 rounded-xl border px-2.5 transition-[border-color,box-shadow] duration-150 focus-within:border-[#299fff]" style={{ borderColor: C.line }}>
                <Search className="size-4 shrink-0" strokeWidth={2} style={{ color: C.fg2 }} />
                <input
                  ref={search}
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) =>
                    keepEscape(e, () => {
                      setQ('');
                      setSearching(false);
                    })
                  }
                  onBlur={() => !q && setSearching(false)}
                  placeholder={ti.find}
                  aria-label={ti.find}
                  className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9e9e9e]"
                />
                {q && (
                  <button
                    type="button"
                    aria-label={ti.clearSearch}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQ('');
                      search.current?.focus();
                    }}
                    style={{ color: C.fg2 }}
                  >
                    <X className="size-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            ) : (
              <Tip label={ti.find}>
                <button type="button" aria-label={ti.find} onClick={() => setSearching(true)} className="grid size-8 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
                  <Search className="size-4" strokeWidth={2} />
                </button>
              </Tip>
            )}
            <Menu
              align="end"
              className="w-[256px]"
              trigger={
                <button type="button" aria-label={ti.displayOptions} className="grid size-8 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc] data-[state=open]:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg2 }}>
                  <SlidersHorizontal className="size-4" strokeWidth={2} />
                </button>
              }
            >
              <DM.Label className="px-2 pt-1 pb-1 text-[12px]" style={{ color: C.fg2 }}>
                {ti.view}
              </DM.Label>
              <DM.RadioGroup value={view} onValueChange={(v) => setView(v as 'grid' | 'list')}>
                <RadioRow value="grid">
                  <LayoutGrid className="size-4" strokeWidth={2} style={{ color: C.fg2 }} />
                  {ti.grid}
                </RadioRow>
                <RadioRow value="list">
                  <List className="size-4" strokeWidth={2} style={{ color: C.fg2 }} />
                  {ti.list}
                </RadioRow>
              </DM.RadioGroup>
              <MenuSep />
              <OptionSub label={ti.sortBy} value={{ date: ti.byDate, name: ti.byName, size: ti.bySize }[sort]}>
                <DM.RadioGroup value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                  <RadioRow value="date">{ti.byDate}</RadioRow>
                  <RadioRow value="name">{ti.byName}</RadioRow>
                  <RadioRow value="size">{ti.bySize}</RadioRow>
                </DM.RadioGroup>
              </OptionSub>
              <OptionSub label={ti.orderLabel} value={order === 'desc' ? ti.newest : ti.oldest}>
                <DM.RadioGroup value={order} onValueChange={(v) => setOrder(v as typeof order)}>
                  <RadioRow value="desc">{ti.newest}</RadioRow>
                  <RadioRow value="asc">{ti.oldest}</RadioRow>
                </DM.RadioGroup>
              </OptionSub>
              <OptionSub label={ti.showOnly} value={onlyLabel}>
                {(
                  [
                    ['Privée', ti.shareOnly.Privée],
                    ['Partagée', ti.shareOnly.Partagée],
                    ['Publiée', ti.shareOnly.Publiée],
                  ] as const
                ).map(([k, label]) => (
                  <DM.CheckboxItem key={k} checked={only[k]} onSelect={(e) => e.preventDefault()} onCheckedChange={(c) => setOnly((o) => ({ ...o, [k]: !!c }))} className={cn(ROW, 'h-8')}>
                    <span className="flex-1">{label}</span>
                    <DM.ItemIndicator>
                      <G d={P.check} className="size-4" />
                    </DM.ItemIndicator>
                  </DM.CheckboxItem>
                ))}
              </OptionSub>
            </Menu>
            <input
              ref={file}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const fl = e.target.files;
                if (fl?.length) s.setLib((l) => [...Array.from(fl, (f) => ({ id: newId('u'), name: f.name, kind: kindOf(f.name), at: Date.now(), size: f.size, share: 'Privée' as Share, hue: Math.floor(Math.random() * 360), ratio: 3 / 2 })), ...l]);
                e.target.value = '';
              }}
            />
            {tab === 'apps' ? (
              <button type="button" onClick={() => s.ask(ti.habitPrompt, 'build')} className={cn(BTN_WHITE, 'ms-1')}>
                {ti.createApp}
              </button>
            ) : (
              <button type="button" onClick={() => file.current?.click()} className={cn(BTN_WHITE, 'ms-1')}>
                {ti.uploadFiles}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          {tab === 'apps' ? (
            empty(ti.noApps, ti.noAppsHint, ti.createApp, () => s.ask(ti.habitPrompt, 'build'))
          ) : tab === 'projects' ? (
            s.projects.length ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(234px,1fr))] gap-x-4 gap-y-5">
                {projects.map((p) => (
                  <button key={p.id} type="button" onClick={() => s.go({ kind: 'project', id: p.id })} className="group flex flex-col gap-2 text-start">
                    <span className="grid aspect-[1200/630] w-full place-items-center rounded-xl border transition-colors group-hover:border-[rgba(252,252,252,0.06)]" style={{ background: C.side, borderColor: 'rgba(252,252,252,0.1)', color: C.fg2 }}>
                      <G d={P.folder} className="size-8" />
                    </span>
                    <span className="flex flex-col px-3.5">
                      <span className="truncate text-[14px] font-medium">{p.name}</span>
                      <span className="truncate text-[14px]" style={{ color: C.fg2 }}>
                        {ti.nFiles(p.files.length)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {(
                    [
                      [<Palette key="a" className="size-4" strokeWidth={2} />, ...ti.projFeatures[0]],
                      [<User key="b" className="size-4" strokeWidth={2} />, ...ti.projFeatures[1]],
                      [<Shield key="c" className="size-4" strokeWidth={2} />, ...ti.projFeatures[2]],
                    ] as const
                  ).map(([icon, title, body]) => (
                    <div key={title} className="flex min-h-[180px] flex-col gap-2 rounded-xl border p-5" style={{ borderColor: C.line }}>
                      <span className="grid size-8 place-items-center rounded-full" style={{ background: C.raised, color: C.fg2 }}>
                        {icon}
                      </span>
                      <div className="text-[15px] font-[550]">{title}</div>
                      <p className="text-[15px] leading-[22.5px]" style={{ color: C.fg2 }}>
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-start gap-3 rounded-xl border p-5" style={{ borderColor: C.line }}>
                  <p className="text-[15px] leading-[22.5px]" style={{ color: C.fg2 }}>
                    {ti.projPitch}
                  </p>
                  <button type="button" onClick={() => s.ui.createProject()} className="h-10 rounded-xl bg-[#fcfcfc] px-4 text-[14px] font-medium text-[#050505] transition-opacity hover:opacity-90">
                    {ti.firstProject}
                  </button>
                </div>
              </div>
            )
          ) : !items.length ? (
            q ? (
              <p className="py-16 text-center text-[14px]" style={{ color: C.fg2 }}>
                {ti.noResultsFor(q)}
              </p>
            ) : (
              empty(tab === 'media' ? ti.noMedia : tab === 'files' ? ti.noFiles : ti.nothing, ti.emptyHint, ti.uploadFiles, () => file.current?.click())
            )
          ) : view === 'grid' ? (
            groups.map((g) => (
              <section key={g.label || 'all'}>
                {g.label && <h2 className="h-12 pt-2 pb-4 ps-3.5 text-[15px] leading-6 font-[550]">{g.label}</h2>}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 pb-5 lg:grid-cols-[repeat(4,234px)]">
                  {g.items.map((it) => (
                    <div key={it.id} className="group/sidebar-menu-item relative flex flex-col gap-2 pb-5">
                      <button type="button" aria-label={it.name} data-library-item-id={it.id} onClick={() => setOpen(items.indexOf(it))} className="absolute inset-0 z-0 rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-[#299fff]" />
                      <span className="pointer-events-none block aspect-[1200/630] w-full overflow-hidden rounded-xl border transition-colors group-hover/sidebar-menu-item:border-[rgba(252,252,252,0.06)]" style={{ background: C.side, borderColor: 'rgba(252,252,252,0.1)' }}>
                        <Thumb item={it} className="size-full" />
                      </span>
                      <span className="pointer-events-none relative flex h-10 flex-col px-3.5">
                        <span className="truncate text-[14px] leading-5 font-medium">{it.name}</span>
                        <span className="truncate text-[14px] leading-5" style={{ color: C.fg2 }}>
                          {fmtDay(it.at)} · {fmtSize(it.size)}
                        </span>
                        <span className="pointer-events-auto absolute end-0 top-0 hidden h-10 w-24 items-start justify-end bg-gradient-to-r from-transparent to-[#131211] pe-1 pt-0.5 group-focus-within/sidebar-menu-item:flex group-hover/sidebar-menu-item:flex has-[[data-state=open]]:flex max-md:flex">
                          <ItemMenu
                            item={it}
                            onDelete={() => del(it.id)}
                            trigger={
                              <button type="button" aria-label={ti.itemActions} className={DOTS_20} style={{ color: C.fg2 }}>
                                <Ellipsis className="size-4" strokeWidth={2} />
                              </button>
                            }
                          />
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-fixed border-collapse text-[14px]">
                <thead>
                  <tr className="h-[38px] text-start" style={{ color: C.fg2 }}>
                    <th className="w-[48%] ps-3 text-start font-normal">{ti.colName}</th>
                    <th className="w-[18%] text-start font-normal">{ti.colType}</th>
                    <th className="w-[14%] text-start font-normal">{ti.colShared}</th>
                    <th className="w-[14%] text-start font-normal">{ti.colCreated}</th>
                    <th className="w-[6%]" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={it.id} onClick={() => setOpen(i)} className={cn('h-[49px] cursor-pointer transition-colors hover:bg-[#201f1d]', i < items.length - 1 && 'border-b')} style={{ borderColor: C.line }}>
                      <td className="py-2 ps-3 pe-2">
                        <span className="flex min-w-0 items-center gap-3">
                          <Thumb item={it} className="size-8 shrink-0 rounded-md" />
                          <span className="truncate font-medium">{it.name}</span>
                        </span>
                      </td>
                      <td className="p-2" style={{ color: C.fg2 }}>
                        {ti.kind[it.kind]}
                      </td>
                      <td className="p-2" style={{ color: C.fg2 }}>
                        {ti.shareState[it.share]}
                      </td>
                      <td className="p-2" style={{ color: C.fg2 }}>
                        {fmtDay(it.at)}
                      </td>
                      <td className="p-2 text-end" onClick={(e) => e.stopPropagation()}>
                        <ItemMenu
                          item={it}
                          onDelete={() => del(it.id)}
                          trigger={
                            <button type="button" aria-label={ti.itemActions} className={cn(DOTS_20, 'ms-auto')} style={{ color: C.fg2 }}>
                              <Ellipsis className="size-4" strokeWidth={2} />
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Lightbox
        items={items}
        index={open !== null && open < items.length ? open : null}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
        onDelete={(id) => {
          del(id);
          if (items.length <= 1) setOpen(null);
          else if (open !== null && open >= items.length - 1) setOpen(items.length - 2);
        }}
      />
    </div>
  );
}

/* ---------- Automatisations: list (8 per page), Exécutions, Modèles, the "Nouvelle automatisation" dialog ---------- */

/** The icon picker's 90 glyphs with grok's French labels (lucide stand-ins); the last one, "Éclair", is the default. */
const AUTO_ICONS: [string, typeof Anchor][] = [
  ['Ancre', Anchor], ["Ouverture de l'objectif", Aperture], ['Pomme', Apple], ['Archive', Archive], ['Banane', Banana], ['Bière', Beer], ['Cloche', Bell], ['Oiseau', Bird], ['Livre ouvert', BookOpen], ['Signet', Bookmark],
  ['Boîte', Box], ['Mallette', Briefcase], ['Insecte', Bug], ['Bâtiment', Building], ['Calculatrice', Calculator], ['Calendrier', Calendar], ['Caméra', Camera], ['Voiture', Car], ['Carotte', Carrot], ['Chat', Cat],
  ['Toque de chef', ChefHat], ['Cerise', Cherry], ['Porte-bloc', Clipboard], ['Horloge', Clock], ['Code', Code], ['Café', Coffee], ['Boussole', Compass], ['Composant', Component], ['Processeur', Cpu], ['Gobelet de soda', CupSoda],
  ['Base de données', Database], ['Diamant', Diamond], ['Chien', Dog], ['Symbole du dollar', DollarSign], ['Goutte', Droplet], ['Film', Film], ['Poisson', Fish], ['Drapeau', Flag], ['Flamme', Flame], ['Fiole de laboratoire', FlaskConical],
  ['Manette', Gamepad2], ['Pierre précieuse', Gem], ['Lunettes', Glasses], ['Globe', Globe], ['Chapeau de diplômé', GraduationCap], ['Écouteurs', Headphones], ['Cœur', Heart], ['Surligneur', Highlighter], ['Maison', House], ['Sablier', Hourglass],
  ['Clé', Key], ['Ordinateur portable', Laptop], ['Feuille', Leaf], ['Ampoule', Lightbulb], ['Courrier', Mail], ['Microscope', Microscope], ['Écran', Monitor], ['Lune', Moon], ['Montagne', Mountain], ['Musique', Music],
  ['Note de musique', Music2], ['Palette', Palette], ['Téléphone', Phone], ['Épingle', Pin], ['Avion', Plane], ['Lecture', Play], ['Fusée', Rocket], ['Voilier', Sailboat], ['Balance', Scale], ['Partager', Share2],
  ['Bouclier', Shield], ['Chemise', Shirt], ['Sourire', Smile], ['Étincelles', Sparkles], ['Étoile', Star], ['Stéthoscope', Stethoscope], ['Note autocollante', StickyNote], ['Soleil', Sun], ['Épée', Sword], ['Étiquette', Tag],
  ['Train', TrainFront], ['Arbre', TreePine], ['Camion', Truck], ['Parapluie', Umbrella], ['Déverrouiller', LockOpen], ['Utilisateur', User], ['Ustensiles', Utensils], ['Vidéo', Video], ['Clé à molette', Wrench], ['Éclair', Zap],
];
const ICON_DEFAULT = AUTO_ICONS.length - 1;
const iconIndex = (label: string) => Math.max(0, AUTO_ICONS.findIndex((i) => i[0] === label));
const AUTO_COLORS: [string, string][] = [
  ['Hériter', ''],
  ['Gris', '#6b7280'],
  ['Rouge', '#ef4444'],
  ['Orange', '#f87500'],
  ['Jaune', '#eab308'],
  ['Vert citron', '#84cc16'],
  ['Turquoise', '#14b8a6'],
  ['Vert', '#22c55e'],
  ['Bleu', '#0890ff'],
  ['Violet', '#ad66ff'],
  ['Rose', '#f537ae'],
];
const WEEKDAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FREQ_IDS: Freq[] = ['once', 'hourly', 'daily', 'weekly', 'monthly', 'yearly'];
const groupLabel = (g: string) => (g === 'Avancé' ? copyOf(COPY_AUTO).advanced : g);
const eventGroups = (): { group: string; tile: [string, string]; items: { label: string; desc: string }[] }[] => {
  const a = copyOf(COPY_AUTO);
  const gh = ([label, what]: [string, string]) => ({ label, desc: `${a.trigPre}${what}` });
  const mail = { label: a.newEmail[0], desc: a.newEmail[1] };
  return [
    { group: 'Gmail', tile: ['M', '#ea4335'], items: [mail] },
    { group: 'Outlook', tile: ['O', '#0a64d6'], items: [mail] },
    { group: 'GitHub', tile: ['G', '#24292f'], items: a.gh.map(gh) },
    { group: 'Linear', tile: ['L', '#5e6ad2'], items: a.linear.map(gh) },
    { group: 'Finance', tile: ['$', '#0f9d58'], items: [{ label: a.txn[0], desc: a.txn[1] }, ...a.finance.map(gh)] },
    { group: 'Avancé', tile: ['W', '#6b7280'], items: [{ label: a.webhook[0], desc: a.webhook[1] }] },
  ];
};
const AUTO_MODELS: [ModelId, ReactNode][] = [
  ['auto', <G key="a" d={P.rocket} className="size-4" />],
  ['fast', <G key="r" d={P.flash} className="size-4" />],
  ['expert', <G key="e" d={P.bulb} className="size-4" />],
  ['heavy', <G key="l" d={P.connectors} className="size-4" />],
  ['build', <G key="b" d={P.hammer} className="size-4" />],
];

const fmtTime = (h: number, m: number) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
const scheduleOf = (a: Auto) => {
  const t = a.triggers[0];
  if (!t) return '—';
  if (t.event) return `${groupLabel(t.event.group)} · ${t.event.label}`;
  const at = fmtTime(t.h, t.m);
  return { once: `Once at ${at}`, hourly: `Every hour at :${String(t.m).padStart(2, '0')}`, daily: `Every day around ${at}`, weekly: `Every ${WEEKDAYS_EN[t.day % 7]} around ${at}`, monthly: `Monthly on day ${t.day + 1} around ${at}`, yearly: `Every year around ${at}` }[t.freq ?? 'daily'];
};
const nextRunOf = (a: Auto) => {
  const t = a.triggers[0];
  if (!t || t.event || a.paused) return '—';
  const now = new Date();
  const n = new Date(now);
  n.setSeconds(0, 0);
  if (t.freq === 'hourly') {
    n.setMinutes(t.m);
    if (n <= now) n.setHours(n.getHours() + 1);
  } else {
    n.setHours(t.h, t.m);
    if (t.freq === 'weekly') {
      const want = (t.day + 1) % 7; // getDay(): 0 = dimanche
      while (n.getDay() !== want || n <= now) n.setDate(n.getDate() + 1);
    } else if (t.freq === 'monthly') {
      n.setDate(t.day + 1);
      if (n <= now) n.setMonth(n.getMonth() + 1);
    } else if (n <= now) n.setDate(n.getDate() + (t.freq === 'yearly' ? 365 : 1));
  }
  const min = Math.round((n.getTime() - now.getTime()) / 60000);
  const ac = copyOf(COPY_AUTO);
  return min < 60 ? ac.inMin(min) : min < 48 * 60 ? ac.inHours(Math.round(min / 60)) : ac.inDays(Math.round(min / 1440));
};

const trig = (freq: Freq, h: number, m: number, day = 0): Trigger => ({ id: newId('t'), freq, h, m, day });
const makeAutos = (): Auto[] => {
  const L = copyOf(COPY_AUTO).autoList;
  const B = (i: number) => copyOf(COPY_DATA).bots[i].name;
  return [
    { id: 'a1', name: L[0][0], icon: iconIndex('Processeur'), color: '', bot: B(3), triggers: [trig('daily', 10, 0)], instructions: L[0][1], app: true, mail: true, model: 'auto' },
    { id: 'a2', name: L[1][0], icon: iconIndex('Toque de chef'), color: '', bot: B(0), triggers: [trig('weekly', 18, 0, 6)], instructions: L[1][1], app: true, mail: false, model: 'auto' },
    { id: 'a3', name: L[2][0], icon: iconIndex('Cœur'), color: '', bot: B(1), triggers: [trig('daily', 7, 0)], instructions: L[2][1], app: true, mail: false, model: 'fast' },
    { id: 'a4', name: L[3][0], icon: iconIndex('Courrier'), color: '#0890ff', bot: B(0), triggers: [trig('daily', 8, 30)], instructions: L[3][1], app: true, mail: true, model: 'auto' },
    { id: 'a5', name: L[4][0], icon: iconIndex('Lunettes'), color: '#ad66ff', bot: B(3), triggers: [trig('weekly', 9, 0, 0)], instructions: L[4][1], app: true, mail: true, model: 'expert' },
    { id: 'a6', name: L[5][0], icon: iconIndex('Symbole du dollar'), color: '#22c55e', bot: B(0), triggers: [trig('monthly', 9, 0, 0)], instructions: L[5][1], app: true, mail: false, model: 'auto' },
    { id: 'a7', name: L[6][0], icon: iconIndex('Livre ouvert'), color: '', bot: B(5), triggers: [trig('daily', 8, 0)], instructions: L[6][1], app: true, mail: false, model: 'fast' },
    { id: 'a8', name: L[7][0], icon: iconIndex('Feuille'), color: '#84cc16', bot: B(6), triggers: [trig('daily', 19, 30)], instructions: L[7][1], app: true, mail: false, model: 'auto', paused: true },
    { id: 'a9', name: L[8][0], icon: iconIndex('Code'), color: '#6b7280', bot: B(4), triggers: [{ id: 't-gh', event: { group: 'GitHub', label: eventGroups()[2].items[0].label }, h: 9, m: 0, day: 0 }], instructions: L[8][1], app: true, mail: true, model: 'expert' },
  ];
};

const AUTO_TEMPLATES: { name: string; desc: string; chip: string; icon: string; cat: string; freq?: Freq }[] = [
  { name: 'Morning Brief', desc: 'Start the day with headlines, market moves, and your weather.', chip: '#1084fe', icon: 'Soleil', cat: 'Actualités' },
  { name: 'Daily Stock Tracker', desc: 'Prices, sentiment, and catalysts for your watchlist every day.', chip: '#ff6700', icon: 'Symbole du dollar', cat: 'Finance' },
  { name: 'Email Auto-Responder', desc: 'Draft concise replies for important email threads each morning.', chip: '#ff309b', icon: 'Courrier', cat: 'Productivité' },
  { name: 'Weekly Review', desc: 'Wrap the week: what you did, loose ends, and next priorities.', chip: '#ff309b', icon: 'Porte-bloc', cat: 'Productivité', freq: 'weekly' },
  { name: 'AI News Digest', desc: 'Model releases, research, and funding that actually matter.', chip: '#1084fe', icon: 'Processeur', cat: 'Actualités' },
  { name: 'X Trends Digest', desc: 'The five most interesting conversations on X right now.', chip: '#1084fe', icon: 'Flamme', cat: 'Actualités' },
  { name: 'Competitor Watch', desc: 'Weekly digest of competitor launches, pricing, and hires.', chip: '#9159fe', icon: 'Lunettes', cat: 'Recherche', freq: 'weekly' },
  { name: 'Task Extractor', desc: 'Extract action items from recent messages and summarize next steps.', chip: '#ff309b', icon: 'Note autocollante', cat: 'Productivité' },
  { name: 'Daily Planner', desc: 'A realistic plan for today with focus blocks and quick wins.', chip: '#ff309b', icon: 'Calendrier', cat: 'Productivité' },
  { name: 'Earnings Calendar', desc: 'Who reports this week, expectations, and what to watch.', chip: '#ff6700', icon: 'Calendrier', cat: 'Finance', freq: 'weekly' },
  { name: 'Portfolio News Scan', desc: 'Only material news for your holdings — earnings, ratings, lawsuits.', chip: '#ff6700', icon: 'Mallette', cat: 'Finance' },
  { name: 'Paper Watch', desc: 'The week’s most interesting research, explained in plain language.', chip: '#9159fe', icon: 'Microscope', cat: 'Recherche', freq: 'weekly' },
  { name: 'Weekend Deep Dive', desc: 'One briefing memo each week on a topic you’re following.', chip: '#9159fe', icon: 'Ampoule', cat: 'Recherche', freq: 'weekly' },
  { name: 'Workout Coach', desc: 'A daily 45-minute session that rotates through the week.', chip: '#1084fe', icon: 'Cœur', cat: 'Mode de vie' },
  { name: 'Meal Planner', desc: 'Seven weeknight dinners plus one consolidated grocery list.', chip: '#1084fe', icon: 'Ustensiles', cat: 'Mode de vie', freq: 'weekly' },
  { name: 'Language Practice', desc: 'A short daily lesson: vocabulary, one grammar point, translation.', chip: '#1084fe', icon: 'Globe', cat: 'Mode de vie' },
];

function AutoChip({ auto, size = 32 }: { auto: Pick<Auto, 'icon' | 'color' | 'bot'>; size?: number }) {
  const s = useStore();
  const bot = s.bots.find((b) => b.name === auto.bot);
  const Icon = AUTO_ICONS[auto.icon]?.[1] ?? Zap;
  // grok shows the running bot's mark (in its colour); a chosen icon or colour replaces it here.
  const mark = auto.icon === ICON_DEFAULT && !auto.color;
  return (
    <span className="grid shrink-0 place-items-center rounded-xl" style={{ width: size, height: size, background: C.base, color: auto.color || bot?.color || C.fg }}>
      {mark ? <BotMark color={bot?.color ?? '#ff9800'} shape={bot?.shape ?? 'blob'} className="size-5" /> : <Icon className="size-[18px]" strokeWidth={2} />}
    </span>
  );
}

const SENT_CHIP = 'inline-flex h-[27px] items-center gap-1 rounded-md bg-[rgba(252,252,252,0.08)] px-2 text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.12)] data-[state=open]:bg-[rgba(252,252,252,0.12)]';

/** "Quotidien ▾ à 7:10 PM": frequency chip, day chip (weekly / monthly), time popover (Hour : Minute, AM / PM), trash. */
function TriggerRow({ t, onChange, onRemove }: { t: Trigger; onChange: (p: Partial<Trigger>) => void; onRemove: () => void }) {
  const ta = useCopy(COPY_AUTO);
  const ev = t.event && eventGroups().find((g) => g.group === t.event!.group);
  const pm = t.h >= 12;
  const h12 = ((t.h + 11) % 12) + 1;
  return (
    <div className="flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-[14px]" style={{ borderColor: C.line }}>
      {t.event ? (
        <>
          <span className="grid size-6 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: ev?.tile[1] }}>
            {ev?.tile[0]}
          </span>
          <span className="min-w-0 flex-1 truncate">
            {t.event.label}
            <span style={{ color: C.fg2 }}> · {groupLabel(t.event.group)}</span>
          </span>
        </>
      ) : (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <Menu
            align="start"
            className="w-[208px]"
            trigger={
              <button type="button" className={SENT_CHIP}>
                {t.freq && ta.freqs[t.freq][0]}
                <G d={P.chevron} className="size-3.5 opacity-70" />
              </button>
            }
          >
            <DM.RadioGroup value={t.freq} onValueChange={(v) => onChange({ freq: v as Freq, day: 0 })}>
              {FREQ_IDS.map((id) => (
                <RadioRow key={id} value={id}>
                  {ta.freqs[id][0]}
                </RadioRow>
              ))}
            </DM.RadioGroup>
          </Menu>
          {(t.freq === 'weekly' || t.freq === 'monthly') && (
            <>
              <span style={{ color: C.fg2 }}>{ta.on}</span>
              <Menu
                align="start"
                className="max-h-[280px] w-[160px] overflow-y-auto"
                trigger={
                  <button type="button" className={SENT_CHIP}>
                    {t.freq === 'weekly' ? ta.weekdays[t.day % 7] : t.day + 1}
                    <G d={P.chevron} className="size-3.5 opacity-70" />
                  </button>
                }
              >
                <DM.RadioGroup value={String(t.day)} onValueChange={(v) => onChange({ day: Number(v) })}>
                  {(t.freq === 'weekly' ? ta.weekdays : Array.from({ length: 28 }, (_, i) => String(i + 1))).map((d, i) => (
                    <RadioRow key={d} value={String(i)}>
                      {d}
                    </RadioRow>
                  ))}
                </DM.RadioGroup>
              </Menu>
            </>
          )}
          <span style={{ color: C.fg2 }}>{ta.at}</span>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button type="button" className={cn(SENT_CHIP, 'tabular-nums')}>
                {t.freq === 'hourly' ? `:${String(t.m).padStart(2, '0')}` : fmtTime(t.h, t.m)}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content align="start" sideOffset={6} className="grok-root grok-pop-in z-[60] flex h-[46px] w-[195px] items-center gap-1 rounded-2xl border px-2 outline-none" style={SURFACE}>
                <input aria-label="Hour" inputMode="numeric" value={h12} disabled={t.freq === 'hourly'} onChange={(e) => onChange({ h: (Math.min(12, Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1)) % 12) + (pm ? 12 : 0) })} className="h-8 w-9 rounded-lg bg-[rgba(252,252,252,0.06)] text-center text-[14px] tabular-nums outline-none focus:ring-1 focus:ring-[#299fff] disabled:opacity-40" />
                <span style={{ color: C.fg2 }}>:</span>
                <input aria-label="Minute" inputMode="numeric" value={String(t.m).padStart(2, '0')} onChange={(e) => onChange({ m: Math.min(59, Number(e.target.value.replace(/\D/g, '').slice(-2)) || 0) })} className="h-8 w-9 rounded-lg bg-[rgba(252,252,252,0.06)] text-center text-[14px] tabular-nums outline-none focus:ring-1 focus:ring-[#299fff]" />
                {(['AM', 'PM'] as const).map((p) => (
                  <button key={p} type="button" disabled={t.freq === 'hourly'} onClick={() => onChange({ h: (t.h % 12) + (p === 'PM' ? 12 : 0) })} className={cn('h-8 rounded-lg px-2 text-[13px] font-medium transition-colors disabled:opacity-40', (p === 'PM') === pm ? 'bg-[rgba(252,252,252,0.12)] text-[#fcfcfc]' : 'text-[#9e9e9e] hover:text-[#fcfcfc]')}>
                    {p}
                  </button>
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      )}
      <Tip label={ta.removeTrigger}>
        <button type="button" aria-label={ta.removeTrigger} onClick={onRemove} className="grid size-7 shrink-0 place-items-center rounded-lg transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
          <Trash2 className="size-4" strokeWidth={2} />
        </button>
      </Tip>
    </div>
  );
}

type AutoForm = Omit<Auto, 'id' | 'bot' | 'paused'>;
const blankForm = (): AutoForm => ({ name: copyOf(COPY_AUTO).newName, icon: ICON_DEFAULT, color: '', triggers: [], instructions: '', app: true, mail: true, model: 'auto' });

/** A 400px nested list dialog (Connecteurs / Compétences) with its "Gérer …" link row. */
function PickListDialog({ open, onOpenChange, title, emptyText, manage, onManage, items, chosen, onToggle }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; emptyText: string; manage: string; onManage: () => void; items: string[]; chosen: string[]; onToggle: (n: string) => void }) {
  return (
    <GDialog open={open} onOpenChange={onOpenChange} title={title} width={400} z={60}>
      <div className="px-4 pt-4 pb-2 text-[14px] font-[550]">{title}</div>
      {items.length ? (
        <div className="flex flex-col gap-px px-2 pb-2">
          {items.map((n) => (
            <label key={n} className="flex h-9 cursor-pointer items-center gap-2 rounded-[10px] px-2 text-[14px] hover:bg-[rgba(252,252,252,0.06)]">
              <input type="checkbox" checked={chosen.includes(n)} onChange={() => onToggle(n)} className="size-4 accent-[#299fff]" />
              <LogoTile name={n} size={20} />
              {n}
            </label>
          ))}
        </div>
      ) : (
        <p className="px-4 pb-3 text-[14px]" style={{ color: C.fg3 }}>
          {emptyText}
        </p>
      )}
      <div className="px-2 pb-2">
        <button type="button" onClick={onManage} className="flex h-9 w-full items-center gap-2 rounded-[10px] px-2.5 text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.12)]" style={{ background: 'rgba(252,252,252,0.08)' }}>
          <G d={P.settings} className="size-4" />
          <span className="flex-1 text-start">{manage}</span>
          <SquareArrowOutUpRight className="size-4" strokeWidth={2} style={{ color: C.fg2 }} />
        </button>
      </div>
    </GDialog>
  );
}

function AutomationDialog({ open, editing, seed, onClose }: { open: boolean; editing: Auto | null; seed: Partial<AutoForm> | null; onClose: () => void }) {
  const s = useStore();
  const ta = useCopy(COPY_AUTO);
  const tc = useCopy(COPY_CORE);
  const tk = useCopy(COPY_COMPOSER);

  const [f, setF] = useState<AutoForm>(blankForm);
  const [start, setStart] = useState('');
  const [guard, setGuard] = useState(false);
  const [skipGuard, setSkipGuard] = useState(false);
  const [never, setNever] = useState(false);
  const [list, setList] = useState<'connectors' | 'skills' | null>(null);
  const [conns, setConns] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    const init: AutoForm = editing ? { name: editing.name, icon: editing.icon, color: editing.color, triggers: editing.triggers, instructions: editing.instructions, app: editing.app, mail: editing.mail, model: editing.model } : { ...blankForm(), ...seed };
    setF(init);
    setStart(JSON.stringify(init));
    setConns([]);
    setFiles([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (p: Partial<AutoForm>) => setF((x) => ({ ...x, ...p }));
  const dirty = JSON.stringify(f) !== start;
  const valid = !!f.name.trim() && f.triggers.length > 0 && !!f.instructions.trim();
  const tryClose = () => (dirty && !skipGuard ? setGuard(true) : onClose());
  const save = () => {
    if (!valid) return;
    const main = s.bots.find((b) => b.main) ?? s.bots[0];
    if (editing) s.setAutos((a) => a.map((x) => (x.id === editing.id ? { ...x, ...f, name: f.name.trim() } : x)));
    else s.setAutos((a) => [{ id: newId('a'), bot: main?.name ?? 'Grok', ...f, name: f.name.trim() }, ...a]);
    toast(editing ? ta.saved : ta.created);
    onClose();
  };
  const Icon = AUTO_ICONS[f.icon][1];
  const addTrigger = (t: Omit<Trigger, 'id'>) => set({ triggers: [...f.triggers, { ...t, id: newId('t') }] });
  const sectionLabel = 'text-[13px] leading-5 font-[550]';
  return (
    <>
      <GDialog
        open={open}
        onOpenChange={(o) => !o && tryClose()}
        title={editing ? ta.editTitle : ta.newTitle}
        showTitle
        width={520}
        height={640}
      >
        <div className="grok-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-[19px] pt-3 pb-4">
          <div className="flex gap-2">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button type="button" aria-label={ta.changeIcon} className="grid size-11 shrink-0 place-items-center rounded-xl border transition-colors hover:bg-[rgba(252,252,252,0.04)]" style={{ borderColor: 'rgba(252,252,252,0.1)', color: f.color || C.fg }}>
                  <Icon className="size-5" strokeWidth={2} />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content align="start" sideOffset={6} collisionPadding={8} className="grok-root grok-pop-in z-[60] flex w-[378px] max-w-[calc(100vw-16px)] flex-col rounded-2xl border outline-none" style={SURFACE}>
                  <div className="grok-scroll grid max-h-[300px] grid-cols-10 gap-0.5 overflow-y-auto p-2">
                    {AUTO_ICONS.map(([label, I], i) => (
                      <Tip key={label} label={ta.iconNames[label] ?? label} delay={400}>
                        <button type="button" aria-label={ta.iconNames[label] ?? label} aria-pressed={f.icon === i} onClick={() => set({ icon: i })} className={cn('grid size-8 place-items-center rounded-xl transition-colors hover:bg-[rgba(252,252,252,0.06)]', f.icon === i && 'bg-[rgba(252,252,252,0.1)]')} style={{ color: f.icon === i ? f.color || C.fg : C.fg2 }}>
                          <I className="size-4" strokeWidth={2} />
                        </button>
                      </Tip>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-0.5 border-t px-3 py-2" style={{ borderColor: C.line }}>
                    {AUTO_COLORS.map(([label, hex]) => (
                      <Tip key={label} label={ta.colorNames[label] ?? label} delay={400}>
                        <button type="button" aria-label={ta.colorNames[label] ?? label} aria-pressed={f.color === hex} onClick={() => set({ color: hex })} className={cn('grid size-8 place-items-center rounded-full border-2 p-[2px] transition-colors duration-150', f.color === hex ? 'border-current' : 'border-transparent')} style={{ color: hex || C.fg2 }}>
                          <span className="size-4 rounded-full" style={hex ? { background: hex } : { border: `1.5px solid ${C.fg2}` }} />
                        </button>
                      </Tip>
                    ))}
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <input aria-label={ta.autoName} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder={ta.newName} className={cn(INPUT, 'h-11 py-1 text-[15px]')} />
          </div>

          <section className="flex flex-col gap-2">
            <div className={sectionLabel} style={{ color: C.fg2 }}>
              {ta.triggers}
            </div>
            {f.triggers.map((t) => (
              <TriggerRow key={t.id} t={t} onChange={(p) => set({ triggers: f.triggers.map((x) => (x.id === t.id ? { ...x, ...p } : x)) })} onRemove={() => set({ triggers: f.triggers.filter((x) => x.id !== t.id) })} />
            ))}
            <DM.Root modal={false}>
              <DM.Trigger asChild>
                <button type="button" className="flex h-[43px] w-full items-center gap-2 rounded-full border border-dashed px-3 text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.04)] data-[state=open]:bg-[rgba(252,252,252,0.04)]" style={{ borderColor: 'rgba(252,252,252,0.1)', color: C.fg2 }}>
                  <G d={P.plus} className="size-4" />
                  {ta.addTrigger}
                </button>
              </DM.Trigger>
              <DM.Portal>
                <DM.Content align="start" sideOffset={4} collisionPadding={8} className={cn(MENU, 'grok-scroll max-h-[min(512px,var(--radix-dropdown-menu-content-available-height))] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto')} style={SURFACE}>
                  <DM.Label className="px-2 pt-2 pb-1 text-[12px]" style={{ color: C.fg2 }}>
                    {ta.general}
                  </DM.Label>
                  {FREQ_IDS.map((id) => (
                    <DM.Item key={id} onSelect={() => addTrigger({ freq: id, h: 19, m: 10, day: 0 })} className={cn(ROW, 'h-auto min-h-[38px] gap-2.5 py-1')}>
                      <span className="grid size-7 shrink-0 place-items-center rounded-full" style={{ background: 'rgba(252,252,252,0.08)', color: C.fg2 }}>
                        <AlarmClock className="size-4" strokeWidth={2} />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-[14px] leading-5 font-medium">{ta.freqs[id][0]}</span>
                        <span className="truncate text-[13px] leading-[18px]" style={{ color: C.fg3 }}>
                          {ta.freqs[id][1]}
                        </span>
                      </span>
                    </DM.Item>
                  ))}
                  {eventGroups().map((g) => (
                    <Fragment key={g.group}>
                      <DM.Label className="px-2 pt-2 pb-1 text-[12px]" style={{ color: C.fg2 }}>
                        {groupLabel(g.group)}
                      </DM.Label>
                      {g.items.map((it) => (
                        <DM.Item key={it.label} onSelect={() => addTrigger({ event: { group: g.group, label: it.label }, h: 9, m: 0, day: 0 })} className={cn(ROW, 'h-auto min-h-[38px] gap-2.5 py-1')}>
                          <span className="grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: g.tile[1] }}>
                            {g.group === 'Finance' ? <Landmark className="size-3.5" strokeWidth={2} /> : g.group === 'Avancé' ? <Webhook className="size-3.5" strokeWidth={2} /> : g.tile[0]}
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="text-[14px] leading-5 font-medium">{it.label}</span>
                            <span className="truncate text-[13px] leading-[18px]" style={{ color: C.fg3 }}>
                              {it.desc}
                            </span>
                          </span>
                        </DM.Item>
                      ))}
                    </Fragment>
                  ))}
                </DM.Content>
              </DM.Portal>
            </DM.Root>
          </section>

          <section className="flex flex-col gap-2">
            <div className={sectionLabel} style={{ color: C.fg2 }}>
              {ta.instructions}
            </div>
            <div className="flex flex-col rounded-2xl border focus-within:border-[rgba(252,252,252,0.1)]" style={{ borderColor: C.line }}>
              <textarea value={f.instructions} onChange={(e) => set({ instructions: e.target.value })} placeholder={ta.instrPlaceholder} aria-label={ta.instructions} className="grok-scroll h-[82px] resize-none bg-transparent px-3 pt-2 text-[14px] leading-[24.5px] outline-none placeholder:text-[#9e9e9e]" />
              {files.length > 0 && (
                <div className="flex flex-wrap gap-1 px-2 pb-1">
                  {files.map((n, i) => (
                    <span key={`${n}-${i}`} className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[12px]" style={{ background: C.raised }}>
                      <FileText className="size-3" strokeWidth={2} />
                      {n}
                    </span>
                  ))}
                </div>
              )}
              <input ref={file} type="file" multiple hidden onChange={(e) => (e.target.files && setFiles((x) => [...x, ...Array.from(e.target.files!, (y) => y.name)]), (e.target.value = ''))} />
              <div className="flex items-center gap-1 px-2 pb-2">
                <Menu
                  align="start"
                  className="w-[208px]"
                  trigger={
                    <button type="button" aria-label={tk.attach} className="grid size-7 place-items-center rounded-full transition-colors hover:bg-[rgba(252,252,252,0.06)] data-[state=open]:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg2 }}>
                      <G d={P.plus} className="size-4" />
                    </button>
                  }
                >
                  <MenuItem tall icon={<G d={P.docPlus} className="size-4" />} onSelect={() => file.current?.click()}>
                    {tk.uploadFile}
                  </MenuItem>
                  <SubMenu icon={<G d={P.doc} className="size-4" />} label={tk.recentFilesLabel} width={286}>
                    {tc.recentFiles.map((n) => (
                      <MenuItem key={n} tall icon={<G d={P.doc} className="size-4" />} onSelect={() => setFiles((x) => [...x, n])}>
                        {n}
                      </MenuItem>
                    ))}
                  </SubMenu>
                </Menu>
                <button type="button" onClick={() => setList('connectors')} className="flex h-7 items-center gap-1 rounded-full px-2 text-[13px] transition-colors hover:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg2 }}>
                  <G d={P.connectors} className="size-4" />
                  {ta.connectors}
                  <span className="tabular-nums">{conns.length}</span>
                </button>
                <button type="button" onClick={() => setList('skills')} className="flex h-7 items-center gap-1 rounded-full px-2 text-[13px] transition-colors hover:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg2 }}>
                  <G d={P.skills} className="size-4" />
                  {ta.skills}
                  <span className="tabular-nums">0</span>
                </button>
                <Menu
                  align="end"
                  className="ms-auto w-[198px]"
                  trigger={
                    <button type="button" aria-label={tk.model(tc.models[f.model as ModelId])} className="ms-auto flex h-7 items-center gap-1 rounded-full px-2 text-[13px] font-medium transition-colors hover:bg-[rgba(252,252,252,0.06)] data-[state=open]:bg-[rgba(252,252,252,0.06)]" style={{ color: C.fg2 }}>
                      {tc.models[f.model as ModelId]}
                      <G d={P.chevron} className="size-3.5" />
                    </button>
                  }
                >
                  <DM.RadioGroup value={f.model} onValueChange={(v) => set({ model: v })}>
                    {AUTO_MODELS.map(([m, icon]) => (
                      <RadioRow key={m} value={m}>
                        <span className="grid size-4 place-items-center" style={{ color: C.fg2 }}>
                          {icon}
                        </span>
                        {tc.models[m]}
                      </RadioRow>
                    ))}
                  </DM.RadioGroup>
                </Menu>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-1">
            <div className={sectionLabel} style={{ color: C.fg2 }}>
              {ta.notifications}
            </div>
            {(
              [
                ['app', ta.notifApp, <Bell key="b" className="size-4" strokeWidth={2} />],
                ['mail', ta.notifMail, <Mail key="m" className="size-4" strokeWidth={2} />],
              ] as const
            ).map(([k, label, icon]) => (
              <div key={k} className="flex h-10 items-center gap-2 text-[14px]">
                <span style={{ color: C.fg2 }}>{icon}</span>
                <span className="flex-1">{label}</span>
                <Toggle label={label} checked={f[k]} onChange={(v) => set({ [k]: v })} />
              </div>
            ))}
          </section>
        </div>
        <div className="flex shrink-0 items-center justify-between border-t px-[19px] py-3" style={{ borderColor: C.line }}>
          <button type="button" onClick={tryClose} className={BTN_LINE}>
            {ta.cancel}
          </button>
          <button type="button" disabled={!valid} onClick={save} className={cn(BTN_WHITE, 'rounded-xl')}>
            {ta.save}
          </button>
        </div>
        <PickListDialog
          open={list !== null}
          onOpenChange={(o) => !o && setList(null)}
          title={list === 'skills' ? ta.skills : ta.connectors}
          emptyText={list === 'skills' ? ta.noSkills : ta.noConnectors}
          manage={list === 'skills' ? ta.manageSkills : ta.manageConnectors}
          onManage={() => {
            const t = list === 'skills' ? 'skills' : 'connectors';
            setList(null);
            s.ui.plugins(t);
          }}
          items={list === 'connectors' ? s.connected : []}
          chosen={conns}
          onToggle={(n) => setConns((c) => (c.includes(n) ? c.filter((x) => x !== n) : [...c, n]))}
        />
      </GDialog>
      <GDialog open={guard} onOpenChange={setGuard} title={ta.discardTitle} width={400} z={65}>
        <div className="flex flex-col gap-2 p-4">
          <p aria-hidden="true" className="pe-9 text-[15px] leading-[22.5px] font-[550]">
            {ta.discardTitle}
          </p>
          <p className="text-[14px] leading-5" style={{ color: C.fg2 }}>
            {ta.discardBody}
          </p>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-[14px]">
            <input type="checkbox" checked={never} onChange={(e) => setNever(e.target.checked)} className="size-5 accent-[#299fff]" />
            {ta.dontShow}
          </label>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setGuard(false)} className={BTN_LINE}>
              {ta.keepEditing}
            </button>
            <button
              type="button"
              onClick={() => {
                if (never) setSkipGuard(true);
                setGuard(false);
                onClose();
              }}
              className={cn(BTN_WHITE, 'rounded-xl')}
            >
              {ta.discard}
            </button>
          </div>
        </div>
      </GDialog>
    </>
  );
}

const PAGE = 8;

function AutomationsPage({ lead }: { lead?: ReactNode }) {
  const s = useStore();
  const ta = useCopy(COPY_AUTO);

  const [tab, setTab] = useState<'list' | 'runs'>('list');
  const [page, setPage] = useState(0);
  const [cat, setCat] = useState('Tout');
  const [dlg, setDlg] = useState<{ editing: Auto | null; seed: Partial<AutoForm> | null } | null>(null);
  const pages = Math.max(1, Math.ceil(s.autos.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const rows = s.autos.slice(cur * PAGE, cur * PAGE + PAGE);
  const cols = 'grid grid-cols-[minmax(0,1fr)_92px_36px] md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,0.8fr)_92px_36px] items-center gap-3 px-3';
  const fromTemplate = (t: (typeof AUTO_TEMPLATES)[number]) =>
    setDlg({ editing: null, seed: { name: t.name, icon: iconIndex(t.icon), color: t.chip, instructions: t.desc, triggers: [{ id: newId('t'), freq: t.freq ?? 'daily', h: 8, m: 0, day: 0 }] } });
  return (
    <div className="grok-scroll h-full overflow-y-auto">
      <h1 className="sr-only">{ta.autos}</h1>
      <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-6 px-5 pt-[60px] pb-16">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {lead}
            <PillTabs
              label={ta.autos}
              value={tab}
              onChange={setTab}
              tabs={[
                ['list', ta.autos],
                ['runs', ta.runs],
              ]}
            />
          </div>
          <button type="button" aria-label={ta.newAuto} onClick={() => setDlg({ editing: null, seed: null })} className={BTN_WHITE}>
            <G d={P.plus} className="size-4" />
            <span className="max-sm:hidden">{ta.newAuto}</span>
          </button>
        </div>

        {tab === 'runs' ? (
          <div className="rounded-2xl border py-16 text-center text-[14px]" style={{ background: C.side, borderColor: C.line, color: C.fg2 }}>
            {ta.noRuns}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border p-1.5" style={{ background: C.side, borderColor: C.line }}>
              <div className={cn(cols, 'h-9 text-[13px]')} style={{ color: C.fg2 }}>
                <span>{ta.colAuto}</span>
                <span className="max-md:hidden">{ta.colSchedule}</span>
                <span className="max-md:hidden">{ta.colNext}</span>
                <span>{ta.colStatus}</span>
                <span />
              </div>
              {rows.length === 0 && (
                <p className="py-10 text-center text-[14px]" style={{ color: C.fg2 }}>
                  {ta.noneYet}
                </p>
              )}
              {rows.map((a) => (
                <div key={a.id} role="button" tabIndex={0} onClick={() => setDlg({ editing: a, seed: null })} onKeyDown={(e) => e.key === 'Enter' && setDlg({ editing: a, seed: null })} className={cn(cols, 'h-[52px] cursor-pointer rounded-[10px] transition-colors outline-none hover:bg-[#201f1d] focus-visible:bg-[#201f1d]')}>
                  <span className="flex min-w-0 items-center gap-3">
                    <AutoChip auto={a} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[14px] leading-5 font-medium">{a.name}</span>
                      <span className="truncate text-[13px] leading-[18px]" style={{ color: C.fg2 }}>
                        {a.bot}
                      </span>
                    </span>
                  </span>
                  <span className="truncate text-[13px] max-md:hidden" style={{ color: C.fg2 }}>
                    {scheduleOf(a)}
                  </span>
                  <span className="truncate text-[13px] tabular-nums max-md:hidden" style={{ color: C.fg2 }}>
                    {nextRunOf(a)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[13px]" style={{ color: a.paused ? C.fg2 : C.fg }}>
                    {a.paused ? <CirclePause className="size-3.5" strokeWidth={2} /> : <CircleCheck className="size-3.5 fill-[#8ce38f] text-[#181716]" strokeWidth={2.5} />}
                    {a.paused ? ta.paused : ta.active}
                  </span>
                  <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="flex justify-end">
                    <Menu
                      align="end"
                      className="w-[208px]"
                      trigger={
                        <button type="button" aria-label={ta.moreActions} className="grid size-6 place-items-center rounded-lg transition-colors hover:bg-[rgba(252,252,252,0.08)] hover:text-[#fcfcfc] data-[state=open]:bg-[rgba(252,252,252,0.08)]" style={{ color: C.fg2 }}>
                          <Ellipsis className="size-4" strokeWidth={2} />
                        </button>
                      }
                    >
                      <MenuItem tall icon={<G d={P.edit} className="size-4" />} onSelect={() => setDlg({ editing: a, seed: null })}>
                        {ta.edit}
                      </MenuItem>
                      <MenuItem tall icon={a.paused ? <Play className="size-4" strokeWidth={2} /> : <Pause className="size-4" strokeWidth={2} />} onSelect={() => s.setAutos((x) => x.map((y) => (y.id === a.id ? { ...y, paused: !y.paused } : y)))}>
                        {a.paused ? ta.resume : ta.pause}
                      </MenuItem>
                      <DM.Item onSelect={() => s.setAutos((x) => x.filter((y) => y.id !== a.id))} className={cn(ROW, 'h-8')} style={{ color: '#f2787e' }}>
                        <MenuIcon danger>
                          <Trash2 className="size-4" strokeWidth={2} />
                        </MenuIcon>
                        {ta.delete}
                      </DM.Item>
                    </Menu>
                  </span>
                </div>
              ))}
              {s.autos.length > 0 && (
                <div className="flex h-9 items-center justify-end gap-1 px-2 text-[13px] tabular-nums" style={{ color: C.fg2 }}>
                  <span className="me-1">
                    {ta.range(cur * PAGE + 1, Math.min(s.autos.length, cur * PAGE + PAGE), s.autos.length)}
                  </span>
                  <button type="button" aria-label={ta.prevPage} disabled={cur === 0} onClick={() => setPage(cur - 1)} className="grid size-6 place-items-center rounded-lg transition-colors hover:bg-[rgba(252,252,252,0.08)] disabled:pointer-events-none disabled:opacity-30">
                    <ChevronLeft className="size-4" strokeWidth={2} />
                  </button>
                  <button type="button" aria-label={ta.nextPage} disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="grid size-6 place-items-center rounded-lg transition-colors hover:bg-[rgba(252,252,252,0.08)] disabled:pointer-events-none disabled:opacity-30">
                    <ChevronRight className="size-4" strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>

            <section className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="ps-3 text-[15px] leading-[22.5px] font-[550]">{ta.templates}</h2>
                <PillTabs label={ta.templateCats} size={28} value={cat} onChange={setCat} tabs={['Tout', 'Actualités', 'Productivité', 'Finance', 'Recherche', 'Mode de vie'].map((c) => [c, ta.catNames[c] ?? c] as const)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2">
                {AUTO_TEMPLATES.filter((t) => cat === 'Tout' || t.cat === cat).map((t) => {
                  const I = AUTO_ICONS[iconIndex(t.icon)][1];
                  return (
                    <button key={t.name} type="button" aria-label={ta.addNamed(t.name)} onClick={() => fromTemplate(t)} className="grok-fade flex h-16 items-center gap-3 rounded-2xl p-3 text-start transition-colors hover:bg-[#201f1d]">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: t.chip }}>
                        <I className="size-4" strokeWidth={2} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[14px] leading-5 font-medium">{t.name}</span>
                        <span className="truncate text-[14px] leading-5" style={{ color: C.fg2 }}>
                          {t.desc}
                        </span>
                      </span>
                      <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-[rgba(252,252,252,0.08)] px-3 text-[14px] font-medium">{ta.add}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
      <AutomationDialog open={!!dlg} editing={dlg?.editing ?? null} seed={dlg?.seed ?? null} onClose={() => setDlg(null)} />
    </div>
  );
}

/* ---------- Plugins: Connecteurs / Compétences / Bots in one 1000px modal ---------- */

const hueOf = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
/** Connector name -> colour logo in public/logos (SVG, or WebP where the brand only ships a raster icon). Dark marks use their light variant so they read on the dark modal. */
const LOGOS: Record<string, string> = {
  Finance: 'finance.svg',
  Gmail: 'gmail.svg',
  'Google Calendar': 'google-calendar.svg',
  'Google Drive': 'google-drive.svg',
  GitHub: 'github.svg',
  Box: 'box.svg',
  Canva: 'canva.svg',
  Notion: 'notion.svg',
  Shopify: 'shopify.svg',
  Stripe: 'stripe.svg',
  Vercel: 'vercel.svg',
  Wix: 'wix.svg',
  'X Ads': 'x.svg',
  'Google Cloud BigQuery': 'google-bigquery.svg',
  Datadog: 'datadog.svg',
  Excalidraw: 'excalidraw.svg',
  Mixpanel: 'mixpanel.svg',
  Netlify: 'netlify.svg',
  'Bigdata.com': 'bigdata.webp',
  Coinbase: 'coinbase.svg',
  Daloopa: 'daloopa.webp',
  Finary: 'finary.webp',
  'Interactive Brokers (IBKR)': 'interactive-brokers.svg',
  Robinhood: 'robinhood.svg',
  'S&P Global': 'sp-global.webp',
  'Scalable Capital': 'scalable-capital.webp',
  Webull: 'webull.webp',
  'X Money': 'x.svg',
  etoro: 'etoro.svg',
  Outlook: 'microsoft-outlook.svg',
  'Outlook Calendar': 'outlook-calendar.svg',
  Asana: 'asana.svg',
  Calendly: 'calendly.svg',
  ClickUp: 'clickup.svg',
  Figma: 'figma.svg',
  Gamma: 'gamma.svg',
  'HyperFrames by HeyGen': 'hyperframes.svg',
  Linear: 'linear.svg',
  'Microsoft Teams': 'microsoft-teams.svg',
  'RingCentral Chat': 'ringcentral.webp',
  'RingCentral Phone': 'ringcentral.webp',
  Whop: 'whop.svg',
  HubSpot: 'hubspot.svg',
  Meltwater: 'meltwater.webp',
  Buffer: 'buffer.svg',
};
/** The connector's logo from public/logos; a connector without one (e.g. a custom one) gets a rounded tile in a stable colour with the name's initial. */
function LogoTile({ name, size = 24 }: { name: string; size?: number }) {
  const logo = LOGOS[name];
  if (logo) {
    return <img src={`${import.meta.env.BASE_URL}logos/${logo}`} alt="" aria-hidden="true" draggable={false} className="shrink-0 rounded-md object-contain" style={{ width: size, height: size }} />;
  }
  return (
    <span aria-hidden="true" className="grid shrink-0 place-items-center rounded-md font-bold text-white" style={{ width: size, height: size, fontSize: Math.round(size * 0.5), background: `hsl(${hueOf(name)} 55% 42%)` }}>
      {name.replace(/^[^A-Za-z0-9]+/, '').charAt(0).toUpperCase()}
    </span>
  );
}

type Conn = { name: string; desc: string; cat: string; intro?: string };
const connsOf = (cat: string, list: [string, string][]): Conn[] => list.map(([name, desc]) => ({ name, desc, cat }));
const CONNECTORS: Conn[] = [
  ...connsOf('À la une', [
    ['Finance', 'Consulter vos comptes et transactions'],
    ['Gmail', 'Rechercher et rédiger des e-mails'],
    ['Google Calendar', 'Vérifier votre emploi du temps'],
    ['Google Drive', 'Rechercher dans vos fichiers'],
    ['GitHub', 'Rechercher les dépôts et les PRs'],
    ['Box', 'Accéder à vos documents'],
    ['Canva', 'Créer et modifier des designs'],
    ['Notion', 'Rechercher dans vos pages'],
    ['Shopify', 'Gérer votre boutique'],
    ['Stripe', 'Consulter les paiements'],
    ['Vercel', 'Suivre vos déploiements'],
    ['Wix', 'Gérer votre site'],
  ]),
  ...connsOf('Advertising', [['X Ads', 'Analyser vos campagnes']]),
  ...connsOf('Analytics', [['Google Cloud BigQuery', 'Interroger vos données']]),
  ...connsOf('Developer', [
    ['Datadog', 'Surveiller vos services'],
    ['Excalidraw', 'Dessiner des schémas'],
    ['Mixpanel', 'Analyser l’usage produit'],
    ['Netlify', 'Gérer vos sites'],
  ]),
  ...connsOf('Finance', [
    ['Bigdata.com', 'Rechercher des données de marché'],
    ['Coinbase', 'Consulter vos actifs crypto'],
    ['Daloopa', 'Extraire des données financières'],
    ['Finary', 'Suivre votre patrimoine'],
    ['Interactive Brokers (IBKR)', 'Consulter votre portefeuille'],
    ['Robinhood', 'Consulter votre portefeuille'],
    ['S&P Global', 'Accéder aux données de marché'],
    ['Scalable Capital', 'Consulter votre portefeuille'],
    ['Webull', 'Consulter votre portefeuille'],
    ['X Money', 'Consulter vos paiements'],
    ['etoro', 'Consulter votre portefeuille'],
  ]),
  ...connsOf('Productivity', [
    ['Outlook', 'Rechercher et rédiger des e-mails'],
    ['Outlook Calendar', 'Vérifier votre emploi du temps'],
    ['Asana', 'Suivre vos projets et tâches'],
    ['Calendly', 'Gérer vos rendez-vous'],
    ['ClickUp', 'Suivre vos tâches'],
    ['Figma', 'Consulter vos fichiers de design'],
    ['Gamma', 'Créer des présentations'],
    ['HyperFrames by HeyGen', 'Créer des vidéos'],
    ['Linear', 'Suivre les tickets'],
    ['Microsoft Teams', 'Rechercher dans vos conversations'],
    ['RingCentral Chat', 'Rechercher dans vos messages'],
    ['RingCentral Phone', 'Consulter vos appels'],
    ['Whop', 'Gérer vos produits'],
  ]),
  ...connsOf('Sales', [
    ['HubSpot', 'Consulter votre CRM'],
    ['Meltwater', 'Suivre vos mentions'],
  ]),
  ...connsOf('Social Media', [['Buffer', 'Programmer vos publications']]),
];
const SKILLS: [string, string][] = [
  ['Word Documents', 'Create, edit, and format Word documents'],
  ['PDFs', 'Create, merge, split, and extract from PDFs'],
  ['Presentations', 'Build slide decks from an outline or a document'],
  ['Skill Creator', 'Create new skills from a short description'],
  ['Spreadsheets', 'Create, analyze, and chart spreadsheets'],
];

type DirBot = { name: string; by: string; desc: string; color: string; shape: BotShape; cat: string };
const DIR_CATS = ['Tous', 'From Grok Bot Team', 'Sales', 'Marketing', 'Recruiting & People', 'Operations', 'Engineering', 'Product', 'Design', 'Personal'];
const dirOf = (cat: string, by: string, list: [string, string, string, BotShape][]): DirBot[] => list.map(([name, desc, color, shape]) => ({ name, desc, color, shape, by, cat }));
const DIRECTORY: DirBot[] = [
  ...dirOf('From Grok Bot Team', 'Grok Bot Team', [
    ['Research Assistant', 'Deep dives with sources, summarised in minutes.', '#1084fe', 'sparkle'],
    ['Inbox Helper', 'Triage, summarise and draft replies to your email.', '#ff309b', 'cloud'],
    ['Slide Maker', 'Turn notes into a clean slide deck.', '#ff6700', 'tablet'],
    ['Daily Briefer', 'Your morning: calendar, news and to-dos.', '#00c972', 'flower'],
  ]),
  ...dirOf('Sales', 'Studio Lumen', [
    ['Prospect Finder', 'Find and qualify leads that match your ideal customer.', '#ff9800', 'star'],
    ['Deal Coach', 'Prepare calls and handle objections.', '#9159fe', 'hex'],
  ]),
  ...dirOf('Marketing', 'Atelier Pixel', [
    ['Campaign Planner', 'Plan multi-channel campaigns end to end.', '#ff263c', 'heart'],
    ['SEO Helper', 'Keyword ideas, briefs and on-page checks.', '#00bca6', 'clover'],
  ]),
  ...dirOf('Recruiting & People', 'Collectif Orbite', [
    ['Interview Prep', 'Structured interview guides for any role.', '#1084fe', 'square'],
    ['Onboarding Buddy', 'A friendly first-week plan for new hires.', '#ff309b', 'blob'],
  ]),
  ...dirOf('Operations', 'Studio Lumen', [
    ['Meeting Notes', 'Action items and decisions from any transcript.', '#777777', 'tablet'],
    ['Invoice Checker', 'Spot mismatches between invoices and orders.', '#936439', 'house'],
  ]),
  ...dirOf('Engineering', 'Atelier Pixel', [
    ['Code Reviewer', 'Careful reviews with concrete suggestions.', '#00c972', 'hex'],
    ['Incident Scribe', 'Timelines and post-mortems from incident chatter.', '#ff263c', 'wedge'],
  ]),
  ...dirOf('Product', 'Collectif Orbite', [
    ['Spec Writer', 'Clear specs from a rough idea.', '#9159fe', 'teardrop'],
    ['Roadmap Coach', 'Prioritise with impact, effort and confidence.', '#ff6700', 'sparkle'],
  ]),
  ...dirOf('Design', 'Atelier Pixel', [
    ['UX Critic', 'Heuristic reviews of screens and flows.', '#ff309b', 'flower'],
    ['Palette Picker', 'Accessible colour palettes for any mood.', '#ff9800', 'pumpkin'],
  ]),
  ...dirOf('Personal', 'Studio Lumen', [
    ['Travel Planner', 'Day-by-day itineraries that fit your pace.', '#00bca6', 'cloud'],
    ['Budget Buddy', 'A gentle monthly budget check-in.', '#00c972', 'square'],
  ]),
  ...dirOf('Autre', 'Communauté', [['Trivia Host', 'A quick quiz on any topic.', '#1084fe', 'star']]),
];

const ROW_CARD = 'flex min-h-[67px] items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-[rgba(252,252,252,0.06)] hover:bg-[#181716]';
const PILL_ADD = 'inline-flex h-6 shrink-0 items-center rounded-full bg-[rgba(252,252,252,0.08)] px-2.5 text-[13px] leading-4 font-medium transition-colors hover:bg-[rgba(252,252,252,0.12)] disabled:opacity-60';

function ConnectorDialog({ conn, onClose }: { conn: Conn | null; onClose: () => void }) {
  const s = useStore();
  const pl = useCopy(COPY_PLUG);

  const [busy, setBusy] = useState(false);
  const on = !!conn && s.connected.includes(conn.name);
  const [intro, f1, f3] = conn ? (conn.name === 'Gmail' ? pl.gmail : pl.introOf(conn.name)) : ['', '', ''];
  const toggle = () => {
    if (!conn) return;
    if (on) return s.setConnected((x) => x.filter((n) => n !== conn.name));
    setBusy(true);
    setTimeout(() => {
      s.setConnected((x) => [...x, conn.name]);
      setBusy(false);
      toast(pl.connectedToast(conn.name));
    }, 700);
  };
  return (
    <GDialog open={!!conn} onOpenChange={(o) => !o && onClose()} title={conn?.name ?? pl.connector} width={520} height={562} z={60}>
      {conn && (
        <div className="flex min-h-0 flex-1 flex-col gap-5 px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 pe-10">
            <span className="grid size-10 place-items-center rounded-lg p-1" style={{ background: C.side }}>
              <LogoTile name={conn.name} size={30} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="truncate text-[15px] leading-[22.5px] font-[550]">{conn.name}</h2>
              <span className="text-[13px]" style={{ color: C.fg2 }}>
                {conn.cat === 'À la une' ? 'Productivity' : (pl.cats[conn.cat] ?? conn.cat)}
              </span>
            </div>
            <button type="button" onClick={toggle} disabled={busy} className={on ? BTN_LINE : BTN_WHITE}>
              {busy && <span aria-hidden="true" className="grok-spin size-3.5 rounded-full border-2 border-black/20 border-t-black" />}
              {on ? pl.disconnect : pl.connect}
            </button>
          </div>
          <p className="text-[14px] leading-5" style={{ color: C.fg2 }}>
            {intro}
          </p>
          <div className="flex flex-col gap-4">
            <h4 className="text-[14px] font-medium" style={{ color: C.fg2 }}>
              {pl.aboutConn}
            </h4>
            {(
              [
                [<Search key="s" className="size-4" strokeWidth={2} />, f1, pl.findCite(conn.name)],
                [<Shield key="h" className="size-4" strokeWidth={2} />, pl.noTraining, pl.noTrainingBody],
                [<LockOpen key="l" className="size-4" strokeWidth={2} />, f3, pl.revoke],
              ] as const
            ).map(([icon, title, body]) => (
              <div key={title} className="flex gap-3">
                <span className="mt-0.5" style={{ color: C.fg2 }}>
                  {icon}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium">{title}</span>
                  <span className="text-[14px] leading-5" style={{ color: C.fg2 }}>
                    {body}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-auto text-[13px] leading-[18px]" style={{ color: C.fg2 }}>
            {pl.thirdParty}{' '}
            <a href="#" onClick={(e) => e.preventDefault()} className="underline underline-offset-2">
              {pl.privacy}
            </a>
            .
          </p>
        </div>
      )}
    </GDialog>
  );
}

/** "Nouveau connecteur" / "Nouvelle compétence": a name and a second field; the result lands in its tab. */
function QuickCreateDialog({ kind, onClose, onCreate }: { kind: 'connector' | 'skill' | null; onClose: () => void; onCreate: (name: string, extra: string) => void }) {
  const pl = useCopy(COPY_PLUG);
  const [name, setName] = useState('');
  const [extra, setExtra] = useState('');
  useEffect(() => {
    setName('');
    setExtra('');
  }, [kind]);
  const isConn = kind === 'connector';
  return (
    <GDialog open={!!kind} onOpenChange={(o) => !o && onClose()} title={isConn ? pl.newConnector : pl.newSkill} showTitle width={440} z={60}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onCreate(name.trim(), extra.trim());
        }}
        className="flex flex-col gap-3 px-5 pt-2 pb-5"
      >
        <label className="flex flex-col gap-1.5 text-[13px]" style={{ color: C.fg2 }}>
          {pl.name}
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={cn(INPUT, 'h-9')} placeholder={isConn ? pl.myMcp : pl.mySkill} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px]" style={{ color: C.fg2 }}>
          {isConn ? pl.mcpUrl : pl.description}
          <input value={extra} onChange={(e) => setExtra(e.target.value)} className={cn(INPUT, 'h-9')} placeholder={isConn ? 'https://mcp.example.com' : pl.skillPh} />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={BTN_LINE}>
            {pl.cancel}
          </button>
          <button type="submit" disabled={!name.trim()} className={cn(BTN_WHITE, 'rounded-xl')}>
            {pl.add}
          </button>
        </div>
      </form>
    </GDialog>
  );
}

function PluginsDialog({ tab, onTab, onClose }: { tab: PluginTab | null; onTab: (t: PluginTab) => void; onClose: () => void }) {
  const s = useStore();
  const pl = useCopy(COPY_PLUG);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tous');
  const [detail, setDetail] = useState<Conn | null>(null);
  const [skill, setSkill] = useState<string | null>(null);
  const [create, setCreate] = useState<'connector' | 'skill' | null>(null);
  const [custom, setCustom] = useState<Conn[]>([]);
  const [skills, setSkills] = useState<[string, string][]>(SKILLS);
  const [off, setOff] = useState<string[]>([]);
  useEffect(() => setQ(''), [tab]);
  const match = (...t: string[]) => t.some((x) => x.toLowerCase().includes(q.trim().toLowerCase()));
  const cta = { connectors: pl.newConnector, skills: pl.newSkill, bots: pl.newBot } as const;
  const conns = [...custom, ...CONNECTORS].filter((x) => match(x.name, pl.connDesc[x.desc] ?? x.desc));
  const cats = [...new Set(conns.map((x) => x.cat))];
  const added = (name: string) => s.bots.some((b) => b.name === name);
  const addBot = (b: DirBot) => {
    if (added(b.name)) return s.openBot(s.bots.find((x) => x.name === b.name)!.id);
    s.setBots((bs) => [...bs, { id: newId('b'), name: b.name, color: b.color, shape: b.shape, group: '', unread: true, desc: b.desc, title: b.cat }]);
    toast(pl.addedSidebar(b.name));
  };
  const dir = DIRECTORY.filter((b) => match(b.name, b.desc, b.by));
  const sections = [...new Set(dir.map((b) => b.cat))].filter((x) => cat === 'Tous' || x === cat);
  const h2 = 'ps-3 text-[15px] leading-[22.5px] font-[550]';
  return (
    <>
      <GDialog open={!!tab} onOpenChange={(o) => !o && onClose()} title="Plugins" width={1000} height="max(480px, min(1076px, calc(100dvh - 190px)))" radius={24} close={false}>
        <div className="grok-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-5 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PillTabs
              label="Plugins"
              value={tab ?? 'connectors'}
              onChange={onTab}
              tabs={[
                ['connectors', pl.tabConnectors],
                ['skills', pl.tabSkills],
                ['bots', 'Bots'],
              ]}
            />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-[224px] items-center gap-2 rounded-full border px-3 focus-within:border-[#299fff]" style={{ borderColor: C.line }}>
                <Search className="size-4 shrink-0" strokeWidth={2} style={{ color: C.fg2 }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => keepEscape(e, () => setQ(''))} placeholder={pl.search} aria-label={pl.search} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9e9e9e]" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (tab === 'bots') {
                    onClose();
                    s.ui.createBot();
                  } else setCreate(tab === 'skills' ? 'skill' : 'connector');
                }}
                className={cn(BTN_WHITE, 'relative w-[176px] overflow-hidden whitespace-nowrap')}
              >
                {(Object.keys(cta) as PluginTab[]).map((k) => (
                  <span key={k} aria-hidden={k !== tab} className={cn('grok-anim absolute inset-0 flex items-center justify-center gap-1 transition-[opacity,transform] duration-200', k === tab ? 'opacity-100' : 'translate-y-1 opacity-0')}>
                    <G d={P.plus} className="size-4" />
                    {cta[k]}
                  </span>
                ))}
                <span className="invisible">{cta[tab ?? 'connectors']}</span>
              </button>
            </div>
          </div>

          {tab === 'connectors' &&
            cats.map((ct) => (
              <section key={ct} className="mt-6 flex flex-col gap-2">
                <h2 className={h2}>{pl.cats[ct] ?? ct}</h2>
                <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                  {conns
                    .filter((x) => x.cat === ct)
                    .map((x) => {
                      const on = s.connected.includes(x.name);
                      return (
                        <div key={x.name} data-testid={`connector-card-${x.name}`} className={ROW_CARD}>
                          <button type="button" onClick={() => setDetail(x)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg p-1" style={{ background: C.side }}>
                              <LogoTile name={x.name} />
                            </span>
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate text-[14px] font-medium">{x.name}</span>
                              <span className="truncate text-[13px]" style={{ color: C.fg2 }}>
                                {pl.connDesc[x.desc] ?? x.desc}
                              </span>
                            </span>
                          </button>
                          <button type="button" onClick={() => setDetail(x)} className={PILL_ADD}>
                            {on ? (
                              <>
                                <G d={P.check} className="me-1 size-3.5" />
                                {pl.connected}
                              </>
                            ) : (
                              pl.add
                            )}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </section>
            ))}

          {tab === 'skills' && (
            <section className="mt-6 flex flex-col gap-2">
              <h2 className={h2}>{pl.personal}</h2>
              <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                {skills
                  .filter(([n, ds]) => match(n, ds))
                  .map(([n, ds]) => (
                    <button key={n} type="button" onClick={() => setSkill(n)} className={cn(ROW_CARD, 'text-start')}>
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: C.side, color: C.fg2 }}>
                        <G d={P.doc} className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[14px] font-medium">{n}</span>
                        <span className="truncate text-[13px]" style={{ color: C.fg2 }}>
                          {ds}
                        </span>
                      </span>
                      {off.includes(n) && (
                        <span className="text-[13px]" style={{ color: C.fg3 }}>
                          {pl.disabled}
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </section>
          )}

          {tab === 'bots' && (
            <>
              <div className="mt-4 overflow-x-auto [scrollbar-width:none]">
                <PillTabs label={pl.botCats} size={28} value={cat} onChange={setCat} tabs={DIR_CATS.map((x) => [x, pl.cats[x] ?? x] as const)} />
              </div>
              {cat === 'Tous' && !q && (
                <section className="mt-6 flex flex-col gap-3">
                  <h2 className={h2}>{pl.featured}</h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {DIRECTORY.slice(0, 4).map((b) => (
                      <button key={b.name} type="button" onClick={() => addBot(b)} className="flex h-[170px] flex-col items-center gap-1 rounded-2xl px-3 pt-6 pb-4 transition-colors hover:bg-[rgba(252,252,252,0.12)]" style={{ background: 'rgba(252,252,252,0.08)' }}>
                        <span className="relative mb-2">
                          <span className="grid size-[72px] place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${b.color} 18%, transparent)` }}>
                            <BotMark color={b.color} shape={b.shape} className="size-12" />
                          </span>
                          <span className="absolute -end-2 -bottom-1 grid size-8 place-items-center rounded-full border" style={{ background: C.raised, borderColor: C.line }}>
                            <G d={P.logo} viewBox="0 0 35 33" className="size-3.5" />
                          </span>
                        </span>
                        <span className="text-[14px] font-medium" style={{ color: b.color }}>
                          {b.name}
                        </span>
                        <span className="text-[13px] font-medium" style={{ color: C.fg2 }}>
                          {pl.by(b.by)}
                        </span>
                        {added(b.name) && (
                          <span className="text-[12px]" style={{ color: C.fg3 }}>
                            {pl.added}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {sections.map((sec) => (
                <section key={sec} className="mt-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h2 className={h2}>{pl.cats[sec] ?? sec}</h2>
                    {cat === 'Tous' && DIR_CATS.includes(sec) && (
                      <button type="button" onClick={() => setCat(sec)} className="h-6 rounded-lg px-2 text-[13px] font-medium transition-colors hover:bg-[rgba(252,252,252,0.06)] hover:text-[#fcfcfc]" style={{ color: C.fg2 }}>
                        {pl.showAll}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                    {dir
                      .filter((b) => b.cat === sec)
                      .map((b) => (
                        <div key={b.name} className={ROW_CARD}>
                          <BotMark color={b.color} shape={b.shape} className="size-8 shrink-0" />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[14px]">
                              <span className="font-medium">{b.name}</span>
                              <span style={{ color: C.fg2 }}> {pl.by(b.by)}</span>
                            </span>
                            <span className="truncate text-[13px]" style={{ color: C.fg2 }}>
                              {b.desc}
                            </span>
                          </span>
                          <button type="button" onClick={() => addBot(b)} className={PILL_ADD}>
                            {added(b.name) ? pl.open : pl.add}
                          </button>
                        </div>
                      ))}
                  </div>
                </section>
              ))}
              {!sections.length && (
                <p className="mt-10 text-center text-[14px]" style={{ color: C.fg2 }}>
                  {pl.noBots}
                </p>
              )}
            </>
          )}
          {tab === 'connectors' && !cats.length && (
            <p className="mt-10 text-center text-[14px]" style={{ color: C.fg2 }}>
              {pl.noConns}
            </p>
          )}
        </div>
        <ConnectorDialog conn={detail} onClose={() => setDetail(null)} />
        <GDialog open={!!skill} onOpenChange={(o) => !o && setSkill(null)} title={skill ?? pl.skill} width={440} z={60}>
          {skill && (
            <div className="flex flex-col gap-4 px-6 pt-6 pb-5">
              <div className="flex items-center gap-3 pe-10">
                <span className="grid size-10 place-items-center rounded-lg" style={{ background: C.side, color: C.fg2 }}>
                  <G d={P.doc} className="size-5" />
                </span>
                <h2 className="text-[15px] font-[550]">{skill}</h2>
              </div>
              <p className="text-[14px] leading-5" style={{ color: C.fg2 }}>
                {skills.find((x) => x[0] === skill)?.[1]}
              </p>
              <div className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-[14px]" style={{ borderColor: C.line }}>
                {pl.enabled}
                <Toggle label={pl.enabled} checked={!off.includes(skill)} onChange={(v) => setOff((o) => (v ? o.filter((x) => x !== skill) : [...o, skill]))} />
              </div>
            </div>
          )}
        </GDialog>
        <QuickCreateDialog
          kind={create}
          onClose={() => setCreate(null)}
          onCreate={(name, extra) => {
            if (create === 'connector') {
              setCustom((x) => [{ name, desc: extra || pl.customMcp, cat: 'Personnalisé' }, ...x]);
              s.setConnected((x) => [...x, name]);
            } else setSkills((x) => [...x, [name, extra || pl.personalSkill]]);
            setCreate(null);
            toast(pl.addedToast(name));
          }}
        />
      </GDialog>
    </>
  );
}

/* ---------- Paramètres (account menu): 1000×640, a 200px nav and nine sections of working local controls ---------- */

const SETTINGS_NAV: [string, [SettingsSection, string, ReactNode][]][] = [
  [
    'Général',
    [
      ['home', 'Compte', <User key="u" className="size-4" strokeWidth={2} />],
      ['appearance', 'Apparence', <Paintbrush key="p" className="size-4" strokeWidth={2} />],
      ['behavior', 'Mode', <SlidersHorizontal key="m" className="size-4" strokeWidth={2} />],
      ['notifications', 'Notifications', <Bell key="n" className="size-4" strokeWidth={2} />],
    ],
  ],
  [
    'Grok',
    [
      ['personality', 'Personnaliser', <SlidersHorizontal key="s" className="size-4" strokeWidth={2} />],
      ['grok-bot', 'Grok Bot', <BotMark key="b" color="currentColor" className="size-4" />],
    ],
  ],
  [
    'Paiements',
    [
      ['billing', 'Facturation', <CreditCard key="c" className="size-4" strokeWidth={2} />],
      ['usage', 'Utilisation', <Zap key="z" className="size-4" strokeWidth={2} />],
    ],
  ],
  ['Données et informations', [['data', 'Contrôles de données', <Database key="d" className="size-4" strokeWidth={2} />]]],
];

const SET_ON = 'rgb(66,126,255)';

function SRow({ label, desc, children, icon }: { label: ReactNode; desc?: ReactNode; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex min-h-[52px] items-center gap-4 py-2.5">
      {icon && <span style={{ color: C.fg2 }}>{icon}</span>}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-[14px] leading-5 font-medium">{label}</div>
        {desc && (
          <div className="text-[13px] leading-[18px]" style={{ color: C.fg2 }}>
            {desc}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
const SDivider = () => <div className="h-px" style={{ background: C.line }} />;
const SCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('rounded-2xl border px-4', className)} style={{ borderColor: C.line }}>
    {children}
  </div>
);
function Bar({ value, color = SET_ON }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: C.raised }}>
      <div className="grok-anim h-full rounded-full transition-[width] duration-500" style={{ width: `${value}%`, background: color, transitionTimingFunction: EASE }} />
    </div>
  );
}
function InfoTip({ text }: { text: string }) {
  return (
    <Tip label={text}>
      <button type="button" aria-label={text} className="ms-1 inline-grid size-4 translate-y-[2px] place-items-center rounded-full" style={{ color: C.fg2 }}>
        <Info className="size-3.5" strokeWidth={2} />
      </button>
    </Tip>
  );
}

type VaultItem = { id: string; type: 'login' | 'card' | 'contact'; name: string };

function SettingsDialog({ section, onSection, onClose }: { section: SettingsSection | null; onSection: (s: SettingsSection) => void; onClose: () => void }) {
  const s = useStore();
  const ts = useCopy(COPY_SET);
  const tc = useCopy(COPY_CORE);

  const [st, setSt] = useState({ theme: 'dark', wrap: false, autoscroll: true, cmdEnter: false, refine: 'clean', browser: false, updates: 'email', persona: 'custom', improve: true, xPerso: true, histPerso: false, links: true, watermark: true, lang: getLocale() === 'fr' ? 'Français' : 'English', cleared: false, cancelled: false });
  const [slots, setSlots] = useState<(string | null)[]>(() => ['Grok', ...Array.from({ length: 15 }, () => null)]);
  const [agents, setAgents] = useState<string[]>([]);
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [vTab, setVTab] = useState<'all' | 'login' | 'card' | 'contact'>('all');
  const [vq, setVq] = useState('');
  const set = (p: Partial<typeof st>) => setSt((x) => ({ ...x, ...p }));
  const gerer = (label: string, what = ts.demoNA) => (
    <button type="button" aria-label={label} onClick={() => toast(what)} className={BTN_LINE}>
      {ts.manage}
    </button>
  );
  const sw = (k: 'wrap' | 'autoscroll' | 'cmdEnter' | 'browser' | 'improve' | 'xPerso' | 'histPerso' | 'links' | 'watermark', label: string) => <Toggle label={label} on={SET_ON} checked={st[k]} onChange={(v) => set({ [k]: v } as Partial<typeof st>)} />;
  const danger = (label: string, title: string, body: string, run: () => void) => (
    <button type="button" onClick={() => s.ui.confirm({ title, body, action: ts.delete, danger: true, onConfirm: run })} className={cn(BTN_LINE, 'text-[#f2787e]')}>
      {label}
    </button>
  );
  const navLabel = SETTINGS_NAV.flatMap((g) => g[1]).find((x) => x[0] === section)?.[1];
  const title = navLabel ? (ts.nav[navLabel] ?? navLabel) : ts.settings;
  const hidden = s.bots.filter((b) => b.hidden);
  const vList = vault.filter((v) => (vTab === 'all' || v.type === vTab) && v.name.toLowerCase().includes(vq.toLowerCase()));

  const body = () => {
    switch (section) {
      case 'home':
        return (
          <>
            <SRow
              label={
                <span className="flex items-center gap-3">
                  <Avatar size={36} />
                  <span className="flex flex-col">
                    <span>Alex</span>
                    <span className="text-[13px] font-normal" style={{ color: C.fg2 }}>
                      alex@example.com
                    </span>
                  </span>
                </span>
              }
            >
              {gerer(ts.manageAccount)}
            </SRow>
            <SDivider />
            <SRow label={ts.subscription} desc="SuperGrok">
              {gerer(ts.manageSub)}
            </SRow>
            <SRow
              label={ts.xAccount}
              desc={
                <span className="flex items-center gap-2">
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">
                    @alex_demo
                  </a>
                  <span className="rounded-full border px-2 text-[12px] leading-[18px]" style={{ color: 'rgb(127,147,176)', borderColor: 'rgba(127,147,176,0.4)' }}>
                    Premium
                  </span>
                </span>
              }
            >
              {gerer(ts.manageX)}
            </SRow>
            <SDivider />
            <SRow label={ts.language} desc={st.lang} icon={<Languages className="size-4" strokeWidth={2} />}>
              <Menu
                align="end"
                className="w-[180px]"
                trigger={
                  <button type="button" aria-label={ts.changeLanguage} className={BTN_LINE}>
                    {ts.change}
                  </button>
                }
              >
                <DM.RadioGroup value={st.lang} onValueChange={(v) => set({ lang: v })}>
                  {['Français', 'English', 'Español', 'Deutsch', '日本語'].map((l) => (
                    <RadioRow key={l} value={l}>
                      {l}
                    </RadioRow>
                  ))}
                </DM.RadioGroup>
              </Menu>
            </SRow>
            <SRow label={ts.birthYear} desc="2000" />
          </>
        );
      case 'appearance':
        return (
          <>
            <SRow label={ts.theme} desc={ts.themeDesc}>
              <div className="flex gap-2">
                {(
                  [
                    ['light', '#f4f4f5', '#d4d4d8'],
                    ['dark', '#131211', '#2a2826'],
                    ['system', 'linear-gradient(90deg,#f4f4f5 50%,#131211 50%)', '#71717a'],
                  ] as const
                ).map(([label, bg, line]) => (
                  <button key={label} type="button" aria-label={ts.themes[label]} aria-pressed={st.theme === label} onClick={() => set({ theme: label })} className="flex w-[98px] flex-col gap-1.5 text-center text-[13px]">
                    <span className={cn('flex h-16 w-full flex-col gap-1.5 rounded-[10px] border-2 p-2 transition-colors', st.theme === label ? 'border-[rgb(66,126,255)]' : 'border-[rgba(252,252,252,0.1)]')} style={{ background: bg }}>
                      <span className="h-1.5 w-2/3 rounded-full" style={{ background: line }} />
                      <span className="h-1.5 w-1/2 rounded-full" style={{ background: line }} />
                      <span className="mt-auto h-3 w-full rounded" style={{ background: line, opacity: 0.6 }} />
                    </span>
                    <span style={{ color: st.theme === label ? C.fg : C.fg2 }}>{ts.themes[label]}</span>
                  </button>
                ))}
              </div>
            </SRow>
            <SDivider />
            <SRow label={ts.wrapLabel} desc={ts.wrapDesc}>
              {sw('wrap', ts.wrapLabel)}
            </SRow>
          </>
        );
      case 'behavior':
        return (
          <>
            <SRow label={ts.autoscroll}>{sw('autoscroll', ts.autoscroll)}</SRow>
            <SDivider />
            <SRow label={ts.cmdEnter} desc={ts.cmdEnterDesc}>
              {sw('cmdEnter', ts.cmdEnter)}
            </SRow>
            <SDivider />
            <SRow label={ts.refineLabel} desc={ts.refineDesc}>
              <Menu
                align="end"
                className="w-[320px]"
                trigger={
                  <button type="button" aria-label={ts.refineLabel} className={cn(BTN_LINE, 'gap-1.5')}>
                    {ts.refine[st.refine][0]}
                    <G d={P.chevron} className="size-3.5" />
                  </button>
                }
              >
                <DM.RadioGroup value={st.refine} onValueChange={(v) => set({ refine: v })}>
                  {(['none', 'clean', 'full'] as const).map((l) => (
                    <DM.RadioItem key={l} value={l} className={cn(ROW, 'h-auto items-start py-2')}>
                      <span className="flex flex-1 flex-col">
                        <span>{ts.refine[l][0]}</span>
                        <span className="text-[13px] leading-[18px]" style={{ color: C.fg2 }}>
                          {ts.refine[l][1]}
                        </span>
                      </span>
                      <DM.ItemIndicator className="mt-0.5">
                        <G d={P.check} className="size-4" />
                      </DM.ItemIndicator>
                    </DM.RadioItem>
                  ))}
                </DM.RadioGroup>
              </Menu>
            </SRow>
          </>
        );
      case 'notifications':
        return (
          <>
            <SRow label={ts.browserNotif} desc={ts.browserNotifDesc}>
              {sw('browser', ts.browserNotif)}
            </SRow>
            <SDivider />
            <SRow label={ts.productUpdates} desc={ts.productUpdatesDesc}>
              <Menu
                align="end"
                className="w-[180px]"
                trigger={
                  <button type="button" role="combobox" aria-expanded={false} aria-label={ts.productUpdates} className={cn(BTN_LINE, 'gap-1.5')}>
                    {ts.updates[st.updates]}
                    <G d={P.chevron} className="size-3.5" />
                  </button>
                }
              >
                <DM.RadioGroup value={st.updates} onValueChange={(v) => set({ updates: v })}>
                  {['email', 'off'].map((l) => (
                    <RadioRow key={l} value={l}>
                      {ts.updates[l]}
                    </RadioRow>
                  ))}
                </DM.RadioGroup>
              </Menu>
            </SRow>
          </>
        );
      case 'personality':
        return (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex flex-col gap-3">
              <div className="text-[14px] font-medium">
                {ts.personalize}
                <InfoTip text={ts.personalizeTip} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['custom', 'concise', 'formal', 'tutor', 'exhaustive'].map((p) => (
                  <button key={p} type="button" aria-pressed={st.persona === p} onClick={() => set({ persona: p })} className={cn('h-6 rounded-full border px-2.5 text-[13px] transition-colors', st.persona === p ? 'border-transparent bg-[#fcfcfc] text-[#050505]' : 'hover:bg-[rgba(252,252,252,0.06)]')} style={st.persona === p ? undefined : { borderColor: 'rgba(252,252,252,0.1)', color: C.fg2 }}>
                    {ts.personas[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-[14px] font-medium">
                {ts.activeAgents}
                <InfoTip text={ts.activeAgentsTip} />
              </div>
              {/* Grok drags agents into the slots; here a click fills the first free slot, a click on a slot empties it. */}
              <div className="grid grid-cols-3 gap-[5px]">
                {slots.map((a, i) => (
                  <button key={i} type="button" disabled={i === 0 || !a} onClick={() => setSlots((x) => x.map((y, j) => (j === i ? null : y)))} className={cn('flex h-10 items-center gap-2 rounded-xl border px-3 text-start text-[14px]', !a && 'border-dashed opacity-40')} style={{ borderColor: a ? C.line : 'rgba(252,252,252,0.15)' }}>
                    {i === 0 ? <AgentOrb agent="grok" size={20} /> : a ? <span className="size-5 rounded-full" style={{ background: `hsl(${hueOf(a)} 60% 50%)` }} /> : null}
                    <span className="truncate">{a ?? ts.agentN(i)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-medium">
                  {ts.availableAgents}
                  <InfoTip text={ts.availableAgentsTip} />
                </div>
                <button type="button" onClick={() => setAgents((x) => [...x, ts.customAgent(x.length + 1)])} className={BTN_LINE}>
                  <G d={P.plus} className="size-4" />
                  {ts.create}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {agents.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      const free = slots.findIndex((x, j) => j > 0 && !x);
                      if (free < 0 || slots.includes(a)) return;
                      setSlots((x) => x.map((y, j) => (j === free ? a : y)));
                    }}
                    className="flex h-9 items-center gap-2 rounded-xl border px-3 text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.04)] disabled:opacity-40"
                    disabled={slots.includes(a)}
                    style={{ borderColor: C.line }}
                  >
                    <span className="size-4 rounded-full" style={{ background: `hsl(${hueOf(a)} 60% 50%)` }} />
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'grok-bot':
        return (
          <div className="flex flex-col gap-5 pt-2">
            <SRow label="Vault" desc="Passwords, cards and contacts your Bots can fill in for you.">
              <Menu
                align="end"
                className="w-[200px]"
                trigger={
                  <button type="button" className={cn(BTN_LINE, 'gap-1.5')}>
                    New item
                    <G d={P.chevron} className="size-3.5" />
                  </button>
                }
              >
                {(
                  [
                    ['login', 'Login', <Key key="k" className="size-4" strokeWidth={2} />, 'New login'],
                    ['card', 'Card', <CreditCard key="c" className="size-4" strokeWidth={2} />, 'New card'],
                    ['contact', 'Contact info', <User key="u" className="size-4" strokeWidth={2} />, 'New contact'],
                  ] as const
                ).map(([type, label, icon, name]) => (
                  <MenuItem key={type} tall icon={icon} onSelect={() => setVault((v) => [...v, { id: newId('v'), type, name: `${name} ${v.filter((x) => x.type === type).length + 1}` }])}>
                    {label}
                  </MenuItem>
                ))}
              </Menu>
            </SRow>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <PillTabs
                label="Vault"
                size={28}
                value={vTab}
                onChange={setVTab}
                tabs={(
                  [
                    ['all', 'All'],
                    ['login', 'Logins'],
                    ['card', 'Cards'],
                    ['contact', 'Contact info'],
                  ] as const
                ).map(([id, l]) => [id, `${l} ${id === 'all' ? vault.length : vault.filter((v) => v.type === id).length}`] as const)}
              />
              <input value={vq} onChange={(e) => setVq(e.target.value)} placeholder="Search Vault" className={cn(INPUT, 'h-8 w-[200px]')} />
            </div>
            {vList.length ? (
              <SCard>
                {vList.map((v, i) => (
                  <Fragment key={v.id}>
                    {i > 0 && <SDivider />}
                    <SRow label={v.name} icon={v.type === 'login' ? <Key className="size-4" strokeWidth={2} /> : v.type === 'card' ? <CreditCard className="size-4" strokeWidth={2} /> : <User className="size-4" strokeWidth={2} />}>
                      <button type="button" aria-label={ts.deleteItem(v.name)} onClick={() => setVault((x) => x.filter((y) => y.id !== v.id))} className={GHOST_20} style={{ color: C.fg2 }}>
                        <Trash2 className="size-3.5" strokeWidth={2} />
                      </button>
                    </SRow>
                  </Fragment>
                ))}
              </SCard>
            ) : (
              <div className="flex flex-col gap-2 rounded-2xl border px-4 py-6 text-center text-[14px]" style={{ borderColor: C.line, color: C.fg2 }}>
                Nothing saved yet. Add a login, card, or contact info with New item.
                <span className="text-[13px]" style={{ color: C.fg3 }}>
                  Grok Bot never sees a saved card's number or security code. It can see logins and contact info so it can type them in for you.
                </span>
              </div>
            )}
            <SDivider />
            <div className="flex flex-col gap-2">
              <div className="text-[14px] font-medium">{ts.hiddenBots}</div>
              {hidden.length ? (
                hidden.map((b) => (
                  <div key={b.id} className="flex h-10 items-center gap-2 text-[14px]">
                    <BotAvatar bot={b} />
                    <span className="flex-1 truncate">{b.name}</span>
                    <button type="button" onClick={() => s.patchBot(b.id, { hidden: false })} className={BTN_LINE}>
                      <Eye className="size-4" strokeWidth={2} />
                      {ts.show}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[13px]" style={{ color: C.fg2 }}>
                  {ts.noHidden}
                </p>
              )}
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex items-center gap-4 overflow-hidden rounded-2xl border p-5" style={{ borderColor: C.line, background: C.side }}>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="text-[15px] font-[550]">Unlock the ultimate AI subscription</div>
                <p className="text-[14px] leading-5" style={{ color: C.fg2 }}>
                  {ts.ultimate}
                </p>
                <button type="button" onClick={() => toast(ts.demoNoBuy)} className={cn(BTN_WHITE, 'w-fit')}>
                  {ts.getStarted}
                </button>
              </div>
              <div className="hidden h-24 w-40 shrink-0 rounded-xl md:block" style={{ background: mediaBg(225) }} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[14px] font-medium">
                <History className="size-4" strokeWidth={2} style={{ color: C.fg2 }} />
                {ts.oldSub}
              </div>
              <SCard>
                <SRow label="SuperGrok" desc={st.cancelled ? ts.cancelScheduled : ts.nextCycle} />
              </SCard>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[14px] font-medium">{ts.billing}</div>
              <SCard>
                <SRow label={ts.updateBilling} desc={ts.billingDesc}>
                  {gerer(ts.manageBilling)}
                </SRow>
                <SDivider />
                <SRow label={ts.cancelSub} desc={ts.cancelSubDesc}>
                  <button
                    type="button"
                    disabled={st.cancelled}
                    onClick={() => s.ui.confirm({ title: ts.cancelPlanTitle, body: ts.cancelPlanBody, action: ts.cancelPlan, danger: true, onConfirm: () => set({ cancelled: true }) })}
                    className="h-8 rounded-full bg-[#e5484d] px-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {ts.cancelPlan}
                  </button>
                </SRow>
              </SCard>
            </div>
            <div className="flex items-center justify-between text-[13px]" style={{ color: C.fg2 }}>
              {ts.prePlan}
              <button type="button" onClick={() => toast(ts.demoPlans)} className={BTN_LINE}>
                {ts.seePlans}
              </button>
            </div>
          </div>
        );
      case 'usage':
        return (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex flex-col gap-2">
              <div className="text-[14px] font-medium">
                {ts.weeklyLimit}
                <InfoTip text={ts.weeklyTip} />
              </div>
              <Bar value={38} />
              <div className="flex justify-between text-[13px]" style={{ color: C.fg2 }}>
                <span>{ts.used(38)}</span>
                <span>{ts.resetsOn}</span>
              </div>
              <SCard className="mt-1">
                <SRow label="Grok Build">
                  <span className="text-[13px] tabular-nums" style={{ color: C.fg2 }}>
                    22 %
                  </span>
                </SRow>
                <SDivider />
                <SRow label="Chat">
                  <span className="text-[13px] tabular-nums" style={{ color: C.fg2 }}>
                    16 %
                  </span>
                </SRow>
              </SCard>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[14px] font-medium">
                Weekly Grok Bot Limit
                <InfoTip text="Bots share a separate weekly allowance." />
              </div>
              <Bar value={12} color="#00c972" />
              <div className="flex justify-between text-[13px]" style={{ color: C.fg2 }}>
                <span>{ts.used(12)}</span>
                <span>{ts.resetsOn}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[14px] font-medium">
                {ts.extraCredits}
                <InfoTip text={ts.extraTip} />
              </div>
              <SCard>
                <SRow label={ts.extraLabel} desc={getLocale() === 'fr' ? '0,00 $' : '$0.00'}>
                  <button type="button" onClick={() => toast(ts.demoNoBuy)} className={BTN_LINE}>
                    {ts.buyCredits}
                  </button>
                </SRow>
                <SDivider />
                <SRow label={ts.autoReload} desc={ts.autoReloadDesc}>
                  <button type="button" onClick={() => toast(ts.demoReload)} className={BTN_LINE}>
                    {ts.configure}
                  </button>
                </SRow>
              </SCard>
            </div>
          </div>
        );
      case 'data':
        return (
          <>
            <SRow label={ts.improveModel} desc={ts.improveDesc}>
              {sw('improve', ts.improveModel)}
            </SRow>
            <SRow label={ts.personalizeX}>{sw('xPerso', ts.personalizeX)}</SRow>
            <SRow
              label={
                <span className="flex items-center gap-2">
                  {ts.personalizeHist}
                  <span className="rounded-full border px-2 py-0.5 text-[13px] leading-4 font-medium" style={{ borderColor: 'rgba(252,252,252,0.2)' }}>
                    {ts.beta}
                  </span>
                </span>
              }
            >
              {sw('histPerso', ts.personalizeHist)}
            </SRow>
            <SRow label={ts.allowLinks}>{sw('links', ts.allowLinks)}</SRow>
            <SRow label={ts.watermark}>{sw('watermark', ts.watermark)}</SRow>
            <SDivider />
            <div className="flex flex-col gap-2 py-3">
              <div className="text-[14px] font-medium">{ts.fileStorage}</div>
              <Bar value={Math.min(100, (s.lib.reduce((n, x) => n + x.size, 0) / 1_073_741_824) * 100 * 20)} />
              <div className="text-[13px]" style={{ color: C.fg2 }}>
                {ts.usedOf(fmtSize(s.lib.reduce((n, x) => n + x.size, 0)))}
              </div>
            </div>
            <SDivider />
            <SRow label={ts.viewFiles} desc={ts.viewFilesDesc}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  s.go({ kind: 'library', tab: 'all' });
                }}
                className={BTN_LINE}
              >
                {ts.manage}
              </button>
            </SRow>
            <SRow label={ts.viewLinks} desc={ts.viewLinksDesc}>
              {gerer(ts.manageLinks, ts.noLinks)}
            </SRow>
            <SRow label={ts.viewDeleted} desc={ts.viewDeletedDesc}>
              {gerer(ts.manageDeleted, ts.noDeleted)}
            </SRow>
            <SRow label={ts.cookies}>{gerer(ts.cookies)}</SRow>
            <SRow label={ts.clearCache}>
              <button type="button" onClick={() => (set({ cleared: true }), toast(ts.cacheCleared))} className={BTN_LINE}>
                {st.cleared ? ts.cleared : ts.clear}
              </button>
            </SRow>
            <SRow label={ts.exportData}>
              <button type="button" onClick={() => toast(ts.exportToast)} className={BTN_LINE}>
                {ts.exportBtn}
              </button>
            </SRow>
            <SDivider />
            <SRow label={ts.deleteAllChats}>{danger(ts.delete, ts.deleteAllChatsTitle, ts.deleteAllChatsBody, s.clearChats)}</SRow>
            <SRow label={ts.deleteImagine}>
              {danger(ts.delete, ts.deleteImagineTitle, ts.deleteImagineBody, () => {
                s.setRuns([]);
                s.setLib((l) => l.filter((x) => x.kind !== 'image' && x.kind !== 'video'));
              })}
            </SRow>
            <SRow label={ts.deleteAccount} desc={ts.deleteAccountDesc}>
              {danger(ts.delete, ts.deleteAccountTitle, ts.deleteAccountBody, () => toast(ts.accountKept))}
            </SRow>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <GDialog open={!!section} onOpenChange={(o) => !o && onClose()} title={ts.settings} width={1000} height={640} close={false}>
      <div className="flex min-h-0 flex-1">
        <nav className="flex w-[200px] shrink-0 flex-col gap-1 overflow-y-auto border-e p-2.5 max-md:w-[56px] max-md:p-1.5" style={{ borderColor: C.line }}>
          {SETTINGS_NAV.map(([group, items]) => (
            <Fragment key={group}>
              <div className="h-[30px] px-2 pt-3 text-[13px] leading-[18px] max-md:hidden" style={{ color: 'rgb(99,99,99)' }}>
                {ts.nav[group] ?? group}
              </div>
              {items.map(([id, label, icon]) => (
                <button key={id} type="button" aria-current={section === id ? 'page' : undefined} onClick={() => onSection(id)} className={cn('flex h-8 shrink-0 items-center gap-1.5 rounded-[10px] px-2 text-start text-[14px] transition-colors hover:bg-[rgba(252,252,252,0.06)]', section === id && 'bg-[rgba(252,252,252,0.08)] hover:bg-[rgba(252,252,252,0.08)]')}>
                  <span className="grid size-4 place-items-center" style={{ color: section === id ? C.fg : C.fg2 }}>
                    {icon}
                  </span>
                  <span className="truncate max-md:hidden">{ts.nav[label] ?? label}</span>
                </button>
              ))}
            </Fragment>
          ))}
        </nav>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <Dialog.Close asChild>
            <button type="button" aria-label={tc.close} className={cn(CLOSE_BTN, 'absolute end-4 top-4 z-10')} style={{ color: C.fg2 }}>
              <X className="size-[18px]" strokeWidth={2} />
            </button>
          </Dialog.Close>
          <div key={section} className="grok-fade grok-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
            <h2 className="pb-2 text-[15px] leading-[22.5px] font-[550]">{title}</h2>
            {body()}
          </div>
        </div>
      </div>
    </GDialog>
  );
}

/* ---------- Scripts ---------- */

/** A feed item before it gets its id (Omit, distributed over the union). */
type NewItem = FeedItem extends infer F ? (F extends FeedItem ? Omit<F, 'id'> : never) : never;
type Plan = { feed: { at: number; item: NewItem }[]; answer: string; sources: number; follow: string[] };

/** Favicon stand-ins as "initial:colour:site". */
const S = { pk: 'P:#ef4444:Pokeinsider', tc: 'T:#2563eb:Tcgplayer', px: 'X:#7c3aed:Pricecharting', eb: 'e:#0ea5e9:eBay', rd: 'R:#f97316:Reddit', yt: 'Y:#dc2626:YouTube', wk: 'W:#525252:Wikipedia', gh: 'G:#16a34a:GitHub' };

const pokemon = (): Plan => {
  const p = copyOf(COPY_SCRIPTS).pk;
  return {
  feed: [
    { at: 1500, item: { kind: 'status', text: 'Analyzing current Pokémon card values and meta' } },
    { at: 3200, item: { kind: 'search', query: p.q1, results: 10, favicons: [S.pk, S.tc, S.eb] } },
    { at: 150, item: { kind: 'search', query: 'most expensive Pokémon card 2026', results: 10, favicons: [S.px, S.eb, S.rd] } },
    { at: 150, item: { kind: 'search', query: 'Pokémon TCG meta best cards October 2026', results: 10, favicons: [S.tc, S.yt, S.pk] } },
    { at: 1300, item: { kind: 'msg', agent: 'a1', text: p.m1 } },
    { at: 900, item: { kind: 'search', query: 'Rayquaza Gold Star Deoxys current price', results: 10, favicons: [S.px, S.eb, S.pk], agent: 'a2' } },
    { at: 1200, item: { kind: 'msg', agent: 'a2', text: p.m2 } },
    { at: 800, item: { kind: 'visit', url: 'pokeinsider.com/most-valuable-pokemon-cards/' } },
    { at: 1100, item: { kind: 'msg', agent: 'grok', text: p.m3 } },
    { at: 900, item: { kind: 'search', query: 'Dragapult ex Standard meta Worlds 2026', results: 10, favicons: [S.tc, S.rd, S.yt], agent: 'a3' } },
    { at: 1300, item: { kind: 'msg', agent: 'a3', text: p.m4 } },
    { at: 1000, item: { kind: 'status', text: p.st2 } },
    { at: 1100, item: { kind: 'msg', agent: 'a1', text: p.m5 } },
    { at: 900, item: { kind: 'status', text: p.st3 } },
  ],
  answer: p.answer,
  sources: 400,
  follow: p.follow,
  };
};

/** Any other question: the same heavy choreography, worded around what was asked. */
function planFor(q: string): Plan {
  const topic = q.replace(/[?!.\s]+$/, '');
  return {
    feed: [
      { at: 1500, item: { kind: 'status', text: `Analyzing ${topic}` } },
      { at: 3000, item: { kind: 'search', query: `${topic} 2026`, results: 10, favicons: [S.wk, S.eb, S.gh] } },
      { at: 150, item: { kind: 'search', query: copyOf(COPY_SCRIPTS).otherQuery(topic), results: 10, favicons: [S.rd, S.tc, S.yt] } },
      { at: 1200, item: { kind: 'msg', agent: 'a1', text: copyOf(COPY_SCRIPTS).other1(topic) } },
      { at: 1100, item: { kind: 'msg', agent: 'a2', text: copyOf(COPY_SCRIPTS).other2 } },
      { at: 1100, item: { kind: 'msg', agent: 'grok', text: copyOf(COPY_SCRIPTS).other3 } },
      { at: 1200, item: { kind: 'msg', agent: 'a3', text: copyOf(COPY_SCRIPTS).other4 } },
      { at: 900, item: { kind: 'status', text: copyOf(COPY_SCRIPTS).otherStatus } },
    ],
    answer: copyOf(COPY_SCRIPTS).otherAnswer(topic),
    sources: 120 + topic.length * 3,
    follow: copyOf(COPY_SCRIPTS).otherFollow(topic),
  };
}

/** The measured choreography: the bulb for ~0.4s, the dot loader while the agents are called (~1.6s), then the
 *  avatars spring in one by one. Searches land as "Recherche sur le web · 0 résultat" and resolve a beat later. */
async function heavy(api: ChatScriptApi, plan: Plan) {
  const a = api.assistant();
  const started = Date.now();
  let data: AgentsData = { items: [], joined: [], started, done: false, pre: true };
  const set = a.custom('agents', data);
  const patch = (p: Partial<AgentsData>) => {
    data = { ...data, ...p };
    set(data);
  };
  await api.sleep(400);
  patch({ pre: false });
  await api.sleep(1600);
  for (const id of ORDER) {
    patch({ joined: [...data.joined, id] });
    await api.sleep(220);
  }
  let n = 0;
  const searching = () => data.items.some((it) => it.kind === 'search' && it.pending);
  const resolve = () => patch({ items: data.items.map((it) => (it.kind === 'search' && it.pending ? { ...it, pending: false } : it)) });
  for (const { at, item } of plan.feed) {
    // Pending searches resolve ~0.6s after they appear, before the next item lands.
    if (searching() && at > 600) {
      await api.sleep(600);
      resolve();
      await api.sleep(at - 600);
    } else await api.sleep(at);
    patch({ items: [...data.items, { ...item, id: `f${++n}`, ...(item.kind === 'search' && { pending: true }) } as FeedItem] });
  }
  if (searching()) {
    await api.sleep(600);
    resolve();
  }
  await api.sleep(900);
  patch({ done: true, seconds: Math.max(1, Math.round((Date.now() - started) / 1000)) });
  await api.sleep(250);
  await a.stream(plan.answer, 34);
  a.custom('sources', { count: plan.sources, favicons: [S.pk, S.tc, S.eb] });
  a.custom('followups', { items: plan.follow });
  a.done();
}

/* ---------- The single-agent modes (Expert, Rapide, Auto) and Build ---------- */

/** The real runs took 25-40s before the answer; the demo plays them at K, each element keeping its measured duration. */
const K = 0.5;
/** Waits until `ms` (real, from the start of the script) scaled by `k`, or returns at once when already past it. */
function clock(api: ChatScriptApi, k = K) {
  const t0 = Date.now();
  return (ms: number) => api.sleep(Math.max(0, ms * k - (Date.now() - t0)));
}
/** A promise that keeps running beside the script: a cancelled script must not leave its rejection unhandled. */
const alongside = <T,>(p: Promise<T>) => {
  p.catch(() => undefined);
  return p;
};

const clip = (s: string, n = 52) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

/** The `steps` data part of one reply, with the row edits the scripts need. */
function timeline(a: AssistantApi) {
  let data: StepsData = { started: Date.now(), rows: [], phase: 'live', collapsed: false };
  const set = a.custom('steps', data);
  let n = 0;
  const patch = (p: Partial<StepsData>) => {
    data = { ...data, ...p };
    set(data);
  };
  return {
    patch,
    elapsed: () => Math.max(1, Math.round((Date.now() - data.started) / 1000)),
    add(r: Omit<StepRow, 'id'>) {
      const id = `s${++n}`;
      patch({ rows: [...data.rows, { ...r, id }] });
      return id;
    },
    edit: (id: string, p: Partial<StepRow>) => patch({ rows: data.rows.map((r) => (r.id === id ? { ...r, ...p } : r)) }),
    drop: (id: string) => patch({ rows: data.rows.filter((r) => r.id !== id) }),
  };
}

const topicOf = (text: string) => text.replace(/[?!.\s]+$/, '');

/** Expert (measured 42s): "Réflexion pendant Ns", a shimmering search count that climbs to 4, an English reasoning row with a
 *  dot sub-step, a "Consulté" row, a second search summary; then "Formulating the final answer in French" + "Réflexion : Ns",
 *  the answer, and the list folding ~9s into it. */
async function expert(api: ChatScriptApi, plan: Plan, text: string) {
  const topic = clip(topicOf(text));
  const a = api.assistant();
  const at = clock(api);
  const s = timeline(a);
  await at(4300);
  const q1 = s.add({ kind: 'search', count: 1, active: true });
  await at(5200);
  const think = s.add({ kind: 'think', text: `Analyzing ${topic}` });
  await at(7400);
  s.edit(think, { subs: [`Summarizing ${topic}`] });
  await at(9800);
  s.edit(q1, { count: 2 });
  await at(12000);
  s.add({ kind: 'visit', text: `guides.example.dev/blog/${slug(topic)}` });
  await at(14500);
  s.edit(q1, { count: 3 });
  await at(17500);
  s.edit(q1, { count: 4 });
  await at(19800);
  s.edit(q1, { active: false });
  await at(20500);
  const q2 = s.add({ kind: 'search', count: 1, active: true });
  await at(22000);
  s.edit(q2, { count: 2 });
  await at(23500);
  s.edit(q2, { active: false });
  await at(30800);
  s.patch({ phase: 'final', finalText: copyOf(COPY_SCRIPTS).expertFinal, seconds: s.elapsed() });
  await at(32800);
  await Promise.all([
    a.stream(plan.answer, 28),
    alongside(
      (async () => {
        await api.sleep(9000 * K);
        s.patch({ collapsed: true });
      })(),
    ),
  ]);
  a.custom('sources', { count: 65, favicons: [S.pk, S.tc, S.eb] });
  a.custom('followups', { items: plan.follow });
  a.done();
}

/** Rapide (measured 42s, ~27s before the first word): only the counter for ~10s, then the steps with image searches;
 *  the answer carries citation chips and an inline image card; the list folds ~1s into it, the follow-ups arrive ~6s in. */
async function rapide(api: ChatScriptApi, plan: Plan, text: string) {
  const topic = clip(topicOf(text), 44);
  const a = api.assistant();
  const at = clock(api);
  const s = timeline(a);
  await at(9980);
  s.add({ kind: 'think', text: `Identifying ${topic}` });
  await at(10200);
  const q = s.add({ kind: 'search', count: 1, active: true });
  await at(11980);
  s.edit(q, { active: false });
  s.add({ kind: 'images', text: `${topic} photo` });
  await at(12150);
  s.add({ kind: 'images', text: `${topic} illustration` });
  await at(19500);
  const extra = s.add({ kind: 'think', text: copyOf(COPY_SCRIPTS).thinking });
  await at(25980);
  s.patch({ phase: 'final', finalText: copyOf(COPY_SCRIPTS).rapideFinal, seconds: s.elapsed() });
  await at(26970);
  s.edit(extra, { leaving: true });
  await Promise.all([
    a.stream(`${plan.answer}\n\n${copyOf(COPY_SCRIPTS).illustration}\n\n![${clip(topic, 40)} - Wikipedia]`, 20),
    alongside(
      (async () => {
        await api.sleep(120);
        s.drop(extra);
        await api.sleep(880);
        s.patch({ collapsed: true });
        await api.sleep(6000 * K - 1000);
        a.custom('followups', { items: plan.follow });
      })(),
    ),
  ]);
  a.custom('sources', { count: 5, favicons: [S.wk, S.eb, S.gh] });
  a.done();
}

/** Auto (measured 38s): French step labels, searches only summarised (1 → 2), "Réflexion" then the counter turning into
 *  "Réflexion : Ns" as the answer starts; the list stays open until the end of the stream. */
async function auto(api: ChatScriptApi, plan: Plan, text: string) {
  const topic = clip(topicOf(text), 44);
  const a = api.assistant();
  const at = clock(api);
  const s = timeline(a);
  await at(7740);
  s.add({ kind: 'think', text: copyOf(COPY_SCRIPTS).autoThink(topic) });
  await at(13120);
  const q = s.add({ kind: 'search', count: 1, active: true });
  await at(13430);
  s.edit(q, { count: 2 });
  await at(14350);
  s.add({ kind: 'think', text: copyOf(COPY_SCRIPTS).thinking });
  await at(25360);
  s.edit(q, { active: false });
  s.patch({ phase: 'final', seconds: s.elapsed() });
  await at(25440);
  await a.stream(plan.answer, 26);
  s.patch({ collapsed: true });
  a.custom('sources', { count: 20, favicons: [S.rd, S.tc, S.gh] });
  await api.sleep(1700 * K);
  a.custom('followups', { items: plan.follow });
  a.done();
}

/** Build (observed 105s, never finished): a live counter, an intro paragraph, then tool rows and prose interleaved while
 *  the preview panel opens and cycles its status. ASSUMPTION: the demo ends at ~40s with a generated page in the preview
 *  and the counter frozen into "Réflexion : 40s" (nothing was observed past the generation). */
async function build(api: ChatScriptApi) {
  const t = copyOf(COPY_SCRIPTS);
  const a = api.assistant();
  const at = clock(api, 0.4);
  let st: BuildData = { started: Date.now(), live: true, done: false, panel: false, preview: false };
  const setSt = a.custom('build', st);
  const upd = (p: Partial<BuildData>) => {
    st = { ...st, ...p };
    setSt(st);
  };
  let n = 0;
  const row = (r: Omit<StepRow, 'id'>) => {
    let cur: StepRow = { ...r, id: `b${++n}` };
    const set = a.custom('brow', cur);
    return (p: Partial<StepRow>) => {
      cur = { ...cur, ...p };
      set(cur);
    };
  };
  await at(3170);
  upd({ live: false });
  const p1 = alongside(a.stream(t.b1, 16));
  await at(3589);
  const read = row({ kind: 'tool', icon: 'read', text: t.filesRead1, active: true });
  upd({ live: true });
  await at(4374);
  upd({ panel: true });
  await at(7500);
  await p1;
  row({ kind: 'think', text: 'Creating the click counter page' });
  await at(7860);
  const p2 = alongside(a.stream(t.b2, 16));
  await at(9120);
  read({ icon: 'explore', text: t.explored(1, 2), active: false });
  await at(10500);
  const sk1 = row({ kind: 'tool', icon: 'skill', text: t.skill1, active: true });
  await at(12000);
  sk1({ active: false });
  await at(12500);
  const ex2 = row({ kind: 'tool', icon: 'explore', text: t.explored2, active: true });
  await at(14000);
  ex2({ active: false });
  await at(15000);
  const sk2 = row({ kind: 'tool', icon: 'skill', text: t.skill1, active: true });
  await at(16500);
  sk2({ active: false });
  const ex3 = row({ kind: 'tool', icon: 'explore', text: t.explored3, active: true });
  await at(18500);
  ex3({ active: false });
  await at(19000);
  row({ kind: 'think', text: 'Building the click counter page' });
  await at(21500);
  const se = row({ kind: 'search', count: 1, active: true });
  await at(23500);
  se({ active: false });
  await at(25000);
  const impl = row({ kind: 'think', text: 'Implementing the click counter page' });
  const subs = ['Designing the click counter interface', 'Implementing the click counter logic', 'Refining the click counter implementation', 'Writing the click counter component', 'Finalizing the click counter page', 'Refining the click counter logic', 'Writing the click counter page'];
  for (let i = 0; i < subs.length; i++) {
    await at(26500 + i * 2600);
    impl({ subs: subs.slice(0, i + 1) });
  }
  await p2;
  await at(60000);
  upd({ live: false });
  await a.stream(t.b3, 16);
  const rd = row({ kind: 'tool', icon: 'read', text: t.filesRead1, active: true });
  upd({ live: true });
  await at(65000);
  rd({ active: false });
  const ed = row({ kind: 'tool', icon: 'edit', text: t.edited1, active: true });
  await at(70000);
  ed({ text: t.edited3 });
  await at(76000);
  ed({ text: t.edited7 });
  await at(98000);
  ed({ active: false });
  await at(100000);
  upd({ live: false, done: true, preview: true, seconds: Math.max(1, Math.round((Date.now() - st.started) / 1000)) });
  a.done();
}

/** Bot: no thinking block, just a working row for ~3s and a short reply streamed into a grey bubble. */
async function botReply(api: ChatScriptApi) {
  const a = api.assistant();
  await api.sleep(3000);
  await a.stream(copyOf(COPY_SCRIPTS).botHi, 4);
  a.done();
}

const planOf = (text: string) => (/pok[eé]mon/i.test(text) && text.length < 60 ? pokemon() : planFor(text));
const answerWith = (api: ChatScriptApi, text: string, model: ModelId, bot: Bot | null) => {
  if (model === 'bot' && bot) return botReply(api);
  if (model === 'build') return build(api);
  if (model === 'heavy') return heavy(api, planOf(text));
  return (model === 'expert' ? expert : model === 'fast' ? rapide : auto)(api, planOf(text), text);
};

const intro = async (api: ChatScriptApi) => {
  await api.sleep(600);
  await api.user(copyOf(COPY_SCRIPTS).introPrompt, { type: true });
  await heavy(api, pokemon());
};

/* ---------- Bot threads: each bot keeps its own messages (local, outside the chat engine) ---------- */

const textMsg = (id: string, role: 'user' | 'assistant', text: string, done = true): Message => ({ id, role, done, parts: [{ kind: 'text', id: `${id}:t`, text, shown: text.length, done }] });
const botSeed = (): Record<string, Message[]> => {
  const seed = copyOf(COPY_SCRIPTS).seed;
  const ids: Record<string, string[]> = { 'b-chef': ['s1', 's2'], 'b-run': ['s3', 's4'] };
  return Object.fromEntries(Object.entries(seed).map(([bot, [[u, r]]]) => [bot, [textMsg(ids[bot][0], 'user', u), textMsg(ids[bot][1], 'assistant', r)]]));
};
const botLine = (n: number) => copyOf(COPY_SCRIPTS).botLines[n % 4];

/** A past chat as the assistant turn draws it: the canned answer, a sources pill and the action row (no streaming). */
const pastAnswer = (rec: ChatRec): Message => ({
  id: `${rec.id}:a`,
  role: 'assistant',
  done: true,
  parts: [
    { kind: 'text', id: `${rec.id}:t`, text: rec.answer || rec.snippet, shown: (rec.answer || rec.snippet).length, done: true },
    { kind: 'custom', id: `${rec.id}:s`, type: 'sources', data: { count: 8 + (hueOf(rec.id) % 17), favicons: [S.wk, S.rd, S.yt] } },
  ],
});

/* ---------- The app ---------- */

const NARROW = '(max-width: 767px)';
function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(NARROW).matches);
  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

export default function GrokTemplate() {
  const ap = useCopy(COPY_APP);
  const ts0 = useCopy(COPY_SIDE);
  const tcore = useCopy(COPY_CORE);
  const [model, setModel] = useState<ModelId>('heavy');
  const modelRef = useRef(model);
  modelRef.current = model;
  // Bot sends never reach the engine (they go to the bot's own thread), so the engine answers with the picked model.
  const reply = useCallback((api: ChatScriptApi, text: string) => answerWith(api, text, modelRef.current === 'bot' ? 'auto' : modelRef.current, null), []);
  const chat = useChatEngine({ intro, reply });
  const narrow = useNarrow();
  const [view, setView] = useState<View>({ kind: 'chat' });
  const [sideOpen, setSideOpen] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [panel, setPanel] = useState<{ id: string; mode: PanelMode } | null>(null);
  const [search, setSearch] = useState(false);
  const [incognito, setIncognito] = useState(false);
  const [privateTone, setPrivateTone] = useState<PrivateTone>('violet');
  // Sidebar data, lifted so every menu and dialog really changes it.
  const [bots, setBots] = useState(makeBots);
  const [groups, setGroups] = useState(makeGroups);
  const [history, setHistory] = useState(makeHistory);
  const [liveMeta, setLiveMeta] = useState<{ title?: string; pinned?: boolean; project?: string }>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [lib, setLib] = useState(makeLib);
  const [autos, setAutos] = useState(makeAutos);
  const [connected, setConnected] = useState<string[]>([]);
  const [runs, setRuns] = useState<ImagineRun[]>([]);
  const [imagine, setImagine] = useState<ImagineOpts>({ mode: 'image', speed: 'fast', count: 'auto', ratio: '2:3', res: '720p', dur: '6s', audio: true });
  const [promo, setPromo] = useState(true);
  const [botChats, setBotChats] = useState<Record<string, Message[]>>(botSeed);
  const [botBusy, setBotBusy] = useState<Record<string, boolean>>({});
  const [botDrafts, setBotDrafts] = useState<Record<string, string>>({});
  const botTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Dialogs
  const [createBot, setCreateBot] = useState<{ name?: string } | null>(null);
  const [botSettings, setBotSettings] = useState<string | null>(null);
  const [chooseMain, setChooseMain] = useState(false);
  const [newSection, setNewSection] = useState<string | null>(null);
  const [createProject, setCreateProject] = useState<{ then?: (id: string) => void } | null>(null);
  const [plugins, setPlugins] = useState<PluginTab | null>(null);
  const [settings, setSettings] = useState<SettingsSection | null>(null);
  const [confirm, setConfirm] = useState<ConfirmOpts | null>(null);
  const [computer, setComputer] = useState<string | null>(null);
  // Auto: the "Réfléchir plus" chip lands 0.85s after sending and stays until closed.
  const [steer, setSteer] = useState<'off' | 'on' | 'closed'>('off');
  const steerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const [rootW, setRootW] = useState(1280);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRootW(el.clientWidth));
    ro.observe(el);
    setRootW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useEffect(() => () => Object.values(botTimers.current).forEach(clearTimeout), []);
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  const msgs = chat.messages;
  const empty = msgs.length === 0;
  const firstUser = msgs.find((m) => m.role === 'user');
  const liveTitle = firstUser && !incognito ? textPart(firstUser)?.text : undefined;
  const live: ChatRec | null = liveTitle ? { id: 'live', title: liveMeta.title ?? liveTitle, when: ts0.justNow, group: ts0.today, snippet: '', answer: '', pinned: liveMeta.pinned, project: liveMeta.project } : null;
  const chats = live ? [live, ...history] : history;
  const isChat = view.kind === 'chat';
  // The grey private mode's glow behind the home composer.
  const glow = incognito && privateTone === 'gris';
  // The right panel folds like the sidebar, so the last one it showed stays mounted while its column closes.
  const [shownPanel, setShownPanel] = useState(panel);
  if (panel && panel !== shownPanel) setShownPanel(panel);
  const shown = panel ?? shownPanel;
  const panelData = dataOf<AgentsData>(
    msgs.find((m) => m.id === shown?.id),
    'agents',
  );
  const panelOpen = isChat && !!panel && !!panelData?.done;
  const sidePanel = shown && panelData?.done && <SidePanel key={`${shown.id}-${shown.mode}`} mode={shown.mode} data={panelData} onClose={() => setPanel(null)} />;
  const lastLog = [...msgs].reverse().find((m) => dataOf<AgentsData>(m, 'agents')?.done);
  // Build: the 659px preview opens beside the thread (squeezed to what is left of a small window; the sidebar folds to its rail).
  const build = dataOf<BuildData>([...msgs].reverse().find((m) => m.role === 'assistant'), 'build');
  const buildOpen = !!build?.panel && !narrow && isChat;
  const buildW = Math.max(300, Math.min(659, rootW - (sideOpen ? 256 : 57) - 340));
  useEffect(() => {
    if (buildOpen && rootW < 1240) setSideOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildOpen]);

  // Follow the stream while the reader stays at the bottom; scrolling up lets them read in peace.
  useEffect(() => {
    const el = scroller.current;
    if (el && pinned.current && isChat) el.scrollTop = el.scrollHeight;
  });
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAtBottom(pinned.current);
  };
  const toBottom = () => {
    const el = scroller.current;
    pinned.current = true;
    setAtBottom(true);
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  const go = (v: View) => {
    setView(v);
    setDrawer(false);
  };
  const newChat = () => {
    chat.reset();
    setPanel(null);
    setDrawer(false);
    setIncognito(false);
    setLiveMeta({});
    clearTimeout(steerTimer.current);
    setSteer('off');
    setView({ kind: 'chat' });
  };
  const pick = (q: string) => {
    newChat();
    pinned.current = true;
    chat.send(q);
  };

  /* Bots */
  const patchBot = (id: string, p: Partial<Bot> | null) => {
    if (p) return setBots((bs) => bs.map((b) => (b.id === id ? { ...b, ...p } : b)));
    setBots((bs) => bs.filter((b) => b.id !== id));
    clearTimeout(botTimers.current[id]);
    setBotChats((c) => {
      const rest = { ...c };
      delete rest[id];
      return rest;
    });
    if (view.kind === 'bot' && view.id === id) setView({ kind: 'chat' });
  };
  const openBot = (id: string) => {
    setBots((bs) => bs.map((b) => (b.id === id ? { ...b, unread: false } : b)));
    go({ kind: 'bot', id });
  };
  const sendBot = (id: string, text: string) => {
    const t = text.trim();
    if (!t || botBusy[id]) return;
    const n = (botChats[id] ?? []).filter((m) => m.role === 'user').length;
    setBotChats((c) => ({ ...c, [id]: [...(c[id] ?? []), textMsg(newId('u'), 'user', t)] }));
    setBotDrafts((d) => ({ ...d, [id]: '' }));
    setBotBusy((b) => ({ ...b, [id]: true }));
    // As in grok: a working row for ~3s, then the reply streams into the grey bubble (~4 words a second).
    const words = botLine(n).match(/\S+\s*/g) ?? [];
    const aid = newId('a');
    let i = 0;
    const tick = () => {
      i = Math.min(words.length, i + 1);
      const done = i >= words.length;
      const msg = textMsg(aid, 'assistant', words.slice(0, i).join('').trimEnd(), done);
      setBotChats((c) => {
        const list = c[id] ?? [];
        return { ...c, [id]: list.some((m) => m.id === aid) ? list.map((m) => (m.id === aid ? msg : m)) : [...list, msg] };
      });
      if (done) {
        setBotBusy((b) => ({ ...b, [id]: false }));
        delete botTimers.current[id];
      } else botTimers.current[id] = setTimeout(tick, 240);
    };
    botTimers.current[id] = setTimeout(tick, 3000);
  };
  const stopBot = (id: string) => {
    clearTimeout(botTimers.current[id]);
    delete botTimers.current[id];
    setBotBusy((b) => ({ ...b, [id]: false }));
    setBotChats((c) => ({ ...c, [id]: (c[id] ?? []).map((m) => (m.done ? m : { ...m, done: true })) }));
  };

  /* Chats */
  const patchChat = (id: string, p: Partial<ChatRec> | null) => {
    if (id === 'live') {
      if (!p) return newChat();
      return setLiveMeta((m) => ({ ...m, ...(p.title !== undefined && { title: p.title }), ...('pinned' in p && { pinned: p.pinned }), ...('project' in p && { project: p.project }) }));
    }
    if (p) return setHistory((h) => h.map((c) => (c.id === id ? { ...c, ...p } : c)));
    setHistory((h) => h.filter((c) => c.id !== id));
    if (view.kind === 'history' && view.id === id) setView({ kind: 'chat' });
  };
  const openChat = (id: string) => go(id === 'live' ? { kind: 'chat' } : { kind: 'history', id });

  const send = (q?: string) => {
    const text = q ?? chat.draft;
    if (!text.trim() || chat.busy) return;
    if (model === 'bot') {
      // Bot: the message goes to the main bot's own page and thread.
      const main = bots.find((b) => b.main && !b.hidden) ?? bots.find((b) => b.pinned) ?? bots[0];
      if (main) {
        chat.setDraft('');
        sendBot(main.id, text);
        openBot(main.id);
        return;
      }
    }
    pinned.current = true;
    setAtBottom(true);
    if (model === 'auto' && steer === 'off') {
      clearTimeout(steerTimer.current);
      steerTimer.current = setTimeout(() => setSteer((v) => (v === 'off' ? 'on' : v)), 850);
    }
    chat.send(text);
  };
  const regenerate = (m: Message) => {
    const i = msgs.indexOf(m);
    const asked = [...msgs.slice(0, i)].reverse().find((x) => x.role === 'user');
    const text = asked && textPart(asked)?.text;
    if (!text || chat.busy) return;
    if (panel?.id === m.id) setPanel(null);
    chat.remove(m.id);
    pinned.current = true;
    void chat.run((api) => reply(api, text));
  };

  // Ctrl+K opens search, Ctrl+J starts a new chat (as on grok.com).
  useEffect(() => {
    const on = (e: globalThis.KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      const k = e.key.toLowerCase();
      if (k === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      } else if (k === 'j') {
        e.preventDefault();
        newChat();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const store: Store = {
    view,
    go,
    bots,
    setBots,
    patchBot,
    openBot,
    groups,
    setGroups,
    chats,
    patchChat,
    openChat,
    clearChats: () => {
      setHistory([]);
      newChat();
    },
    projects,
    setProjects,
    lib,
    setLib,
    autos,
    setAutos,
    connected,
    setConnected,
    runs,
    setRuns,
    imagine,
    setImagine,
    ask: (q, m, project) => {
      if (m) {
        modelRef.current = m;
        setModel(m);
      }
      pick(q);
      if (project) setLiveMeta({ project });
    },
    ui: {
      createBot: (name) => setCreateBot({ name }),
      botSettings: setBotSettings,
      chooseMain: () => setChooseMain(true),
      newSection: setNewSection,
      createProject: (then) => setCreateProject({ then }),
      plugins: (tab = 'connectors') => {
        setDrawer(false);
        setPlugins(tab);
      },
      settings: (sec = 'home') => {
        setDrawer(false);
        setSettings(sec);
      },
      confirm: setConfirm,
      computer: setComputer,
    },
  };

  // While the intro types into the home composer the button reads as Send, as it would under your own typing.
  const composer = (placeholder?: string) => (
    <Composer value={chat.draft} onChange={chat.setDraft} onSend={() => send()} busy={chat.busy && !empty} onStop={chat.stop} placeholder={placeholder} model={model} onModel={setModel} incognito={incognito && privateTone} />
  );
  const openSearch = () => {
    setDrawer(false);
    setSearch(true);
  };
  const sidebar = <Sidebar onNew={newChat} onClose={() => (narrow ? setDrawer(false) : setSideOpen(false))} onSearch={openSearch} />;
  const lead = narrow ? (
    <IconBtn label={ap.showSidebar} onClick={() => setDrawer(true)}>
      <G d={P.sidebar} className="size-[18px]" />
    </IconBtn>
  ) : undefined;

  const curBot = view.kind === 'bot' ? bots.find((b) => b.id === view.id) : undefined;
  const curRec = view.kind === 'history' ? history.find((c) => c.id === view.id) : isChat ? (live ?? undefined) : undefined;
  const curProject = view.kind === 'project' ? projects.find((p) => p.id === view.id) : undefined;

  /** "Plus" over a thread: Épingler, Déplacer vers le projet (projects + Créer un projet), Supprimer le chat. */
  const threadMenu = (rec?: ChatRec) => (
    <Menu
      align="end"
      className="w-[218px]"
      trigger={
        <IconBtn label={ap.more}>
          <Ellipsis className="size-[18px]" />
        </IconBtn>
      }
    >
      <MenuItem icon={rec?.pinned ? <PinOff className="size-4" strokeWidth={2} /> : <Pin className="size-4" strokeWidth={2} />} onSelect={() => rec && patchChat(rec.id, { pinned: !rec.pinned })}>
        {rec?.pinned ? ts0.unpin : ts0.pin}
      </MenuItem>
      <SubMenu icon={<G d={P.folder} className="size-4" />} label={ap.moveToProject}>
        {projects.map((p) => (
          <DM.Item key={p.id} onSelect={() => rec && (patchChat(rec.id, { project: p.id }), toast(ap.movedTo(p.name)))} className={cn(ROW, 'h-8')}>
            <MenuIcon>
              <G d={P.folder} className="size-4" />
            </MenuIcon>
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            {rec?.project === p.id && <G d={P.check} className="size-4" />}
          </DM.Item>
        ))}
        {projects.length > 0 && <MenuSep />}
        <MenuItem tall icon={<G d={P.plus} className="size-4" />} onSelect={() => setCreateProject({ then: (pid) => rec && patchChat(rec.id, { project: pid }) })}>
          {ap.createProject}
        </MenuItem>
      </SubMenu>
      <MenuItem danger icon={<Trash2 className="size-4" strokeWidth={2} />} onSelect={() => (rec ? patchChat(rec.id, null) : newChat())}>
        {ap.deleteChat}
      </MenuItem>
    </Menu>
  );
  const threadHeader = (rec?: ChatRec) => (
    <header className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between px-3" style={{ background: `linear-gradient(${C.base} 70%, transparent)` }}>
      <div className="flex items-center">
        {narrow && (
          <>
            {lead}
            <IconBtn label={ap.newChat} onClick={newChat}>
              <G d={P.chat} className="size-[18px]" />
            </IconBtn>
          </>
        )}
      </div>
      {isChat && empty ? (
        <div className="flex items-center gap-1">
          {incognito && (
            <div role="radiogroup" aria-label={ap.privateStyle} className="grok-fade flex h-10 items-center gap-1 rounded-full px-1.5">
              {(
                [
                  ['violet', ap.purple, C.incognitoFg],
                  ['gris', ap.gray, C.incognitoGreyFg],
                ] as const
              ).map(([tone, label, dot]) => (
                <button
                  key={tone}
                  type="button"
                  role="radio"
                  aria-checked={privateTone === tone}
                  aria-label={label}
                  title={label}
                  onClick={() => setPrivateTone(tone)}
                  className={cn('grid size-7 place-items-center rounded-full transition-colors', privateTone === tone ? 'bg-[rgba(252,252,252,0.1)]' : 'hover:bg-[rgba(252,252,252,0.06)]')}
                >
                  <span className="size-3.5 rounded-full" style={{ background: dot, boxShadow: privateTone === tone ? `0 0 0 2px ${C.base}, 0 0 0 3.5px ${dot}` : undefined }} />
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            aria-pressed={incognito}
            aria-label={incognito ? ap.leavePrivate : ap.switchPrivate}
            onClick={() => setIncognito((v) => !v)}
            className={cn('flex h-10 items-center gap-2 rounded-full px-4 text-[14px] leading-[19.6px] font-medium transition-colors', incognito ? 'bg-[rgba(252,252,252,0.1)]' : 'hover:bg-[rgba(252,252,252,0.06)]')}
            style={{ color: C.fg }}
          >
            <G d={P.privacy} className="size-[18px]" />
            {ap.private}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {threadMenu(rec)}
          <IconBtn label={tcore.shareLink} onClick={() => (void navigator.clipboard?.writeText(`grok.com/share/${rec?.id ?? 'chat'}`).catch(() => {}), toast(ap.shareCopied))}>
            <G d={P.link} className="size-[18px]" />
          </IconBtn>
          <IconBtn label={ap.togglePanel} active={!!panel} onClick={() => isChat && setPanel((p) => (p ? null : lastLog ? { id: lastLog.id, mode: 'thoughts' } : null))}>
            <G d={P.panel} className="size-[18px] -scale-x-100" />
          </IconBtn>
        </div>
      )}
    </header>
  );
  const bottomComposer = (node: ReactNode, chip?: ReactNode) => (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-2 pb-3 sm:px-4 sm:pb-5" style={{ background: `linear-gradient(to bottom, transparent, ${C.base} 40%)` }}>
      <div className="relative mx-auto w-full max-w-[752px] pt-6">
        {isChat && !atBottom && (
          <button type="button" aria-label={ap.scrollDown} onClick={toBottom} className="grok-enter pointer-events-auto absolute -top-6 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full border transition-colors hover:text-[#fcfcfc]" style={{ background: C.raised, borderColor: C.line, color: C.fg2 }}>
            <G d={P.chevron} className="size-4" />
          </button>
        )}
        <div className="pointer-events-auto relative">
          {chip}
          {node}
        </div>
      </div>
    </div>
  );

  let page: ReactNode = null;
  if (view.kind === 'chat')
    page = (
      <>
        {threadHeader(live ?? undefined)}
        {empty ? (
          <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-[12vh]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <span
                className="grok-anim absolute left-1/2 h-[380px] w-[min(1100px,140%)] rounded-[50%] transition-[opacity,transform] duration-1000"
                style={{ top: 'calc(50% - 6vh + 30px)', background: C.incognitoGlow, filter: 'blur(100px)', opacity: glow ? 1 : 0, transform: `translate(-50%, -50%) scale(${glow ? 1 : 0})`, transitionTimingFunction: EASE_GLOW }}
              />
            </div>
            <h1 className="relative mb-7 text-center text-[24px] leading-[32.4px] font-[550]">
              {ap.headPre}{' '}
              <span className="relative inline-block">
                {ap.headEm}
                <span aria-hidden="true" className="grok-underline absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full" />
              </span>
            </h1>
            <div className="relative w-full max-w-[752px]">
              {model === 'build' && <BuildChips onPick={chat.setDraft} />}
              {composer(model === 'bot' ? ap.messageBot : undefined)}
              {incognito && (
                <div className="absolute inset-x-0 top-full">
                  <PrivateNotice />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div ref={scroller} onScroll={onScroll} className="grok-scroll flex-1 overflow-y-auto">
              <div className="mx-auto flex w-full max-w-[736px] flex-col gap-3 px-4 pt-20 pb-48">
                {msgs.map((m) => {
                  if (m.role === 'user') return <UserTurn key={m.id} text={textPart(m)?.text ?? ''} />;
                  const b = dataOf<BuildData>(m, 'build');
                  if (b) return <BuildTurn key={m.id} m={m} build={b} />;
                  return (
                    <AssistantTurn
                      key={m.id}
                      m={m}
                      onOpenLog={() => setPanel({ id: m.id, mode: 'thoughts' })}
                      onOpenSources={() => setPanel(dataOf<AgentsData>(m, 'agents')?.items.length ? { id: m.id, mode: 'sources' } : null)}
                      onAsk={(q) => send(q)}
                      onRegenerate={() => regenerate(m)}
                    />
                  );
                })}
              </div>
            </div>
            {bottomComposer(composer(ap.askAnything), steer === 'on' && model === 'auto' ? <SteerChip onClose={() => setSteer('closed')} /> : undefined)}
          </>
        )}
      </>
    );
  else if (view.kind === 'history' && curRec)
    page = (
      <>
        {threadHeader(curRec)}
        <div key={curRec.id} className="grok-scroll flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[736px] flex-col gap-3 px-4 pt-20 pb-48">
            <UserTurn text={curRec.title} />
            <AssistantTurn m={pastAnswer(curRec)} onOpenLog={() => {}} onOpenSources={() => {}} onAsk={(q) => pick(q)} onRegenerate={() => pick(curRec.title)} />
          </div>
        </div>
        {/* A follow-up starts a fresh live chat: past chats are not replayed by the streaming engine. */}
        {bottomComposer(<Composer value={chat.draft} onChange={chat.setDraft} onSend={() => chat.draft.trim() && pick(chat.draft)} busy={false} onStop={chat.stop} placeholder={ap.askAnything} model={model} onModel={setModel} />)}
      </>
    );
  else if (view.kind === 'bot' && curBot)
    page = (
      <BotPage
        key={curBot.id}
        bot={curBot}
        lead={lead}
        msgs={botChats[curBot.id] ?? []}
        busy={!!botBusy[curBot.id]}
        composer={<Composer value={botDrafts[curBot.id] ?? ''} onChange={(v) => setBotDrafts((d) => ({ ...d, [curBot.id]: v }))} onSend={() => sendBot(curBot.id, botDrafts[curBot.id] ?? '')} busy={!!botBusy[curBot.id]} onStop={() => stopBot(curBot.id)} placeholder={ap.sendTo(curBot.name)} model={model} onModel={setModel} hideModel />}
      />
    );
  else if (view.kind === 'imagine') page = <ImaginePage lead={lead} />;
  else if (view.kind === 'template') page = <TemplatePage key={view.slug} slug={view.slug} />;
  else if (view.kind === 'library') page = <LibraryPage tab={view.tab} lead={lead} />;
  else if (view.kind === 'automations') page = <AutomationsPage lead={lead} />;
  else if (view.kind === 'project' && curProject)
    page = (
      <>
        {lead && <div className="absolute top-3 left-3 z-30">{lead}</div>}
        <ProjectPage project={curProject} />
      </>
    );
  else
    page = (
      <div className="m-auto flex flex-col items-center gap-3 text-[14px]" style={{ color: C.fg2 }}>
        {ap.gone}
        <button type="button" onClick={newChat} className={BTN_SOFT}>
          {ap.backToChat}
        </button>
      </div>
    );

  return (
    <StoreCtx.Provider value={store}>
      <Tooltip.Provider delayDuration={700} skipDelayDuration={300}>
        <div ref={root} className="grok-root relative flex h-full overflow-hidden" style={{ background: C.base, color: C.fg }}>
          <style>{CSS}</style>

          {!narrow && (
            <div className="relative shrink-0 overflow-hidden border-e transition-[width] duration-300" style={{ width: sideOpen ? 256 : 57, transitionTimingFunction: EASE, background: C.side, borderColor: sideOpen ? 'transparent' : C.line }}>
              <div className={cn('absolute inset-y-0 start-0 transition-opacity duration-200', sideOpen ? 'opacity-100' : 'pointer-events-none opacity-0')} inert={!sideOpen}>
                {sidebar}
              </div>
              <div className={cn('absolute inset-y-0 start-0 transition-opacity duration-200', sideOpen ? 'pointer-events-none opacity-0' : 'opacity-100')} inert={sideOpen}>
                <Rail onOpen={() => setSideOpen(true)} onNew={newChat} onSearch={openSearch} />
              </div>
            </div>
          )}
          {narrow && drawer && (
            <div className="absolute inset-0 z-40 flex">
              <div className="grok-enter h-full shadow-2xl">{sidebar}</div>
              <button type="button" aria-label={ap.closeMenu} className="flex-1 bg-black/50" onClick={() => setDrawer(false)} />
            </div>
          )}

          <main className="relative flex min-w-0 flex-1 flex-col">{page}</main>

          {!narrow && (
            <div className="shrink-0 overflow-hidden transition-[width] duration-300" style={{ width: buildOpen ? buildW : 0, transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}>
              {build?.panel && isChat && <BuildPanel width={buildW} preview={build.preview} />}
            </div>
          )}

          {!narrow && (
            <div className="relative shrink-0 overflow-hidden transition-[width] duration-300" style={{ width: panelOpen ? 480 : 0, transitionTimingFunction: EASE }}>
              <div className={cn('absolute inset-y-0 end-0 w-[480px] transition-opacity duration-200', panelOpen ? 'opacity-100' : 'pointer-events-none opacity-0')} inert={!panelOpen}>
                {isChat && sidePanel}
              </div>
            </div>
          )}
          {narrow && panelOpen && <div className="grok-enter absolute inset-y-0 end-0 z-30 w-full">{sidePanel}</div>}

          {view.kind === 'imagine' && promo && !narrow && (
            <PromoCard
              onClose={() => setPromo(false)}
              onTry={() => {
                setPromo(false);
                setImagine((o) => ({ ...o, mode: 'video' }));
              }}
            />
          )}

          <SearchDialog
            open={search}
            onOpenChange={setSearch}
            chats={chats}
            thread={msgs}
            onPick={openChat}
            onPrivate={() => {
              newChat();
              setIncognito(true);
            }}
          />
          <CreateBotDialog
            open={!!createBot}
            initialName={createBot?.name}
            onClose={() => setCreateBot(null)}
            onCreate={(b) => {
              const id = newId('b');
              setBots((bs) => [...bs, { id, ...b, group: '' }]);
              setCreateBot(null);
              go({ kind: 'bot', id });
            }}
          />
          <BotSettingsDialog bot={bots.find((b) => b.id === botSettings) ?? null} onClose={() => setBotSettings(null)} />
          <ChooseMainDialog open={chooseMain} onClose={() => setChooseMain(false)} />
          <NewSectionDialog botId={newSection} onClose={() => setNewSection(null)} />
          <CreateProjectDialog
            open={!!createProject}
            onClose={() => setCreateProject(null)}
            onCreate={(name, files) => {
              const id = newId('p');
              setProjects((p) => [...p, { id, name, files, instructions: '' }]);
              const then = createProject?.then;
              setCreateProject(null);
              if (then) then(id);
              else go({ kind: 'project', id });
            }}
          />
          <PluginsDialog tab={plugins} onTab={setPlugins} onClose={() => setPlugins(null)} />
          <SettingsDialog section={settings} onSection={setSettings} onClose={() => setSettings(null)} />
          <ComputerDialog bot={bots.find((b) => b.id === computer) ?? null} onClose={() => setComputer(null)} />
          <ConfirmDialog opts={confirm} onClose={() => setConfirm(null)} />
          <Toaster />
        </div>
      </Tooltip.Provider>
    </StoreCtx.Provider>
  );
}
