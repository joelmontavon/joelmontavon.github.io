import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Headphones,
  MessageSquareWarning,
  Smile,
  ShieldCheck,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Info,
  Award,
  Database,
  Calendar,
  BarChart3,
  FileText,
  Scale,
} from "lucide-react";
import {
  loadMeasureDescriptions,
  getDomains,
  parseFourStarThreshold,
  getDomainIcon,
  getWeightingColor,
} from "@/services/measuresService";

/**
 * Get the Lucide icon component for a domain
 */
function getDomainIconComponent(domain) {
  const iconName = getDomainIcon(domain);
  const icons = {
    Headphones,
    MessageSquareWarning,
    Smile,
    ShieldCheck,
    ClipboardList,
  };
  return icons[iconName] || ClipboardList;
}

/**
 * Measure Detail Card Component - Expandable detail view
 */
function MeasureDetailCard({ measure, isExpanded, onToggle }) {
  const thresholds = parseFourStarThreshold(measure["4-Star Threshold"]);
  const higherIsBetter = measure["General Trend"]?.toLowerCase().includes("higher");
  const WeightIcon = higherIsBetter ? TrendingUp : TrendingDown;

  return (
    <div className="border-t border-border">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
              {measure.Measure}
            </span>
            <span className="font-medium text-left">{measure["Label for Stars"]}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-2 py-1 rounded-full ${getWeightingColor(
              measure["Weighting Category"]
            )}`}
          >
            {measure["Weighting Value"]}x
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-card space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              Description
            </h4>
            <p className="text-sm">{measure.Description}</p>
          </div>

          {/* Metric */}
          {measure.Metric && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4" />
                Metric Definition
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {measure.Metric}
              </p>
            </div>
          )}

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Trend */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Trend Direction</span>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  higherIsBetter ? "text-green-600" : "text-red-600"
                }`}
              >
                <WeightIcon className="h-4 w-4" />
                {measure["General Trend"]}
              </div>
            </div>

            {/* Weighting */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Weighting</span>
              <div className="text-sm font-medium">
                {measure["Weighting Value"]}x - {measure["Weighting Category"]}
              </div>
            </div>

            {/* Data Source */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Data Source</span>
              <div className="text-sm font-medium flex items-center gap-1">
                <Database className="h-3 w-3" />
                {measure["Data Source"]}
              </div>
            </div>

            {/* Data Time Frame */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Data Time Frame</span>
              <div className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {measure["Data Time Frame"]}
              </div>
            </div>

            {/* Statistical Method */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Statistical Method</span>
              <div className="text-sm font-medium flex items-center gap-1">
                <Scale className="h-3 w-3" />
                {measure["Statistical Method"]}
              </div>
            </div>

            {/* Data Display */}
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Data Display</span>
              <div className="text-sm font-medium">{measure["Data Display"]}</div>
            </div>
          </div>

          {/* 4-Star Thresholds */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
              <Award className="h-4 w-4" />
              4-Star Thresholds
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">MA-PD</div>
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {thresholds.mapd}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">PDP</div>
                <div className="text-lg font-bold text-green-700 dark:text-green-400">
                  {thresholds.pdp}
                </div>
              </div>
            </div>
          </div>

          {/* Exclusions */}
          {measure.Exclusions && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                Exclusions
              </h4>
              <p className="text-sm text-muted-foreground">{measure.Exclusions}</p>
            </div>
          )}

          {/* NQF Number */}
          {measure["NQF #"] && measure["NQF #"] !== "None" && (
            <div className="text-xs text-muted-foreground">
              NQF #: <span className="font-mono">{measure["NQF #"]}</span>
            </div>
          )}

          {/* CMS Framework Area */}
          {measure["CMS Framework Area"] && (
            <div className="text-xs text-muted-foreground">
              CMS Framework: {measure["CMS Framework Area"]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Domain Accordion Component
 */
function DomainAccordion({ domain, measures, expandedMeasures, onToggleMeasure }) {
  const [isDomainExpanded, setIsDomainExpanded] = useState(true);
  const DomainIcon = getDomainIconComponent(domain);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors py-4"
        onClick={() => setIsDomainExpanded(!isDomainExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DomainIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{domain}</CardTitle>
              <CardDescription>
                {measures.length} measure{measures.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
          {isDomainExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isDomainExpanded && (
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {measures.map((measure, index) => (
              <MeasureDetailCard
                key={`${measure.Measure}-${index}`}
                measure={measure}
                isExpanded={expandedMeasures[`${domain}-${measure.Measure}-${index}`]}
                onToggle={() =>
                  onToggleMeasure(`${domain}-${measure.Measure}-${index}`)
                }
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Main Measures Explorer Component
 */
export function Measures() {
  const [measureData, setMeasureData] = useState([]);
  const [domains, setDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [expandedMeasures, setExpandedMeasures] = useState({});

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [descriptions, domainList] = await Promise.all([
          loadMeasureDescriptions(),
          getDomains(),
        ]);
        setMeasureData(descriptions);
        setDomains(domainList);
      } catch (error) {
        console.error("Error loading measures data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Toggle measure expansion
  const handleToggleMeasure = (key) => {
    setExpandedMeasures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter measures based on search and domain selection
  const filteredData = useMemo(() => {
    if (!measureData.length) return [];

    return measureData
      .filter((domainObj) => {
        // Filter by selected domain
        if (selectedDomain !== "all" && domainObj.domain !== selectedDomain) {
          return false;
        }
        return true;
      })
      .map((domainObj) => {
        // Filter measures by search query
        if (!searchQuery.trim()) {
          return domainObj;
        }

        const query = searchQuery.toLowerCase();
        const filteredMeasures = domainObj.measures.filter((measure) => {
          const measureName = (measure.Measure || "").toLowerCase();
          const label = (measure["Label for Stars"] || "").toLowerCase();
          const description = (measure.Description || "").toLowerCase();
          const metric = (measure.Metric || "").toLowerCase();

          return (
            measureName.includes(query) ||
            label.includes(query) ||
            description.includes(query) ||
            metric.includes(query)
          );
        });

        return {
          ...domainObj,
          measures: filteredMeasures,
        };
      })
      .filter((domainObj) => domainObj.measures.length > 0);
  }, [measureData, searchQuery, selectedDomain]);

  // Calculate total measures count
  const totalMeasures = useMemo(() => {
    return filteredData.reduce((acc, domain) => acc + domain.measures.length, 0);
  }, [filteredData]);

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Medicare Part D Quality Measures
        </h1>
        <p className="text-muted-foreground">
          Explore the quality measures used to rate Medicare Part D prescription drug
          plans. These measures assess customer service, member experience, drug safety,
          and pricing accuracy.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search measures by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedDomain} onValueChange={setSelectedDomain}>
          <SelectTrigger className="w-full sm:w-[320px]">
            <SelectValue placeholder="Filter by domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domains.map((domain) => (
              <SelectItem key={domain} value={domain}>
                {domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {totalMeasures} measure{totalMeasures !== 1 ? "s" : ""}
        {selectedDomain !== "all" && ` in ${selectedDomain}`}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading measures data...</p>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!isLoading && filteredData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No measures found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Domain Accordions */}
      {!isLoading && filteredData.length > 0 && (
        <div className="space-y-4">
          {filteredData.map((domainObj) => (
            <DomainAccordion
              key={domainObj.domain}
              domain={domainObj.domain}
              measures={domainObj.measures}
              expandedMeasures={expandedMeasures}
              onToggleMeasure={handleToggleMeasure}
            />
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">About Part D Star Ratings (2024)</p>
              <p>
                Medicare uses a 5-star rating system to help beneficiaries compare Part D
                plans. Measures are weighted based on their importance, with Intermediate
                Outcome Measures receiving higher weights (3x) than Process Measures (1x).
                Plans must meet specific thresholds to achieve 4 or 5 stars. Data includes
                ratings from 2012-2024, with thresholds updated annually by CMS.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Measures;
