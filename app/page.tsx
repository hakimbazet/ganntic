"use client";

import { useCallback, useEffect, useState } from "react";
import { LayoutList, ArrowRight } from "lucide-react";
import { FileUploader } from "./components/FileUploader";
import { ColumnMapper, GanttTask } from "./components/ColumnMapper";
import { GanttView } from "./components/gantt";
import { SaveChartDialog } from "./components/SaveChartDialog";
import { ThemeToggle } from "./components/ThemeToggle";
import { GalleryPanel } from "./components/GalleryPanel";
import { useExcelParser } from "./hooks/useExcelParser";
import { useGallery } from "./hooks/useGallery";

export default function Home() {
  const {
    parsed,
    isParsing,
    error,
    parseFile,
    reset: resetParser,
  } = useExcelParser();
  const { items, addItem, deleteItem } = useGallery();
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [animateKey, setAnimateKey] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      parseFile(file);
    },
    [parseFile],
  );

  const handleMapped = useCallback((mappedTasks: GanttTask[]) => {
    setTasks(mappedTasks);
  }, []);

  const handleReset = useCallback(() => {
    resetParser();
    setTasks([]);
  }, [resetParser]);

  const handleLoadFromGallery = useCallback((item: { tasks: GanttTask[] }) => {
    setTasks(item.tasks);
    setIsGalleryOpen(false);
  }, []);

  const handleSaveChart = useCallback(
    (name: string) => {
      addItem(name, tasks);
      setIsSaveDialogOpen(false);
    },
    [addItem, tasks],
  );

  // Trigger animation when step changes
  useEffect(() => {
    setAnimateKey((k) => k + 1);
  }, [!!parsed, tasks.length]);

  const step = tasks.length > 0 ? "view" : parsed ? "map" : "upload";

  return (
    <div className="relative min-h-screen animated-mesh">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--copper)] to-transparent opacity-40" />

      <main className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="pt-10 pb-6 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-[var(--copper)] flex items-center justify-center">
                <span className="font-heading text-lg text-[var(--text-inverse)] leading-none">
                  G
                </span>
              </div>
              <span className="font-heading text-2xl tracking-wide text-[var(--text-main)]">
                Ganttic
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Gallery button */}
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--copper)] hover:border-[var(--copper)]/30 transition-all duration-300"
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Gallery</span>
                {items.length > 0 && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-[var(--copper)]/10 text-[var(--copper)] text-[10px] flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
              {/* Theme toggle */}
              <ThemeToggle />
              {/* Status */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--copper)] animate-pulse" />
                {step === "upload" && "Ready"}
                {step === "map" && "Mapping"}
                {step === "view" && "Visualizing"}
              </div>
            </div>
          </div>
        </header>

        {/* Hero text — only on upload step */}
        {step === "upload" && (
          <div className="px-6 lg:px-12 pt-8 pb-4">
            <div className="max-w-2xl mx-auto text-center animate-fade-up">
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-[var(--text-main)] leading-[1.1]">
                From spreadsheet
                <br />
                <span className="text-[var(--copper)]">to timeline.</span>
              </h1>
              <p className="mt-6 text-lg text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
                Upload any Excel file, map your columns, and transform raw data
                into a beautiful, exportable Gantt chart in seconds.
              </p>
              <p className="mt-3 text-sm text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
                The simplest way to manage projects, track deadlines, and keep
                your team organized — no signup required.
              </p>
              <div className="mt-5">
                <a
                  href="/getting-started/"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--copper)] hover:text-[var(--copper-light)] transition-colors"
                >
                  <ArrowRight className="h-3 w-3" />
                  New here? Read the guide
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Step indicator bar */}
        <div className="px-6 lg:px-12 py-6">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            {["Upload", "Map", "Visualize"].map((label, i) => {
              const active =
                (step === "upload" && i === 0) ||
                (step === "map" && i === 1) ||
                (step === "view" && i === 2);
              const completed =
                (step === "map" && i === 0) ||
                (step === "view" && (i === 0 || i === 1));
              return (
                <div key={label} className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-500 ${
                        active
                          ? "bg-[var(--copper)] text-[var(--text-inverse)]"
                          : completed
                            ? "bg-[var(--copper)]/20 text-[var(--copper)] border border-[var(--copper)]/30"
                            : "bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]"
                      }`}
                    >
                      {completed && !active ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-xs font-medium tracking-wide transition-colors duration-500 ${
                        active
                          ? "text-[var(--text-main)]"
                          : completed
                            ? "text-[var(--copper)]"
                            : "text-[var(--text-muted)]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-px transition-all duration-700 ${
                        completed
                          ? "bg-[var(--copper)]/30"
                          : "bg-[var(--border)]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 px-6 lg:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            {step === "upload" && (
              <div
                key={`upload-${animateKey}`}
                className="animate-fade-up max-w-xl mx-auto pt-8"
              >
                <FileUploader
                  onFileSelect={handleFileSelect}
                  isParsing={isParsing}
                />
                {error && (
                  <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-500 animate-fade-up">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {step === "map" && parsed && (
              <div key={`map-${animateKey}`} className="animate-fade-up">
                <ColumnMapper
                  headers={parsed.headers}
                  rows={parsed.rows}
                  onMapped={handleMapped}
                  onReset={handleReset}
                />
              </div>
            )}

            {step === "view" && tasks.length > 0 && (
              <div key={`view-${animateKey}`} className="animate-fade-up">
                <GanttView
                  tasks={tasks}
                  onReset={handleReset}
                  onSave={() => setIsSaveDialogOpen(true)}
                  onTasksChange={setTasks}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] px-6 lg:px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>Ganttic — Excel to Gantt</span>
          </div>
        </footer>
      </main>

      {/* Overlays */}
      <GalleryPanel
        items={items}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onLoad={handleLoadFromGallery}
        onDelete={deleteItem}
      />

      {isSaveDialogOpen && (
        <SaveChartDialog
          tasks={tasks}
          onSave={handleSaveChart}
          onCancel={() => setIsSaveDialogOpen(false)}
        />
      )}
    </div>
  );
}
