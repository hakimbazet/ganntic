# Excel to Gantt Chart Converter — Plan

## Overview
Build a web application that allows users to upload an Excel file, map their own columns to Gantt fields, and visualize tasks as a flat Gantt chart timeline. Users can export the final chart as an image.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Excel Parsing:** `xlsx` (SheetJS)
- **Image Export:** `html-to-image`
- **Date Utilities:** `date-fns`

## Step-by-Step Tasks

### Phase 1: Project Setup
1. Initialize Next.js 16 in the workspace.
2. Configure Tailwind CSS v4 and shadcn/ui.
3. Install shadcn/ui base components: `button`, `card`, `select`, `table`.
4. Install additional packages: `xlsx`, `html-to-image`, `date-fns`, `lucide-react`.

### Phase 2: Core Components
5. **File Uploader** (`app/components/FileUploader.tsx`): Drag-and-drop component for Excel file upload.
6. **Excel Parser Hook** (`app/hooks/useExcelParser.ts`): Convert uploaded `.xlsx` to raw JSON + extract headers.
7. **Column Mapper** (`app/components/ColumnMapper.tsx`): UI to map user columns to `Task`, `Start Date`, `End Date`, and `Progress`.
8. **Gantt View** (`app/components/GanttView.tsx`):
   - Calculate global date range.
   - Render scrollable horizontal timeline header.
   - Render task rows with positioned bars based on mapped dates.
   - Show progress overlay on bars.
9. **Export Toolbar** (`app/components/ExportToolbar.tsx`): Button to capture Gantt DOM as PNG using `html-to-image`.

### Phase 3: Integration & Polish
10. **Main Page** (`app/page.tsx`): Orchestrate the 3-step flow: Upload → Map → View.
11. Add validation for mapped data (valid dates, start < end).
12. Add reset functionality to upload a new file.
13. Clean up styling and ensure responsiveness.

## Project Structure
```
app/
├── page.tsx
├── layout.tsx
├── globals.css
├── components/
│   ├── FileUploader.tsx
│   ├── ColumnMapper.tsx
│   ├── GanttView.tsx
│   └── ExportToolbar.tsx
└── hooks/
    └── useExcelParser.ts
components/ui/         # shadcn components
lib/utils.ts
```
