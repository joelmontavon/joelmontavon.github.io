import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Calculator,
  RefreshCw,
  Database,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui";
import { usePdcStore } from "@/stores/pdcStore";
import { formatDate } from "@/lib/dates";

/**
 * Accordion section component
 */
function AccordionSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer select-none flex flex-row items-center justify-between py-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-lg flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </CardHeader>
      {isOpen && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

/**
 * Drug select component
 */
function DrugSelect({ value, onChange, drugs }) {
  const groupedDrugs = drugs.reduce((acc, drug) => {
    if (!acc[drug.measure]) {
      acc[drug.measure] = [];
    }
    acc[drug.measure].push(drug);
    return acc;
  }, {});

  return (
    <Select value={value?.id || ""} onValueChange={(val) => {
      const selectedDrug = drugs.find((d) => d.id === val);
      onChange(selectedDrug);
    }}>
      <SelectTrigger>
        <SelectValue placeholder="Select a drug..." />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedDrugs).map(([measure, measureDrugs]) => (
          <SelectGroup key={measure}>
            <SelectLabel>{measure}</SelectLabel>
            {measureDrugs.map((drug) => (
              <SelectItem key={drug.id} value={drug.id}>
                {drug.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Claim row component
 */
function ClaimRow({ claim, index, onUpdate, onRemove, drugs }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/30 rounded-lg mb-2">
      <div className="col-span-12 md:col-span-5">
        <Label className="text-xs text-muted-foreground">Drug</Label>
        <DrugSelect
          value={claim.drug}
          onChange={(drug) => onUpdate(claim.id, "drug", drug)}
          drugs={drugs}
        />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label className="text-xs text-muted-foreground">Date of Fill</Label>
        <Input
          type="date"
          value={claim.dateOfFill}
          onChange={(e) => onUpdate(claim.id, "dateOfFill", e.target.value)}
        />
      </div>
      <div className="col-span-4 md:col-span-2">
        <Label className="text-xs text-muted-foreground">Days Supply</Label>
        <Input
          type="number"
          min="1"
          max="365"
          value={claim.daysSupply}
          onChange={(e) =>
            onUpdate(claim.id, "daysSupply", parseInt(e.target.value) || 0)
          }
        />
      </div>
      <div className="col-span-2 md:col-span-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(claim.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Eligibility period row component
 */
function EligRow({ period, onUpdate, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/30 rounded-lg mb-2">
      <div className="col-span-5">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input
          type="date"
          value={period.from}
          onChange={(e) => onUpdate(period.id, "from", e.target.value)}
        />
      </div>
      <div className="col-span-5">
        <Label className="text-xs text-muted-foreground">Thru</Label>
        <Input
          type="date"
          value={period.thru}
          onChange={(e) => onUpdate(period.id, "thru", e.target.value)}
        />
      </div>
      <div className="col-span-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(period.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Results display component
 */
function ResultsDisplay({ results }) {
  if (!results) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Add claims and click Calculate to see PDC results</p>
      </div>
    );
  }

  const { pdc, daysCovered, daysInPeriod, isAdherent, totalClaims, profile } = results;
  const pdcPercentage = (pdc * 100).toFixed(1);

  // Determine progress bar color based on PDC
  const getProgressColor = (pdcValue) => {
    if (pdcValue >= 0.8) return "bg-green-500";
    if (pdcValue >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* PDC Score Card */}
      <div className="text-center p-6 bg-muted/30 rounded-lg">
        <div className="text-5xl font-bold mb-2">{pdcPercentage}%</div>
        <div className="text-lg text-muted-foreground mb-4">Proportion of Days Covered</div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(pdc)}`}
            style={{ width: `${Math.min(pdc * 100, 100)}%` }}
          />
        </div>

        {/* Adherence threshold marker */}
        <div className="relative h-2">
          <div
            className="absolute top-0 h-full border-l-2 border-dashed border-green-600"
            style={{ left: "80%" }}
          />
          <span
            className="absolute text-xs text-green-600 font-medium"
            style={{ left: "80%", transform: "translateX(-50%)", top: "8px" }}
          >
            80% threshold
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        {isAdherent ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Adherent</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Non-Adherent</span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-card border rounded-lg">
          <div className="text-2xl font-bold">{daysCovered}</div>
          <div className="text-sm text-muted-foreground">Days Covered</div>
        </div>
        <div className="text-center p-4 bg-card border rounded-lg">
          <div className="text-2xl font-bold">{daysInPeriod}</div>
          <div className="text-sm text-muted-foreground">Days in Period</div>
        </div>
        <div className="text-center p-4 bg-card border rounded-lg">
          <div className="text-2xl font-bold">{totalClaims}</div>
          <div className="text-sm text-muted-foreground">Total Claims</div>
        </div>
        <div className="text-center p-4 bg-card border rounded-lg">
          <div className="text-lg font-bold">{profile || "N/A"}</div>
          <div className="text-sm text-muted-foreground">Pattern</div>
        </div>
      </div>

      {/* Claims Summary */}
      {results.claims && results.claims.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Drug</th>
                <th className="text-left p-3">Fill Date</th>
                <th className="text-left p-3">Adj Fill Date</th>
                <th className="text-left p-3">Last Dose</th>
                <th className="text-right p-3">Days Supply</th>
              </tr>
            </thead>
            <tbody>
              {results.claims.map((claim, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{claim.drug?.label || claim.drug?.id || "Unknown"}</td>
                  <td className="p-3">{formatDate(claim.dateOfFill, "MMM d, yyyy")}</td>
                  <td className="p-3">
                    {claim.dateOfFillAdj
                      ? formatDate(claim.dateOfFillAdj, "MMM d, yyyy")
                      : "-"}
                  </td>
                  <td className="p-3">
                    {claim.dateOfLastDose
                      ? formatDate(claim.dateOfLastDose, "MMM d, yyyy")
                      : "-"}
                  </td>
                  <td className="p-3 text-right">{claim.daysSupply}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Main PDC Calculator component
 */
export function PDC() {
  const {
    measurementPeriod,
    selectedMeasures,
    claims,
    eligPeriods,
    drugDatabase,
    results,
    isLoading,
    isCalculating,
    error,
    setMeasurementPeriod,
    setSelectedMeasures,
    addClaim,
    removeClaim,
    updateClaim,
    clearClaims,
    addEligPeriod,
    removeEligPeriod,
    updateEligPeriod,
    clearEligPeriods,
    setDrugDatabase,
    getAvailableMeasures,
    getFilteredDrugs,
    calculate,
    reset,
    loadSampleData,
  } = usePdcStore();

  // Load drug database on mount
  useEffect(() => {
    const loadDrugs = async () => {
      try {
        const response = await fetch("/data/pdcDrugs.json");
        const drugs = await response.json();
        setDrugDatabase(drugs);
      } catch (err) {
        console.error("Failed to load drug database:", err);
      }
    };

    loadDrugs();
  }, [setDrugDatabase]);

  const availableMeasures = getAvailableMeasures();
  const filteredDrugs = getFilteredDrugs();

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PDC Calculator</h1>
        <p className="text-muted-foreground">
          Calculate Proportion of Days Covered for medication adherence analysis.
          PDC &gt;= 80% indicates adherence.
        </p>
      </div>

      {/* Options Section */}
      <AccordionSection title="Options" icon={Database} defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Measurement Period Start</Label>
            <Input
              type="date"
              value={measurementPeriod.from}
              onChange={(e) =>
                setMeasurementPeriod(e.target.value, measurementPeriod.thru)
              }
            />
          </div>
          <div>
            <Label>Measurement Period End</Label>
            <Input
              type="date"
              value={measurementPeriod.thru}
              onChange={(e) =>
                setMeasurementPeriod(measurementPeriod.from, e.target.value)
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Filter by Drug Class (Optional)</Label>
          <Select
            value={selectedMeasures[0] || ""}
            onValueChange={(value) =>
              setSelectedMeasures(value ? [value] : [])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All drug classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All drug classes</SelectItem>
              {availableMeasures.map((measure) => (
                <SelectItem key={measure} value={measure}>
                  {measure}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={loadSampleData}>
            <Database className="h-4 w-4 mr-2" />
            Load Sample Data
          </Button>
        </div>
      </AccordionSection>

      {/* Eligibility Section (Optional) */}
      <AccordionSection title="Eligibility (Optional)">
        {eligPeriods.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              No eligibility periods defined. Add periods to track member eligibility.
            </p>
            <Button variant="outline" onClick={addEligPeriod}>
              <Plus className="h-4 w-4 mr-2" />
              Add Eligibility Period
            </Button>
          </div>
        ) : (
          <>
            {eligPeriods.map((period, index) => (
              <EligRow
                key={period.id}
                period={period}
                index={index}
                onUpdate={updateEligPeriod}
                onRemove={removeEligPeriod}
              />
            ))}
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={addEligPeriod}>
                <Plus className="h-4 w-4 mr-2" />
                Add Period
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearEligPeriods}
                className="text-destructive"
              >
                Clear All
              </Button>
            </div>
          </>
        )}
      </AccordionSection>

      {/* Claims Section */}
      <AccordionSection title="Claims" icon={Calculator} defaultOpen={true}>
        {claims.map((claim, index) => (
          <ClaimRow
            key={claim.id}
            claim={claim}
            index={index}
            onUpdate={updateClaim}
            onRemove={removeClaim}
            drugs={filteredDrugs}
          />
        ))}

        <div className="flex gap-2 mt-4">
          <Button onClick={addClaim}>
            <Plus className="h-4 w-4 mr-2" />
            Add Claim
          </Button>
          <Button
            variant="ghost"
            onClick={clearClaims}
            className="text-destructive"
          >
            Clear All
          </Button>
        </div>
      </AccordionSection>

      {/* Calculate Button */}
      <div className="flex justify-center my-6">
        <Button
          size="lg"
          onClick={calculate}
          disabled={isCalculating || claims.length === 0}
        >
          {isCalculating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate PDC
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-4 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      <AccordionSection title="Results" icon={Calculator} defaultOpen={true}>
        <ResultsDisplay results={results} />
      </AccordionSection>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <h4 className="font-medium mb-2">About PDC</h4>
        <p>
          Proportion of Days Covered (PDC) is a measure of medication adherence.
          It calculates the percentage of days a patient has medication available
          during a measurement period. A PDC of 80% or higher is generally
          considered adherent.
        </p>
        <p className="mt-2">
          <strong>Formula:</strong> PDC = Days Covered / Days in Measurement Period
        </p>
      </div>
    </div>
  );
}

export default PDC;
