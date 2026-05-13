"use client";

import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

export interface ParsedExcel {
  headers: string[];
  rows: Record<string, unknown>[];
}

export function useExcelParser() {
  const [parsed, setParsed] = useState<ParsedExcel | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback((file: File) => {
    setIsParsing(true);
    setError(null);
    setParsed(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: "",
        });

        if (json.length === 0) {
          setError("The uploaded file is empty or could not be read.");
          setIsParsing(false);
          return;
        }

        const headers = Object.keys(json[0]);
        setParsed({ headers, rows: json });
        setIsParsing(false);
      } catch (err) {
        setError("Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.");
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file.");
      setIsParsing(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const reset = useCallback(() => {
    setParsed(null);
    setError(null);
    setIsParsing(false);
  }, []);

  return { parsed, isParsing, error, parseFile, reset };
}
