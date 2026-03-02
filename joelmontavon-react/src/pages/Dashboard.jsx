import { useEffect } from "react";
import { Star, Search, ChevronDown, ChevronUp, X, Users, TrendingUp, Award, Trophy } from "lucide-react";
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
  Button,
} from "@/components/ui";
import { useDashboardStore } from "@/stores/dashboardStore";
import { formatScore, getScoreColorClass, getScoreBgClass, parseScore } from "@/services/dashboardService";

/**
 * Stat Card Component
 */
function StatCard({ title, value, subtitle, icon: Icon, colorClass }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${colorClass || ""}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Rating Distribution Bar Chart
 */
function RatingDistributionChart({ distribution }) {
  if (!distribution) return null;

  const maxCount = Math.max(...Object.values(distribution), 1);
  const stars = [5, 4, 3, 2, 1];

  const getBarColor = (star) => {
    switch (star) {
      case 5:
        return "bg-emerald-500";
      case 4:
        return "bg-green-500";
      case 3:
        return "bg-yellow-500";
      case 2:
        return "bg-orange-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <div className="space-y-3">
      {stars.map((star) => {
        const count = distribution[star] || 0;
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={star} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{star}</span>
            </div>
            <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
              <div
                className={`h-full ${getBarColor(star)} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Contract Row Component
 */
function ContractRow({ contract, isExpanded, onToggle, measures, scores }) {
  const score = contract["Summary Score"];
  const scoreNum = parseScore(score);
  const isValidScore = scoreNum !== null;

  // Get measure scores for expanded view
  const getMeasureValue = (measureName) => {
    if (!scores || !scores[measureName]) return "N/A";
    const value = scores[measureName];
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") {
      // Format as percentage if it looks like one (> 0 and <= 1)
      if (value > 0 && value <= 1) {
        return `${(value * 100).toFixed(1)}%`;
      }
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <div className={`border rounded-lg mb-2 ${isExpanded ? "ring-2 ring-primary" : ""}`}>
      {/* Main Row */}
      <div
        className={`flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors ${getScoreBgClass(score)}`}
        onClick={onToggle}
      >
        {/* Contract Number */}
        <div className="w-28 flex-shrink-0">
          <span className="font-mono text-sm font-medium">{contract["Contract Number"]}</span>
        </div>

        {/* Organization Name */}
        <div className="flex-1 min-w-0 px-4">
          <p className="font-medium truncate">{contract["Contract Name"]}</p>
          <p className="text-sm text-muted-foreground truncate">
            {contract["Organization Marketing Name"] || contract["Parent Organization"]}
          </p>
        </div>

        {/* SNP Status */}
        <div className="w-20 flex-shrink-0 text-center">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              contract.SNP === "Yes"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {contract.SNP || "N/A"}
          </span>
        </div>

        {/* Summary Score */}
        <div className="w-24 flex-shrink-0 text-center">
          <div className="flex items-center justify-center gap-1">
            {isValidScore ? (
              <>
                <Star className={`h-4 w-4 ${getScoreColorClass(score)} fill-current`} />
                <span className={`font-bold ${getScoreColorClass(score)}`}>
                  {formatScore(score)}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">N/A</span>
            )}
          </div>
        </div>

        {/* Expand Icon */}
        <div className="w-10 flex-shrink-0 flex justify-center">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content - Measure Details */}
      {isExpanded && (
        <div className="border-t bg-card p-4">
          <h4 className="font-semibold mb-3 text-sm">Measure Scores</h4>
          {scores ? (
            <div className="grid gap-2 text-sm">
              {measures &&
                Object.entries(measures).map(([measureName, measureDef]) => (
                  <div
                    key={measureName}
                    className="flex items-center justify-between py-2 border-b border-dashed last:border-0"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{measureName}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({measureDef["Measure ID"]})
                      </span>
                    </div>
                    <div className="font-mono font-medium">{getMeasureValue(measureName)}</div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No measure scores available</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="animate-pulse h-6 bg-muted rounded w-32" />
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse border rounded-lg mb-2 p-4">
              <div className="flex items-center gap-4">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="flex-1 h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error Display
 */
function ErrorDisplay({ error, onRetry }) {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onRetry}>Try Again</Button>
      </CardContent>
    </Card>
  );
}

/**
 * Main Dashboard Component
 */
export function Dashboard() {
  const {
    isLoading,
    error,
    selectedYear,
    selectedContractType,
    searchTerm,
    availableYears,
    contractTypes,
    filteredContracts,
    statistics,
    sortAscending,
    expandedContract,
    selectedContractScores,
    selectedContractMeasures,
    initialize,
    setYear,
    setContractType,
    setSearchTerm,
    clearFilters,
    toggleSort,
    toggleContractExpand,
  } = useDashboardStore();

  // Initialize data on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-6">
        <LoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-6">
        <ErrorDisplay error={error} onRetry={initialize} />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Medicare Part D Star Ratings</h1>
        <p className="text-muted-foreground">
          Performance ratings for Medicare Part D contracts
        </p>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Year Selector */}
            <div className="w-full md:w-40">
              <label className="text-sm font-medium mb-1.5 block">Year</label>
              <Select value={String(selectedYear || "")} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contract Type Selector */}
            <div className="w-full md:w-40">
              <label className="text-sm font-medium mb-1.5 block">Contract Type</label>
              <Select value={selectedContractType} onValueChange={setContractType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by contract number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Contracts"
            value={statistics.totalContracts.toLocaleString()}
            subtitle={`${statistics.validScoreCount} with valid scores`}
            icon={Users}
          />
          <StatCard
            title="Average Rating"
            value={formatScore(statistics.averageRating)}
            subtitle="Mean summary score"
            icon={TrendingUp}
            colorClass={getScoreColorClass(statistics.averageRating)}
          />
          <StatCard
            title="4+ Star Contracts"
            value={statistics.fourPlusStars.toLocaleString()}
            subtitle={`${statistics.validScoreCount > 0 ? ((statistics.fourPlusStars / statistics.validScoreCount) * 100).toFixed(1) : 0}% of total`}
            icon={Award}
            colorClass="text-green-600"
          />
          <StatCard
            title="5 Star Contracts"
            value={statistics.fiveStars.toLocaleString()}
            subtitle="Top performing plans"
            icon={Trophy}
            colorClass="text-emerald-600"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contracts Table - Takes up 2 columns on large screens */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>
                {filteredContracts.length} contract{filteredContracts.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={toggleSort}>
              {sortAscending ? "Low to High" : "High to Low"}
              {sortAscending ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {/* Table Header */}
            <div className="flex items-center p-2 text-sm font-medium text-muted-foreground border-b">
              <div className="w-28 flex-shrink-0">Contract</div>
              <div className="flex-1 px-4">Organization</div>
              <div className="w-20 flex-shrink-0 text-center">SNP</div>
              <div className="w-24 flex-shrink-0 text-center">Rating</div>
              <div className="w-10 flex-shrink-0" />
            </div>

            {/* Table Body */}
            <div className="max-h-[600px] overflow-y-auto mt-2">
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <ContractRow
                    key={contract["Contract Number"]}
                    contract={contract}
                    isExpanded={expandedContract === contract["Contract Number"]}
                    onToggle={() => toggleContractExpand(contract["Contract Number"])}
                    measures={selectedContractMeasures}
                    scores={selectedContractScores}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No contracts found matching your filters</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Count of contracts at each star level</CardDescription>
          </CardHeader>
          <CardContent>
            {statistics && <RatingDistributionChart distribution={statistics.ratingDistribution} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
