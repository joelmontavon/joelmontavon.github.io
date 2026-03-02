/**
 * Statin Drug Conversion Service
 *
 * Provides statin drug data and equivalent dose calculations.
 * Conversion factors are based on LDL-C lowering efficacy.
 */

// Statin drug database with brand names, available doses, and conversion factors
const statins = {
  atorvastatin: {
    brand: 'Lipitor',
    doses: [10, 20, 40],
    conversionFactor: [0.5, 0.5],
    img: 'https://www.lipitor.com/-/media/project/common/lipitorcom/images/lipitor-atorvastatin-calcium-logo.jpg?h=70&iar=0&w=280&hash=1865BF51419E873BB6982C1B1D86D9E8'
  },
  fluvastatin: {
    brand: 'Lescol',
    doses: [20, 40, 80],
    conversionFactor: [4, 4]
  },
  lovastatin: {
    brand: 'Mevacor',
    doses: [10, 20, 40, 80],
    conversionFactor: [2, 2]
  },
  pravastatin: {
    brand: 'Pravacol',
    doses: [10, 20, 40, 80],
    conversionFactor: [2, 2]
  },
  rosuvastatin: {
    brand: 'Crestor',
    doses: [5, 10, 20],
    conversionFactor: [0.125, 0.25],
    img: 'https://www.crestor.com/content/dam/website-services/us/341-crestordtc-com/images/crestor-rosuvastatin-calcium.png'
  },
  simvastatin: {
    brand: 'Zocor',
    doses: [5, 10, 20, 40, 80],
    conversionFactor: [1, 1],
    img: 'https://www.sec.gov/Archives/edgar/data/64978/000095012302011676/y66526y66526az0005.gif'
  }
};

/**
 * Get all available statin drug names
 * @returns {string[]} Array of statin drug names
 */
export function getStatinNames() {
  return Object.keys(statins);
}

/**
 * Get statin drug options for select dropdowns
 * @returns {Array<{value: string, label: string, brand: string}>}
 */
export function getStatinOptions() {
  return Object.keys(statins).map(key => ({
    value: key,
    label: toTitleCase(key),
    brand: statins[key].brand
  }));
}

/**
 * Get available doses for a specific statin
 * @param {string} statinName - The statin drug name
 * @returns {number[]} Array of available doses in mg
 */
export function getDoses(statinName) {
  const statin = statins[statinName];
  return statin ? statin.doses : [];
}

/**
 * Get statin data by name
 * @param {string} statinName - The statin drug name
 * @returns {Object|null} Statin data object or null if not found
 */
export function getStatin(statinName) {
  return statins[statinName] || null;
}

/**
 * Convert a string to title case
 * @param {string} str - Input string
 * @returns {string} Title-cased string
 */
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Check if a value is within the available dose range for a statin
 * @param {number} value - The dose value to check
 * @param {number[]} doses - Available doses array
 * @returns {boolean} True if value is within range
 */
function isWithinDoseRange(value, doses) {
  return doses[0] <= value && value <= doses[doses.length - 1];
}

/**
 * Calculate equivalent doses for all statins based on selected drug and dose
 *
 * Conversion logic:
 * 1. Calculate reference min/max values using selected statin's conversion factors
 *    minVal = selectedDose / conversionFactor[1]
 *    maxVal = selectedDose / conversionFactor[0]
 * 2. For each other statin, calculate equivalent range:
 *    min = minVal * theirFactor[0]
 *    max = maxVal * theirFactor[1]
 * 3. Check if calculated values fall within available doses
 *
 * @param {string} selectedStatin - The selected statin drug name
 * @param {number} selectedDose - The selected dose in mg
 * @returns {Array<{drug: string, brand: string, strength: string, min: number|string, max: number|string, img?: string}>}
 */
export function calculateEquivalents(selectedStatin, selectedDose) {
  const selectedDrug = statins[selectedStatin];
  if (!selectedDrug) return [];

  // Calculate reference values using selected statin's conversion factors
  const minVal = selectedDose / selectedDrug.conversionFactor[1];
  const maxVal = selectedDose / selectedDrug.conversionFactor[0];

  const results = [];

  Object.keys(statins).forEach(key => {
    const drug = statins[key];

    // Calculate equivalent dose range
    let min = minVal * drug.conversionFactor[0];
    let max = maxVal * drug.conversionFactor[1];

    // Check if values are within available dose range
    min = isWithinDoseRange(min, drug.doses) ? min : 'N/A';
    max = isWithinDoseRange(max, drug.doses) ? max : 'N/A';

    // Determine the strength display string
    let strength;
    if (key === selectedStatin) {
      // For the selected drug, show the exact selected dose
      strength = selectedDose;
    } else if (min === max) {
      strength = min;
    } else if (min === 'N/A') {
      strength = max;
    } else if (max === 'N/A') {
      strength = min;
    } else {
      strength = `${min}-${max}`;
    }

    // Add 'mg' suffix if not N/A
    if (strength !== 'N/A') {
      strength += ' mg';
    }

    results.push({
      drug: toTitleCase(key),
      drugKey: key,
      brand: drug.brand,
      img: drug.img,
      min,
      max,
      strength,
      isSelected: key === selectedStatin
    });
  });

  return results;
}

/**
 * Get the default statin (simvastatin as per original code)
 * @returns {string}
 */
export function getDefaultStatin() {
  return 'simvastatin';
}

/**
 * Get the default dose for a statin (first available dose)
 * @param {string} statinName - The statin drug name
 * @returns {number}
 */
export function getDefaultDose(statinName) {
  const doses = getDoses(statinName);
  return doses.length > 0 ? doses[0] : 0;
}

export default {
  getStatinNames,
  getStatinOptions,
  getDoses,
  getStatin,
  calculateEquivalents,
  getDefaultStatin,
  getDefaultDose
};
