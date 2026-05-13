"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Sparkles, RotateCcw, ChevronRight } from "lucide-react";

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  pic?: string;
  category?: string;
  priority?: "high" | "medium" | "low";
  remarks?: string;
}

interface ColumnMapperProps {
  headers: string[];
  rows: Record<string, unknown>[];
  onMapped: (tasks: GanttTask[]) => void;
  onReset: () => void;
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    if (!value.trim()) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function parseProgress(value: unknown): number {
  if (typeof value === "number") {
    if (value >= 0 && value <= 1) return Math.round(value * 100);
    if (value >= 0 && value <= 100) return Math.round(value);
    return 0;
  }
  if (typeof value === "string") {
    const clean = value.replace("%", "").trim();
    const num = parseFloat(clean);
    if (!isNaN(num)) {
      if (num >= 0 && num <= 1) return Math.round(num * 100);
      if (num >= 0 && num <= 100) return Math.round(num);
    }
  }
  return 0;
}

function parsePriority(value: unknown): "high" | "medium" | "low" | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const raw = String(value).toLowerCase().trim();
  if (["high", "h", "1", "critical", "urgent"].includes(raw)) return "high";
  if (["medium", "m", "2", "med", "normal"].includes(raw)) return "medium";
  if (["low", "l", "3", "minor"].includes(raw)) return "low";
  return undefined;
}

export function ColumnMapper({ headers, rows, onMapped, onReset }: ColumnMapperProps) {
  const [taskNameCol, setTaskNameCol] = useState<string>("");
  const [startDateCol, setStartDateCol] = useState<string>("");
  const [endDateCol, setEndDateCol] = useState<string>("");
  const [progressCol, setProgressCol] = useState<string>("");
  const [picCol, setPicCol] = useState<string>("");
  const [categoryCol, setCategoryCol] = useState<string>("");
  const [priorityCol, setPriorityCol] = useState<string>("");
  const [remarksCol, setRemarksCol] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  const handleGenerate = () => {
    setValidationError(null);

    if (!taskNameCol || !startDateCol || !endDateCol) {
      setValidationError("Please map Task Name, Start Date, and End Date.");
      return;
    }

    const tasks: GanttTask[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = String(row[taskNameCol] ?? "").trim();
      const start = parseDate(row[startDateCol]);
      const end = parseDate(row[endDateCol]);
      const progress = progressCol && progressCol !== "none" ? parseProgress(row[progressCol]) : 0;
      const pic = picCol && picCol !== "none" ? String(row[picCol] ?? "").trim() || undefined : undefined;
      const category = categoryCol && categoryCol !== "none" ? String(row[categoryCol] ?? "").trim() || undefined : undefined;
      const priority = priorityCol && priorityCol !== "none" ? parsePriority(row[priorityCol]) : undefined;
      const remarks = remarksCol && remarksCol !== "none" ? String(row[remarksCol] ?? "").trim() || undefined : undefined;

      if (!name || !start || !end) continue;
      if (start.getTime() > end.getTime()) continue;

      tasks.push({ id: `task-${i}`, name, start, end, progress, pic, category, priority, remarks });
    }

    if (tasks.length === 0) {
      setValidationError(
        "No valid tasks could be generated. Please check your column mappings and date formats."
      );
      return;
    }

    onMapped(tasks);
  };

  const mappingCards = [
    { id: "task", label: "Task Name", required: true, value: taskNameCol, setter: setTaskNameCol },
    { id: "start", label: "Start Date", required: true, value: startDateCol, setter: setStartDateCol },
    { id: "end", label: "End Date", required: true, value: endDateCol, setter: setEndDateCol },
    { id: "progress", label: "Progress %", required: false, value: progressCol, setter: setProgressCol, hasNone: true },
    { id: "pic", label: "PIC / Assignee", required: false, value: picCol, setter: setPicCol, hasNone: true },
    { id: "category", label: "Category", required: false, value: categoryCol, setter: setCategoryCol, hasNone: true },
    { id: "priority", label: "Priority", required: false, value: priorityCol, setter: setPriorityCol, hasNone: true },
    { id: "remarks", label: "Remarks", required: false, value: remarksCol, setter: setRemarksCol, hasNone: true },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl text-[var(--text-main)]">Map your columns</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Tell us which columns contain what data
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--copper)]/30 bg-transparent"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start Over
        </Button>
      </div>

      {/* Mapping cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mappingCards.map((card) => (
          <div
            key={card.id}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative rounded-xl border transition-all duration-400 overflow-hidden ${
              card.value
                ? "border-[var(--copper)]/25 bg-[var(--copper)]/[0.03]"
                : hoveredCard === card.id
                ? "border-[var(--copper)]/20 bg-[var(--surface-raised)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            {card.value && (
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--copper)]/40 to-transparent" />
            )}
            <div className="p-5 flex flex-col gap-3">
              <Label className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                {card.label}
                {card.required && (
                  <span className="text-[10px] text-[var(--copper)]">Required</span>
                )}
              </Label>
              <Select value={card.value} onValueChange={(v) => card.setter(v ?? "")}>
                <SelectTrigger
                  className={`w-full border-[var(--border)] bg-[var(--background)] text-[var(--text-main)] focus:ring-[var(--copper)]/30 focus:border-[var(--copper)]/40 ${
                    card.value ? "border-[var(--copper)]/20" : ""
                  }`}
                >
                  <SelectValue placeholder="Choose column" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--surface-raised)] border-[var(--border)]">
                  {card.hasNone && (
                    <SelectItem
                      value="none"
                      className="text-[var(--text-muted)] focus:bg-[var(--copper)]/10 focus:text-[var(--text-main)]"
                    >
                      — None —
                    </SelectItem>
                  )}
                  {headers.map((h) => (
                    <SelectItem
                      key={h}
                      value={h}
                      className="text-[var(--text-main)] focus:bg-[var(--copper)]/10 focus:text-[var(--text-main)]"
                    >
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.04] px-5 py-4 text-sm text-red-500 animate-fade-up">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          {validationError}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between py-2">
        <div className="text-xs font-mono text-[var(--text-muted)]">
          Previewing{" "}
          <span className="text-[var(--copper)]">{previewRows.length}</span> of{" "}
          <span className="text-[var(--text-main)]">{rows.length}</span> rows
        </div>
        <Button
          onClick={handleGenerate}
          className="gap-2 bg-[var(--copper)] text-[var(--text-inverse)] hover:bg-[var(--copper-light)] font-medium tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[var(--copper)]/10"
        >
          <Sparkles className="h-4 w-4" />
          Generate Gantt Chart
          <ChevronRight className="h-4 w-4 opacity-60" />
        </Button>
      </div>

      {/* Data preview */}
      <Card className="overflow-hidden border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--border)] hover:bg-transparent">
                {headers.map((h) => (
                  <TableHead
                    key={h}
                    className="whitespace-nowrap text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] py-4"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, idx) => (
                <TableRow
                  key={idx}
                  className="border-[var(--border)] hover:bg-[var(--surface-raised)]/50 transition-colors"
                >
                  {headers.map((h) => (
                    <TableCell
                      key={h}
                      className="whitespace-nowrap text-sm text-[var(--text-main)]/80 py-3.5 font-mono"
                    >
                      {String(row[h] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
