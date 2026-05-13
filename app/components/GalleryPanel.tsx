"use client";

import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { X, FolderOpen, Trash2, Clock, LayoutList } from "lucide-react";
import type { GalleryItem } from "../hooks/useGallery";

interface GalleryPanelProps {
  items: GalleryItem[];
  isOpen: boolean;
  onClose: () => void;
  onLoad: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
}

export function GalleryPanel({ items, isOpen, onClose, onLoad, onDelete }: GalleryPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--obsidian)]/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative h-full w-full max-w-md border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="font-heading text-2xl text-[var(--text-main)]">Gallery</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {items.length} saved {items.length === 1 ? "chart" : "charts"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-raised)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[var(--surface-raised)] flex items-center justify-center">
                <LayoutList className="h-6 w-6 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-main)]">No saved charts yet</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Generate a Gantt chart and save it to see it here
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 hover:border-[var(--copper)]/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-[var(--text-main)] truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <LayoutList className="h-3 w-3" />
                          {item.tasks.length} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onLoad(item)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--copper)] hover:bg-[var(--copper)]/5 transition-colors"
                        title="Load chart"
                      >
                        <FolderOpen className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/5 transition-colors"
                        title="Delete chart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mini date range */}
                  <div className="mt-3 pt-3 border-t border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-2">
                    <span className="text-[var(--copper)]">{format(new Date(item.tasks[0]?.start ?? item.createdAt), "MMM d")}</span>
                    <span>—</span>
                    <span>{format(new Date(item.tasks[item.tasks.length - 1]?.end ?? item.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
