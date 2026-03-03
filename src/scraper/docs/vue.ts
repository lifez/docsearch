import type { FilterFn, ScraperConfig } from "../pipeline.ts";

const vueCleanHtml: FilterFn = ($, _ctx, _result) => {
  // Remove VitePress sidebar
  $(".VPSidebar, .VPNav, .VPNavBar").remove();
  // Remove page footer navigation (prev/next)
  $(".VPDocFooter, .VPFooter").remove();
  // Remove "Edit this page" and "Last updated" sections
  $(".VPLastUpdated, .edit-link").remove();
  // Remove aside table of contents
  $(".VPDocAside, aside").remove();
};

export const vueConfig3: ScraperConfig = {
  name: "vue/3",
  version: "3",
  baseUrl: "https://vuejs.org/",
  container: "#VPContent",
  skip: ["about/", "partners/", "sponsor/", "ecosystem/"],
  concurrency: 5,
  customFilters: [vueCleanHtml],
};

export const vueConfig2: ScraperConfig = {
  name: "vue/2",
  version: "2",
  baseUrl: "https://v2.vuejs.org/v2/guide/",
  container: ".content",
  skip: ["about/", "partners/", "sponsor/", "ecosystem/"],
  concurrency: 5,
  customFilters: [vueCleanHtml],
};
