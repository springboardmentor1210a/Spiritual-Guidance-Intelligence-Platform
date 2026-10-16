import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "arcana_theme";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (
    savedTheme === "dark" ||
    savedTheme === "light" ||
    savedTheme === "system"
  ) {
    return savedTheme;
  }

  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  const resolvedTheme =
    theme === "system"
      ? getSystemTheme()
      : theme;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);

    document.documentElement.setAttribute(
      "data-theme",
      resolvedTheme
    );
  }, [theme, resolvedTheme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    function handleSystemThemeChange() {
      setTheme("system");
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return value;
}