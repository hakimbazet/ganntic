"use client";

import React, { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import {
  RotateCcw, ImageDown, Calendar, Bookmark, X, Filter,
  ChevronDown, ChevronRight,
} from "lucide-react";
import {
  format, differenceInDays, differenceInCalendarWeeks,
  differenceInCalendarMonths, addDays, eachDayOfInterval,
  eachWeekOfInterval, eachMonthOfInterval, endOfWeek, isSameMonth,
} from "date-fns";
import { TaskTable } from "./TaskTable";
import type { GanttTask } from "../ColumnMapper";

interface GanttViewProps {
  tasks: GanttTask[];
  onReset: () => void;
  onSave: () => void;
  onTasksChange: (tasks: GanttTask[]) => void;
}

type ViewMode = "daily" | "weekly" | "monthly";

const PRIORITY_META: Record<string, { dot: string; bar: string; fill: string }> = {
  high: { dot: "#c44545", bar: "#c44545", fill: "#e06c6c" },
  medium: { dot: "#d4a017", bar: "#d4a017", fill: "#e5c07b" },
  low: { dot: "#5a9e7a", bar: "#5a9e7a", fill: "#78c49a" },
};

function getSlotIndex(date: Date, minDate: Date, mode: ViewMode): number {
  if (mode === "daily") return differenceInDays(date, minDate);
  if (mode === "weekly") return differenceInCalendarWeeks(date, minDate, { weekStartsOn: 1 });
  return differenceInCalendarMonths(date, minDate);
}
function getSlotSpan(start: Date, end: Date, minDate: Date, mode: ViewMode): number {
  return Math.max(getSlotIndex(end, minDate, mode) - getSlotIndex(start, minDate, mode) + 1, 1);
}

const DAILY_W = 50;

export function GanttView({ tasks, onReset, onSave, onTasksChange }: GanttViewProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "table">("timeline");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selCat, setSelCat] = useState("all");
  const [selPic, setSelPic] = useState("all");
  const [selPri, setSelPri] = useState("all");

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    tasks.forEach((t) => s.add(t.category || "Uncategorized"));
    return s;
  });
  const toggleCat = (n: string) => setExpanded((p) => { const c = new Set(p); c.has(n) ? c.delete(n) : c.add(n); return c; });

  const cats = useMemo(() => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))).sort(), [tasks]);
  const pics = useMemo(() => Array.from(new Set(tasks.map((t) => t.pic).filter(Boolean))).sort(), [tasks]);

  const filtered = useMemo(() => tasks.filter((t) => {
    if (selCat !== "all" && t.category !== selCat) return false;
    if (selPic !== "all" && t.pic !== selPic) return false;
    if (selPri !== "all" && t.priority !== selPri) return false;
    return true;
  }), [tasks, selCat, selPic, selPri]);

  const hasFilters = selCat !== "all" || selPic !== "all" || selPri !== "all";
  const clearAll = () => { setSelCat("all"); setSelPic("all"); setSelPri("all"); };

  const { slots, minDate, slotCount } = useMemo(() => {
    const s = tasks.map((t) => t.start), e = tasks.map((t) => t.end);
    const aMin = new Date(Math.min(...s.map((d) => d.getTime())));
    const aMax = new Date(Math.max(...e.map((d) => d.getTime())));
    const pMin = addDays(aMin, -3), pMax = addDays(aMax, 7);
    let ds: Date[];
    if (viewMode === "daily") ds = eachDayOfInterval({ start: pMin, end: pMax });
    else if (viewMode === "weekly") ds = eachWeekOfInterval({ start: pMin, end: pMax }, { weekStartsOn: 1 });
    else ds = eachMonthOfInterval({ start: pMin, end: pMax });
    return { slots: ds, minDate: pMin, slotCount: ds.length };
  }, [tasks, viewMode]);

  const isDaily = viewMode === "daily";
  const headW = isDaily ? slotCount * DAILY_W : undefined;
  const pct = 100 / slotCount;

  const pxOff = (d: Date) => getSlotIndex(d, minDate, viewMode) * DAILY_W;
  const pxSpan = (s: Date, e: Date) => getSlotSpan(s, e, minDate, viewMode) * DAILY_W;
  const pctOff = (d: Date) => (getSlotIndex(d, minDate, viewMode) / slotCount) * 100;
  const pctSpan = (s: Date, e: Date) => (getSlotSpan(s, e, minDate, viewMode) / slotCount) * 100;

  const groups = useMemo(() => {
    const order: string[] = [], map = new Map<string, GanttTask[]>();
    filtered.forEach((t) => { const c = t.category || "Uncategorized"; if (!map.has(c)) { map.set(c, []); order.push(c); } map.get(c)!.push(t); });
    return order.map((name) => {
      const ts = map.get(name)!;
      return { name, tasks: ts,
        sStart: new Date(Math.min(...ts.map((t) => t.start.getTime()))),
        sEnd: new Date(Math.max(...ts.map((t) => t.end.getTime()))),
        sProg: Math.round(ts.reduce((s, t) => s + t.progress, 0) / ts.length),
      };
    });
  }, [filtered]);

  const exportPng = async () => {
    if (!chartRef.current) return;
    const isDark = document.documentElement.classList.contains("dark");
    const bg = getComputedStyle(document.documentElement).getPropertyValue(isDark ? "--obsidian" : "--background").trim();
    const url = await toPng(chartRef.current, { pixelRatio: 2, backgroundColor: bg || (isDark ? "#0c0c0f" : "#f8f6f2") });
    const a = document.createElement("a");
    a.download = `gantt-${format(new Date(), "yyyy-MM-dd")}.png`; a.href = url; a.click();
  };

  const barStyle = (s: Date, e: Date) => isDaily
    ? { left: `${pxOff(s)}px`, width: `${pxSpan(s, e)}px` }
    : { left: `${pctOff(s)}%`, width: `${pctSpan(s, e)}%` };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-3xl text-[var(--text-main)]">Timeline</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)] flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {format(minDate, "MMM d, yyyy")} — {format(addDays(minDate, isDaily ? slotCount : slotCount * (viewMode === "weekly" ? 7 : 30)), "MMM d, yyyy")}
            {" "}·{" "}
            <span className="text-[var(--copper)]">{filtered.length} of {tasks.length}{hasFilters && " (filtered)"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && <button onClick={clearAll} className="text-xs font-mono text-[var(--copper)] flex items-center gap-1"><X className="h-3 w-3" /> Clear</button>}
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent"><RotateCcw className="h-3.5 w-3.5" /> New</Button>
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--copper)] bg-transparent"><Bookmark className="h-4 w-4" /> Save</Button>
          <Button size="sm" onClick={exportPng} className="gap-2 bg-[var(--copper)] text-[var(--text-inverse)] hover:bg-[var(--copper-light)]"><ImageDown className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] pb-1">
        {(["timeline", "table"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-[5px] ${
              activeTab === t
                ? "border-[var(--copper)] text-[var(--text-main)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {t === "timeline" ? "Timeline" : "Table"}
          </button>
        ))}
      </div>

      {activeTab === "table" ? (
        <TaskTable
          tasks={tasks}
          onApply={(updated) => {
            onTasksChange(updated);
            setActiveTab("timeline");
          }}
          onCancel={() => setActiveTab("timeline")}
        />
      ) : (
        <>
          {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2 text-[var(--text-muted)]"><Filter className="h-3.5 w-3.5" /><span className="text-xs font-mono uppercase tracking-widest">Filters</span></div>
        {cats.length > 0 && (
          <select value={selCat} onChange={(e) => setSelCat(e.target.value)} className="h-8 px-3 rounded-lg text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-main)] focus:ring-2 focus:ring-[var(--copper)]/10">
            <option value="all">All Categories</option>
            {cats.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        )}
        {pics.length > 0 && (
          <select value={selPic} onChange={(e) => setSelPic(e.target.value)} className="h-8 px-3 rounded-lg text-xs border border-[var(--border)] bg-[var(--background)] text-[var(--text-main)] focus:ring-2 focus:ring-[var(--copper)]/10">
            <option value="all">All PICs</option>
            {pics.map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
        )}
        <div className="flex items-center gap-1">
          {["all", "high", "medium", "low"].map((p) => (
            <button key={p} onClick={() => setSelPri(p)} className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${selPri === p ? "border-[var(--copper)]/30 bg-[var(--copper)]/10 text-[var(--text-main)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}>
              {p !== "all" && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_META[p]?.dot }} />}
              {p === "all" ? "All" : p === "high" ? "High" : p === "medium" ? "Med" : "Low"}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-[var(--border)] mx-1" />
        <div className="flex items-center gap-1">
          {(["daily", "weekly", "monthly"] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setViewMode(m)} className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${viewMode === m ? "border-[var(--copper)]/30 bg-[var(--copper)]/10 text-[var(--text-main)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-[var(--border)] rounded-2xl bg-[var(--surface)]">
          <Filter className="h-8 w-8 text-[var(--text-muted)] opacity-40" />
          <p className="text-sm font-medium text-[var(--text-main)]">No tasks match your filters</p>
          <Button variant="outline" size="sm" onClick={clearAll} className="gap-1"><X className="h-3.5 w-3.5" /> Clear</Button>
        </div>
      )}

      {/* Chart */}
      {filtered.length > 0 && (
        <div ref={chartRef} className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] glow-copper">
          <div className="flex min-w-0">
            {/* Left column */}
            <div className="shrink-0 border-r border-[var(--border)] bg-[var(--surface)] z-10" style={{ width: 300 }}>
              <div className="flex items-center border-b border-[var(--border)] px-5 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]" style={{ height: 84 }}>Task</div>
              {groups.map((g) => {
                const exp = expanded.has(g.name);
                return (
                  <div key={g.name}>
                    <div className="flex items-center border-b border-[var(--border)] px-5 cursor-pointer hover:bg-[var(--surface-raised)]/40" style={{ height: 48 }} onClick={() => toggleCat(g.name)}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="shrink-0 text-[var(--text-muted)]">{exp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
                        <span className="text-sm font-bold text-[var(--text-main)] truncate">{g.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--background)] text-[var(--text-muted)] border border-[var(--border)]">{g.tasks.length}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] ml-2">{format(g.sStart, "MMM d")} – {format(g.sEnd, "MMM d")}</span>
                    </div>
                    {exp && g.tasks.map((task, i) => {
                      const pm = task.priority ? PRIORITY_META[task.priority] : null;
                      return (
                        <div key={task.id} className="flex items-center border-b border-[var(--border)] px-5 hover:bg-[var(--surface-raised)]/60" style={{ height: 48, paddingLeft: 36 }}>
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-[var(--text-muted)] w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                            {pm && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pm.dot }} />}
                            <span className="text-sm font-medium text-[var(--text-main)] truncate">{task.name}</span>
                          </div>
                          {task.pic && <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--copper)]/10 text-[var(--copper)] truncate max-w-[80px] ml-1">{task.pic}</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Timeline */}
            <div className={`flex-1 min-w-0 ${isDaily ? "overflow-x-auto" : ""}`}>
              <div style={isDaily ? { width: headW } : undefined} className={isDaily ? "" : "w-full"}>
                {/* Header */}
                <div style={{ height: 84 }} className="relative border-b border-[var(--border)]">
                  <div className="flex border-b border-[var(--border)]" style={{ height: 42 }}>
                    {(() => {
                      const parents: { label: string; count: number }[] = [];
                      let cur: typeof parents[0] | null = null;
                      slots.forEach((s) => {
                        const label = viewMode === "monthly" ? format(s, "yyyy") : format(s, "MMM yyyy");
                        if (!cur || cur.label !== label) { if (cur) parents.push(cur); cur = { label, count: 1 }; }
                        else cur.count++;
                      });
                      if (cur) parents.push(cur);
                      return parents.map((p, i) => (
                        <div key={i} className="flex items-center justify-center border-r border-[var(--border)] bg-[var(--surface)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]"
                          style={{ width: isDaily ? p.count * DAILY_W : `${(p.count / slotCount) * 100}%` }}>
                          {p.label}
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="flex" style={{ height: 42 }}>
                    {slots.map((s, i) => (
                      <div key={i}
                        className={`flex flex-col items-center justify-center border-r border-[var(--border)] text-[10px] ${viewMode === "daily" && (s.getDay() === 0 || s.getDay() === 6) ? "bg-[var(--surface)]/40" : ""}`}
                        style={{ width: isDaily ? DAILY_W : `${pct}%` }}>
                        <span className="text-[var(--text-muted)]/60 font-mono text-[9px]">
                          {viewMode === "daily" ? format(s, "EEE") : viewMode === "weekly" ? "Week" : format(s, "yyyy")}
                        </span>
                        <span className="font-mono font-medium text-[10px] text-[var(--text-muted)] truncate w-full text-center px-0.5">
                          {viewMode === "daily" ? format(s, "d") : viewMode === "weekly" ? (() => {
                            const we = endOfWeek(s, { weekStartsOn: 1 });
                            return isSameMonth(s, we) ? `${format(s, "d")}–${format(we, "d")}` : `${format(s, "MMM d")}–${format(we, "MMM d")}`;
                          })() : format(s, "MMM")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="relative">
                  <div className={`absolute inset-0 flex pointer-events-none ${isDaily ? "" : "w-full"}`}>
                    {slots.map((_, i) => (
                      <div key={i} className="border-r border-[var(--border)]" style={{ width: isDaily ? DAILY_W : `${pct}%` }} />
                    ))}
                  </div>

                  {groups.map((g) => {
                    const exp = expanded.has(g.name);
                    const rows: React.ReactNode[] = [];

                    // Summary bar
                    const bs = barStyle(g.sStart, g.sEnd);
                    rows.push(
                      <div key={`${g.name}-s`} className="relative flex items-center group" style={{ height: 48 }}>
                        <div className="absolute rounded-md overflow-hidden border border-[var(--copper)]/40" style={{ ...bs, height: 28, top: 10, backgroundColor: "rgba(184,101,62,0.15)", minWidth: 4 }}>
                          <div className="h-full" style={{ width: `${g.sProg}%`, backgroundColor: "rgba(184,101,62,0.45)" }} />
                          {(isDaily ? pxSpan(g.sStart, g.sEnd) > 50 : pctSpan(g.sStart, g.sEnd) > 4) && (
                            <div className="absolute inset-0 flex items-center px-2">
                              <span className="text-[10px] font-mono font-semibold text-[var(--copper)] truncate">{g.sProg}%</span>
                            </div>
                          )}
                        </div>
                        {/* Category summary tooltip */}
                        <div className="absolute left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 flex justify-start">
                          <div className="px-2 py-1 rounded-md text-[10px] font-mono bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-main)] shadow-xl whitespace-nowrap"
                            style={{ marginLeft: `calc(${isDaily ? `${pxOff(g.sStart) + pxSpan(g.sStart, g.sEnd)}px` : `${pctOff(g.sStart) + pctSpan(g.sStart, g.sEnd)}%`} + 8px)`, marginTop: -28 }}>
                            {g.name} · {g.tasks.length} tasks · {format(g.sStart, "MMM d")} – {format(g.sEnd, "MMM d")}
                          </div>
                        </div>
                      </div>
                    );

                    if (exp) {
                      g.tasks.forEach((task) => {
                        const pm = task.priority ? PRIORITY_META[task.priority] : null;
                        const bw = barStyle(task.start, task.end);
                        rows.push(
                          <div key={task.id} className="relative flex items-center group" style={{ height: 48 }}>
                            <div className="absolute inset-0 bg-[var(--copper)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute rounded-md overflow-hidden transition-all group-hover:brightness-110"
                              style={{ ...bw, height: 32, top: 8, backgroundColor: pm ? pm.bar : "#888888", minWidth: 4 }}>
                              <div className="h-full transition-all duration-500" style={{ width: `${task.progress}%`, backgroundColor: pm ? pm.fill : "#aaaaaa" }} />
                              {(isDaily ? pxSpan(task.start, task.end) > 50 : pctSpan(task.start, task.end) > 4) && (
                                <div className="absolute inset-0 flex items-center px-2">
                                  <span className="text-[10px] font-mono font-medium text-white/90 truncate drop-shadow-sm">{task.progress > 0 ? `${task.progress}%` : "…"}</span>
                                </div>
                              )}
                            </div>
                            <div className="absolute left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 flex justify-start">
                              <div className="px-2 py-1 rounded-md text-[10px] font-mono bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-main)] shadow-xl whitespace-nowrap"
                                style={{ marginLeft: `calc(${isDaily ? `${pxOff(task.start) + pxSpan(task.start, task.end)}px` : `${pctOff(task.start) + pctSpan(task.start, task.end)}%`} + 8px)`, marginTop: -24 }}>
                                {isDaily ? (
                                  <>
                                    {format(task.start, "MMM d")} — {format(task.end, "MMM d")}
                                    {task.pic && ` · ${task.pic}`}
                                    {task.remarks && ` · ${task.remarks}`}
                                  </>
                                ) : (
                                  <>{task.name} · {task.progress}%</>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    }

                    return <div key={g.name}>{rows}</div>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs font-mono text-[var(--text-muted)] flex-wrap">
        <span className="text-[10px] uppercase tracking-widest">Priority</span>
        <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-sm bg-[#888888]" /><span>None</span></div>
        <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-sm bg-[#c44545]" /><span>High</span></div>
        <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-sm bg-[#d4a017]" /><span>Medium</span></div>
        <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-sm bg-[#5a9e7a]" /><span>Low</span></div>
        <div className="h-5 w-px bg-[var(--border)]" />
        <span className="text-[10px] uppercase tracking-widest">Category</span>
        <div className="flex items-center gap-2"><div className="h-3 w-8 rounded-sm border border-[var(--copper)]/40 bg-[var(--copper)]/15" /><span>Summary bar</span></div>
      </div>
      </>
      )}
    </div>
  );
}
