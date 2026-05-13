"use client";

import React, { useMemo, useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2, Plus, AlertCircle, RotateCcw, Check } from "lucide-react";
import type { GanttTask } from "../ColumnMapper";

interface TaskTableProps {
  tasks: GanttTask[];
  onApply: (tasks: GanttTask[]) => void;
  onCancel: () => void;
}

type ValidationError = { [rowId: string]: { [field: string]: string } };

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !isNaN(d.getTime());
}

export function TaskTable({ tasks, onApply, onCancel }: TaskTableProps) {
  const [draft, setDraft] = useState<GanttTask[]>(() =>
    tasks.map((t) => ({ ...t, start: new Date(t.start), end: new Date(t.end) }))
  );
  const [errors, setErrors] = useState<ValidationError>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [showUndo, setShowUndo] = useState<string | null>(null);

  const allPics = useMemo(
    () => Array.from(new Set(draft.map((t) => t.pic).filter(Boolean))).sort(),
    [draft]
  );
  const allCats = useMemo(
    () => Array.from(new Set(draft.map((t) => t.category).filter(Boolean))).sort(),
    [draft]
  );

  const validate = (tasks: GanttTask[]): ValidationError => {
    const errs: ValidationError = {};
    tasks.forEach((task) => {
      const e: { [f: string]: string } = {};
      if (!task.name.trim()) e.name = "Task name is required";
      if (!isValidDate(task.start)) e.start = "Invalid date";
      if (!isValidDate(task.end)) e.end = "Invalid date";
      if (isValidDate(task.start) && isValidDate(task.end) && task.start.getTime() > task.end.getTime()) {
        e.start = "Start must be before end";
        e.end = "End must be after start";
      }
      if (task.progress < 0 || task.progress > 100 || isNaN(task.progress)) {
        e.progress = "Must be 0–100";
      }
      if (task.priority && !["high", "medium", "low"].includes(task.priority)) {
        e.priority = "Invalid priority";
      }
      if (Object.keys(e).length > 0) errs[task.id] = e;
    });
    return errs;
  };

  const updateTask = (id: string, updates: Partial<GanttTask>) => {
    setDraft((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    // Clear errors for this row on edit
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id));
    setShowUndo(id);
    const timer = setTimeout(() => {
      setShowUndo((curr) => (curr === id ? null : curr));
      setDraft((prev) => prev.filter((t) => t.id !== id));
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 4000);
    (window as unknown as Record<string, unknown>)[`undo_${id}`] = timer;
  };

  const handleUndo = (id: string) => {
    const timer = (window as unknown as Record<string, unknown>)[`undo_${id}`] as number;
    if (timer) clearTimeout(timer);
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setShowUndo(null);
  };

  const handleAddRow = () => {
    const newTask: GanttTask = {
      id: `task-new-${Date.now()}`,
      name: "",
      start: new Date(),
      end: new Date(),
      progress: 0,
      pic: "",
      category: "",
      priority: undefined,
      remarks: "",
    };
    setDraft((prev) => [...prev, newTask]);
  };

  const handleApply = () => {
    const visible = draft.filter((t) => !deletedIds.has(t.id));
    const errs = validate(visible);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onApply(visible);
  };

  const visibleTasks = draft.filter((t) => !deletedIds.has(t.id));

  const DateCell = ({
    value,
    onChange,
    error,
  }: {
    value: Date;
    onChange: (d: Date) => void;
    error?: string;
  }) => (
    <Popover>
      <PopoverTrigger
        className={`h-8 w-full rounded-lg border px-2.5 text-left text-xs font-mono transition-colors ${
          error
            ? "border-red-500 bg-red-500/5 text-red-400 hover:bg-red-500/10"
            : "border-[var(--border)] bg-[var(--background)] text-[var(--text-main)] hover:border-[var(--copper)]/30"
        }`}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-3 w-3 opacity-50" />
          {isValidDate(value) ? format(value, "yyyy-MM-dd") : "Invalid"}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[var(--surface)] border-[var(--border)]" align="start">
        <Calendar
          mode="single"
          selected={isValidDate(value) ? value : undefined}
          onSelect={(d) => d && onChange(d)}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {Object.keys(errors).length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Please fix the highlighted errors before applying changes.</span>
        </div>
      )}

      {showUndo && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm">
          <span className="text-[var(--text-muted)]">Row deleted</span>
          <button
            onClick={() => handleUndo(showUndo)}
            className="text-xs font-mono text-[var(--copper)] hover:text-[var(--copper-light)] flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Undo
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
              {["#", "Task Name", "Start", "End", "Progress", "PIC", "Category", "Priority", "Remarks", ""].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((task, idx) => {
              const err = errors[task.id] || {};
              return (
                <tr key={task.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-raised)]/30 transition-colors">
                  {/* # */}
                  <td className="px-3 py-2 text-[10px] font-mono text-[var(--text-muted)] w-8">
                    {idx + 1}
                  </td>

                  {/* Name */}
                  <td className="px-2 py-2 min-w-[180px]">
                    <Input
                      value={task.name}
                      onChange={(e) => updateTask(task.id, { name: e.target.value })}
                      placeholder="Task name"
                      className={`h-8 text-xs ${err.name ? "border-red-500 focus-visible:ring-red-500/30" : ""}`}
                    />
                    {err.name && <p className="text-[10px] text-red-500 mt-0.5">{err.name}</p>}
                  </td>

                  {/* Start */}
                  <td className="px-2 py-2 min-w-[140px]">
                    <DateCell
                      value={task.start}
                      onChange={(d) => updateTask(task.id, { start: d })}
                      error={err.start}
                    />
                    {err.start && <p className="text-[10px] text-red-500 mt-0.5">{err.start}</p>}
                  </td>

                  {/* End */}
                  <td className="px-2 py-2 min-w-[140px]">
                    <DateCell
                      value={task.end}
                      onChange={(d) => updateTask(task.id, { end: d })}
                      error={err.end}
                    />
                    {err.end && <p className="text-[10px] text-red-500 mt-0.5">{err.end}</p>}
                  </td>

                  {/* Progress */}
                  <td className="px-2 py-2 w-[90px]">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={task.progress}
                      onChange={(e) => updateTask(task.id, { progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                      className={`h-8 text-xs ${err.progress ? "border-red-500 focus-visible:ring-red-500/30" : ""}`}
                    />
                    {err.progress && <p className="text-[10px] text-red-500 mt-0.5">{err.progress}</p>}
                  </td>

                  {/* PIC */}
                  <td className="px-2 py-2 min-w-[130px]">
                    <select
                      value={task.pic || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateTask(task.id, { pic: v === "__new__" ? "" : v });
                      }}
                      className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--text-main)] focus:border-[var(--copper)]/40 focus:outline-none"
                    >
                      <option value="">— None —</option>
                      {allPics.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      <option value="__new__">+ Add new…</option>
                    </select>
                    {(!task.pic || allPics.includes(task.pic || "")) ? null : (
                      <input
                        type="text"
                        value={task.pic}
                        onChange={(e) => updateTask(task.id, { pic: e.target.value })}
                        placeholder="Type PIC name"
                        className="mt-1 h-7 w-full rounded border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--text-main)]"
                      />
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-2 py-2 min-w-[130px]">
                    <select
                      value={task.category || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateTask(task.id, { category: v === "__new__" ? "" : v });
                      }}
                      className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--text-main)] focus:border-[var(--copper)]/40 focus:outline-none"
                    >
                      <option value="">— None —</option>
                      {allCats.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__new__">+ Add new…</option>
                    </select>
                    {(!task.category || allCats.includes(task.category || "")) ? null : (
                      <input
                        type="text"
                        value={task.category}
                        onChange={(e) => updateTask(task.id, { category: e.target.value })}
                        placeholder="Type category"
                        className="mt-1 h-7 w-full rounded border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--text-main)]"
                      />
                    )}
                  </td>

                  {/* Priority */}
                  <td className="px-2 py-2 w-[100px]">
                    <select
                      value={task.priority || ""}
                      onChange={(e) => {
                        const v = e.target.value as "high" | "medium" | "low" | "";
                        updateTask(task.id, { priority: v || undefined });
                      }}
                      className={`h-8 w-full rounded-lg border px-2 text-xs focus:outline-none ${
                        err.priority ? "border-red-500 bg-red-500/5" : "border-[var(--border)] bg-[var(--background)] text-[var(--text-main)]"
                      }`}
                    >
                      <option value="">— None —</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    {err.priority && <p className="text-[10px] text-red-500 mt-0.5">{err.priority}</p>}
                  </td>

                  {/* Remarks */}
                  <td className="px-2 py-2 min-w-[160px]">
                    <Input
                      value={task.remarks || ""}
                      onChange={(e) => updateTask(task.id, { remarks: e.target.value })}
                      placeholder="Notes…"
                      className="h-8 text-xs"
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-2 py-2 w-10">
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/5 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="gap-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--copper)]/30 bg-transparent"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
        <div className="flex items-center gap-2">
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
            onClick={handleApply}
            className="gap-2 bg-[var(--copper)] text-[var(--text-inverse)] hover:bg-[var(--copper-light)] font-medium"
          >
            <Check className="h-4 w-4" />
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
