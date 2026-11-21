import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { parseThemePreference, resolveNightMode, themeStorageKey, type ThemePreference } from "@/lib/night-desk/theme";

const ThemeContext = createContext<{
  preference: ThemePreference;
  night: boolean;
  setPreference: (value: ThemePreference) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("light");
  const [night, setNight] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    let current = parseThemePreference(document.documentElement.dataset['themePreference']);
    function apply(animate: boolean) {
      const dark = resolveNightMode(current, media.matches);
      const root = document.documentElement;
      if (animate && root.classList.contains("dark") !== dark) {
        root.classList.add("theme-transitioning");
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => root.classList.remove("theme-transitioning"), 350);
      }
      root.classList.toggle("dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
      root.dataset['themePreference'] = current;
      setPreferenceState(current);
      setNight(dark);
    }
    apply(false);
    function onSystemChange() { if (current === "system") apply(true); }
    function onPreferenceChange(event: Event) {
      if (!(event instanceof CustomEvent)) return;
      current = parseThemePreference(event.detail);
      apply(true);
    }
    function onStorage(event: StorageEvent) {
      if (event.key !== themeStorageKey) return;
      current = parseThemePreference(event.newValue);
      apply(true);
    }
    media.addEventListener("change", onSystemChange);
    window.addEventListener("night-desk-theme-change", onPreferenceChange);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("night-desk-theme-change", onPreferenceChange);
      window.removeEventListener("storage", onStorage);
      if (timer.current) clearTimeout(timer.current);
      document.documentElement.classList.remove("theme-transitioning");
    };
  }, []);

  function setPreference(value: ThemePreference) {
    try { localStorage.setItem(themeStorageKey, value); } catch { /* The selection still works without persistent storage. */ }
    window.dispatchEvent(new CustomEvent("night-desk-theme-change", { detail: value }));
  }

  return <ThemeContext.Provider value={{ preference, night, setPreference }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("Theme controls require ThemeProvider");
  return theme;
}