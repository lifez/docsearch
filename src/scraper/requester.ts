import pLimit from "p-limit";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function createRequester(concurrency: number = 10) {
  const limit = pLimit(concurrency);

  async function fetchWithRetry(url: string): Promise<string> {
    const delays = [1000, 2000, 4000];
    let lastError: unknown;

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        return await response.text();
      } catch (error) {
        lastError = error;
        if (attempt < delays.length) {
          await sleep(delays[attempt]!);
        }
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Failed to fetch ${url}: ${message}`);
  }

  return (url: string): Promise<string> => limit(() => fetchWithRetry(url));
}
