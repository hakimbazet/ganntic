"use client";

import React, { useCallback, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isParsing: boolean;
}

export function FileUploader({ onFileSelect, isParsing }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div className="relative group">
      {/* Ambient glow behind */}
      <div
        className={`absolute -inset-1 rounded-2xl bg-gradient-to-b from-[var(--copper)]/20 to-transparent blur-xl transition-all duration-700 ${
          isDragging ? "opacity-100 scale-105" : "opacity-0 scale-95 group-hover:opacity-60 group-hover:scale-100"
        }`}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center gap-6 p-14 sm:p-20 rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden ${
          isDragging
            ? "border-[var(--copper)] bg-[var(--copper)]/5"
            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--copper)]/30 hover:bg-[var(--surface-raised)]"
        }`}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Icon ring */}
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-500 ${
            isDragging
              ? "bg-[var(--copper)]/10 scale-110"
              : "bg-[var(--surface-raised)] group-hover:bg-[var(--copper)]/5 group-hover:scale-105"
          }`}
        >
          <div className="absolute inset-0 rounded-2xl border border-[var(--border)] group-hover:border-[var(--copper)]/20 transition-colors duration-500" />
          {isParsing ? (
            <FileSpreadsheet className="h-8 w-8 text-[var(--copper)] animate-pulse" />
          ) : (
            <Upload
              className={`h-8 w-8 transition-all duration-500 ${
                isDragging ? "text-[var(--copper)] -translate-y-1" : "text-[var(--text-muted)] group-hover:text-[var(--copper)]"
              }`}
            />
          )}
        </div>

        {/* Text */}
        <div className="text-center relative z-0">
          <p className="text-base font-medium text-[var(--text-main)] tracking-wide">
            {isParsing ? "Reading your spreadsheet..." : isDragging ? "Drop it here" : "Drag & drop your Excel file"}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Or click to browse — supports .xlsx and .xls
          </p>
        </div>

        {/* Supported formats pills */}
        <div className="flex items-center gap-2 relative z-0">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border)] bg-[var(--background)]">
            .xlsx
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border)] bg-[var(--background)]">
            .xls
          </span>
        </div>
      </div>
    </div>
  );
}
