import type { FilterFn } from "../pipeline.ts";

export const containerFilter: FilterFn = ($, ctx, _result) => {
  const { config } = ctx;
  const content = $(config.container).html();
  if (content) $("body").html(content);
};
