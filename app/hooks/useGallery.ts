"use client";

import { useState, useCallback, useEffect } from "react";
import type { GanttTask } from "../components/ColumnMapper";

export interface GalleryItem {
  id: string;
  name: string;
  tasks: GanttTask[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "ganntsheet-gallery";

function loadGallery(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GalleryItem[];
    // Revive Date objects from ISO strings
    return parsed.map((item) => ({
      ...item,
      tasks: item.tasks.map((task) => ({
        ...task,
        start: new Date(task.start),
        end: new Date(task.end),
      })),
    }));
  } catch {
    return [];
  }
}

function saveGallery(items: GalleryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(loadGallery());
    setIsReady(true);
  }, []);

  const addItem = useCallback((name: string, tasks: GanttTask[]) => {
    const now = new Date().toISOString();
    const newItem: GalleryItem = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      tasks,
      createdAt: now,
      updatedAt: now,
    };
    setItems((prev) => {
      const next = [newItem, ...prev];
      saveGallery(next);
      return next;
    });
    return newItem.id;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Pick<GalleryItem, "name" | "tasks">>) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      );
      saveGallery(next);
      return next;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveGallery(next);
      return next;
    });
  }, []);

  const getItem = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  return { items, isReady, addItem, updateItem, deleteItem, getItem };
}
