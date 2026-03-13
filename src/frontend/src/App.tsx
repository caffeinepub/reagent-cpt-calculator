import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FlaskConical,
  FolderOpen,
  Loader2,
  Plus,
  Save,
  TestTubes,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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
  mlCost: number;
  cpt: number;
}

// ── Sample Data ────────────────────────────────────────────────────────────
const SAMPLE_DATA = [
  { name: "Reagent A — Glucose Oxidase", price: 120.0, volume: 50 },
  { name: "Reagent B — Hemoglobin A1c", price: 85.5, volume: 30 },
  { name: "Reagent C — Cholesterol Total", price: 200.0, volume: 100 },
  { name: "Reagent D — Troponin I", price: 45.0, volume: 20 },
  { name: "Reagent E — C-Reactive Protein", price: 310.0, volume: 60 },
  { name: "Reagent F — Thyroid TSH", price: 175.0, volume: 75 },
];

const STAT_KEYS = ["min", "avg", "max"] as const;

function computeRows(
  rows: { name: string; price: number; volume: number }[],
  divisor: number,
): ParsedRow[] {
  return rows.map((r) => {
    const mlCost = r.volume > 0 ? r.price / r.volume : 0;
    const cpt = divisor > 0 ? mlCost / divisor : 0;
    return { ...r, mlCost, cpt };
  });
}

// ── Export CSV ─────────────────────────────────────────────────────────────
function exportCSV(rows: ParsedRow[], divisor: number) {
  const header = [
    "Reagent Name",
    "Price (₹)",
    "Volume (ml)",
    "ML Cost (₹)",
    `CPT (÷${divisor})`,
  ].join(",");
  const body = rows
    .map((r) =>
      [
        `"${r.name.replace(/"/g, '""')}"`,
        r.price.toFixed(4),
        r.volume.toFixed(4),
        r.mlCost.toFixed(4),
        r.cpt.toFixed(4),
      ].join(","),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reagent-cpt-divisor${divisor}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [divisor, setDivisor] = useState(2);
  const [rows, setRows] = useState<ParsedRow[]>(() =>
    computeRows(SAMPLE_DATA, 2),
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");

  // Add reagent form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formVolume, setFormVolume] = useState("");

  const { data: sessions, isLoading: sessionsLoading } = useListSessions();
  const saveSession = useSaveSession();
  const deleteSession = useDeleteSession();

  // Recompute CPT when divisor changes
  const handleDivisorChange = (val: number) => {
    setDivisor(val);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        cpt: val > 0 ? r.mlCost / val : 0,
      })),
    );
  };

  const handleAddReagent = () => {
    const name = formName.trim();
    const price = Number(formPrice);
    const volume = Number(formVolume);
    if (!name || price <= 0 || volume <= 0) return;
    const mlCost = volume > 0 ? price / volume : 0;
    const cpt = divisor > 0 ? mlCost / divisor : 0;
    setRows((prev) => [...prev, { name, price, volume, mlCost, cpt }]);
    setFormName("");
    setFormPrice("");
    setFormVolume("");
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const loadSample = () => {
    setRows(computeRows(SAMPLE_DATA, divisor));
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
        id: `session-${Date.now()}`,
        name: sessionName.trim(),
        divisor,
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
    setDivisor(session.divisor);
    setRows(
      session.reagents.map((r) => ({
        name: r.name,
        price: r.price,
        volume: r.volume,
        mlCost: r.mlCost,
        cpt: r.cpt,
      })),
    );
  };

  // Summary stats
  const cptValues = rows.map((r) => r.cpt);
  const minCPT = cptValues.length ? Math.min(...cptValues) : 0;
  const maxCPT = cptValues.length ? Math.max(...cptValues) : 0;
  const avgCPT = cptValues.length
    ? cptValues.reduce((a, b) => a + b, 0) / cptValues.length
    : 0;

  const stats = [
    {
      key: STAT_KEYS[0],
      label: "Min CPT",
      value: minCPT,
      hint: "Lowest cost per test",
    },
    {
      key: STAT_KEYS[1],
      label: "Avg CPT",
      value: avgCPT,
      hint: "Mean cost per test",
    },
    {
      key: STAT_KEYS[2],
      label: "Max CPT",
      value: maxCPT,
      hint: "Highest cost per test",
    },
  ];

  const canAdd =
    formName.trim() !== "" && Number(formPrice) > 0 && Number(formVolume) > 0;

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
        {/* ── Controls Row ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Divisor */}
          <div className="bg-card rounded-lg border border-border p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <TestTubes className="h-4 w-4 text-primary" />
              <span className="font-display text-sm font-600 text-foreground uppercase tracking-widest">
                Calculation Settings
              </span>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="divisor"
                className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
              >
                Divisor (tests per mL)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="divisor"
                  type="number"
                  min={0.0001}
                  step={1}
                  value={divisor}
                  onChange={(e) =>
                    handleDivisorChange(Number(e.target.value) || 1)
                  }
                  className="font-mono text-lg w-28 bg-background border-border focus:ring-primary"
                  data-ocid="calc.input"
                />
                <div className="flex gap-1">
                  {[2, 4, 5, 10].map((v) => (
                    <Button
                      key={v}
                      size="sm"
                      variant={divisor === v ? "default" : "outline"}
                      onClick={() => handleDivisorChange(v)}
                      className="font-mono w-10 text-xs"
                      data-ocid="calc.toggle"
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                CPT = (Price ÷ Volume) ÷ Divisor
              </p>
            </div>
          </div>

          {/* Add Reagent Form */}
          <div className="bg-card rounded-lg border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <span className="font-display text-sm font-600 text-foreground uppercase tracking-widest">
                  Add Reagent
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSample}
                className="text-xs border-border hover:border-primary/50 hover:text-primary font-mono"
                data-ocid="calc.secondary_button"
              >
                Load Sample Data
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="reagent-name"
                  className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
                >
                  Reagent Name
                </Label>
                <Input
                  id="reagent-name"
                  type="text"
                  placeholder="e.g. Glucose Oxidase"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && canAdd && handleAddReagent()
                  }
                  className="bg-background border-border focus:ring-primary font-mono text-sm"
                  data-ocid="reagent.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label
                    htmlFor="reagent-price"
                    className="text-muted-foreground text-xs font-mono uppercase tracking-wider"
                  >
                    Price (₹)
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportCSV(rows, divisor)}
                    className="gap-1.5 text-xs font-mono border-border hover:border-primary/50 hover:text-primary"
                    data-ocid="results.secondary_button"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </Button>

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

              {/* Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table className="lab-table" data-ocid="results.table">
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider w-8">
                        #
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                        Reagent Name
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider text-right">
                        Price (₹)
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider text-right">
                        Volume (ml)
                      </TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-wider text-right">
                        ML Cost (₹)
                      </TableHead>
                      <TableHead className="font-mono text-xs text-accent uppercase tracking-wider text-right">
                        CPT ÷{divisor}
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow
                        key={`${row.name}-${i}`}
                        className="hover:bg-secondary/30 transition-colors"
                        data-ocid="results.row"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-sans text-sm text-foreground">
                          {row.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right tabular-nums">
                          ₹{row.price.toFixed(4)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right tabular-nums">
                          {row.volume.toFixed(4)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right tabular-nums text-muted-foreground">
                          ₹{row.mlCost.toFixed(4)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right tabular-nums font-600">
                          <span className="text-accent">
                            ₹{row.cpt.toFixed(4)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteRow(i)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            data-ocid="results.delete_button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.key}
                    className="bg-card border border-border rounded-lg p-4 space-y-0.5"
                    data-ocid="results.card"
                  >
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="font-mono text-xl font-700 text-accent tabular-nums">
                      ₹{stat.value.toFixed(4)}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.hint}</p>
                  </div>
                ))}
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
                  data-ocid={`sessions.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans text-foreground truncate">
                      {session.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {session.reagents.length} reagents · divisor{" "}
                      {session.divisor}
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
