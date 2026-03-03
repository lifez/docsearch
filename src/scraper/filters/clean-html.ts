import type { FilterFn } from "../pipeline.ts";

export const cleanHtmlFilter: FilterFn = ($, _ctx, _result) => {
  $("script, style, nav, footer, noscript").remove();
  $("*")
    .contents()
    .filter(function () {
      return this.type === "comment";
    })
    .remove();
};
