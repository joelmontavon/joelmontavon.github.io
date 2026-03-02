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
} from "@/components/ui";
import { TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Minus, Star } from "lucide-react";
import {
  loadSummaryData,
  getAvailableYears,
  getContractTypes,
  getStarDistribution,
  calculateStatistics,
  calculateYearlyTrends,
  calculateYoYChange,
  getStarColor,
  getStarTextColor,
  getStarBgLightColor,
} from "@/services/trendsService";

/**
 * Simple HTML/CSS-based bar chart component
 */
function DistributionBarChart({ distribution }) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...Object.values(distribution));

  if (total === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available for selected filters
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-3">
            {/* Star label */}
            <div className="flex items-center gap-1 w-20 flex-shrink-0">
              <span className={`font-semibold ${getStarTextColor(rating)}`}>
                {rating}
              </span>
              <Star className={`h-4 w-4 ${getStarTextColor(rating)} fill-current`} />
            </div>

            {/* Bar container */}
            <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden relative">
              {/* Bar fill */}
              <div
                className={`h-full ${getStarColor(rating)} transition-all duration-300 ease-out`}
                style={{ width: `${barWidth}%` }}
              />
              {/* Count label inside bar */}
              {count > 0 && (
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-sm font-medium text-white drop-shadow-sm">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Year-over-year trend chart component
 */
function YearlyTrendChart({ yearlyTrends }) {
  if (!yearlyTrends || yearlyTrends.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trend data available
      </div>
    );
  }

  const maxPercent = Math.max(
    ...yearlyTrends.map((t) => t.percentAtOrAbove4 || 0)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-48">
        {yearlyTrends.map((trend) => {
          const height =
            maxPercent > 0 ? ((trend.percentAtOrAbove4 || 0) / maxPercent) * 100 : 0;

          return (
            <div
              key={trend.year}
              className="flex-1 flex flex-col items-center gap-2"
            >
              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-300 min-h-[4px]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
              </div>
              {/* Year label */}
              <span className="text-xs text-muted-foreground">{trend.year}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="text-center text-sm text-muted-foreground">
        % of contracts at or above 4 stars
      </div>
    </div>
  );
}

/**
 * Statistics card component
 */
function StatCard({ title, value, suffix = "", change, icon: Icon }) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0 || change === null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">
              {value !== null ? value : "N/A"}
              {suffix && <span className="text-lg ml-1">{suffix}</span>}
            </p>
          </div>
          {Icon && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
        {change !== null && change !== undefined && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            {isPositive && (
              <>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+{change}</span>
              </>
            )}
            {isNegative && (
              <>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-red-500">{change}</span>
              </>
            )}
            {isNeutral && (
              <>
                <Minus className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500">No change</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs prior year</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Star Rating Summary Cards
 */
function StarSummaryCards({ distribution, totalContracts }) {
  const starLevels = [
    { rating: 5, label: "5 Star", description: "Excellent" },
    { rating: 4, label: "4 Star", description: "Above Average" },
    { rating: 3, label: "3 Star", description: "Average" },
    { rating: 2, label: "2 Star", description: "Below Average" },
    { rating: 1, label: "1 Star", description: "Poor" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {starLevels.map(({ rating, label, description }) => {
        const count = distribution[rating] || 0;
        const percentage =
          totalContracts > 0 ? ((count / totalContracts) * 100).toFixed(1) : 0;

        return (
          <Card key={rating} className={`${getStarBgLightColor(rating)} border-0`}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className={`text-xl font-bold ${getStarTextColor(rating)}`}>
                  {count}
                </span>
                <Star
                  className={`h-4 w-4 ${getStarTextColor(rating)} fill-current`}
                />
              </div>
              <p className="text-xs font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{percentage}%</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function Trends() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [contractType, setContractType] = useState("all");
  const [selectedYear, setSelectedYear] = useState(null);

  // Derived data
  const [availableYears, setAvailableYears] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [statistics, setStatistics] = useState({});
  const [yearlyTrends, setYearlyTrends] = useState([]);
  const [yoyChange, setYoyChange] = useState({});

  // Load data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const summaryData = await loadSummaryData();
        setData(summaryData);

        // Set available years and contract types
        const years = getAvailableYears(summaryData);
        setAvailableYears(years);
        setContractTypes(getContractTypes(summaryData));

        // Set default year to most recent
        if (years.length > 0) {
          setSelectedYear(years[years.length - 1]);
        }

        setError(null);
      } catch (err) {
        setError("Failed to load trend data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update derived data when filters change
  const updateDerivedData = useCallback(() => {
    if (!data.length) return;

    // Calculate distribution
    const dist = getStarDistribution(data, contractType, selectedYear);
    setDistribution(dist);

    // Calculate statistics
    const stats = calculateStatistics(data, contractType, selectedYear);
    setStatistics(stats);

    // Calculate yearly trends (for all years with current contract type filter)
    const trends = calculateYearlyTrends(data, contractType);
    setYearlyTrends(trends);

    // Calculate YoY change
    const change = calculateYoYChange(trends);
    setYoyChange(change);
  }, [data, contractType, selectedYear]);

  useEffect(() => {
    updateDerivedData();
  }, [updateDerivedData]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading trend data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-blue-500" />
          Star Ratings Trends
        </h1>
        <p className="text-muted-foreground">
          Analyze Medicare Advantage and Part D contract performance trends over time.
        </p>
      </div>

      {/* Filter Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Filter the data by contract type and year to explore trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {/* Contract Type Select */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Contract Type
              </label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Select */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select
                value={selectedYear?.toString() || ""}
                onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Average Rating"
          value={statistics.average}
          suffix="stars"
          change={yoyChange.averageChange}
          icon={Star}
        />
        <StatCard
          title="Median Rating"
          value={statistics.median}
          suffix="stars"
          icon={BarChart3}
        />
        <StatCard
          title="At or Above 4 Stars"
          value={statistics.percentAtOrAbove4}
          suffix="%"
          change={yoyChange.percentAtOrAbove4Change}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Contracts"
          value={statistics.totalContracts}
          icon={BarChart3}
        />
      </div>

      {/* Star Rating Summary Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Distribution Summary</h2>
        <StarSummaryCards
          distribution={distribution}
          totalContracts={statistics.totalContracts}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Star Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Star Rating Distribution
            </CardTitle>
            <CardDescription>
              Count of contracts at each star level for {selectedYear || "selected period"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionBarChart distribution={distribution} />
          </CardContent>
        </Card>

        {/* Year-over-Year Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              4+ Star Trend
            </CardTitle>
            <CardDescription>
              Percentage of contracts at or above 4 stars over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <YearlyTrendChart yearlyTrends={yearlyTrends} />
          </CardContent>
        </Card>
      </div>

      {/* Information Footer */}
      <Card className="mt-8 bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">About Star Ratings</h3>
          <p className="text-sm text-muted-foreground">
            Medicare Star Ratings are calculated by CMS on a 1-5 scale, with 5 stars
            representing the highest quality. Ratings are based on multiple performance
            measures across different categories including health outcomes, patient
            experience, and plan administration. The Summary Score represents the
            overall star rating for each contract.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
