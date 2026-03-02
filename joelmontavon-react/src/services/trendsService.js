/**
 * Trends Service
 *
 * Provides data processing for Star Ratings trends and distributions.
 * Processes summary.json and stars.json data for visualization.
 */

// Cache for loaded data
let summaryData = null;
let starsData = null;

/**
 * Load summary data from JSON file
 * @returns {Promise<Array>} Array of summary records
 */
export async function loadSummaryData() {
  if (summaryData) return summaryData;

  try {
    const response = await fetch('/data/summary.json');
    summaryData = await response.json();
    return summaryData;
  } catch (error) {
    console.error('Error loading summary data:', error);
    return [];
  }
}

/**
 * Load stars data from JSON file
 * @returns {Promise<Array>} Array of stars records
 */
export async function loadStarsData() {
  if (starsData) return starsData;

  try {
    const response = await fetch('/data/stars.json');
    starsData = await response.json();
    return starsData;
  } catch (error) {
    console.error('Error loading stars data:', error);
    return [];
  }
}

/**
 * Get unique years from the data
 * @param {Array} data - Summary or stars data
 * @returns {number[]} Sorted array of years
 */
export function getAvailableYears(data) {
  if (!data || !data.length) return [];
  const years = [...new Set(data.map(item => item.Year))];
  return years.sort((a, b) => a - b);
}

/**
 * Get contract types from the data
 * @param {Array} data - Summary or stars data
 * @returns {string[]} Array of contract types
 */
export function getContractTypes(data) {
  if (!data || !data.length) return [];
  const types = [...new Set(data.map(item => item['Contract Type']))];
  return types.filter(Boolean).sort();
}

/**
 * Filter data by contract type and year
 * @param {Array} data - Data to filter
 * @param {string} contractType - Contract type filter (or 'all')
 * @param {number} year - Year filter (or null for all years)
 * @returns {Array} Filtered data
 */
export function filterData(data, contractType, year) {
  if (!data) return [];

  return data.filter(item => {
    const typeMatch = contractType === 'all' || item['Contract Type'] === contractType;
    const yearMatch = !year || item.Year === year;
    return typeMatch && yearMatch;
  });
}

/**
 * Check if a summary score is a valid numeric value
 * @param {*} score - The summary score value
 * @returns {boolean} True if valid numeric score
 */
function isValidScore(score) {
  return typeof score === 'number' || (typeof score === 'string' && !isNaN(parseFloat(score)));
}

/**
 * Parse summary score to number
 * @param {*} score - The summary score value
 * @returns {number|null} Parsed score or null
 */
function parseScore(score) {
  if (typeof score === 'number') return score;
  if (typeof score === 'string') {
    const parsed = parseFloat(score);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Get star rating distribution for a given filter
 * @param {Array} data - Summary data
 * @param {string} contractType - Contract type filter
 * @param {number} year - Year filter
 * @returns {Object} Distribution counts for each star level
 */
export function getStarDistribution(data, contractType, year) {
  const filtered = filterData(data, contractType, year);

  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  filtered.forEach(item => {
    const score = parseScore(item['Summary Score']);
    if (score !== null && score >= 1 && score <= 5) {
      // Round to nearest whole number for distribution
      const roundedScore = Math.round(score);
      distribution[roundedScore] = (distribution[roundedScore] || 0) + 1;
    }
  });

  return distribution;
}

/**
 * Calculate summary statistics for a given filter
 * @param {Array} data - Summary data
 * @param {string} contractType - Contract type filter
 * @param {number} year - Year filter
 * @returns {Object} Statistics object
 */
export function calculateStatistics(data, contractType, year) {
  const filtered = filterData(data, contractType, year);

  // Extract valid scores
  const scores = filtered
    .map(item => parseScore(item['Summary Score']))
    .filter(score => score !== null && score >= 1 && score <= 5);

  if (scores.length === 0) {
    return {
      average: null,
      median: null,
      percentAtOrAbove4: null,
      totalContracts: 0
    };
  }

  // Sort for median calculation
  scores.sort((a, b) => a - b);

  // Calculate average
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Calculate median
  const mid = Math.floor(scores.length / 2);
  const median = scores.length % 2 !== 0
    ? scores[mid]
    : (scores[mid - 1] + scores[mid]) / 2;

  // Calculate percentage at or above 4 stars
  const atOrAbove4 = scores.filter(score => score >= 4).length;
  const percentAtOrAbove4 = (atOrAbove4 / scores.length) * 100;

  return {
    average: Math.round(average * 100) / 100,
    median: Math.round(median * 100) / 100,
    percentAtOrAbove4: Math.round(percentAtOrAbove4 * 10) / 10,
    totalContracts: scores.length
  };
}

/**
 * Calculate year-over-year trends
 * @param {Array} data - Summary data
 * @param {string} contractType - Contract type filter
 * @returns {Array} Array of yearly statistics
 */
export function calculateYearlyTrends(data, contractType) {
  const years = getAvailableYears(data);

  return years.map(year => {
    const stats = calculateStatistics(data, contractType, year);
    return {
      year,
      ...stats
    };
  });
}

/**
 * Calculate year-over-year change
 * @param {Array} yearlyTrends - Array of yearly statistics
 * @returns {Object} Change metrics
 */
export function calculateYoYChange(yearlyTrends) {
  if (!yearlyTrends || yearlyTrends.length < 2) {
    return {
      averageChange: null,
      percentAtOrAbove4Change: null
    };
  }

  // Get last two years
  const sorted = [...yearlyTrends].sort((a, b) => a.year - b.year);
  const current = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const averageChange = current.average !== null && previous.average !== null
    ? Math.round((current.average - previous.average) * 100) / 100
    : null;

  const percentAtOrAbove4Change = current.percentAtOrAbove4 !== null && previous.percentAtOrAbove4 !== null
    ? Math.round((current.percentAtOrAbove4 - previous.percentAtOrAbove4) * 10) / 10
    : null;

  return {
    averageChange,
    percentAtOrAbove4Change,
    currentYear: current.year,
    previousYear: previous.year
  };
}

/**
 * Get color class for star rating
 * @param {number} rating - Star rating (1-5)
 * @returns {string} Tailwind color class
 */
export function getStarColor(rating) {
  const colors = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-green-500'
  };
  return colors[rating] || 'bg-gray-500';
}

/**
 * Get text color class for star rating
 * @param {number} rating - Star rating (1-5)
 * @returns {string} Tailwind text color class
 */
export function getStarTextColor(rating) {
  const colors = {
    1: 'text-red-600',
    2: 'text-orange-600',
    3: 'text-yellow-600',
    4: 'text-blue-600',
    5: 'text-green-600'
  };
  return colors[rating] || 'text-gray-600';
}

/**
 * Get background color class for star rating (light version)
 * @param {number} rating - Star rating (1-5)
 * @returns {string} Tailwind background color class
 */
export function getStarBgLightColor(rating) {
  const colors = {
    1: 'bg-red-100 dark:bg-red-900/30',
    2: 'bg-orange-100 dark:bg-orange-900/30',
    3: 'bg-yellow-100 dark:bg-yellow-900/30',
    4: 'bg-blue-100 dark:bg-blue-900/30',
    5: 'bg-green-100 dark:bg-green-900/30'
  };
  return colors[rating] || 'bg-gray-100';
}

export default {
  loadSummaryData,
  loadStarsData,
  getAvailableYears,
  getContractTypes,
  filterData,
  getStarDistribution,
  calculateStatistics,
  calculateYearlyTrends,
  calculateYoYChange,
  getStarColor,
  getStarTextColor,
  getStarBgLightColor
};
