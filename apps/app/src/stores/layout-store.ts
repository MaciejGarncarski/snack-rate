import { createStore } from "@tanstack/react-store";
import { useEffect } from "react";

type Layout = "1col" | "2col";

const STORAGE_KEY = "snack-rate-layout";

export const layoutStore = createStore<Layout>("2col");

export function setLayout(layout: Layout): void {
  layoutStore.setState(() => {
    localStorage.setItem(STORAGE_KEY, layout);
    return layout;
  });
}

export function useSyncLayout(): void {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1col" || stored === "2col") {
      layoutStore.setState(() => stored);
    }
  }, []);
}
