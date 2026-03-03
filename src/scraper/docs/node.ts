import type { FilterFn, ScraperConfig } from "../pipeline.ts";

export const nodeCleanHtml: FilterFn = ($, _ctx, _result) => {
  // 1. Remove <hr> elements
  $("hr").remove();

  // 2. Strip `.mark` anchor spans used for deep linking
  $(".mark").remove();

  // 3. Convert stability badge <pre> elements to plain paragraphs
  $("pre[class^='api_stability']").each((_i, el) => {
    $(el).replaceWith($("<p>").text($(el).text()));
  });

  // 4. Handle multi-<code> in <pre> (MJS/CJS tab splits)
  $("pre:has(code + code)").each((_i, el) => {
    const $pre = $(el);
    const $codes = $pre.find("code");
    const replacements: ReturnType<typeof $>[] = [];
    $codes.each((_j, code) => {
      replacements.push($("<pre>").append($("<code>").text($(code).text())));
    });
    // Insert all replacement <pre> elements after the original, then remove it
    replacements.forEach((r) => $pre.after(r));
    $pre.remove();
  });
};

const sharedNodeConfig = {
  container: "#apicontent",
  skip: ["index.html", "all.html", "documentation.html", "synopsis.html"],
  concurrency: 10,
  customFilters: [nodeCleanHtml],
  splitConfig: {
    splitAtLevels: [4, 5],
    minContentLength: 50,
  },
} as const;

export const nodeConfig22: ScraperConfig = {
  name: "node/22",
  version: "22.x",
  baseUrl: "https://nodejs.org/dist/latest-v22.x/docs/api/",
  ...sharedNodeConfig,
};

export const nodeConfig20: ScraperConfig = {
  name: "node/20",
  version: "20.x",
  baseUrl: "https://nodejs.org/dist/latest-v20.x/docs/api/",
  ...sharedNodeConfig,
};
