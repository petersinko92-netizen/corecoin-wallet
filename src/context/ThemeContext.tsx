"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. CHANGE DEFAULT TO 'dark' (Fixes the white flash)
  const [theme, setTheme] = useState<Theme>('dark'); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 2. Check local storage, but default to dark if nothing is found
    const saved = localStorage.getItem('corecoin-theme') as Theme;
    
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(saved);
    } else {
      // Default to DARK
      setTheme('dark');
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('corecoin-theme', newTheme);
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};