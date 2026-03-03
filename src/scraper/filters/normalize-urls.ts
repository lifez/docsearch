import type { FilterFn } from "../pipeline.ts";

const IGNORED_SCHEMES = ["mailto:", "javascript:", "data:"];

function resolveHref(base: string, href: string): string | null {
  if (!href) return null;
  if (IGNORED_SCHEMES.some((scheme) => href.startsWith(scheme))) return null;
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

export const normalizeUrlsFilter: FilterFn = ($, ctx, _result) => {
  $("[href]").each(function () {
    const el = $(this);
    const href = el.attr("href");
    if (!href) return;
    const resolved = resolveHref(ctx.url, href);
    if (resolved) el.attr("href", resolved);
  });

  $("[src]").each(function () {
    const el = $(this);
    const src = el.attr("src");
    if (!src) return;
    const resolved = resolveHref(ctx.url, src);
    if (resolved) el.attr("src", resolved);
  });
};
