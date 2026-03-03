import type { ScraperConfig } from "../pipeline.ts";
import type { DoccConfig } from "../docc.ts";

export const swiftConfig: ScraperConfig = {
  name: "swift/6",
  version: "6.x",
  baseUrl:
    "https://docs.swift.org/swift-book/documentation/the-swift-programming-language",
  container: "", // Not used — DocC JSON scraper
  skip: [],
  concurrency: 5,
};

export const swiftDoccConfig: DoccConfig = {
  scraperConfig: swiftConfig,
  indexUrl:
    "https://docs.swift.org/swift-book/data/documentation/the-swift-programming-language.json",
  dataBaseUrl:
    "https://docs.swift.org/swift-book/data/documentation/the-swift-programming-language",
  topicPrefix: "The-Swift-Programming-Language",
};
