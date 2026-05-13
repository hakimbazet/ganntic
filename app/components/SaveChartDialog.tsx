"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X, BookmarkCheck } from "lucide-react";
import type { GanttTask } from "./ColumnMapper";

interface SaveChartDialogProps {
  tasks: GanttTask[];
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function SaveChartDialog({ tasks, onSave, onCancel }: SaveChartDialogProps) {
  const firstTask = tasks[0]?.name ?? "Untitled";
  const defaultName = `${firstTask} — ${format(new Date(), "MMM d, yyyy")}`;
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--obsidian)]/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="font-heading text-xl text-[var(--text-main)]">Save to Gallery</h3>
          <button
            onClick={onCancel}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-raised)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
              Chart Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--copper)]/40 focus:ring-2 focus:ring-[var(--copper)]/10 outline-none transition-all"
              placeholder="Enter a name for this chart"
            />
            <p className="text-xs text-[var(--text-muted)]">
              {tasks.length} tasks · {format(tasks[0]?.start ?? new Date(), "MMM d")} — {format(tasks[tasks.length - 1]?.end ?? new Date(), "MMM d, yyyy")}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-2 bg-[var(--copper)] text-[var(--text-inverse)] hover:bg-[var(--copper-light)] font-medium"
            >
              <BookmarkCheck className="h-4 w-4" />
              Save Chart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
