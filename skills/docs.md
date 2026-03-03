# /docs — Search developer documentation

Search locally indexed developer docs via docsearch.

## Workflow

1. **Search**: `docsearch search "$ARGUMENTS" -c <collection>`
2. **Read**: `docsearch get '<docid>'` — full content using docid from search results
3. **Answer**: synthesize from the doc, cite source URL from frontmatter

## Commands

docsearch search <query> [-c <col>]   Search indexed docs (BM25, returns snippets + docids)
docsearch get <docid>                  Get full document by docid (e.g. '#634e59')
docsearch list                         List available/scraped doc collections
docsearch read <path>                  Read a doc file by path (e.g. node/22/fs/readfile.md)

## Collections

Collections use `name/version` format: `node/22`, `node/20`, `nextjs/14`, `nextjs/16`, `bun/1`

## Example

User asks: "How does fs.readFile work in Node.js?"

1. docsearch search "readFile" -c node/22
   → results show #634e59 = fsPromises.readFile, #b59609 = fs.readFile
2. docsearch get '#634e59'
   → full doc with signature, parameters, examples
3. Answer with code examples, cite source URL from frontmatter
