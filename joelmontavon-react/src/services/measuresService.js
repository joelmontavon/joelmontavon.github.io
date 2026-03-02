/**
 * Medicare Part D Quality Measures Service
 *
 * Provides data loading and measure lookup functionality for the Measures Explorer.
 * Data sources: measure_descriptions.json and measures.json
 */

// Cache for loaded data
let measureDescriptionsCache = null;
let measuresCache = null;

/**
 * Load measure descriptions from JSON file
 * @returns {Promise<Array>} Array of domain objects with measures
 */
export async function loadMeasureDescriptions() {
  if (measureDescriptionsCache) {
    return measureDescriptionsCache;
  }

  try {
    const response = await fetch('/data/measure_descriptions.json');
    if (!response.ok) {
      throw new Error(`Failed to load measure descriptions: ${response.status}`);
    }
    measureDescriptionsCache = await response.json();
    return measureDescriptionsCache;
  } catch (error) {
    console.error('Error loading measure descriptions:', error);
    return [];
  }
}

/**
 * Load measures thresholds data from JSON file
 * @returns {Promise<Object>} Measures data by year and contract type
 */
export async function loadMeasures() {
  if (measuresCache) {
    return measuresCache;
  }

  try {
    const response = await fetch('/data/measures.json');
    if (!response.ok) {
      throw new Error(`Failed to load measures: ${response.status}`);
    }
    measuresCache = await response.json();
    return measuresCache;
  } catch (error) {
    console.error('Error loading measures:', error);
    return {};
  }
}

/**
 * Get all available domains from measure descriptions
 * @returns {Promise<Array<string>>} Array of domain names
 */
export async function getDomains() {
  const descriptions = await loadMeasureDescriptions();
  return descriptions.map(d => d.domain);
}

/**
 * Get all measures across all domains
 * @returns {Promise<Array>} Flat array of all measures with domain info
 */
export async function getAllMeasures() {
  const descriptions = await loadMeasureDescriptions();
  const allMeasures = [];

  descriptions.forEach(domainObj => {
    domainObj.measures.forEach(measure => {
      allMeasures.push({
        ...measure,
        domain: domainObj.domain
      });
    });
  });

  return allMeasures;
}

/**
 * Get measures grouped by domain
 * @returns {Promise<Object>} Measures grouped by domain name
 */
export async function getMeasuresByDomain() {
  const descriptions = await loadMeasureDescriptions();
  const grouped = {};

  descriptions.forEach(domainObj => {
    grouped[domainObj.domain] = domainObj.measures;
  });

  return grouped;
}

/**
 * Find a measure by its ID (e.g., "D01")
 * @param {string} measureId - The measure ID to search for
 * @returns {Promise<Object|null>} Measure object with domain info or null
 */
export async function getMeasureById(measureId) {
  const allMeasures = await getAllMeasures();
  return allMeasures.find(m => m.Measure && m.Measure.startsWith(measureId)) || null;
}

/**
 * Search measures by name or description
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching measures
 */
export async function searchMeasures(query) {
  if (!query || query.trim() === '') {
    return getAllMeasures();
  }

  const allMeasures = await getAllMeasures();
  const lowerQuery = query.toLowerCase().trim();

  return allMeasures.filter(measure => {
    const measureName = (measure.Measure || '').toLowerCase();
    const label = (measure['Label for Stars'] || '').toLowerCase();
    const description = (measure.Description || '').toLowerCase();
    const metric = (measure.Metric || '').toLowerCase();

    return measureName.includes(lowerQuery) ||
           label.includes(lowerQuery) ||
           description.includes(lowerQuery) ||
           metric.includes(lowerQuery);
  });
}

/**
 * Filter measures by domain
 * @param {string} domain - Domain name to filter by
 * @returns {Promise<Array>} Measures in the specified domain
 */
export async function filterByDomain(domain) {
  if (!domain || domain === 'all') {
    return getAllMeasures();
  }

  const descriptions = await loadMeasureDescriptions();
  const domainObj = descriptions.find(d => d.domain === domain);
  return domainObj ? domainObj.measures : [];
}

/**
 * Get available years from measures data
 * @returns {Promise<Array<string>>} Array of years
 */
export async function getAvailableYears() {
  const measures = await loadMeasures();
  return Object.keys(measures).sort();
}

/**
 * Get threshold data for a specific measure
 * @param {string} year - Year to get thresholds for
 * @param {string} contractType - 'MA-PD' or 'PDP'
 * @param {string} measureId - Measure ID (e.g., 'D01')
 * @returns {Promise<Object|null>} Threshold data or null
 */
export async function getMeasureThresholds(year, contractType, measureId) {
  const measures = await loadMeasures();

  if (!measures[year] || !measures[year][contractType]) {
    return null;
  }

  const yearData = measures[year][contractType];

  for (const measureName in yearData) {
    const measure = yearData[measureName];
    if (measure['Measure ID'] === measureId) {
      return {
        name: measureName,
        ...measure
      };
    }
  }

  return null;
}

/**
 * Get unique weighting categories from all measures
 * @returns {Promise<Array<string>>} Array of weighting categories
 */
export async function getWeightingCategories() {
  const allMeasures = await getAllMeasures();
  const categories = new Set();

  allMeasures.forEach(measure => {
    if (measure['Weighting Category']) {
      categories.add(measure['Weighting Category']);
    }
  });

  return Array.from(categories).sort();
}

/**
 * Get unique data sources from all measures
 * @returns {Promise<Array<string>>} Array of data sources
 */
export async function getDataSources() {
  const allMeasures = await getAllMeasures();
  const sources = new Set();

  allMeasures.forEach(measure => {
    if (measure['Data Source']) {
      sources.add(measure['Data Source']);
    }
  });

  return Array.from(sources).sort();
}

/**
 * Parse the 4-Star threshold string to extract MA-PD and PDP values
 * @param {string} thresholdStr - The threshold string from measure data
 * @returns {Object} Object with mapd and pdp threshold values
 */
export function parseFourStarThreshold(thresholdStr) {
  if (!thresholdStr) {
    return { mapd: 'N/A', pdp: 'N/A' };
  }

  const result = { mapd: 'N/A', pdp: 'N/A' };

  // Parse MA-PD threshold
  const mapdMatch = thresholdStr.match(/MA-PD:\s*([^,]+)/);
  if (mapdMatch) {
    result.mapd = mapdMatch[1].trim();
  }

  // Parse PDP threshold
  const pdpMatch = thresholdStr.match(/PDP:\s*([^,]+)/);
  if (pdpMatch) {
    result.pdp = pdpMatch[1].trim();
  }

  return result;
}

/**
 * Get icon name for domain
 * @param {string} domain - Domain name
 * @returns {string} Icon name for lucide-react
 */
export function getDomainIcon(domain) {
  const iconMap = {
    '1 - Drug Plan Customer Service': 'Headphones',
    '2 - Member Complaints and Changes in the Drug Plan\'s Performance': 'MessageSquareWarning',
    '3 - Member Experience with the Drug Plan': 'Smile',
    '4 - Drug Safety and Accuracy of Drug Pricing': 'ShieldCheck'
  };

  return iconMap[domain] || 'ClipboardList';
}

/**
 * Get color class for weighting category
 * @param {string} category - Weighting category name
 * @returns {string} Tailwind color class
 */
export function getWeightingColor(category) {
  if (!category) return 'bg-gray-100 text-gray-800';

  if (category.includes('Intermediate Outcome')) {
    return 'bg-green-100 text-green-800';
  }
  if (category.includes('Experience') || category.includes('Complaints')) {
    return 'bg-blue-100 text-blue-800';
  }
  if (category.includes('Access')) {
    return 'bg-purple-100 text-purple-800';
  }
  if (category.includes('Improvement')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (category.includes('Process')) {
    return 'bg-orange-100 text-orange-800';
  }
  if (category.includes('Outcome')) {
    return 'bg-teal-100 text-teal-800';
  }

  return 'bg-gray-100 text-gray-800';
}

export default {
  loadMeasureDescriptions,
  loadMeasures,
  getDomains,
  getAllMeasures,
  getMeasuresByDomain,
  getMeasureById,
  searchMeasures,
  filterByDomain,
  getAvailableYears,
  getMeasureThresholds,
  getWeightingCategories,
  getDataSources,
  parseFourStarThreshold,
  getDomainIcon,
  getWeightingColor
};
