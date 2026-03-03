import type { ScraperConfig } from "../pipeline.ts";
import type { DoccConfig } from "../docc.ts";

function makeAppleDoccConfigs(
  slug: string,
  framework: string,
): { scraperConfig: ScraperConfig; doccConfig: DoccConfig } {
  const scraperConfig: ScraperConfig = {
    name: `ios-${slug}/latest`,
    version: "latest",
    baseUrl: `https://developer.apple.com/documentation/${slug}`,
    container: "", // Not used — DocC JSON scraper
    skip: [],
    concurrency: 5,
  };
  return {
    scraperConfig,
    doccConfig: {
      scraperConfig,
      indexUrl: `https://developer.apple.com/tutorials/data/documentation/${slug}.json`,
      dataBaseUrl: `https://developer.apple.com/tutorials/data/documentation/${slug}`,
      topicPrefix: framework,
      recursive: true,
      maxDepth: 2,
      identifierFilter: framework,
    },
  };
}

const swiftui = makeAppleDoccConfigs("swiftui", "SwiftUI");
export const swiftuiConfig = swiftui.scraperConfig;
export const swiftuiDoccConfig = swiftui.doccConfig;

const uikit = makeAppleDoccConfigs("uikit", "UIKit");
export const uikitConfig = uikit.scraperConfig;
export const uikitDoccConfig = uikit.doccConfig;
