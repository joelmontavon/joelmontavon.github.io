import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, Plus, Trash2, AlertTriangle, AlertCircle, CheckCircle, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMedStore } from "@/stores/medStore";
import { COMMON_OPIOIDS, OPIOIDS_LIST } from "@/services/opioidsService";

// Accordion Section Component
function AccordionSection({ title, children, defaultOpen = false, rightElement }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer select-none flex flex-row items-center justify-between py-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {rightElement}
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {isOpen && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

// Warning Badge Component
function WarningBadge({ type, message }) {
  const styles = {
    critical: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
    success: "bg-green-100 text-green-800 border-green-300",
  };

  const icons = {
    critical: <AlertCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <AlertTriangle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium",
        styles[type]
      )}
    >
      {icons[type]}
      {message}
    </div>
  );
}

// Claim Row Component
function ClaimRow({ claim, index }) {
  const { updateClaim, updateClaimDrug, setClaimDrugFromSelection, removeClaim } =
    useMedStore();

  const handleDrugSelect = (value) => {
    const opioid = OPIOIDS_LIST.find((o) => o.label === value);
    if (opioid) {
      setClaimDrugFromSelection(claim.id, opioid);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-slate-50">
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium text-sm text-slate-600">Claim #{index + 1}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeClaim(claim.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Drug Selection */}
        <div className="space-y-2">
          <Label>Drug</Label>
          <Select
            value={claim.drug.ingredient ? `${claim.drug.ingredient} (${claim.drug.route}${claim.drug.rxnormDoseForm ? ` - ${claim.drug.rxnormDoseForm}` : ""})` : ""}
            onValueChange={handleDrugSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select opioid..." />
            </SelectTrigger>
            <SelectContent>
              <optgroup label="Common Opioids">
                {COMMON_OPIOIDS.map((o) => (
                  <SelectItem key={o.label} value={o.label}>
                    {o.label}
                  </SelectItem>
                ))}
              </optgroup>
              <optgroup label="All Opioids">
                {OPIOIDS_LIST.map((o) => (
                  <SelectItem key={o.label} value={o.label}>
                    {o.label}
                  </SelectItem>
                ))}
              </optgroup>
            </SelectContent>
          </Select>
        </div>

        {/* Strength */}
        <div className="space-y-2">
          <Label>Strength ({claim.drug.uom || "MG"})</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={claim.drug.strength || ""}
            onChange={(e) =>
              updateClaimDrug(claim.id, { strength: parseFloat(e.target.value) || 0 })
            }
            placeholder="e.g., 10"
          />
        </div>

        {/* Date of Fill */}
        <div className="space-y-2">
          <Label>Date of Fill</Label>
          <Input
            type="date"
            value={claim.dateOfFill}
            onChange={(e) => updateClaim(claim.id, { dateOfFill: e.target.value })}
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            min="0"
            value={claim.quantity || ""}
            onChange={(e) =>
              updateClaim(claim.id, { quantity: parseInt(e.target.value) || 0 })
            }
            placeholder="e.g., 60"
          />
        </div>

        {/* Days Supply */}
        <div className="space-y-2">
          <Label>Days Supply</Label>
          <Input
            type="number"
            min="1"
            value={claim.daysSupply || ""}
            onChange={(e) =>
              updateClaim(claim.id, { daysSupply: parseInt(e.target.value) || 1 })
            }
            placeholder="e.g., 30"
          />
        </div>

        {/* Prescriber */}
        <div className="space-y-2">
          <Label>Prescriber</Label>
          <Input
            type="text"
            value={claim.prescriber || ""}
            onChange={(e) => updateClaim(claim.id, { prescriber: e.target.value })}
            placeholder="Dr. Name"
          />
        </div>

        {/* Pharmacy */}
        <div className="space-y-2">
          <Label>Pharmacy</Label>
          <Input
            type="text"
            value={claim.pharmacy || ""}
            onChange={(e) => updateClaim(claim.id, { pharmacy: e.target.value })}
            placeholder="Pharmacy name"
          />
        </div>
      </div>
    </div>
  );
}

// Results Table Component
function ResultsTable({ results }) {
  if (!results || !results.claimsWithMED || results.claimsWithMED.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-100">
            <th className="text-left p-2 font-medium">#</th>
            <th className="text-left p-2 font-medium">Drug</th>
            <th className="text-left p-2 font-medium">Fill Date</th>
            <th className="text-left p-2 font-medium">Last Dose</th>
            <th className="text-right p-2 font-medium">Qty</th>
            <th className="text-right p-2 font-medium">Days</th>
            <th className="text-right p-2 font-medium">Daily MED</th>
          </tr>
        </thead>
        <tbody>
          {results.claimsWithMED.map((claim, index) => (
            <tr key={claim.id || index} className="border-b hover:bg-slate-50">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">
                <div>
                  <div className="font-medium">{claim.drug.ingredient}</div>
                  <div className="text-xs text-muted-foreground">
                    {claim.drug.route}
                    {claim.drug.strength > 0 && ` - ${claim.drug.strength}${claim.drug.uom}`}
                  </div>
                </div>
              </td>
              <td className="p-2">
                {format(parseISO(claim.dateOfFill), "MM/dd/yyyy")}
              </td>
              <td className="p-2">
                {format(claim.dateOfLastDose, "MM/dd/yyyy")}
              </td>
              <td className="p-2 text-right">{claim.quantity}</td>
              <td className="p-2 text-right">{claim.daysSupply}</td>
              <td className="p-2 text-right font-medium">
                {claim.medResult ? (
                  <span
                    className={cn(
                      claim.medResult.dailyMED >= results.threshold
                        ? "text-red-600 font-bold"
                        : "text-slate-700"
                    )}
                  >
                    {claim.medResult.dailyMED.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Main MED Calculator Component
export function MED() {
  const {
    measurementPeriod,
    patient,
    claims,
    threshold,
    results,
    isCalculating,
    error,
    setMeasurementFrom,
    setMeasurementThru,
    setPatientDob,
    setCancerExclusion,
    setHospiceExclusion,
    setThreshold,
    addClaim,
    calculate,
    clearResults,
    reset,
  } = useMedStore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MED Calculator</h1>
        <p className="text-muted-foreground">
          Morphine Milligram Equivalents (MED) calculator for opioid safety analysis.
        </p>
      </div>

      {/* Options Section */}
      <AccordionSection
        title="Options"
        defaultOpen={true}
        rightElement={
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Measurement Period Start</Label>
            <Input
              type="date"
              value={measurementPeriod.from}
              onChange={(e) => setMeasurementFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Measurement Period End</Label>
            <Input
              type="date"
              value={measurementPeriod.thru}
              onChange={(e) => setMeasurementThru(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>MED Threshold</Label>
            <Input
              type="number"
              min="1"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 120)}
            />
          </div>
        </div>
      </AccordionSection>

      {/* Patient Section */}
      <AccordionSection title="Patient Information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={patient.dob}
              onChange={(e) => setPatientDob(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={patient.cancerExclusion}
                onChange={(e) => setCancerExclusion(e.target.checked)}
                className="rounded border-gray-300"
              />
              Cancer Exclusion
            </Label>
            <p className="text-xs text-muted-foreground">
              Active cancer treatment exclusion
            </p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={patient.hospiceExclusion}
                onChange={(e) => setHospiceExclusion(e.target.checked)}
                className="rounded border-gray-300"
              />
              Hospice Exclusion
            </Label>
            <p className="text-xs text-muted-foreground">
              Hospice or palliative care exclusion
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* Claims Section */}
      <AccordionSection
        title="Claims"
        defaultOpen={true}
        rightElement={
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addClaim();
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Claim
          </Button>
        }
      >
        {claims.map((claim, index) => (
          <ClaimRow key={claim.id} claim={claim} index={index} />
        ))}
      </AccordionSection>

      {/* Calculate Button */}
      <div className="flex gap-4 mb-6">
        <Button onClick={calculate} disabled={isCalculating} className="flex-1">
          <Calculator className="h-4 w-4 mr-2" />
          {isCalculating ? "Calculating..." : "Calculate MED"}
        </Button>
        {results && (
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <WarningBadge type="warning" message={error} />
        </div>
      )}

      {/* Results Section */}
      {results && (
        <AccordionSection title="Results" defaultOpen={true}>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Claims</div>
                <div className="text-2xl font-bold">{results.claims.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Days Above {results.threshold}</div>
                <div className="text-2xl font-bold">{results.totalDaysAbove}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Max Consecutive Days</div>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    results.consecutiveDays >= 90 ? "text-red-600" : ""
                  )}
                >
                  {results.consecutiveDays}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Providers / Pharmacies</div>
                <div className="text-2xl font-bold">
                  {results.prescriberCount} / {results.pharmacyCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warnings */}
          <div className="space-y-3 mb-6">
            {/* Exclusion Warnings */}
            {results.hasExclusions && (
              <WarningBadge
                type="info"
                message={`Patient has exclusions: ${[
                  results.exclusionWarnings.cancer ? "Cancer" : null,
                  results.exclusionWarnings.hospice ? "Hospice" : null,
                ]
                  .filter(Boolean)
                  .join(", ")}`}
              />
            )}

            {/* High Dosage Warning */}
            {results.isHighDosage && (
              <WarningBadge
                type={results.isMultipleProviders ? "critical" : "warning"}
                message={`High Dosage: ${results.consecutiveDays} consecutive days with MED >= ${results.threshold}`}
              />
            )}

            {/* Multiple Providers Warning */}
            {results.isMultipleProviders && (
              <WarningBadge
                type={results.isHighDosage ? "critical" : "warning"}
                message={`Multiple Providers: ${results.prescriberCount} prescribers and ${results.pharmacyCount} pharmacies`}
              />
            )}

            {/* No Warnings */}
            {!results.isHighDosage && !results.isMultipleProviders && !results.hasExclusions && (
              <WarningBadge
                type="success"
                message="No warnings - opioid usage within safety guidelines"
              />
            )}
          </div>

          {/* Results Table */}
          <h4 className="font-semibold mb-3">Claim Details</h4>
          <ResultsTable results={results} />
        </AccordionSection>
      )}

      {/* Information Footer */}
      <Card className="mt-8 bg-slate-50">
        <CardContent className="pt-4">
          <h4 className="font-semibold mb-2">About MED Calculations</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <strong>Daily MED</strong> = (Quantity / Days Supply) x Strength x Conversion Factor
            </li>
            <li>
              <strong>High Dosage Warning</strong>: 90+ consecutive days with MED &gt;= 120
            </li>
            <li>
              <strong>Multiple Providers Warning</strong>: 4+ prescribers AND 4+ pharmacies
            </li>
            <li>
              <strong>Critical Warning</strong>: Both high dosage AND multiple providers
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default MED;
