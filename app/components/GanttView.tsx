"use client";

import React, { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { RotateCcw, ImageDown, Calendar, Bookmark, X, Filter } from "lucide-react";
import { format, differenceInDays, addDays, eachDayOfInterval, isWeekend } from "date-fns";
import type { GanttTask } from "./ColumnMapper";

interface GanttViewProps {
  tasks: GanttTask[];
  onReset: () => void;
  onSave: () => void;
}

const DAY_WIDTH = 50;
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 84;
const TASK_LABEL_WIDTH = 300;

const PRIORITY_META: Record<string, { label: string; dot: string; bar: string; fill: string }> = {
  high: { label: "High", dot: "#c44545", bar: "#c44545", fill: "#e06c6c" },
  medium: { label: "Medium", dot: "#d4a017", bar: "#d4a017", fill: "#e5c07b" },
  low: { label: "Low", dot: "#5a9e7a", bar: "#5a9e7a", fill: "#78c49a" },
};

export function GanttView({ tasks, onReset, onSave }: GanttViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPic, setSelectedPic] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  // Unique filter options
  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))).sort(),
    [tasks]
  );
  const pics = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.pic).filter(Boolean))).sort(),
    [tasks]
  );

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedCategory !== "all" && task.category !== selectedCategory) return false;
      if (selectedPic !== "all" && task.pic !== selectedPic) return false;
      if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
      return true;
    });
  }, [tasks, selectedCategory, selectedPic, selectedPriority]);

  const hasActiveFilters =
    selectedCategory !== "all" || selectedPic !== "all" || selectedPriority !== "all";

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedPic("all");
    setSelectedPriority("all");
  };

  // Timeline calculation uses FULL tasks for consistent date range
  const { minDate, totalDays, days } = useMemo(() => {
    const starts = tasks.map((t) => t.start);
    const ends = tasks.map((t) => t.end);
    const min = new Date(Math.min(...starts.map((d) => d.getTime())));
    const max = new Date(Math.max(...ends.map((d) => d.getTime())));
    const paddedMin = addDays(min, -3);
    const paddedMax = addDays(max, 7);
    const allDays = eachDayOfInterval({ start: paddedMin, end: paddedMax });
    return { minDate: paddedMin, totalDays: allDays.length, days: allDays };
  }, [tasks]);

  const months = useMemo(() => {
    const result: { label: string; startIndex: number; count: number }[] = [];
    let current: typeof result[0] | null = null;
    days.forEach((day, idx) => {
      const monthLabel = format(day, "MMM yyyy");
      if (!current || current.label !== monthLabel) {
        if (current) result.push(current);
        current = { label: monthLabel, startIndex: idx, count: 1 };
      } else {
        current.count++;
      }
    });
    if (current) result.push(current);
    return result;
  }, [days]);

  const getOffset = (date: Date) => differenceInDays(date, minDate) * DAY_WIDTH;
  const getWidth = (start: Date, end: Date) =>
    Math.max((differenceInDays(end, start) + 1) * DAY_WIDTH, 4);

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue(isDark ? "--obsidian" : "--background")
        .trim();
      const dataUrl = await toPng(chartRef.current, {
        pixelRatio: 2,
        backgroundColor: bgColor || (isDark ? "#0c0c0f" : "#f8f6f2"),
      });
      const link = document.createElement("a");
      link.download = `gantt-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // ignore
    }
  };

  const chartWidth = totalDays * DAY_WIDTH;

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-3xl text-[var(--text-main)]">Timeline</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)] flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {format(minDate, "MMM d, yyyy")} — {format(addDays(minDate, totalDays - 1), "MMM d, yyyy")}
            {" "}·{" "}
            <span className="text-[var(--copper)]">
              {filteredTasks.length} of {tasks.length} tasks
              {hasActiveFilters && " (filtered)"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-mono text-[var(--copper)] hover:text-[var(--copper-light)] flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--copper)]/30 bg-transparent"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New File
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="gap-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--copper)] hover:border-[var(--copper)]/30 bg-transparent"
          >
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="gap-2 bg-[var(--copper)] text-[var(--text-inverse)] hover:bg-[var(--copper-light)] font-medium tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[var(--copper)]/10"
          >
            <ImageDown className="h-4 w-4" />
            Export PNG
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Filter className="h-3.5 w-3.5" />
          <span className="text-xs font-mono uppercase tracking-widest">Filters</span>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 px-3 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--background)] text-[var(--text-main)] focus:border-[var(--copper)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--copper)]/10"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        {/* PIC Filter */}
        {pics.length > 0 && (
          <select
            value={selectedPic}
            onChange={(e) => setSelectedPic(e.target.value)}
            className="h-8 px-3 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--background)] text-[var(--text-main)] focus:border-[var(--copper)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--copper)]/10"
          >
            <option value="all">All PICs</option>
            {pics.map((pic) => (
              <option key={pic} value={pic}>
                {pic}
              </option>
            ))}
          </select>
        )}

        {/* Priority Filter */}
        <div className="flex items-center gap-1">
          {[
            { key: "all", label: "All" },
            { key: "high", label: "High", color: "#c44545" },
            { key: "medium", label: "Med", color: "#d4a017" },
            { key: "low", label: "Low", color: "#5a9e7a" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPriority(p.key)}
              className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 border ${
                selectedPriority === p.key
                  ? "border-[var(--copper)]/30 bg-[var(--copper)]/10 text-[var(--text-main)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--copper)]/20"
              }`}
            >
              {p.color && (
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              )}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* No results */}
      {filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-[var(--border)] rounded-2xl bg-[var(--surface)]">
          <Filter className="h-8 w-8 text-[var(--text-muted)] opacity-40" />
          <div>
            <p className="text-sm font-medium text-[var(--text-main)]">No tasks match your filters</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Try adjusting Category, PIC, or Priority
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1 mt-1">
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        </div>
      )}

      {/* Chart container */}
      {filteredTasks.length > 0 && (
        <div
          ref={chartRef}
          className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] glow-copper"
        >
          <div className="flex">
            {/* Task labels column */}
            <div
              className="shrink-0 border-r border-[var(--border)] bg-[var(--surface)] z-10"
              style={{ width: TASK_LABEL_WIDTH }}
            >
              {/* Column header */}
              <div
                className="flex items-center border-b border-[var(--border)] px-5 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]"
                style={{ height: HEADER_HEIGHT }}
              >
                Task
              </div>
              {/* Task rows */}
              {filteredTasks.map((task, idx) => {
                const pMeta = task.priority ? PRIORITY_META[task.priority] : null;
                return (
                  <div
                    key={task.id}
                    className="flex items-center border-b border-[var(--border)] px-5 transition-colors duration-200 hover:bg-[var(--surface-raised)]/60"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] w-5 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      {/* Priority dot */}
                      {pMeta && (
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: pMeta.dot }}
                          title={pMeta.label}
                        />
                      )}
                      <span className="text-sm font-medium text-[var(--text-main)] truncate">
                        {task.name}
                      </span>
                    </div>
                    {/* Meta chips on the right */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {task.category && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--background)] text-[var(--text-muted)] border border-[var(--border)] truncate max-w-[80px]">
                          {task.category}
                        </span>
                      )}
                      {task.pic && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--copper)]/10 text-[var(--copper)] truncate max-w-[80px]">
                          {task.pic}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline scroll area */}
            <div className="overflow-x-auto">
              <div style={{ width: chartWidth }}>
                {/* Timeline header */}
                <div style={{ height: HEADER_HEIGHT }} className="relative border-b border-[var(--border)]">
                  {/* Months row */}
                  <div className="flex border-b border-[var(--border)]">
                    {months.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center border-r border-[var(--border)] bg-[var(--surface)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]"
                        style={{ width: m.count * DAY_WIDTH, height: HEADER_HEIGHT / 2 }}
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                  {/* Days row */}
                  <div className="flex">
                    {days.map((day, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center border-r border-[var(--border)] text-[10px] transition-colors ${
                          isWeekend(day) ? "bg-[var(--surface)]/40" : "bg-transparent"
                        }`}
                        style={{ width: DAY_WIDTH, height: HEADER_HEIGHT / 2 }}
                      >
                        <span className="text-[var(--text-muted)]/60 font-mono text-[9px]">
                          {format(day, "EEE")}
                        </span>
                        <span
                          className={`font-mono font-medium text-[11px] ${
                            isWeekend(day) ? "text-[var(--text-muted)]/40" : "text-[var(--text-muted)]"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart body */}
                <div className="relative">
                  {/* Background grid columns */}
                  <div className="absolute inset-0 flex">
                    {days.map((day, i) => (
                      <div
                        key={i}
                        className={`border-r border-[var(--border)] ${
                          isWeekend(day) ? "bg-[var(--text-main)]/[0.015]" : ""
                        }`}
                        style={{ width: DAY_WIDTH, height: filteredTasks.length * ROW_HEIGHT }}
                      />
                    ))}
                  </div>

                  {/* Today marker */}
                  {(() => {
                    const today = new Date();
                    const todayOffset = getOffset(today);
                    if (todayOffset >= 0 && todayOffset < chartWidth) {
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-[var(--copper)]/40 z-[5]"
                          style={{ left: todayOffset + DAY_WIDTH / 2 }}
                        >
                          <div className="absolute -top-1 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--copper)] text-[var(--text-inverse)] leading-none">
                            Today
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Task bars */}
                  {filteredTasks.map((task) => {
                    const left = getOffset(task.start);
                    const width = getWidth(task.start, task.end);
                    const pMeta = task.priority ? PRIORITY_META[task.priority] : null;
                    const bg = pMeta ? pMeta.bar : "#888888";
                    const fill = pMeta ? pMeta.fill : "#aaaaaa";
                    return (
                      <div
                        key={task.id}
                        className="relative flex items-center group"
                        style={{ height: ROW_HEIGHT }}
                      >
                        {/* Hover highlight row */}
                        <div className="absolute inset-0 bg-[var(--copper)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                        {/* Bar */}
                        <div
                          className="absolute rounded-md overflow-hidden transition-all duration-300 group-hover:brightness-110"
                          style={{
                            left,
                            width,
                            height: ROW_HEIGHT - 18,
                            top: 9,
                            backgroundColor: bg,
                          }}
                        >
                          {/* Progress fill */}
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor: fill,
                            }}
                          />
                          {/* Label */}
                          {width > 70 && (
                            <div className="absolute inset-0 flex items-center px-2.5">
                              <span className="text-[10px] font-mono font-medium text-white/90 truncate drop-shadow-sm">
                                {task.progress > 0 ? `${task.progress}%` : "…"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 flex justify-center">
                          <div
                            className="px-2 py-1 rounded-md text-[10px] font-mono bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-main)] shadow-xl"
                            style={{ marginLeft: left + width + 8, marginTop: -ROW_HEIGHT / 2 }}
                          >
                            {format(task.start, "MMM d")} — {format(task.end, "MMM d")}
                            {task.pic && ` · ${task.pic}`}
                            {task.category && ` · ${task.category}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs font-mono text-[var(--text-muted)] flex-wrap">
        <span className="text-[10px] uppercase tracking-widest">Bars</span>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#888888]" />
          <span>No priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#c44545]" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#d4a017]" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#5a9e7a]" />
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}
