import { describe, it, expect } from "vitest";

describe("Master Access Password", () => {
  it("should have MASTER_ACCESS_PASSWORD environment variable set", () => {
    const masterPassword = process.env.MASTER_ACCESS_PASSWORD;
    expect(masterPassword).toBeDefined();
    expect(masterPassword).not.toBe("");
    expect(typeof masterPassword).toBe("string");
  });

  it("should be a non-trivial password", () => {
    const masterPassword = process.env.MASTER_ACCESS_PASSWORD!;
    expect(masterPassword.length).toBeGreaterThanOrEqual(4);
  });
});
