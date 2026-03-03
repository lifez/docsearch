async function run(...args: string[]): Promise<void> {
  const proc = Bun.spawn(args, {
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(
      `Command failed with exit code ${exitCode}: ${args.join(" ")}`
    );
  }
}

function collectionName(name: string): string {
  return name.replaceAll("/", "-");
}

export async function indexDoc(
  name: string,
  dataDir: string,
  description: string
): Promise<void> {
  const col = collectionName(name);
  // Remove existing collection if present (re-index case)
  await Bun.spawn(["qmd", "collection", "rm", col], {
    stdout: "ignore",
    stderr: "ignore",
  }).exited;
  await run("qmd", "collection", "add", dataDir, "--name", col);
  await run("qmd", "context", "add", `qmd://${col}`, description);
  await run("qmd", "embed");
}

export async function getDoc(docid: string): Promise<void> {
  await run("qmd", "get", docid);
}

export async function searchDocs(
  query: string,
  collection?: string
): Promise<void> {
  const args = ["qmd", "search", query, "--md", "-n", "5"];

  if (collection !== undefined) {
    args.push("-c", collectionName(collection));
  }

  await run(...args);
}
