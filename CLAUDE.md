# docsearch

CLI tool that scrapes developer docs, converts to markdown, indexes with qmd for local semantic search, and integrates with Claude Code via a skill file.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Dependencies**: cheerio, turndown, p-limit

## Project Structure

```
src/
├── index.ts              # CLI entry (Bun.argv dispatcher)
├── config.ts             # Data dirs, defaults
├── scraper/
│   ├── base.ts           # BFS crawl + filter pipeline
│   ├── requester.ts      # fetch + p-limit concurrency + retry
│   ├── pipeline.ts       # Filter pipeline runner
│   ├── filters/          # container, clean-html, normalize-urls, internal-urls, to-markdown
│   └── docs/             # Per-doc configs (e.g. node.ts)
├── indexer/
│   └── qmd.ts            # qmd CLI wrapper (Bun.spawn)
├── commands/             # scrape, index, search, list, read
└── utils/                # url.ts, logger.ts
skills/
└── docs.md               # Claude Code skill file
```

## Commands

```
docsearch scrape <doc>     # Scrape docs to markdown
docsearch index <doc>      # Index with qmd
docsearch search <query>   # Proxy to qmd search
docsearch list             # List available/scraped docs
docsearch read <path>      # Cat a scraped markdown file
```

## Conventions

- Run with `bun run src/index.ts <command>`
- Data stored in `~/.local/share/docsearch/docs/`
- Each scraped doc gets YAML frontmatter (title, source, doc, version)
- Filters are simple functions: `(doc, ctx, result) => void`
- Reference `example/` directory for how doc sites structure their content (DevDocs app)
- Master plan lives in `PLAN.md` — follow it for implementation order
- Use `/docs` skill to look up language/library API details when planning or implementing features
