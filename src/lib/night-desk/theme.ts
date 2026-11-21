export type ThemePreference = "light" | "night" | "system";
export const themeStorageKey = "night-desk-theme";

export function parseThemePreference(value: unknown): ThemePreference {
  return value === "night" || value === "system" ? value : "light";
}

export function resolveNightMode(preference: ThemePreference, systemDark: boolean): boolean {
  return preference === "night" || (preference === "system" && systemDark);
}

// Runs before styles are painted; all browser reads stay inside the script's invocation.
export const themeInitScript = `(function(){var p="light";try{p=localStorage.getItem(${JSON.stringify(themeStorageKey)})||"light"}catch(e){}if(p!=="night"&&p!=="system")p="light";var d=p==="night"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";document.documentElement.dataset.themePreference=p;})();`;