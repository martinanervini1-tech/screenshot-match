import { describe, expect, it } from "vitest";
import { parseThemePreference, resolveNightMode, themeInitScript, themeStorageKey } from "@/lib/night-desk/theme";

describe("Night Desk theme preferences", () => {
  it("keeps Light even when the operating system is dark", () => {
    expect(resolveNightMode("light", true)).toBe(false);
  });
  it("keeps Night even when the operating system is light", () => {
    expect(resolveNightMode("night", false)).toBe(true);
  });
  it("follows both operating system modes for System", () => {
    expect(resolveNightMode("system", true)).toBe(true);
    expect(resolveNightMode("system", false)).toBe(false);
  });
  it("falls back to established Light Mode for absent or invalid preferences", () => {
    expect(parseThemePreference(null)).toBe("light");
    expect(parseThemePreference("invalid")).toBe("light");
    expect(parseThemePreference("night")).toBe("night");
    expect(parseThemePreference("system")).toBe("system");
  });
  it("restores the saved Night preference before page rendering", () => {
    const root = { classList: { toggle: (name: string, on: boolean) => { classes.set(name, on); } }, style: { colorScheme: "" }, dataset: {} as Record<string, string> };
    const classes = new Map<string, boolean>();
    const initialize = new Function("window", "document", "localStorage", themeInitScript);
    const storage = { getItem: (key: string) => key === themeStorageKey ? "night" : null };
    initialize({ matchMedia: () => ({ matches: false }) }, { documentElement: root }, storage);
    expect(classes.get("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("dark");
    expect(root.dataset['themePreference']).toBe("night");
  });
});