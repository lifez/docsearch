# docsearch — CLI Documentation Browser

CLI tool that scrapes developer docs, converts to markdown, indexes with qmd for local semantic search, and integrates with Claude Code via a skill file.

## Architecture

```
docsearch scrape <doc>  →  markdown files  →  qmd index  →  /docs skill in Claude Code
```

## Project Structure

```
docsearch/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # CLI entry (Bun.argv dispatcher)
│   ├── config.ts                # Data dirs, defaults
│   ├── scraper/
│   │   ├── base.ts              # BFS crawl + filter pipeline
│   │   ├── requester.ts         # fetch + p-limit concurrency + retry
│   │   ├── pipeline.ts          # Filter pipeline runner
│   │   ├── filters/
│   │   │   ├── container.ts     # Extract main content via CSS selector
│   │   │   ├── clean-html.ts    # Remove script/style/comments
│   │   │   ├── normalize-urls.ts
│   │   │   ├── internal-urls.ts # Discover crawlable links
│   │   │   └── to-markdown.ts   # HTML → Markdown via Turndown
│   │   └── docs/
│   │       └── node.ts          # Node.js config + custom filters
│   ├── indexer/
│   │   └── qmd.ts               # qmd CLI wrapper (Bun.spawn)
│   ├── commands/
│   │   ├── scrape.ts
│   │   ├── index.ts
│   │   ├── search.ts
│   │   ├── list.ts
│   │   └── read.ts
│   └── utils/
│       ├── url.ts               # URL normalize, contains, subpath
│       └── logger.ts
├── skills/
│   └── docs.md                  # Claude Code skill file
└── data/                        # ~/.local/share/docsearch/docs/
    └── node/
```

## Dependencies

- `cheerio` — HTML parsing
- `turndown` — HTML→Markdown
- `p-limit` — concurrency control

## Implementation Steps

### Step 1: Scaffold project

```bash
bun init
bun add cheerio turndown p-limit
```

Set up `tsconfig.json`, `package.json` with `bin` entry pointing to `src/index.ts`.

### Step 2: Config + URL utils

**`src/config.ts`** — resolve data dir (`~/.local/share/docsearch/docs/`), provide `getDocDir(name)`.

**`src/utils/url.ts`** — `normalizeUrl(url)` (strip hash/trailing slash), `isSubUrl(base, url)`, `urlToFilename(base, url)` (derive `.md` filename from URL path).

**`src/utils/logger.ts`** — thin wrapper: `log.info()`, `log.error()`, `log.debug()` with color.

### Step 3: Filter pipeline

**`src/scraper/pipeline.ts`** — runs an array of `FilterFn` in sequence:

```typescript
type FilterContext = { url: string; baseUrl: string; config: ScraperConfig }
type FilterResult = { internalUrls: Set<string> }
type FilterFn = (doc: cheerio.CheerioAPI, ctx: FilterContext, result: FilterResult) => void
```

**Core filters** (each is a simple function):

1. **`container.ts`** — `$('body').html($( config.container ).html())` — extract main content
2. **`clean-html.ts`** — remove `script`, `style`, `nav`, `footer`, HTML comments
3. **`normalize-urls.ts`** — resolve all `href`/`src` attrs to absolute URLs
4. **`internal-urls.ts`** — find `<a>` links within `baseUrl`, add to `result.internalUrls`, skip configured patterns
5. **`to-markdown.ts`** — Turndown with fenced code block rule, return markdown string (stored on result)

### Step 4: Requester

**`src/scraper/requester.ts`** — `createRequester(concurrency)` returns `fetch(url)` wrapper with:
- `p-limit` for concurrency (default 10)
- 3 retries with exponential backoff (1s, 2s, 4s)
- Returns HTML string or throws

### Step 5: Base scraper

**`src/scraper/base.ts`** — `scrape(config: ScraperConfig)`:

```
BFS loop:
  queue = [config.baseUrl]
  visited = Set<string>

  while queue not empty:
    batch = dequeue up to concurrency URLs
    fetch all via requester
    for each response:
      load into cheerio
      run filter pipeline → get markdown + internal URLs
      write markdown file with YAML frontmatter to data dir
      enqueue new internal URLs not in visited
```

YAML frontmatter per file:
```yaml
---
title: <extracted from h1 or <title>>
source: <original URL>
doc: <config.name>
version: <config.version>
---
```

### Step 6: Node.js scraper config

**`src/scraper/docs/node.ts`**:

```typescript
const nodeConfig: ScraperConfig = {
  name: 'node',
  version: '22.x',
  baseUrl: 'https://nodejs.org/dist/latest-v22.x/docs/api/',
  container: '#apicontent',
  skip: ['index.html', 'all.html', 'documentation.html', 'synopsis.html'],
  concurrency: 10,
  customFilters: [nodeCleanHtml]
}
```

Custom `nodeCleanHtml` filter:
- Remove `<hr>` elements
- Handle multi-`<code>` in `<pre>` (MJS/CJS tab splits → separate fenced blocks)
- Strip `.mark` anchor spans
- Convert stability badge `<pre>` to plain text

### Step 7: CLI commands + dispatcher

**`src/index.ts`** — parse `Bun.argv`, dispatch to command:

```
docsearch scrape <doc>          # scrape docs to markdown
docsearch index <doc>           # index with qmd
docsearch search <query>        # proxy to qmd search
docsearch list                  # list available/scraped docs
docsearch read <path>           # cat a scraped markdown file
```

Each command in `src/commands/` is a simple async function.

### Step 8: qmd indexer

**`src/indexer/qmd.ts`** — wraps qmd CLI via `Bun.spawn`:

```typescript
async function indexDoc(name: string, description: string) {
  // qmd collection add <dataDir>/<name> --name <name>
  // qmd context add qmd://<name> "<description>"
  // qmd embed
}
```

The `index` command calls this with doc-specific descriptions.

### Step 9: Skill file

**`skills/docs.md`** — Claude Code slash command:

```markdown
# /docs — Search developer documentation

Search locally indexed developer documentation using qmd.

## Instructions

1. Search: `qmd search "$ARGUMENTS" --md -n 5`
2. Semantic: `qmd vsearch "$ARGUMENTS" --md -n 5`
3. Read full doc: `qmd get <docid>`
4. Synthesize answer citing sources.

## Guidelines
- Use `-c <name>` to filter by collection
- Check collections: `qmd collection list`
```

Install by copying to `~/.claude/commands/docs.md`.

### Step 10: Test end-to-end

1. `bun run src/index.ts scrape node` → markdown files in data dir
2. `bun run src/index.ts index node` → qmd collection created
3. `qmd search "http server" -c node --md` → results
4. `/docs "how to read files"` in Claude Code → answer with sources
