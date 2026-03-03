import type { ScraperConfig } from "../pipeline.ts";
import { nodeConfig22, nodeConfig20 } from "./node.ts";
import { bunConfig } from "./bun.ts";
import { nextjsConfig14, nextjsConfig16 } from "./nextjs.ts";
import { pythonConfig313, pythonConfig312 } from "./python.ts";
import { reactConfig19, reactConfig18 } from "./react.ts";
import { typescriptConfig5 } from "./typescript.ts";
import { tailwindConfig4, tailwindConfig3 } from "./tailwindcss.ts";
import { vueConfig3, vueConfig2 } from "./vue.ts";
import { rustBookConfig, rustStdConfig } from "./rust.ts";
import { goConfig } from "./go.ts";
import { djangoConfig52, djangoConfig51 } from "./django.ts";
import { postgresqlConfig17, postgresqlConfig16 } from "./postgresql.ts";
import { dockerConfig } from "./docker.ts";
import { swiftConfig, swiftDoccConfig } from "./swift.ts";
import { kotlinAndroidConfig } from "./kotlin-android.ts";
import { swiftuiConfig, swiftuiDoccConfig, uikitConfig, uikitDoccConfig } from "./ios.ts";
import { expressConfig5, expressConfig4 } from "./express.ts";
import { apolloServerConfig4 } from "./apollo-server.ts";
import type { DoccConfig } from "../docc.ts";

export interface DocEntry {
  config: ScraperConfig;
  description: string;
  customScraper?: () => Promise<void>;
}

function doccScraper(config: DoccConfig): () => Promise<void> {
  return async () => {
    const { scrapeDocc } = await import("../docc.ts");
    await scrapeDocc(config);
  };
}

export const DOCS: Record<string, DocEntry> = {
  "node/22": {
    config: nodeConfig22,
    description: "Node.js v22 API documentation",
  },
  "node/20": {
    config: nodeConfig20,
    description: "Node.js v20 API documentation",
  },
  "nextjs/14": {
    config: nextjsConfig14,
    description: "Next.js v14 documentation",
  },
  "nextjs/16": {
    config: nextjsConfig16,
    description: "Next.js v16 documentation",
  },
  "bun/1": {
    config: bunConfig,
    description: "Bun v1 runtime and API documentation",
  },
  "python/3.13": {
    config: pythonConfig313,
    description: "Python 3.13 documentation",
  },
  "python/3.12": {
    config: pythonConfig312,
    description: "Python 3.12 documentation",
  },
  "react/19": {
    config: reactConfig19,
    description: "React v19 documentation",
  },
  "react/18": {
    config: reactConfig18,
    description: "React v18 documentation",
  },
  "typescript/5": {
    config: typescriptConfig5,
    description: "TypeScript 5.x documentation",
  },
  "tailwindcss/4": {
    config: tailwindConfig4,
    description: "Tailwind CSS v4 documentation",
  },
  "tailwindcss/3": {
    config: tailwindConfig3,
    description: "Tailwind CSS v3 documentation",
  },
  "vue/3": {
    config: vueConfig3,
    description: "Vue 3 documentation",
  },
  "vue/2": {
    config: vueConfig2,
    description: "Vue 2 guide documentation",
  },
  "rust-book/1": {
    config: rustBookConfig,
    description: "The Rust Programming Language book",
  },
  "rust-std/1": {
    config: rustStdConfig,
    description: "Rust standard library documentation",
  },
  "go/1": {
    config: goConfig,
    description: "Go standard library documentation (pkg.go.dev)",
  },
  "django/5.2": {
    config: djangoConfig52,
    description: "Django 5.2 documentation",
  },
  "django/5.1": {
    config: djangoConfig51,
    description: "Django 5.1 documentation",
  },
  "postgresql/17": {
    config: postgresqlConfig17,
    description: "PostgreSQL 17 documentation",
  },
  "postgresql/16": {
    config: postgresqlConfig16,
    description: "PostgreSQL 16 documentation",
  },
  "docker/latest": {
    config: dockerConfig,
    description: "Docker documentation (latest)",
  },
  "swift/6": {
    config: swiftConfig,
    description: "The Swift Programming Language (Swift 6)",
    customScraper: doccScraper(swiftDoccConfig),
  },
  "kotlin-android/latest": {
    config: kotlinAndroidConfig,
    description: "Kotlin for Android development",
  },
  "ios-swiftui/latest": {
    config: swiftuiConfig,
    description: "SwiftUI framework documentation (Apple)",
    customScraper: doccScraper(swiftuiDoccConfig),
  },
  "ios-uikit/latest": {
    config: uikitConfig,
    description: "UIKit framework documentation (Apple)",
    customScraper: doccScraper(uikitDoccConfig),
  },
  "express/5": {
    config: expressConfig5,
    description: "Express.js v5 API and guide documentation",
  },
  "express/4": {
    config: expressConfig4,
    description: "Express.js v4 API and guide documentation",
  },
  "apollo-server/4": {
    config: apolloServerConfig4,
    description: "Apollo Server v4 GraphQL documentation",
  },
};

export const docNames = Object.keys(DOCS).join(", ");
