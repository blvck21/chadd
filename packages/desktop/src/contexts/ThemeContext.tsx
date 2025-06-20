import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Theme, ThemeName, themes, defaultTheme } from "../styles/themes";

interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: { [key in ThemeName]: Theme };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem("ichfickdiscord-theme");
    return (savedTheme as ThemeName) || "retro-green";
  });

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    localStorage.setItem("ichfickdiscord-theme", newThemeName);
  };

  const currentTheme = themes[themeName] || defaultTheme;

  useEffect(() => {
    // Apply theme CSS variables to root
    const root = document.documentElement;
    const theme = currentTheme;

    // Set CSS custom properties
    root.style.setProperty("--color-primary", theme.colors.primary);
    root.style.setProperty("--color-secondary", theme.colors.secondary);
    root.style.setProperty("--color-tertiary", theme.colors.tertiary);
    root.style.setProperty("--color-surface", theme.colors.surface);
    root.style.setProperty("--color-overlay", theme.colors.overlay);

    root.style.setProperty("--color-text-primary", theme.colors.textPrimary);
    root.style.setProperty(
      "--color-text-secondary",
      theme.colors.textSecondary
    );
    root.style.setProperty("--color-text-muted", theme.colors.textMuted);
    root.style.setProperty("--color-text-inverse", theme.colors.textInverse);

    root.style.setProperty("--color-accent", theme.colors.accent);
    root.style.setProperty("--color-accent-hover", theme.colors.accentHover);
    root.style.setProperty("--color-accent-muted", theme.colors.accentMuted);

    root.style.setProperty("--color-success", theme.colors.success);
    root.style.setProperty("--color-warning", theme.colors.warning);
    root.style.setProperty("--color-error", theme.colors.error);
    root.style.setProperty("--color-info", theme.colors.info);

    root.style.setProperty("--color-border", theme.colors.border);
    root.style.setProperty("--color-border-hover", theme.colors.borderHover);
    root.style.setProperty("--color-shadow", theme.colors.shadow);

    root.style.setProperty("--color-speaking", theme.colors.speaking);
    root.style.setProperty("--color-muted", theme.colors.muted);
    root.style.setProperty("--color-deafened", theme.colors.deafened);

    root.style.setProperty("--font-primary", theme.fonts.primary);
    root.style.setProperty("--font-monospace", theme.fonts.monospace);
    root.style.setProperty("--font-heading", theme.fonts.heading);

    root.style.setProperty("--effect-blur", theme.effects.blur);
    root.style.setProperty(
      "--effect-border-radius",
      theme.effects.borderRadius
    );
    root.style.setProperty("--effect-transition", theme.effects.transition);
    root.style.setProperty("--effect-box-shadow", theme.effects.boxShadow);

    root.style.setProperty("--gradient-primary", theme.gradients.primary);
    root.style.setProperty("--gradient-secondary", theme.gradients.secondary);
    root.style.setProperty("--gradient-accent", theme.gradients.accent);

    // Apply font imports for special themes
    if (theme.name === "cyberpunk") {
      // Load Orbitron font for cyberpunk theme
      const link = document.createElement("link");
      link.href =
        "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    if (theme.type === "retro") {
      // Load monospace fonts for retro themes
      const link = document.createElement("link");
      link.href =
        "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    themeName,
    setTheme,
    availableThemes: themes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
