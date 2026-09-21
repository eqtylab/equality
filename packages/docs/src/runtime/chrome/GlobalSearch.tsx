import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContainer,
  DialogDescription,
  DialogTitle,
  EmptyTableState,
  Icon,
} from '@eqtylab/equality';

import styles from './GlobalSearch.module.css';

/** The header sits outside `Command`: moving the query there costs a hidden input and key forwarding. */

/**
 * Equality ships unlayered CSS, and an unlayered declaration beats anything in
 * `@layer utilities` whatever its specificity. So any utility here that has to
 * overrule a value Equality already sets on the same element needs `!` — the list's
 * own `max-height: 300px` is one, and without the `!` the results pane silently
 * shrinks. Utilities setting a property Equality leaves alone need nothing.
 */

/** Equality styles the hover but not cmdk's selected row. Matches the sidebar's current
 * page on purpose: the two highlights have to agree. */
const ITEM =
  'cursor-pointer data-[selected=true]:bg-lilac-300/50 data-[selected=true]:text-lilac-700 data-[selected=true]:shadow-sm dark:data-[selected=true]:bg-lilac-600/50 dark:data-[selected=true]:text-lilac-100';

/** Equality has no highlight colour, so these name lilac steps directly, one per theme.
 * Never `brand-primary`: it is the selected row's own colour, so the mark would vanish
 * exactly when a row is selected. */
const MARK = 'rounded bg-lilac-200 px-0.5 text-lilac-800 dark:bg-lilac-700 dark:text-lilac-200';

/** The same treatment, for the <mark>s inside Pagefind's own excerpt markup. */
const HIT_SUMMARY =
  'text-text-secondary line-clamp-1 text-xs [&_mark]:rounded [&_mark]:bg-lilac-200 [&_mark]:px-0.5 [&_mark]:text-lilac-800 dark:[&_mark]:bg-lilac-700 dark:[&_mark]:text-lilac-200';

const MAX_RESULTS = 20;
const PAGE_SIZE = 5;
const RECENT_KEY = 'eq-docs-recent-pages';
const MAX_RECENT = 5;

/** Hand-written: Pagefind is fetched at runtime, so no package supplies types. */
interface PagefindDoc {
  url: string;
  excerpt: string;
  /** Stamped by Prose.astro; `crumbs` is the `_group.yaml` trail, not the URL. */
  meta?: { title?: string; crumbs?: string; description?: string };
}

interface PagefindRawResult {
  id: string;
  data: () => Promise<PagefindDoc>;
}

interface PagefindApi {
  options: (opts: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  debouncedSearch: (query: string) => Promise<{ results: PagefindRawResult[] } | null>;
}

interface Props {
  suggested?: Array<{ label: string; href: string }>;
}

function toRecent(item: { label: string; href: string }): RecentPage {
  return { url: item.href, title: item.label };
}

interface Hit {
  id: string;
  url: string;
  title: string;
  summary: string;
  isExcerpt: boolean;
  crumbs?: string;
}

const BASE = import.meta.env.BASE_URL;
const BUNDLE_PATH = `${BASE.replace(/\/+$/, '')}/pagefind/`;

let apiPromise: Promise<PagefindApi> | null = null;

/** Drop `@vite-ignore` and the build fails: this path exists only after the build runs. */
function loadPagefind(): Promise<PagefindApi> {
  if (!apiPromise) {
    apiPromise = import(/* @vite-ignore */ `${BUNDLE_PATH}pagefind.js`).then(async (module) => {
      const api = module as unknown as PagefindApi;
      // Without `baseUrl` every result href misses the base on a versioned deploy.
      await api.options({ baseUrl: BASE, bundlePath: BUNDLE_PATH });
      await api.init();
      return api;
    });
  }
  return apiPromise;
}

interface RecentPage {
  url: string;
  title: string;
  crumbs?: string;
}

function getRecentPages(): RecentPage[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? (JSON.parse(stored) as RecentPage[]) : [];
  } catch {
    return [];
  }
}

/** Reads the page it is on from the same attributes the index is built from. */
function recordCurrentPage(): RecentPage[] {
  const heading = document.querySelector('h1[data-pagefind-meta="title"]');
  const article = document.querySelector('article[data-pagefind-body]');
  const title = heading?.textContent?.trim();
  if (!title) return getRecentPages();

  const meta = article?.getAttribute('data-pagefind-meta') ?? '';
  const crumbs = meta.startsWith('crumbs:') ? meta.slice('crumbs:'.length) : undefined;
  const entry: RecentPage = { url: window.location.pathname, title, crumbs };

  try {
    const kept = getRecentPages().filter((page) => page.url !== entry.url);
    const updated = [entry, ...kept].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getRecentPages();
  }
}

function isTypingTarget(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className={MARK}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function GlobalSearch({ suggested = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [expanded, setExpanded] = useState(false);
  // Lazy initializer, safe only because this island is client:only and never prerenders.
  const [recentPages] = useState<RecentPage[]>(recordCurrentPage);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const requestId = useRef(0);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setHits([]);
    setStatus('idle');
    setExpanded(false);
    requestId.current++;
    // DialogContainer preventDefaults onCloseAutoFocus; drop this and a keyboard user lands on <body>.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [setExpanded]);

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (isOpen) close();
        else open();
      }
      // Escape is handled by Radix once the dialog is open.
      if (event.key === '/' && !isOpen && !isTypingTarget()) {
        event.preventDefault();
        open();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, open, close]);

  const runSearch = useCallback(async (value: string) => {
    const id = ++requestId.current;
    if (!value.trim()) {
      setHits([]);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    try {
      const api = await loadPagefind();
      const search = await api.debouncedSearch(value);
      // Null means a newer keystroke superseded this call.
      if (search === null || id !== requestId.current) return;
      const docs = await Promise.all(search.results.slice(0, MAX_RESULTS).map((r) => r.data()));
      if (id !== requestId.current) return;
      setHits(
        docs.map((doc, index) => ({
          id: search.results[index].id,
          url: doc.url,
          title: doc.meta?.title ?? doc.url,
          summary: doc.meta?.description ?? doc.excerpt,
          isExcerpt: !doc.meta?.description,
          crumbs: doc.meta?.crumbs,
        }))
      );
      setStatus('ready');
    } catch {
      if (id !== requestId.current) return;
      // No index before the first build; say so rather than showing nothing.
      setStatus('error');
      setHits([]);
    }
  }, []);

  const visible = useMemo(() => (expanded ? hits : hits.slice(0, PAGE_SIZE)), [hits, expanded]);

  function onQueryChange(value: string) {
    setQuery(value);
    setExpanded(false);
    void runSearch(value);
  }

  function handleSelect(hit: Hit) {
    setIsOpen(false);
    // assign(), not `location.href =`: the React compiler lint rejects the assignment form.
    window.location.assign(hit.url);
  }

  // Excluding the current page is what makes a first visit fall through to `suggested`.
  const elsewhere = recentPages.filter((page) => page.url !== window.location.pathname);
  const landing = elsewhere.length > 0 ? elsewhere : suggested.map(toRecent);
  const landingHeading = elsewhere.length > 0 ? 'Recently viewed' : 'Start here';
  const showLanding = !query && landing.length > 0;
  const showEmpty = status !== 'error' && hits.length === 0 && !showLanding;

  return (
    <>
      {/* A button, not an Input: Enter, Space and the accessible name come free. */}
      <div role="search" className="w-full min-w-0 max-sm:w-auto">
        <button
          ref={triggerRef}
          type="button"
          className="border-border bg-background text-text-secondary focus-ring flex h-10 w-full min-w-0 cursor-pointer items-center gap-2 rounded-md border p-2 text-sm max-sm:w-10 max-sm:justify-center max-sm:border-transparent max-sm:bg-transparent max-sm:p-0"
          aria-haspopup="dialog"
          aria-label="Search documentation"
          onClick={open}
        >
          <Icon icon="Search" size="xs" />
          <span className="min-w-0 flex-1 truncate text-left max-sm:sr-only">
            Search documentation...
          </span>
          <kbd
            aria-hidden="true"
            className="bg-background-raised text-text-secondary pointer-events-none hidden rounded border px-1.5 py-0.5 font-mono text-xs sm:inline-block"
          >
            ⌘K
          </kbd>
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={(next: boolean) => (next ? open() : close())}>
        <DialogContainer className={styles.dialog} aria-describedby={undefined}>
          <div className="sr-only">
            <DialogTitle>Search documentation</DialogTitle>
            <DialogDescription>
              Type to search every page. Arrow keys move, Enter opens, Escape closes.
            </DialogDescription>
          </div>

          {/* Pagefind has already ranked these. Let cmdk filter and it discards the good ones. */}
          <Command shouldFilter={false} className="w-full border-none">
            <CommandInput
              value={query}
              onValueChange={onQueryChange}
              placeholder="Search documentation..."
            />

            <CommandList className="max-h-[min(60vh,28rem)]! overflow-y-auto pb-2">
              {status === 'error' && (
                <div className="flex flex-col items-center gap-3 px-4 py-10">
                  <EmptyTableState icon="SearchX" title="Search needs a build to run first" />
                </div>
              )}

              {/* Not CommandEmpty: its filter count never updates while shouldFilter is false. */}
              {showEmpty && (
                <div className="flex flex-col items-center gap-3 px-4 py-10">
                  <EmptyTableState
                    icon={query ? 'SearchX' : 'Search'}
                    title={
                      query
                        ? status === 'loading'
                          ? 'Searching...'
                          : `No results for "${query}"`
                        : 'Start typing to search'
                    }
                  />
                  {query && status !== 'loading' && (
                    <Button variant="tertiary" size="sm" onClick={() => onQueryChange('')}>
                      Clear search
                    </Button>
                  )}
                </div>
              )}

              {showLanding && (
                <CommandGroup className="px-1 [&>*+*]:mt-1" heading={landingHeading}>
                  {landing.map((page) => (
                    <CommandItem
                      key={page.url}
                      value={page.url}
                      onSelect={() => window.location.assign(page.url)}
                      className={ITEM}
                    >
                      <Icon icon="FileText" size="sm" />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-text-primary truncate text-sm font-medium">
                          {page.title}
                        </span>
                        {page.crumbs && (
                          <span className="text-text-tertiary mt-1 truncate text-xs">
                            {page.crumbs}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Flat and in Pagefind's order: grouping by section reordered the ranking. */}
              {hits.length > 0 && (
                <CommandGroup className="px-1 [&>*+*]:mt-1" heading="Results">
                  {visible.map((hit) => (
                    <CommandItem
                      key={hit.id}
                      value={hit.id}
                      data-search-id={hit.id}
                      onSelect={() => handleSelect(hit)}
                      className={ITEM}
                    >
                      <Icon icon="FileText" size="sm" />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-text-primary truncate text-sm font-medium">
                          <HighlightMatch text={hit.title} query={query} />
                        </span>
                        {hit.isExcerpt ? (
                          // Pagefind's markup, built from our own content.
                          <span
                            className={HIT_SUMMARY}
                            dangerouslySetInnerHTML={{ __html: hit.summary }}
                          />
                        ) : (
                          <span className={HIT_SUMMARY}>
                            <HighlightMatch text={hit.summary} query={query} />
                          </span>
                        )}
                        {hit.crumbs && (
                          <span className="text-text-tertiary mt-1 truncate text-xs">
                            {hit.crumbs}
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}

                  {hits.length > visible.length && (
                    <CommandItem
                      value="view-more"
                      onSelect={() => setExpanded(true)}
                      className="text-brand-primary cursor-pointer justify-center text-sm"
                    >
                      View more results
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>

            {/* Outside the list: inside it the note scrolls out of sight. */}
            {import.meta.env.DEV && status !== 'error' && (
              <p className="text-text-secondary border-border border-t px-4 py-2 text-xs">
                Dev mode: results come from the last build.
              </p>
            )}
          </Command>
        </DialogContainer>
      </Dialog>
    </>
  );
}
