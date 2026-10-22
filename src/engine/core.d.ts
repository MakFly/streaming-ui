export function createCore(): {
  demos: unknown[];
  H: Record<string, unknown>;
  refs: Record<string, unknown>;
  consts: Record<string, string>;
  timers: () => unknown;
};
