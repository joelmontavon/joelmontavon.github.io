/**
 * Dashboard Service
 * Handles data loading and processing for Medicare Part D Star Ratings Dashboard
 */

// Cache for loaded data
const dataCache = {
  summary: null,
  measures: null,
  scores: null,
};

/**
 * Load summary data (contract summary scores)
 */
export async function loadSummaryData() {
  if (dataCache.summary) {
    return dataCache.summary;
  }

  try {
    const response = await fetch("/data/summary.json");
    if (!response.ok) {
      throw new Error(`Failed to load summary data: ${response.status}`);
    }
    const data = await response.json();
    dataCache.summary = data;
    return data;
  } catch (error) {
    console.error("Error loading summary data:", error);
    throw error;
  }
}

/**
 * Load measures data (measure definitions with thresholds)
 */
export async function loadMeasuresData() {
  if (dataCache.measures) {
    return dataCache.measures;
  }

  try {
    const response = await fetch("/data/measures.json");
    if (!response.ok) {
      throw new Error(`Failed to load measures data: ${response.status}`);
    }
    const data = await response.json();
    dataCache.measures = data;
    return data;
  } catch (error) {
    console.error("Error loading measures data:", error);
    throw error;
  }
}

/**
 * Load scores data (individual measure scores per contract)
 * Note: This is a large file (~2.7MB)
 */
export async function loadScoresData() {
  if (dataCache.scores) {
    return dataCache.scores;
  }

  try {
    const response = await fetch("/data/scores.json");
    if (!response.ok) {
      throw new Error(`Failed to load scores data: ${response.status}`);
    }
    const data = await response.json();
    dataCache.scores = data;
    return data;
  } catch (error) {
    console.error("Error loading scores data:", error);
    throw error;
  }
}

/**
 * Load all dashboard data at once
 */
export async function loadAllData() {
  const [summary, measures, scores] = await Promise.all([
    loadSummaryData(),
    loadMeasuresData(),
    loadScoresData(),
  ]);
  return { summary, measures, scores };
}

/**
 * Get available years from the data
 */
export function getAvailableYears(data) {
  if (!data || !Array.isArray(data)) return [];
  const years = [...new Set(data.map((item) => item.Year))].sort((a, b) => b - a);
  return years;
}

/**
 * Get available contract types from the data
 */
export function getContractTypes(data) {
  if (!data || !Array.isArray(data)) return [];
  const types = [...new Set(data.map((item) => item["Contract Type"]))].filter(Boolean).sort();
  return types;
}

/**
 * Filter summary data by year, contract type, and search term
 */
export function filterSummaryData(data, filters = {}) {
  if (!data || !Array.isArray(data)) return [];

  let filtered = [...data];

  // Filter by year
  if (filters.year) {
    filtered = filtered.filter((item) => item.Year === filters.year);
  }

  // Filter by contract type
  if (filters.contractType) {
    filtered = filtered.filter((item) => item["Contract Type"] === filters.contractType);
  }

  // Filter by search term (contract number or organization name)
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        (item["Contract Number"] && item["Contract Number"].toLowerCase().includes(term)) ||
        (item["Contract Name"] && item["Contract Name"].toLowerCase().includes(term)) ||
        (item["Organization Marketing Name"] &&
          item["Organization Marketing Name"].toLowerCase().includes(term)) ||
        (item["Parent Organization"] && item["Parent Organization"].toLowerCase().includes(term))
    );
  }

  return filtered;
}

/**
 * Check if a summary score is a valid numeric rating
 */
export function isValidScore(score) {
  return typeof score === "number" || (typeof score === "string" && !isNaN(parseFloat(score)));
}

/**
 * Parse summary score to number
 */
export function parseScore(score) {
  if (typeof score === "number") return score;
  if (typeof score === "string") {
    const parsed = parseFloat(score);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Calculate summary statistics from filtered data
 */
export function calculateStatistics(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      totalContracts: 0,
      averageRating: 0,
      fourPlusStars: 0,
      fiveStars: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  // Filter to only contracts with valid numeric scores
  const withValidScores = data.filter((item) => isValidScore(item["Summary Score"]));

  const totalContracts = data.length;

  // Calculate average rating (only from valid scores)
  const scores = withValidScores.map((item) => parseScore(item["Summary Score"])).filter((s) => s !== null);
  const averageRating = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 0;

  // Count 4+ star contracts (4.0 and above)
  const fourPlusStars = scores.filter((s) => s >= 4.0).length;

  // Count 5 star contracts (exactly 5.0)
  const fiveStars = scores.filter((s) => s >= 5.0).length;

  // Calculate rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  scores.forEach((score) => {
    // Round to nearest integer for distribution
    const roundedScore = Math.round(score);
    if (roundedScore >= 1 && roundedScore <= 5) {
      ratingDistribution[roundedScore]++;
    } else if (roundedScore < 1) {
      ratingDistribution[1]++;
    } else if (roundedScore > 5) {
      ratingDistribution[5]++;
    }
  });

  return {
    totalContracts,
    averageRating,
    fourPlusStars,
    fiveStars,
    ratingDistribution,
    validScoreCount: scores.length,
  };
}

/**
 * Sort contracts by rating (descending by default)
 */
export function sortContractsByRating(data, ascending = false) {
  if (!data || !Array.isArray(data)) return [];

  return [...data].sort((a, b) => {
    const scoreA = parseScore(a["Summary Score"]);
    const scoreB = parseScore(b["Summary Score"]);

    // Handle null scores (put them at the end)
    if (scoreA === null && scoreB === null) return 0;
    if (scoreA === null) return 1;
    if (scoreB === null) return -1;

    return ascending ? scoreA - scoreB : scoreB - scoreA;
  });
}

/**
 * Get scores for a specific contract
 */
export function getContractScores(scoresData, contractNumber, year) {
  if (!scoresData || !Array.isArray(scoresData)) return null;

  return scoresData.find(
    (item) => item["Contract Number"] === contractNumber && item.Year === year
  );
}

/**
 * Get measure definitions for a specific year and contract type
 */
export function getMeasureDefinitions(measuresData, year, contractType) {
  if (!measuresData || !measuresData[year] || !measuresData[year][contractType]) {
    return {};
  }
  return measuresData[year][contractType];
}

/**
 * Format score for display
 */
export function formatScore(score) {
  if (score === null || score === undefined) return "N/A";
  if (typeof score === "string") {
    // Check if it's a non-numeric string
    if (isNaN(parseFloat(score))) return score;
    score = parseFloat(score);
  }
  return score.toFixed(1);
}

/**
 * Get star rating color class based on score
 */
export function getScoreColorClass(score) {
  const parsed = parseScore(score);
  if (parsed === null) return "text-muted-foreground";

  if (parsed >= 5) return "text-emerald-600";
  if (parsed >= 4) return "text-green-600";
  if (parsed >= 3) return "text-yellow-600";
  if (parsed >= 2) return "text-orange-600";
  return "text-red-600";
}

/**
 * Get star rating background color class based on score
 */
export function getScoreBgClass(score) {
  const parsed = parseScore(score);
  if (parsed === null) return "bg-muted";

  if (parsed >= 5) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (parsed >= 4) return "bg-green-100 dark:bg-green-900/30";
  if (parsed >= 3) return "bg-yellow-100 dark:bg-yellow-900/30";
  if (parsed >= 2) return "bg-orange-100 dark:bg-orange-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

export default {
  loadSummaryData,
  loadMeasuresData,
  loadScoresData,
  loadAllData,
  getAvailableYears,
  getContractTypes,
  filterSummaryData,
  isValidScore,
  parseScore,
  calculateStatistics,
  sortContractsByRating,
  getContractScores,
  getMeasureDefinitions,
  formatScore,
  getScoreColorClass,
  getScoreBgClass,
};
