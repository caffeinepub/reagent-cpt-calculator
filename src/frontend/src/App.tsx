import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronRight,
  Download,
  FileText,
  FlaskConical,
  FolderOpen,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ReagentRow, Session } from "./backend";
import {
  useDeleteSession,
  useListSessions,
  useSaveSession,
} from "./hooks/useQueries";

// ── Types ──────────────────────────────────────────────────────────────────
interface ParsedRow {
  name: string;
  price: number;
  volume: number;
  testsPerMl: number;
  mlCost: number;
  cpt: number;
  mrp?: number;
}

const CONTACT_NUMBER = "9289920091";

// ── Built-in clinical reagents list ───────────────────────────────────────
const BUILTIN_REAGENTS: string[] = [
  "ADA- Adenosine Deaminase with calibrator",
  "Albumin",
  "Alkaline Phosphatase",
  "Alpha Amylase",
  "Ammonia",
  "ACE- Angiotensin Converting Enzyme",
  "Bicarbonate",
  "Bilirubin (T & D)",
  "Calcium",
  "Chloride",
  "Cholesterol",
  "Cholinesterase",
  "CK-MB",
  "CK-NAC",
  "Creatinine (kin.)",
  "Creatinine (Enzymatic)",
  "Creatinine (kin.) Single Reagent",
  "Direct HDL With Calibrators",
  "Direct LDL With Calibrators",
  "Fructosamine",
  "Gamma GT",
  "Glucose",
  "Haemo GB",
  "Homocysteine with calibrators",
  "Inorganic Phosphorus",
  "Iron",
  "Lactate",
  "LDH",
  "Lipase",
  "Magnesium",
  "Micro Protein",
  "Pyruvate",
  "SGOT",
  "SGPT",
  "Total Bile Acids",
  "Total Protein",
  "Triglycerides",
  "TIBC",
  "Urea (Kinetic)",
  "Uric Acid",
  "Alpha-1- Macroglobulin with Cal",
  "Anti CCP",
  "Apo A1- With Calibrator",
  "Apo B - With Calibrator",
  "Apo E - With Calibrator",
  "ASO - With Calibrator",
  "Beta-2-Microglobulin - With Cal",
  "C3 - With Calibrator",
  "C4 - With Calibrator",
  "CRP - With Calibrator",
  "Cystanin C - With Calibrator",
  "D-Dimer - With Calibrator",
  "Fertiitn Kit",
  "HbA1C(Direct) - Reagents",
  "HbA1C - Calibrator",
  "Hs-CRP - With Calibrator",
  "IgA - With Calibrator",
  "IgE - With Calibrator",
  "IgG- With Calibrator",
  "IgM - With Calibrator",
  "Lipoprotein (a) - With Calibrator",
  "Micro Albumin Urea with Calibrator",
  "Pre-Albumin - With Calibrator",
  "Procalcitonin - With Calibrator",
  "Retinol Binding Protein - With Cal",
  "RF - With Calibrator",
  "ASO(Slide)",
  "CRP (Slide)",
  "RF (Slide)",
  "RPR (Slide)",
  "CombiWidal - S",
  "CombiWidal - OH",
  "CLONE ANTI ABD (Blended)",
  "Multical",
  "Biochemistry QC (Norm & Path)",
  "Ammonia vials",
  "ALP Monovial",
  "Alpha Amylase Monovial",
  "Bicarbonate monovials",
  "Calcium Monovials",
  "Chloride Monovials",
  "Phosphorus Monovials",
  "Potassium Monovials",
  "Sodium Monovials",
];

const REAGENT_VOLUMES: Record<string, number> = {
  "ADA- Adenosine Deaminase with calibrator": 30,
  Albumin: 100,
  "Alkaline Phosphatase": 100,
  "Alpha Amylase": 20,
  Ammonia: 25,
  "ACE- Angiotensin Converting Enzyme": 20,
  Bicarbonate: 20,
  "Bilirubin (T & D)": 100,
  Calcium: 100,
  Chloride: 100,
  Cholesterol: 100,
  Cholinesterase: 100,
  "CK-MB": 20,
  "CK-NAC": 20,
  "Creatinine (kin.)": 100,
  "Creatinine (Enzymatic)": 100,
  "Creatinine (kin.) Single Reagent": 100,
  "Direct HDL With Calibrators": 40,
  "Direct LDL With Calibrators": 40,
  Fructosamine: 20,
  "Gamma GT": 100,
  Glucose: 500,
  "Haemo GB": 1000,
  "Homocysteine with calibrators": 30,
  "Inorganic Phosphorus": 100,
  Iron: 100,
  Lactate: 20,
  LDH: 50,
  Lipase: 24,
  Magnesium: 100,
  "Micro Protein": 100,
  Pyruvate: 50,
  SGOT: 100,
  SGPT: 100,
  "Total Bile Acids": 20,
  "Total Protein": 100,
  Triglycerides: 100,
  TIBC: 40,
  "Urea (Kinetic)": 100,
  "Uric Acid": 100,
  "Alpha-1- Macroglobulin with Cal": 40,
  "Anti CCP": 20,
  "Apo A1- With Calibrator": 40,
  "Apo B - With Calibrator": 40,
  "Apo E - With Calibrator": 40,
  "ASO - With Calibrator": 50,
  "Beta-2-Microglobulin - With Cal": 50,
  "C3 - With Calibrator": 40,
  "C4 - With Calibrator": 40,
  "CRP - With Calibrator": 50,
  "Cystanin C - With Calibrator": 50,
  "D-Dimer - With Calibrator": 40,
  "Fertiitn Kit": 40,
  "HbA1C(Direct) - Reagents": 40,
  "HbA1C - Calibrator": 4,
  "Hs-CRP - With Calibrator": 50,
  "IgA - With Calibrator": 40,
  "IgE - With Calibrator": 40,
  "IgG- With Calibrator": 40,
  "IgM - With Calibrator": 40,
  "Lipoprotein (a) - With Calibrator": 50,
  "Micro Albumin Urea with Calibrator": 50,
  "Pre-Albumin - With Calibrator": 40,
  "Procalcitonin - With Calibrator": 40,
  "Retinol Binding Protein - With Cal": 40,
  "RF - With Calibrator": 50,
  "ASO(Slide)": 100,
  "CRP (Slide)": 100,
  "RF (Slide)": 100,
  "RPR (Slide)": 50,
  "CombiWidal - S": 20,
  "CombiWidal - OH": 20,
  "CLONE ANTI ABD (Blended)": 30,
  Multical: 12,
  "Biochemistry QC (Norm & Path)": 10,
  "Ammonia vials": 10,
  "ALP Monovial": 25,
  "Alpha Amylase Monovial": 10,
  "Bicarbonate monovials": 10,
  "Calcium Monovials": 25,
  "Chloride Monovials": 25,
  "Phosphorus Monovials": 25,
  "Potassium Monovials": 25,
  "Sodium Monovials": 25,
};

// ── Export CSV ─────────────────────────────────────────────────────────────
function exportCSV(rows: ParsedRow[], showMrp = false) {
  const header = [
    "Reagent Name",
    ...(showMrp ? ["MRP (₹)"] : []),
    "Price (₹)",
    "Volume (ml)",
    "Tests/mL",
    "Total Tests",
    "ML Cost (₹)",
    "CPT (₹)",
  ].join(",");
  const body = rows
    .map((r) =>
      [
        `"${r.name.replace(/"/g, '""')}"`,
        ...(showMrp ? [r.mrp?.toFixed(4) ?? ""] : []),
        r.price.toFixed(4),
        r.volume.toFixed(4),
        r.testsPerMl,
        (r.volume * r.testsPerMl).toFixed(2),
        r.mlCost.toFixed(4),
        r.cpt.toFixed(4),
      ].join(","),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reagent-cpt.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Generate PDF Quotation via Print ───────────────────────────────────────
function generateQuotationPDF(
  selectedRows: ParsedRow[],
  customerName: string,
  labName: string,
  exclusiveGst: boolean,
  excludeTestsPerMl: boolean,
  excludeTotalTests: boolean,
  excludeMlCost: boolean,
  excludeMrp = false,
  excludeCpt = false,
  showMrpCol = false,
) {
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Build dynamic column headers
  const colHeaders = [
    `<th style="text-align:center;width:40px;">#</th>`,
    "<th>Reagent Name</th>",
    `<th style="text-align:right;">Volume</th>`,
    ...(showMrpCol && !excludeMrp
      ? [`<th style="text-align:right;">MRP (&#8377;)</th>`]
      : []),
    `<th style="text-align:right;">Offer Price (&#8377;)</th>`,
    ...(!excludeTestsPerMl
      ? [`<th style="text-align:right;">Tests/mL</th>`]
      : []),
    ...(!excludeTotalTests
      ? [`<th style="text-align:right;">Total Tests</th>`]
      : []),
    ...(!excludeMlCost
      ? [`<th style="text-align:right;">ML Cost (&#8377;)</th>`]
      : []),
    ...(!excludeCpt
      ? [`<th style="text-align:right;">CPT (&#8377;)</th>`]
      : []),
  ].join("");

  const itemsHTML = selectedRows
    .map(
      (row, i) => `
      <tr>
        <td style="padding:8px 10px;border:1px solid #ddd;text-align:center;">${i + 1}</td>
        <td style="padding:8px 10px;border:1px solid #ddd;">${row.name}</td>
        <td style="padding:8px 10px;border:1px solid #ddd;text-align:right;">${row.volume.toFixed(2)} ml</td>
        ${showMrpCol && !excludeMrp ? `<td style="padding:8px 10px;border:1px solid #ddd;text-align:right;">&#8377;${row.mrp != null ? row.mrp.toFixed(2) : "-"}</td>` : ""}
        <td style="padding:8px 10px;border:1px solid #ddd;text-align:right;">&#8377;${row.price.toFixed(2)}</td>
        ${!excludeTestsPerMl ? `<td style="padding:8px 10px;border:1px solid #ddd;text-align:right;">${row.testsPerMl}</td>` : ""}
        ${!excludeTotalTests ? `<td style="padding:8px 10px;border:1px solid #ddd;text-align:right;font-weight:600;">${(row.volume * row.testsPerMl).toFixed(2)}</td>` : ""}
        ${!excludeMlCost ? `<td style="padding:8px 10px;border:1px solid #ddd;text-align:right;">&#8377;${row.mlCost.toFixed(4)}</td>` : ""}
        ${!excludeCpt ? `<td style="padding:8px 10px;border:1px solid #ddd;text-align:right;font-weight:600;">&#8377;${row.cpt.toFixed(4)}</td>` : ""}
      </tr>`,
    )
    .join("");

  const hasAbbreviations = selectedRows.some(
    (row) => row.name.endsWith("(S)") || row.name.endsWith("(F)"),
  );
  const gstLine = exclusiveGst
    ? "<li><strong>GST:</strong> All items are exclusive of GST.</li>"
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Quotation</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 30px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; }
        th { background: #1a4f8a; color: white; padding: 9px 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
        th:not(:first-child) { text-align: right; }
        tr:nth-child(even) td { background: #f5f8ff; }
        .tc-section { margin-top: 24px; padding-top: 16px; border-top: 2px solid #1a4f8a; }
        .tc-section h3 { font-size: 14px; color: #1a4f8a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
        .tc-section ul { margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; }
        .footer { margin-top: 32px; font-size: 12px; color: #555; text-align: center; border-top: 1px solid #ddd; padding-top: 12px; }
        .divider { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header-row">
        <div>
          <div style="font-size:12px;color:#666;margin-top:2px;">Clinical Lab Cost Analysis</div>
        </div>
        <div style="text-align:right;">
          <div class="label">Date</div>
          <div class="value">${date}</div>
          <div class="label">Contact</div>
          <div class="value">${CONTACT_NUMBER}</div>
        </div>
      </div>

      <h1 style="color:#1a4f8a;">QUOTATION</h1>
      <hr class="divider" />

      <div style="display:flex;gap:40px;margin-bottom:16px;">
        <div>
          <div class="label">Customer Name</div>
          <div class="value">${customerName || "&#8212;"}</div>
        </div>
        <div>
          <div class="label">Lab / Organization Name</div>
          <div class="value">${labName || "&#8212;"}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            ${colHeaders}
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="tc-section">
        <h3>Terms &amp; Conditions</h3>
        <ul>
          <li><strong>Quotation Validity:</strong> 30 Days from the date of this quotation.</li>
          <li><strong>Payment:</strong> 50% advance along with the confirmed PO and 50% PDC cheque on Delivery.</li>
          <li><strong>Delivery:</strong> As per Ex-Stocks.</li>
          ${gstLine}
        </ul>
      </div>

      <div class="footer">
        For queries, contact: ${CONTACT_NUMBER} &nbsp;|&nbsp; Generated on ${date}
      </div>
      ${hasAbbreviations ? '<div style="margin-top:16px;font-size:11px;color:#555;border-top:1px solid #eee;padding-top:8px;"><strong>Abbreviations:</strong> (S) = Semi Assay &nbsp;|&nbsp; (F) = Fully Assay</div>' : ""}
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [exclusiveGst, setExclusiveGst] = useState(false);
  const [excludeTestsPerMl, setExcludeTestsPerMl] = useState(false);
  const [excludeTotalTests, setExcludeTotalTests] = useState(false);
  const [excludeMlCost, setExcludeMlCost] = useState(false);
  const [excludeMrp, setExcludeMrp] = useState(false);
  const [excludeCpt, setExcludeCpt] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [quotationOpen, setQuotationOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [labName, setLabName] = useState("");

  // Add reagent form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formVolume, setFormVolume] = useState("");
  const [formTestsPerMl, setFormTestsPerMl] = useState("");
  const [semiAssay, setSemiAssay] = useState(false);
  const [fullyAssay, setFullyAssay] = useState(false);
  const [showMrp, setShowMrp] = useState(false);
  const [formMrp, setFormMrp] = useState("");

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const autocompleteWrapperRef = useRef<HTMLDivElement>(null);

  const { data: sessions, isLoading: sessionsLoading } = useListSessions();
  const saveSession = useSaveSession();
  const deleteSession = useDeleteSession();

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        autocompleteWrapperRef.current &&
        !autocompleteWrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNameChange = (value: string) => {
    setFormName(value);
    if (!value.trim()) {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      return;
    }
    const lower = value.toLowerCase();
    const existingNames = rows.map((r) => r.name);
    const combined = Array.from(
      new Set([...BUILTIN_REAGENTS, ...existingNames]),
    );
    const matches = combined.filter((name) =>
      name.toLowerCase().includes(lower),
    );
    setFilteredSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSuggestionClick = (name: string) => {
    setFormName(name);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
    const vol = REAGENT_VOLUMES[name];
    if (vol !== undefined) {
      setFormVolume(String(vol));
    }
  };

  const handleAddReagent = () => {
    let name = formName.trim();
    const price = Number(formPrice);
    const volume = Number(formVolume);
    const testsPerMl = Number(formTestsPerMl);
    if (!name || price <= 0 || volume <= 0 || testsPerMl <= 0) return;
    if (semiAssay) name = `${name} (S)`;
    else if (fullyAssay) name = `${name} (F)`;
    const mlCost = volume > 0 ? price / volume : 0;
    const cpt = testsPerMl > 0 ? mlCost / testsPerMl : 0;
    const mrp = showMrp ? Number(formMrp) || undefined : undefined;
    setRows((prev) => [
      ...prev,
      { name, price, volume, testsPerMl, mlCost, cpt, mrp },
    ]);
    setFormName("");
    setFormPrice("");
    setFormVolume("");
    setFormTestsPerMl("");
    setFormMrp("");
    setShowSuggestions(false);
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
    setSelectedRows((prev) => {
      const next = new Set<number>();
      for (const idx of prev) {
        if (idx < index) next.add(idx);
        else if (idx > index) next.add(idx - 1);
      }
      return next;
    });
  };

  // ── Cell edit handler ────────────────────────────────────────────────────
  const handleCellChange = (
    index: number,
    field: "price" | "mlCost" | "volume" | "testsPerMl",
    value: string,
  ) => {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed) || parsed < 0) return;
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === "price") {
          const mlCost = row.volume > 0 ? parsed / row.volume : 0;
          const cpt = row.testsPerMl > 0 ? mlCost / row.testsPerMl : 0;
          return { ...row, price: parsed, mlCost, cpt };
        }
        if (field === "volume") {
          const price = parsed * row.mlCost;
          const cpt = row.testsPerMl > 0 ? row.mlCost / row.testsPerMl : 0;
          return { ...row, volume: parsed, price, cpt };
        }
        if (field === "testsPerMl") {
          const cpt = parsed > 0 ? row.mlCost / parsed : 0;
          return { ...row, testsPerMl: parsed, cpt };
        }
        // field === "mlCost"
        const price = parsed * row.volume;
        const cpt = row.testsPerMl > 0 ? parsed / row.testsPerMl : 0;
        return { ...row, mlCost: parsed, price, cpt };
      }),
    );
  };

  const handleSave = () => {
    if (!sessionName.trim()) return;
    const reagentRows: ReagentRow[] = rows.map((r) => ({
      name: r.name,
      price: r.price,
      volume: r.volume,
      mlCost: r.mlCost,
      cpt: r.cpt,
    }));
    saveSession.mutate(
      {
        id: "session-$Date.now()",
        name: sessionName.trim(),
        divisor: 1,
        reagents: reagentRows,
      },
      {
        onSuccess: () => {
          setSaveOpen(false);
          setSessionName("");
        },
      },
    );
  };

  const loadSessionData = (session: Session) => {
    setRows(
      session.reagents.map((r) => {
        const testsPerMl = (r as any).testsPerMl ?? 1;
        const mlCost = r.mlCost;
        const cpt = testsPerMl > 0 ? mlCost / testsPerMl : r.cpt;
        return {
          name: r.name,
          price: r.price,
          volume: r.volume,
          testsPerMl,
          mlCost,
          cpt,
        };
      }),
    );
    setSelectedRows(new Set());
  };

  const toggleRowSelection = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((_, i) => i)));
    }
  };

  const handleGenerateQuotation = () => {
    const chosen = rows.filter((_, i) => selectedRows.has(i));
    if (chosen.length === 0) return;
    generateQuotationPDF(
      chosen,
      customerName,
      labName,
      exclusiveGst,
      excludeTestsPerMl,
      excludeTotalTests,
      excludeMlCost,
      excludeMrp,
      excludeCpt,
      showMrp,
    );
    setQuotationOpen(false);
  };

  const canAdd =
    formName.trim() !== "" &&
    Number(formPrice) > 0 &&
    Number(formVolume) > 0 &&
    Number(formTestsPerMl) > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster theme="dark" />

      {/* Header */}
      <header className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/5" />
        <div className="scanlines relative">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/15 shadow-glow">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-700 text-foreground tracking-tight">
                  Reagent CPT Calculator
                </h1>
                <p className="text-xs text-muted-foreground font-mono">
                  Cost Per Test · Clinical Lab Tool
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-primary border-primary/30 font-mono text-xs"
            >
              v1.0
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* ── Add Reagent Form ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="bg-card rounded-lg border border-border p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span className="font-display text-sm font-600 text-foreground uppercase tracking-widest">
                Add Reagent
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-4 mb-1">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={semiAssay}
                      onChange={(e) => {
                        setSemiAssay(e.target.checked);
                        if (e.target.checked) {
                          setFullyAssay(false);
                          setFormTestsPerMl("2");
                        }
                      }}
                      className="accent-primary w-3.5 h-3.5"
                      data-ocid="reagent.semi_assay.checkbox"
                    />
                    Semi Assay
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={fullyAssay}
                      onChange={(e) => {
                        setFullyAssay(e.target.checked);
                        if (e.target.checked) {
                          setSemiAssay(false);
                          setFormTestsPerMl("4");
                        }
                      }}
                      className="accent-primary w-3.5 h-3.5"
                      data-ocid="reagent.fully_assay.checkbox"
                    />
                    Fully Assay
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={showMrp}
                      onChange={(e) => setShowMrp(e.target.checked)}
                      className="accent-primary w-3.5 h-3.5"
                      data-ocid="reagent.mrp.checkbox"
                    />
                    MRP
                  </label>
                </div>
                <Label
                  htmlFor="reagent-name"
                  className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
                >
                  Reagent Name
                </Label>
                {/* Autocomplete wrapper */}
                <div ref={autocompleteWrapperRef} className="relative">
                  <Input
                    id="reagent-name"
                    type="text"
                    placeholder="e.g. Glucose Oxidase"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onFocus={() => {
                      const existingNames = rows.map((r) => r.name);
                      const combined = Array.from(
                        new Set([...BUILTIN_REAGENTS, ...existingNames]),
                      );
                      const lower = formName.toLowerCase();
                      const matches = lower
                        ? combined.filter((n) =>
                            n.toLowerCase().includes(lower),
                          )
                        : combined;
                      setFilteredSuggestions(matches);
                      setShowSuggestions(matches.length > 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowSuggestions(false);
                      } else if (
                        e.key === "Enter" &&
                        canAdd &&
                        !showSuggestions
                      ) {
                        handleAddReagent();
                      }
                    }}
                    className="bg-background border-border focus:ring-primary font-mono text-sm"
                    data-ocid="reagent.input"
                    autoComplete="off"
                  />
                  {/* Suggestions dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          onMouseDown={(e) => {
                            // Use mousedown so blur doesn't fire first
                            e.preventDefault();
                            handleSuggestionClick(suggestion);
                          }}
                          className="px-3 py-2 text-sm font-mono cursor-pointer hover:bg-secondary/60 text-foreground"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div
                className={`grid gap-2 ${showMrp ? "grid-cols-4" : "grid-cols-3"}`}
              >
                {showMrp && (
                  <div className="space-y-1">
                    <Label
                      htmlFor="reagent-mrp"
                      className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
                    >
                      MRP (₹)
                    </Label>
                    <Input
                      id="reagent-mrp"
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0.00"
                      value={formMrp}
                      onChange={(e) => setFormMrp(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && canAdd && handleAddReagent()
                      }
                      className="bg-background border-border focus:ring-primary font-mono text-sm"
                      data-ocid="reagent.input"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label
                    htmlFor="reagent-price"
                    className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
                  >
                    Offer Price (₹)
                  </Label>
                  <Input
                    id="reagent-price"
                    type="number"
                    min={0.0001}
                    step="any"
                    placeholder="120.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && canAdd && handleAddReagent()
                    }
                    className="bg-background border-border focus:ring-primary font-mono text-sm"
                    data-ocid="reagent.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="reagent-volume"
                    className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
                  >
                    Volume (ml)
                  </Label>
                  <Input
                    id="reagent-volume"
                    type="number"
                    min={0.0001}
                    step="any"
                    placeholder="50"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && canAdd && handleAddReagent()
                    }
                    className="bg-background border-border focus:ring-primary font-mono text-sm"
                    data-ocid="reagent.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="reagent-tests-per-ml"
                    className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
                  >
                    Tests/mL
                  </Label>
                  <Input
                    id="reagent-tests-per-ml"
                    type="number"
                    min={0.0001}
                    step="any"
                    placeholder="e.g. 2"
                    value={formTestsPerMl}
                    onChange={(e) => setFormTestsPerMl(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && canAdd && handleAddReagent()
                    }
                    className="bg-background border-border focus:ring-primary font-mono text-sm"
                    data-ocid="reagent.input"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddReagent}
              disabled={!canAdd}
              className="w-full gap-1.5 text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
              data-ocid="reagent.primary_button"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Reagent
            </Button>
          </div>
        </motion.section>

        {/* ── Results Table ── */}
        <AnimatePresence mode="wait">
          {rows.length > 0 && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span className="font-display text-sm font-600 uppercase tracking-widest text-foreground">
                    Results
                  </span>
                  <Badge className="bg-primary/20 text-primary border-none font-mono text-xs">
                    {rows.length} reagents
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportCSV(rows, showMrp)}
                    className="gap-1.5 text-xs font-mono border-border hover:border-primary/50 hover:text-primary"
                    data-ocid="results.secondary_button"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </Button>

                  {/* Generate Quotation */}
                  <Dialog open={quotationOpen} onOpenChange={setQuotationOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={selectedRows.size === 0}
                        className="gap-1.5 text-xs font-mono border-accent/50 text-accent hover:bg-accent/10 hover:border-accent"
                        data-ocid="results.open_modal_button"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Generate Quotation
                        {selectedRows.size > 0 && (
                          <Badge className="ml-1 bg-accent/20 text-accent border-none font-mono text-xs px-1.5 py-0">
                            {selectedRows.size}
                          </Badge>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="bg-card border-border"
                      data-ocid="quotation.dialog"
                    >
                      <DialogHeader>
                        <DialogTitle className="font-display">
                          Generate Quotation
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                          Enter customer details. The quotation PDF will open in
                          a new window for printing or saving.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-2">
                        <div className="space-y-1">
                          <Label
                            htmlFor="customer-name"
                            className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                          >
                            Customer Name
                          </Label>
                          <Input
                            id="customer-name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Dr. Sharma"
                            className="bg-background border-border focus:ring-primary font-mono"
                            data-ocid="quotation.input"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor="lab-name"
                            className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                          >
                            Lab / Organization Name
                          </Label>
                          <Input
                            id="lab-name"
                            value={labName}
                            onChange={(e) => setLabName(e.target.value)}
                            placeholder="e.g. City Diagnostics"
                            className="bg-background border-border focus:ring-primary font-mono"
                            data-ocid="quotation.input"
                          />
                        </div>
                        <div className="rounded-md bg-secondary/40 border border-border p-3 text-xs font-mono text-muted-foreground space-y-1">
                          <p className="font-600 text-foreground text-[11px] uppercase tracking-wider mb-2">
                            Selected Items ({selectedRows.size})
                          </p>
                          {rows
                            .filter((_, i) => selectedRows.has(i))
                            .map((r, i) => (
                              <p key={r.name + String(i)}>
                                {i + 1}. {r.name} — CPT: ₹{r.cpt.toFixed(4)}
                              </p>
                            ))}
                        </div>
                        {exclusiveGst && (
                          <p className="text-xs font-mono text-amber-500/80 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2">
                            GST note will be included: &quot;All items are
                            exclusive of GST.&quot;
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setQuotationOpen(false)}
                          className="font-mono text-xs"
                          data-ocid="quotation.cancel_button"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleGenerateQuotation}
                          className="font-mono text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                          data-ocid="quotation.confirm_button"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Generate PDF
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                        data-ocid="results.open_modal_button"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="bg-card border-border"
                      data-ocid="session.dialog"
                    >
                      <DialogHeader>
                        <DialogTitle className="font-display">
                          Save Session
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                          Save these results with a name to revisit later.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 py-2">
                        <Label
                          htmlFor="session-name"
                          className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                        >
                          Session Name
                        </Label>
                        <Input
                          id="session-name"
                          value={sessionName}
                          onChange={(e) => setSessionName(e.target.value)}
                          placeholder="e.g. Q4 Panel Review"
                          className="bg-background border-border focus:ring-primary font-mono"
                          onKeyDown={(e) => e.key === "Enter" && handleSave()}
                          data-ocid="session.input"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSaveOpen(false)}
                          className="font-mono text-xs"
                          data-ocid="session.cancel_button"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={
                            !sessionName.trim() || saveSession.isPending
                          }
                          className="font-mono text-xs bg-primary text-primary-foreground"
                          data-ocid="session.confirm_button"
                        >
                          {saveSession.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : null}
                          {saveSession.isPending ? "Saving..." : "Save"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Select all hint */}
              <p className="text-xs text-muted-foreground font-mono">
                Check rows to include in quotation. &nbsp;
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                  data-ocid="results.toggle"
                >
                  {selectedRows.size === rows.length
                    ? "Deselect all"
                    : "Select all"}
                </button>
              </p>

              {/* Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table className="lab-table" data-ocid="results.table">
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="w-8">
                        <Checkbox
                          checked={
                            rows.length > 0 && selectedRows.size === rows.length
                          }
                          onCheckedChange={toggleSelectAll}
                          data-ocid="results.checkbox"
                        />
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider w-8">
                        #
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                        Reagent Name
                      </TableHead>
                      {showMrp && (
                        <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider text-right">
                          MRP (₹) <span className="text-primary/60">✎</span>
                        </TableHead>
                      )}
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider text-right">
                        Offer Price (₹){" "}
                        <span className="text-primary/60">✎</span>
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider text-right">
                        Volume (ml) <span className="text-primary/60">✎</span>
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider text-right">
                        Tests/mL <span className="text-primary/60">✎</span>
                      </TableHead>
                      <TableHead className="font-mono text-xs text-primary/80 uppercase tracking-wider text-right">
                        Total Tests
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider text-right">
                        ML Cost (₹) <span className="text-primary/60">✎</span>
                      </TableHead>
                      <TableHead className="w-10" />
                      <TableHead className="font-mono text-xs text-accent uppercase tracking-wider text-right">
                        CPT (₹)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow
                        key={"$row.name-$i"}
                        className={`hover:bg-secondary/30 transition-colors $
                          selectedRows.has(i) ? "bg-accent/5" : ""`}
                        data-ocid={"results.row.$i + 1"}
                      >
                        <TableCell className="p-2">
                          <Checkbox
                            checked={selectedRows.has(i)}
                            onCheckedChange={() => toggleRowSelection(i)}
                            data-ocid={"results.checkbox.$i + 1"}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-sans text-sm text-foreground">
                          {row.name}
                        </TableCell>
                        {/* MRP */}
                        {showMrp && (
                          <TableCell className="p-1">
                            <div className="relative flex items-center justify-end">
                              <span className="absolute left-2 text-xs text-muted-foreground pointer-events-none select-none">
                                ₹
                              </span>
                              <Input
                                type="number"
                                step="any"
                                min={0}
                                value={row.mrp ?? ""}
                                onChange={(e) =>
                                  setRows((prev) =>
                                    prev.map((r, idx) =>
                                      idx === i
                                        ? {
                                            ...r,
                                            mrp:
                                              e.target.value === ""
                                                ? undefined
                                                : Number(e.target.value),
                                          }
                                        : r,
                                    ),
                                  )
                                }
                                className="pl-5 pr-2 py-1 h-7 w-28 text-right font-mono text-sm tabular-nums bg-transparent border-transparent focus:border-border focus:bg-background transition-colors"
                                data-ocid="results.input"
                              />
                            </div>
                          </TableCell>
                        )}
                        {/* Offer Price */}
                        <TableCell className="p-1">
                          <div className="relative flex items-center justify-end">
                            <span className="absolute left-2 text-xs text-muted-foreground pointer-events-none select-none">
                              ₹
                            </span>
                            <Input
                              type="number"
                              step="any"
                              min={0}
                              value={row.price}
                              onChange={(e) =>
                                handleCellChange(i, "price", e.target.value)
                              }
                              className="pl-5 pr-2 py-1 h-7 w-28 text-right font-mono text-sm tabular-nums bg-transparent border-transparent focus:border-border focus:bg-background transition-colors"
                              data-ocid="results.input"
                            />
                          </div>
                        </TableCell>
                        {/* Volume */}
                        <TableCell className="p-1">
                          <Input
                            type="number"
                            step="any"
                            min={0}
                            value={row.volume}
                            onChange={(e) =>
                              handleCellChange(i, "volume", e.target.value)
                            }
                            className="pr-2 py-1 h-7 w-24 text-right font-mono text-sm tabular-nums bg-transparent border-transparent focus:border-border focus:bg-background transition-colors"
                            data-ocid="results.input"
                          />
                        </TableCell>
                        {/* Tests/mL */}
                        <TableCell className="p-1">
                          <Input
                            type="number"
                            step="any"
                            min={0}
                            value={row.testsPerMl}
                            onChange={(e) =>
                              handleCellChange(i, "testsPerMl", e.target.value)
                            }
                            className="pr-2 py-1 h-7 w-20 text-right font-mono text-sm tabular-nums bg-transparent border-transparent focus:border-border focus:bg-background transition-colors"
                            data-ocid="results.input"
                          />
                        </TableCell>
                        {/* Total Tests */}
                        <TableCell className="text-right font-mono text-sm tabular-nums font-600 text-primary/90 pr-4">
                          {(row.volume * row.testsPerMl).toFixed(2)}
                        </TableCell>
                        {/* ML Cost */}
                        <TableCell className="p-1">
                          <div className="relative flex items-center justify-end">
                            <span className="absolute left-2 text-xs text-muted-foreground pointer-events-none select-none">
                              ₹
                            </span>
                            <Input
                              type="number"
                              step="any"
                              min={0}
                              value={row.mlCost}
                              onChange={(e) =>
                                handleCellChange(i, "mlCost", e.target.value)
                              }
                              className="pl-5 pr-2 py-1 h-7 w-28 text-right font-mono text-sm tabular-nums bg-transparent border-transparent focus:border-border focus:bg-background transition-colors text-muted-foreground"
                              data-ocid="results.input"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteRow(i)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            data-ocid={"results.delete_button.$i + 1"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right tabular-nums font-600">
                          <span className="text-accent">
                            ₹{row.cpt.toFixed(4)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* GST & Quotation Exclusion Checkboxes */}
              <div className="space-y-2 pt-2 pb-1">
                {/* Exclusive GST */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="exclusive-gst"
                    checked={exclusiveGst}
                    onCheckedChange={(v) => setExclusiveGst(!!v)}
                    data-ocid="gst.checkbox"
                  />
                  <Label
                    htmlFor="exclusive-gst"
                    className="text-sm font-mono cursor-pointer select-none"
                  >
                    Exclusive GST
                  </Label>
                  {exclusiveGst && (
                    <span className="text-xs text-amber-500/80 font-mono bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5">
                      All items are exclusive of GST
                    </span>
                  )}
                </div>

                {/* Quotation column exclusions */}
                <div className="pl-1 pt-1 space-y-1">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1.5">
                    Exclude from quotation PDF:
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="exclude-tests-per-ml"
                        checked={excludeTestsPerMl}
                        onCheckedChange={(v) => setExcludeTestsPerMl(!!v)}
                        data-ocid="exclude.testsperml.checkbox"
                      />
                      <Label
                        htmlFor="exclude-tests-per-ml"
                        className="text-sm font-mono cursor-pointer select-none"
                      >
                        Tests/mL
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="exclude-total-tests"
                        checked={excludeTotalTests}
                        onCheckedChange={(v) => setExcludeTotalTests(!!v)}
                        data-ocid="exclude.totaltests.checkbox"
                      />
                      <Label
                        htmlFor="exclude-total-tests"
                        className="text-sm font-mono cursor-pointer select-none"
                      >
                        Total Tests
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="exclude-ml-cost"
                        checked={excludeMlCost}
                        onCheckedChange={(v) => setExcludeMlCost(!!v)}
                        data-ocid="exclude.mlcost.checkbox"
                      />
                      <Label
                        htmlFor="exclude-ml-cost"
                        className="text-sm font-mono cursor-pointer select-none"
                      >
                        ML Cost
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="exclude-mrp"
                        checked={excludeMrp}
                        onCheckedChange={(v) => setExcludeMrp(!!v)}
                        data-ocid="exclude.mrp.checkbox"
                      />
                      <Label
                        htmlFor="exclude-mrp"
                        className="text-sm font-mono cursor-pointer select-none"
                      >
                        MRP
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="exclude-cpt"
                        checked={excludeCpt}
                        onCheckedChange={(v) => setExcludeCpt(!!v)}
                        data-ocid="exclude.cpt.checkbox"
                      />
                      <Label
                        htmlFor="exclude-cpt"
                        className="text-sm font-mono cursor-pointer select-none"
                      >
                        CPT
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Saved Sessions ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-4"
        >
          <Separator className="bg-border" />
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-600 uppercase tracking-widest text-foreground">
              Saved Sessions
            </span>
          </div>

          {sessionsLoading && (
            <div
              className="flex items-center gap-2 text-muted-foreground"
              data-ocid="sessions.loading_state"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-mono">Loading sessions…</span>
            </div>
          )}

          {!sessionsLoading && (!sessions || sessions.length === 0) && (
            <div
              className="rounded-lg border border-dashed border-border p-8 text-center"
              data-ocid="sessions.empty_state"
            >
              <FlaskConical className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-mono">
                No saved sessions yet.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Save your first calculation above.
              </p>
            </div>
          )}

          {sessions && sessions.length > 0 && (
            <div className="space-y-2" data-ocid="sessions.list">
              {sessions.map(([id, session], i) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:border-primary/40 transition-colors group"
                  data-ocid={"sessions.item.$i + 1"}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans text-foreground truncate">
                      {session.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {session.reagents.length} reagents
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadSessionData(session)}
                      className="text-xs font-mono border-border hover:border-primary/50 hover:text-primary gap-1"
                      data-ocid="sessions.edit_button"
                    >
                      <FolderOpen className="h-3 w-3" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSession.mutate(id)}
                      disabled={deleteSession.isPending}
                      className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
                      data-ocid="sessions.delete_button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-primary">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              data-ocid="footer.link"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
