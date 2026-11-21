import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { parseThemePreference } from "@/lib/night-desk/theme";
import { useTheme } from "./theme-provider";

export function ThemeSelector() {
  const { preference, night, setPreference } = useTheme();
  const reduced = useReducedMotion();
  const Icon = night ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="theme-toggle" aria-label="Choose color theme" title="Choose color theme">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span className="theme-toggle-icon" key={night ? "night" : "light"} initial={{ opacity: 0, rotate: reduced ? 0 : -30, scale: reduced ? 1 : 0.85 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: reduced ? 0 : 30, scale: reduced ? 1 : 0.85 }} transition={{ duration: reduced ? 0 : 0.15 }}><Icon /></motion.span>
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="theme-menu">
        <DropdownMenuLabel className="theme-menu-label">Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={preference} onValueChange={(value) => setPreference(parseThemePreference(value))}>
          <DropdownMenuRadioItem value="light"><Sun />Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="night"><Moon />Night</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system"><Monitor />System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}