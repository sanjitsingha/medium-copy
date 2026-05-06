'use client'
import { useEffect } from "react";

export default function ThemeProvider({ children }) {
  useEffect(() => {
    // Force light mode by removing the 'dark' class
    document.documentElement.classList.remove("dark");
  }, []);

  return children;
}