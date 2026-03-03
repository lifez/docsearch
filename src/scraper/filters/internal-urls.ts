import { isSubUrl, normalizeForDedup } from "../../utils/url.ts";
import type { FilterFn } from "../pipeline.ts";

export const internalUrlsFilter: FilterFn = ($, ctx, result) => {
  const { url, baseUrl, config } = ctx;

  $("a[href]").each(function () {
    const href = $(this).attr("href");
    if (!href) return;

    let absolute: string;
    try {
      absolute = new URL(href, url).href;
    } catch {
      return;
    }

    if (!isSubUrl(baseUrl, absolute)) return;

    if (config.skip.some((pattern) => absolute.includes(pattern))) return;

    result.internalUrls.add(normalizeForDedup(absolute));
  });
};
