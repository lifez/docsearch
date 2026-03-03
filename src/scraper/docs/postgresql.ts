import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const postgresqlCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove top and bottom navigation bars
  $(".navheader, .navfooter").remove();
  // Remove page header with breadcrumbs
  $(".toc").remove();
  // Tag code blocks as SQL for better markdown rendering
  $("pre.programlisting, pre.screen").each((_i, el) => {
    const $el = $(el);
    if (!$el.find("code").length) {
      const text = $el.text();
      $el.html(`<code class="sql">${text}</code>`);
    }
  });
};

const sharedPostgresqlConfig = {
  container: "#docContent",
  skip: [
    "release-",
    "install-",
    "docguide-",
    "regress-",
    "source-",
    "nls-",
    "fdw-",
  ],
  concurrency: 3,
  customFilters: [postgresqlCleanHtml],
} as const;

export const postgresqlConfig17: ScraperConfig = {
  name: "postgresql/17",
  version: "17",
  baseUrl: "https://www.postgresql.org/docs/17/",
  ...sharedPostgresqlConfig,
};

export const postgresqlConfig16: ScraperConfig = {
  name: "postgresql/16",
  version: "16",
  baseUrl: "https://www.postgresql.org/docs/16/",
  ...sharedPostgresqlConfig,
};
