import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Focus,
  BarChart3,
  FileSpreadsheet,
  Calendar,
  Users,
  Tag,
  Gauge,
  StickyNote,
  ImageDown,
  Table2,
  ZoomIn,
  Filter,
  Bookmark,
  CheckCircle,
} from "lucide-react";

export const metadata = {
  title: "Getting Started | Ganttic",
};

export default function GettingStartedPage() {
  return (
    <div className="relative min-h-screen animated-mesh">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--copper)] to-transparent opacity-40" />

      <main className="relative z-10 flex flex-col min-h-screen">
        {/* Minimal header */}
        <header className="pt-10 pb-6 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-md bg-[var(--copper)] flex items-center justify-center">
                <span className="font-heading text-lg text-[var(--text-inverse)] leading-none">
                  G
                </span>
              </div>
              <span className="font-heading text-2xl tracking-wide text-[var(--text-main)]">
                Ganttic
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--copper)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to app
            </Link>
          </div>
        </header>

        <div className="flex-1 px-6 lg:px-12 pb-20">
          <div className="max-w-3xl mx-auto">
            {/* Hero */}
            <div className="pt-6 pb-12 animate-fade-up">
              <h1 className="font-heading text-4xl sm:text-5xl text-[var(--text-main)] leading-[1.1]">
                Getting Started
              </h1>
              <p className="mt-4 text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl">
                Turn any Excel spreadsheet into a project timeline in three
                steps. No sign-up, no templates to memorize — just upload, map,
                and go.
              </p>
            </div>

            {/* 3-step guide */}
            <div className="grid gap-6 sm:grid-cols-3 pb-16">
              {[
                {
                  icon: Upload,
                  label: "01",
                  title: "Upload",
                  body: "Drop any .xlsx or .xls file. We read the first sheet automatically.",
                },
                {
                  icon: Focus,
                  label: "02",
                  title: "Map",
                  body: "Pick which columns are Task Name, Start Date, and End Date. Everything else is optional.",
                },
                {
                  icon: BarChart3,
                  label: "03",
                  title: "Visualize",
                  body: "Your Gantt chart appears instantly. Zoom, filter, edit, and export when ready.",
                },
              ].map((s, i) => (
                <div
                  key={s.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--copper)]/20 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 rounded-lg bg-[var(--copper)]/10 flex items-center justify-center text-[var(--copper)]">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                      Step {s.label}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl text-[var(--text-main)] mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Required vs Optional data */}
            <section className="pb-16 animate-fade-up">
              <div className="flex items-center gap-3 mb-6">
                <FileSpreadsheet className="h-5 w-5 text-[var(--copper)]" />
                <h2 className="font-heading text-2xl text-[var(--text-main)]">
                  What your spreadsheet needs
                </h2>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)]/40">
                  <p className="text-sm text-[var(--text-muted)]">
                    Your columns can be named anything — you map them manually.
                    Only three fields are required to draw the chart.
                  </p>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {[
                    {
                      req: true,
                      name: "Task Name",
                      desc: "What the task is called.",
                      icon: StickyNote,
                    },
                    {
                      req: true,
                      name: "Start Date",
                      desc: "When the task begins. Native Excel dates, serial numbers, or text dates all work.",
                      icon: Calendar,
                    },
                    {
                      req: true,
                      name: "End Date",
                      desc: "When the task ends. Must be on or after the start date.",
                      icon: Calendar,
                    },
                    {
                      req: false,
                      name: "Progress %",
                      desc: "Number 0–100, decimal 0.0–1.0, or text like '75%'. Shown as a fill inside each bar.",
                      icon: Gauge,
                    },
                    {
                      req: false,
                      name: "PIC / Assignee",
                      desc: "Person or team responsible. Used for filtering.",
                      icon: Users,
                    },
                    {
                      req: false,
                      name: "Category",
                      desc: "Groups tasks into collapsible sections (e.g. Phase 1, Design, QA).",
                      icon: Tag,
                    },
                    {
                      req: false,
                      name: "Priority",
                      desc: "High, Medium, or Low. Flexible: H/M/L, 1/2/3, Critical/Normal/Minor all work.",
                      icon: Gauge,
                    },
                    {
                      req: false,
                      name: "Remarks",
                      desc: "Short notes shown on hover in daily view.",
                      icon: StickyNote,
                    },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="px-6 py-4 flex items-start gap-4"
                    >
                      <div className="mt-0.5 shrink-0">
                        {row.req ? (
                          <CheckCircle className="h-4 w-4 text-[var(--copper)]" />
                        ) : (
                          <span className="inline-block h-4 w-4 rounded-full border border-[var(--border)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[var(--text-main)]">
                            {row.name}
                          </span>
                          {row.req && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--copper)]/10 text-[var(--copper)] border border-[var(--copper)]/20">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                          {row.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Feature highlights */}
            <section className="pb-16 animate-fade-up">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-5 w-5 text-[var(--copper)]" />
                <h2 className="font-heading text-2xl text-[var(--text-main)]">
                  Once your chart is ready
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: ZoomIn,
                    title: "Three zoom levels",
                    body: "Switch between Daily, Weekly, and Monthly views to see the right level of detail.",
                  },
                  {
                    icon: Filter,
                    title: "Filter on the fly",
                    body: "Narrow down by Category, Assignee, or Priority without changing your source file.",
                  },
                  {
                    icon: Table2,
                    title: "Inline editor",
                    body: "Switch to the Table tab to edit tasks directly, then jump back to Timeline.",
                  },
                  {
                    icon: ImageDown,
                    title: "Export as PNG",
                    body: "Download a high-resolution image that matches your current light or dark theme.",
                  },
                  {
                    icon: Bookmark,
                    title: "Save to gallery",
                    body: "Store charts locally in your browser so you can reload them later.",
                  },
                  {
                    icon: Tag,
                    title: "Smart grouping",
                    body: "Tasks are grouped by Category. Expand or collapse sections to focus on what matters.",
                  },
                ].map((f, i) => (
                  <div
                    key={f.title}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 flex items-start gap-4 animate-fade-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="h-9 w-9 rounded-lg bg-[var(--copper)]/10 flex items-center justify-center text-[var(--copper)] shrink-0">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-main)] mb-1">
                        {f.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {f.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* File tips */}
            <section className="pb-16 animate-fade-up">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
                <h3 className="font-heading text-xl text-[var(--text-main)] mb-4">
                  A few tips for smoother uploads
                </h3>
                <ul className="space-y-3">
                  {[
                    "Only the first worksheet in your workbook is read.",
                    "Rows missing a task name, start date, or end date are skipped automatically.",
                    "If a task ends before it starts, it is filtered out as invalid.",
                    "Progress can be written as 0.75, 75, or '75%' — we handle the conversion.",
                    "Priority is flexible: use High/Medium/Low, H/M/L, 1/2/3, or even Critical/Normal/Minor.",
                  ].map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-3 text-sm text-[var(--text-muted)]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--copper)] shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center pb-10 animate-fade-up">
              <Link
                href="/"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[var(--copper)] text-[var(--text-inverse)] text-sm font-medium hover:bg-[var(--copper-light)] transition-all"
              >
                <Upload className="h-4 w-4" />
                Upload your first file
              </Link>
              <p className="mt-3 text-xs text-[var(--text-muted)] font-mono">
                Free. No sign-up. Works entirely in your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] px-6 lg:px-12 py-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>Ganttic — Excel to Gantt</span>
            <span>Built with Next.js & Tailwind</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
