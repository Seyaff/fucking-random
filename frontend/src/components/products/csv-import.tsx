import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { productService } from "@/services/product.service";
import type { ColumnMap } from "@/types/product";

interface CsvImportProps {
  onImported: () => void;
}

export function CsvImport({ onImported }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [columnMap, setColumnMap] = useState<ColumnMap | null>(null);
  const [preview, setPreview] = useState<Record<string, string | number | undefined>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setColumnMap(null);
    setPreview(null);
    setError(null);
    setSuccess(null);
  };

  const handleFile = async (f: File) => {
    if (!f.name.endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }
    setFile(f);
    setError(null);
    setSuccess(null);
    setColumnMap(null);
    setPreview(null);
    setDetecting(true);
    try {
      const result = await productService.detectColumns(f);
      setColumnMap(result.columnMap);
      setPreview(result.preview);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to read CSV";
      setError(msg);
    } finally {
      setDetecting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const result = await productService.importCsv(file);
      setSuccess(result.imported);
      onImported();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Import failed";
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="size-5" />
          Import from CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file with your product data. Relay will auto-detect column headers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Upload className="size-8 mx-auto mb-3 text-muted-foreground/60" />
            <p className="text-sm font-medium">Drop your CSV here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Supports .csv files</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="size-5 shrink-0 text-primary" />
                <span className="text-sm font-medium truncate">{file.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="shrink-0 text-xs h-7">
                Change
              </Button>
            </div>

            {detecting && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Detecting columns...
              </div>
            )}

            {columnMap && preview && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Detected columns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(columnMap).map(([field, header]) => (
                      <span key={field} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-0.5">
                        <Check className="size-3" />
                        {header} <span className="opacity-60">→</span> {field}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Preview (first {preview.length} rows)</p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          {Object.values(columnMap).map((h) => (
                            <th key={h} className="text-left p-2 font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-t">
                            {Object.keys(columnMap).map((field) => (
                              <td key={field} className="p-2 whitespace-nowrap">{row[field] ?? "-"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {success !== null && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                <Check className="size-4 shrink-0" />
                Successfully imported {success} products
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}
      </CardContent>
      {file && !detecting && success === null && (
        <CardFooter>
          <Button onClick={handleImport} disabled={importing} className="w-full">
            {importing ? <Loader2 className="size-4 animate-spin mr-2" /> : <Upload className="size-4 mr-2" />}
            {importing ? "Importing..." : `Import ${preview ? `${file.name}` : ""}`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
