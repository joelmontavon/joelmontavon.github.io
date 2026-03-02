import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from "@/components/ui";
import { Pill, ArrowRightLeft } from "lucide-react";
import {
  getStatinOptions,
  getDoses,
  calculateEquivalents,
  getDefaultStatin,
  getDefaultDose,
} from "@/services/statinsService";

export function Statins() {
  const statinOptions = getStatinOptions();
  const defaultStatin = getDefaultStatin();

  const [selectedStatin, setSelectedStatin] = useState(defaultStatin);
  const [selectedDose, setSelectedDose] = useState(getDefaultDose(defaultStatin));
  const [availableDoses, setAvailableDoses] = useState(getDoses(defaultStatin));
  const [results, setResults] = useState([]);

  // Calculate equivalents whenever selection changes
  const updateResults = useCallback(() => {
    if (selectedStatin && selectedDose) {
      const equivalents = calculateEquivalents(selectedStatin, selectedDose);
      setResults(equivalents);
    }
  }, [selectedStatin, selectedDose]);

  useEffect(() => {
    updateResults();
  }, [updateResults]);

  // Handle statin change - update doses and reset to first dose
  const handleStatinChange = (value) => {
    const doses = getDoses(value);
    setSelectedStatin(value);
    setAvailableDoses(doses);
    setSelectedDose(doses[0]);
  };

  // Handle dose change
  const handleDoseChange = (value) => {
    setSelectedDose(parseInt(value, 10));
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Pill className="h-8 w-8 text-blue-500" />
          Statin Converter
        </h1>
        <p className="text-muted-foreground">
          Calculate equivalent doses between different statin medications based on LDL-C lowering efficacy.
        </p>
      </div>

      {/* Input Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Select Statin and Dose
          </CardTitle>
          <CardDescription>
            Choose a statin medication and dose to see equivalent doses for all statins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {/* Statin Select */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="statin-select" className="mb-2 block">
                Statin Drug
              </Label>
              <Select value={selectedStatin} onValueChange={handleStatinChange}>
                <SelectTrigger id="statin-select">
                  <SelectValue placeholder="Select a statin" />
                </SelectTrigger>
                <SelectContent>
                  {statinOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.brand})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dose Select */}
            <div className="flex-1 min-w-[150px]">
              <Label htmlFor="dose-select" className="mb-2 block">
                Dose (mg)
              </Label>
              <Select
                value={selectedDose.toString()}
                onValueChange={handleDoseChange}
              >
                <SelectTrigger id="dose-select">
                  <SelectValue placeholder="Select dose" />
                </SelectTrigger>
                <SelectContent>
                  {availableDoses.map((dose) => (
                    <SelectItem key={dose} value={dose.toString()}>
                      {dose} mg
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Equivalent Doses</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <Card
            key={result.drugKey}
            className={`transition-all ${
              result.isSelected
                ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Drug Image (if available) */}
                {result.img && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white border">
                    <img
                      src={result.img}
                      alt={result.brand}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Drug Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{result.drug}</h3>
                    {result.isSelected && (
                      <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {result.brand}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.strength}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information Footer */}
      <Card className="mt-8 bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">About Statin Conversion</h3>
          <p className="text-sm text-muted-foreground">
            Statin conversion factors are based on LDL-C lowering efficacy. These equivalents
            are approximate and should be used as a general reference only. Clinical judgment
            should always be exercised when switching between statin medications. Factors such
            as patient tolerance, drug interactions, and specific indications should be considered.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
