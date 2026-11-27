import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'xxs',
            'display-1',
            'display-2',
            'title',
            'title-1',
            'title-2',
            'section',
            'body',
            'caption',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
