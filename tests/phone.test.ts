import { normalizeBangladeshPhone } from "../src/lib/utils";

describe("Bangladesh Phone Number Normalization", () => {
  test("normalizes standard 11-digit local format (017...)", () => {
    const result = normalizeBangladeshPhone("01711223344");
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe("+8801711223344");
  });

  test("preserves and cleans already prefixed international format (+8801...)", () => {
    const result = normalizeBangladeshPhone("+8801811223344");
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe("+8801811223344");
  });

  test("handles spaces, hyphens, and formatting characters", () => {
    const result = normalizeBangladeshPhone("019-11 22 (3344)");
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe("+8801911223344");
  });

  test("normalizes 8801... without plus prefix", () => {
    const result = normalizeBangladeshPhone("8801611223344");
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe("+8801611223344");
  });

  test("rejects invalid or too short numbers", () => {
    const result = normalizeBangladeshPhone("012345");
    expect(result.isValid).toBe(false);
  });

  test("rejects non-Bangladesh prefixes (e.g. 010, 011, 012)", () => {
    const result = normalizeBangladeshPhone("01011223344");
    expect(result.isValid).toBe(false);
  });
});
