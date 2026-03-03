export function normalizeUrl(url: string): string {
  // Strip URL hash fragment only; preserve trailing slash so relative URL
  // resolution works correctly for directory-style base URLs.
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    url = url.slice(0, hashIndex);
  }
  return url;
}

function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function normalizeForDedup(url: string): string {
  return stripSlash(normalizeUrl(url));
}

export function isSubUrl(base: string, url: string): boolean {
  const normalizedBase = stripSlash(normalizeUrl(base));
  const normalizedUrl = stripSlash(normalizeUrl(url));
  return normalizedUrl.startsWith(normalizedBase);
}

export function urlToFilename(base: string, url: string): string {
  const normalizedBase = stripSlash(normalizeUrl(base));
  const normalizedUrl = stripSlash(normalizeUrl(url));

  // If the URL is the base URL itself, return index.md
  if (normalizedUrl === normalizedBase) {
    return "index.md";
  }

  // Get the path relative to the base
  const relativePath = normalizedUrl.slice(normalizedBase.length).replace(/^\//, "");

  if (!relativePath) {
    return "index.md";
  }

  // Strip .html extension and replace with .md
  const withoutHtml = relativePath.replace(/\.html$/, "");

  return withoutHtml + ".md";
}
