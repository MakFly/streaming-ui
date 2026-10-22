import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The Streaming UI type ramp (text-body-regular, text-caption-1-medium…) are font-size utilities, not colors:
// teach tailwind-merge so `text-text-primary` and `text-body-medium` don't cancel each other out.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [(v: string) => /^(large-title|display-\d|title-\d|headline|body|body-2|caption-\d)(-|$)/.test(v)] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
