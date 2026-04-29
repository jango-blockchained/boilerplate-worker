import { describe, expect, it } from "bun:test";
import worker from "../src/index";

describe("Boilerplate Worker", () => {
  it("should return 200 for root path", async () => {
    const req = new Request("http://localhost/");
    const env = { CONFIG_KV: {} as any };
    const ctx = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    };

    const res = await worker.fetch(req, env, ctx as any);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe("Boilerplate Worker is running");
  });

  it("should return 200 for /health path", async () => {
    const req = new Request("http://localhost/health");
    const env = { CONFIG_KV: {} as any };
    const ctx = {
      waitUntil: () => {},
      passThroughOnException: () => {},
    };

    const res = await worker.fetch(req, env, ctx as any);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.status).toBe("ok");
  });
});
