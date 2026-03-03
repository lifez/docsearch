import TurndownService from "turndown";
import type { FilterFn } from "../pipeline.ts";

export const toMarkdownFilter: FilterFn = ($, _ctx, result) => {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  td.addRule("fenced-code-blocks", {
    filter(node) {
      return (
        node.nodeName === "PRE" &&
        node.firstChild !== null &&
        node.firstChild.nodeName === "CODE"
      );
    },
    replacement(_content, node) {
      // node is HTMLElement from turndown — access via standard DOM interface
      const pre = node as unknown as {
        querySelector: (sel: string) => { getAttribute: (a: string) => string | null; textContent: string | null } | null;
      };
      const code = pre.querySelector("code");
      const className = code?.getAttribute("class") ?? "";
      const langMatch = className.match(/(?:^|\s)language-(\S+)/);
      const lang = langMatch ? langMatch[1] ?? "" : "";
      const codeText = code?.textContent ?? "";
      const fence = "```";
      return `\n\n${fence}${lang}\n${codeText}\n${fence}\n\n`;
    },
  });

  result.markdown = td.turndown($("body").html() ?? "");
};
