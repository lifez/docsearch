import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { createRequester } from "./requester.ts";

// Simple HTTP server for testing conditional requests
let server: ReturnType<typeof Bun.serve>;
let baseUrl: string;

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/page") {
        // Returns content with ETag and Last-Modified headers
        const ifNoneMatch = req.headers.get("if-none-match");
        const ifModifiedSince = req.headers.get("if-modified-since");

        // If conditional headers match, return 304
        if (ifNoneMatch === '"etag-v1"' || ifModifiedSince === "Wed, 01 Jan 2025 00:00:00 GMT") {
          return new Response(null, { status: 304 });
        }

        return new Response("<h1>Hello</h1>", {
          headers: {
            "Content-Type": "text/html",
            ETag: '"etag-v1"',
            "Last-Modified": "Wed, 01 Jan 2025 00:00:00 GMT",
          },
        });
      }

      if (url.pathname === "/no-cache-headers") {
        return new Response("<p>No cache</p>", {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (url.pathname === "/error") {
        return new Response("Not Found", { status: 404 });
      }

      return new Response("Not Found", { status: 404 });
    },
  });
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server.stop();
});

describe("createRequester", () => {
  test("returns html and cache headers on 200", async () => {
    const requester = createRequester(1);
    const result = await requester(`${baseUrl}/page`);
    expect(result).not.toBeNull();
    expect(result!.html).toBe("<h1>Hello</h1>");
    expect(result!.etag).toBe('"etag-v1"');
    expect(result!.lastModified).toBe("Wed, 01 Jan 2025 00:00:00 GMT");
  });

  test("returns null on 304 when sending If-None-Match", async () => {
    const requester = createRequester(1);
    const result = await requester(`${baseUrl}/page`, {
      etag: '"etag-v1"',
    });
    expect(result).toBeNull();
  });

  test("returns null on 304 when sending If-Modified-Since", async () => {
    const requester = createRequester(1);
    const result = await requester(`${baseUrl}/page`, {
      lastModified: "Wed, 01 Jan 2025 00:00:00 GMT",
    });
    expect(result).toBeNull();
  });

  test("returns html without cache headers when server omits them", async () => {
    const requester = createRequester(1);
    const result = await requester(`${baseUrl}/no-cache-headers`);
    expect(result).not.toBeNull();
    expect(result!.html).toBe("<p>No cache</p>");
    expect(result!.etag).toBeUndefined();
    expect(result!.lastModified).toBeUndefined();
  });

  test("does not send conditional headers when no cache entry", async () => {
    const requester = createRequester(1);
    const result = await requester(`${baseUrl}/page`);
    // Without cache entry, should get 200 with content
    expect(result).not.toBeNull();
    expect(result!.html).toBe("<h1>Hello</h1>");
  });

  test(
    "throws on non-304 error responses after retries",
    async () => {
      const requester = createRequester(1);
      await expect(requester(`${baseUrl}/error`)).rejects.toThrow("HTTP 404");
    },
    { timeout: 15000 }
  );
});
