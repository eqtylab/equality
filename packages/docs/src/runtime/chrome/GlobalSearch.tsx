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
          <mark key={i} className={styles.mark}>
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
      // In `astro dev` there is no index at all, by design. Say so rather than showing nothing.
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
      <div role="search" className={styles.search}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          aria-label="Search documentation"
          onClick={open}
        >
          <Icon icon="Search" size="xs" />
          <span className={styles.triggerLabel}>Search documentation...</span>
          <kbd aria-hidden="true" className={styles.shortcut}>
            ⌘K
          </kbd>
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={(next: boolean) => (next ? open() : close())}>
        <DialogContainer className={styles.dialog} aria-describedby={undefined}>
          <div className={styles.srOnly}>
            <DialogTitle>Search documentation</DialogTitle>
            <DialogDescription>
              Type to search every page. Arrow keys move, Enter opens, Escape closes.
            </DialogDescription>
          </div>

          {/* Pagefind has already ranked these. Let cmdk filter and it discards the good ones. */}
          <Command shouldFilter={false} className={styles.command}>
            <CommandInput
              value={query}
              onValueChange={onQueryChange}
              placeholder="Search documentation..."
            />

            <CommandList className={styles.list}>
              {status === 'error' && (
                <div className={styles.state}>
                  <EmptyTableState icon="SearchX" title="Search needs a build to run first" />
                </div>
              )}

              {/* Not CommandEmpty: its filter count never updates while shouldFilter is false. */}
              {showEmpty && (
                <div className={styles.state}>
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
                <CommandGroup className={styles.group} heading={landingHeading}>
                  {landing.map((page) => (
                    <CommandItem
                      key={page.url}
                      value={page.url}
                      onSelect={() => window.location.assign(page.url)}
                      className={styles.item}
                    >
                      <Icon icon="FileText" size="sm" />
                      <span className={styles.hit}>
                        <span className={styles.hitTitle}>{page.title}</span>
                        {page.crumbs && <span className={styles.hitCrumb}>{page.crumbs}</span>}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Flat and in Pagefind's order: grouping by section reordered the ranking. */}
              {hits.length > 0 && (
                <CommandGroup className={styles.group} heading="Results">
                  {visible.map((hit) => (
                    <CommandItem
                      key={hit.id}
                      value={hit.id}
                      data-search-id={hit.id}
                      onSelect={() => handleSelect(hit)}
                      className={styles.item}
                    >
                      <Icon icon="FileText" size="sm" />
                      <span className={styles.hit}>
                        <span className={styles.hitTitle}>
                          <HighlightMatch text={hit.title} query={query} />
                        </span>
                        {hit.isExcerpt ? (
                          // Pagefind's markup, built from our own content.
                          <span
                            className={styles.hitSummary}
                            dangerouslySetInnerHTML={{ __html: hit.summary }}
                          />
                        ) : (
                          <span className={styles.hitSummary}>
                            <HighlightMatch text={hit.summary} query={query} />
                          </span>
                        )}
                        {hit.crumbs && <span className={styles.hitCrumb}>{hit.crumbs}</span>}
                      </span>
                    </CommandItem>
                  ))}

                  {hits.length > visible.length && (
                    <CommandItem
                      value="view-more"
                      onSelect={() => setExpanded(true)}
                      className={styles.more}
                    >
                      View more results
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContainer>
      </Dialog>
    </>
  );
}
