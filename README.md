# docsearch

Scrape, index, and search developer docs locally. Integrates with Claude Code via `/docs`.

## The Problem

Developer docs live across dozens of websites with different structures. When coding, you constantly context-switch to a browser to look things up. AI assistants like Claude Code don't have access to the latest version-specific docs.

docsearch solves this by scraping docs to markdown, indexing them locally with [qmd](https://github.com/tobi/qmd), and exposing them to Claude Code as a `/docs` skill — so your AI assistant can search and cite real documentation inline.

## How It Works

```
Scrape HTML → Filter & convert to Markdown → Index with qmd → Search via CLI or /docs skill
```

1. **Scrape** — BFS crawl of a doc site, filtering to relevant pages
2. **Filter** — Strip navigation/chrome, clean HTML, normalize URLs
3. **Convert** — HTML to Markdown via Turndown, with YAML frontmatter (title, source URL, doc, version)
4. **Index** — Feed markdown files to qmd for local BM25 search
5. **Search** — Query via CLI or let Claude Code search with the `/docs` skill

## Setup

### Prerequisites

- [Bun](https://bun.sh) — `curl -fsSL https://bun.sh/install | bash`
- [qmd](https://github.com/tobi/qmd) — `bun install -g @tobilu/qmd`

### Install

**Global install (recommended):**

```bash
bun add -g github:lifez/docsearch
```

**Or from source:**

```bash
git clone git@github.com:lifez/docsearch.git && cd docsearch
bun install
bun link        # registers the `docsearch` command globally
```

### Scrape your first doc

```bash
docsearch scrape node/22
```

This scrapes Node.js v22 docs to markdown and automatically indexes them with qmd.

### Set up the Claude Code skill

Copy the skill file so Claude Code can use `/docs`:

```bash
mkdir -p ~/.claude/commands
cp skills/docs.md ~/.claude/commands/docs.md
```

Now in Claude Code, use `/docs "how does fs.readFile work?"` to search your local docs.

## Usage

### CLI Commands

```
docsearch scrape <doc>         Scrape docs to markdown (e.g. node/22, nextjs/14)
docsearch index <doc>          Index with qmd (e.g. node/22, bun/1)
docsearch search <query>       Search indexed docs (-c node/22 to filter by collection)
docsearch get <docid>          Get full document by docid (e.g. '#634e59')
docsearch list                 List available docs and scrape status
docsearch read <path>          Read a scraped doc (e.g. node/22, node/22/fs)
```

### Claude Code

```
/docs "how does fs.readFile work?"
/docs "Django model field types"
/docs "Rust ownership rules"
```

The skill searches, retrieves full docs, and synthesizes an answer with source citations.

## Supported Docs

| Collection | Versions | Description |
|---|---|---|
| **node** | 22, 20 | Node.js API documentation |
| **nextjs** | 16, 14 | Next.js documentation |
| **bun** | 1 | Bun runtime and API documentation |
| **python** | 3.13, 3.12 | Python documentation |
| **react** | 19, 18 | React documentation |
| **typescript** | 5 | TypeScript documentation |
| **tailwindcss** | 4, 3 | Tailwind CSS documentation |
| **vue** | 3, 2 | Vue documentation |
| **rust-book** | 1 | The Rust Programming Language book |
| **rust-std** | 1 | Rust standard library documentation |
| **go** | 1 | Go standard library documentation |
| **django** | 5.2, 5.1 | Django documentation |
| **postgresql** | 17, 16 | PostgreSQL documentation |
| **docker** | latest | Docker documentation |
| **swift** | 6 | The Swift Programming Language |
| **kotlin-android** | latest | Kotlin for Android development |
| **ios-swiftui** | latest | SwiftUI framework documentation |
| **ios-uikit** | latest | UIKit framework documentation |
| **express** | 5, 4 | Express.js API documentation |
| **apollo-server** | 4 | Apollo Server GraphQL documentation |

Use `docsearch list` to see which docs you've scraped locally.

## Adding a New Doc Source

1. Create a config file in `src/scraper/docs/` (see existing configs for reference)
2. Define the base URL, content container selector, URL skip patterns, and any custom HTML filters
3. Register it in `src/scraper/docs/registry.ts`
