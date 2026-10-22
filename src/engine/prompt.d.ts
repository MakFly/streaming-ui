import type { DemoSource } from './types';

export interface RegistryItem {
  name: string;
  url: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files?: { path?: string; target?: string; content?: string }[];
  cssVars?: Record<string, unknown>;
  css?: Record<string, unknown>;
}
export const slug: (s: string) => string;
export const keyOf: (d: Pick<DemoSource, 'group' | 'title'>) => string;
export function loadItems(d: DemoSource): Promise<{ items: RegistryItem[]; note?: string }>;
export function buildPrompt(d: DemoSource, items: RegistryItem[], note: string | undefined, demo: string): string;
export function createPrompt(
  d: DemoSource,
  refs: { H: unknown; refs: unknown; consts: unknown },
): Promise<{ items: RegistryItem[]; note: string; demo: string; prompt: string }>;
