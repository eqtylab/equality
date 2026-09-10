declare module 'microlighter' {
  interface HighlightAllOptions {
    root?: ParentNode;
    selector?: string;
    languageAliases?: Record<string, string>;
  }

  export function highlightAll(options?: HighlightAllOptions): Promise<HTMLElement[]>;
}
