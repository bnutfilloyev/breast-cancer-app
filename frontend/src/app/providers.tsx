"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryProvider } from "@/providers/query-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
}
