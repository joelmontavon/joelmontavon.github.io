/**
 * Opioids Service - MED (Morphine Milligram Equivalents) Calculator
 * Ported from Angular services.js opioidsService
 */
import { differenceInDays, addDays, parseISO } from "date-fns";

// Opioid conversion factors data
// Format: nested by ingredient -> route
const OPIOIDS_DATA = {
  Buprenorphine: {
    Transdermal: [{ conversionFactor: 42, uom: "MCG" }],
    Sublingual: [{ conversionFactor: 10, uom: "MG" }],
  },
  Butorphanol: {
    Injectable: [{ conversionFactor: 7, uom: "MG" }],
    Nasal: [{ conversionFactor: 7, uom: "MG" }],
  },
  Codeine: {
    "Oral Pill": [{ conversionFactor: 0.15, uom: "MG" }],
  },
  Dihydrocodeine: {
    "Oral Pill": [{ conversionFactor: 0.25, uom: "MG" }],
  },
  Fentanyl: {
    Sublingual: [{ conversionFactor: 0.18, uom: "MCG" }],
    Transdermal: [{ conversionFactor: 7.2, uom: "MCG" }],
    Buccal: [
      { rxnormDoseForm: "Buccal Film", conversionFactor: 0.18, uom: "MCG" },
      { rxnormDoseForm: "Buccal Tablet", conversionFactor: 0.13, uom: "MCG" },
    ],
    Nasal: [{ conversionFactor: 0.16, uom: "MCG" }],
  },
  Hydrocodone: {
    "Oral Pill": [{ conversionFactor: 1, uom: "MG" }],
  },
  Hydromorphone: {
    Injectable: [{ conversionFactor: 4, uom: "MG" }],
    "Oral Pill": [{ conversionFactor: 4, uom: "MG" }],
    Rectal: [{ conversionFactor: 4, uom: "MG" }],
  },
  Levorphanol: {
    "Oral Pill": [{ conversionFactor: 11, uom: "MG" }],
  },
  Meperidine: {
    Injectable: [{ conversionFactor: 0.1, uom: "MG" }],
    "Oral Pill": [{ conversionFactor: 0.1, uom: "MG" }],
  },
  Methadone: {
    Injectable: [{ conversionFactor: 3, uom: "MG" }],
    "Oral Pill": [{ conversionFactor: 3, uom: "MG" }],
  },
  Morphine: {
    Injectable: [{ conversionFactor: 1, uom: "MG" }],
    "Oral Pill": [{ conversionFactor: 1, uom: "MG" }],
    Rectal: [{ conversionFactor: 1, uom: "MG" }],
  },
  Nalbuphine: {
    Injectable: [{ conversionFactor: 1, uom: "MG" }],
  },
  Opium: {
    Rectal: [{ conversionFactor: 1, uom: "MG" }],
    "Oral Pill": [{ conversionFactor: 1, uom: "MG" }],
  },
  Oxycodone: {
    "Oral Pill": [{ conversionFactor: 1.5, uom: "MG" }],
  },
  Oxymorphone: {
    Injectable: [{ conversionFactor: 3, uom: "MG" }],
    "Oral Pill": [{ conversionFactor: 3, uom: "MG" }],
    Rectal: [{ conversionFactor: 3, uom: "MG" }],
  },
  Pentazocine: {
    "Oral Pill": [{ conversionFactor: 0.37, uom: "MG" }],
    Injectable: [{ conversionFactor: 0.37, uom: "MG" }],
  },
  Tapentadol: {
    "Oral Pill": [{ conversionFactor: 0.4, uom: "MG" }],
  },
  Tramadol: {
    "Oral Pill": [{ conversionFactor: 0.1, uom: "MG" }],
  },
};

// Flatten opioids data for easy selection dropdown
export const OPIOIDS_LIST = Object.entries(OPIOIDS_DATA).flatMap(
  ([ingredient, routes]) =>
    Object.entries(routes).flatMap(([route, factors]) =>
      factors.map((factor) => ({
        ingredient,
        route,
        rxnormDoseForm: factor.rxnormDoseForm || null,
        conversionFactor: factor.conversionFactor,
        uom: factor.uom,
        label: factor.rxnormDoseForm
          ? `${ingredient} (${route} - ${factor.rxnormDoseForm})`
          : `${ingredient} (${route})`,
      }))
    )
);

// Common opioids for quick access
export const COMMON_OPIOIDS = OPIOIDS_LIST.filter((o) =>
  ["Hydrocodone", "Oxycodone", "Morphine", "Tramadol", "Codeine"].includes(
    o.ingredient
  )
);

/**
 * Get conversion factor for a specific opioid
 */
export function getConversionFactor(ingredient, route, rxnormDoseForm = null) {
  const ingredientData = OPIOIDS_DATA[ingredient];
  if (!ingredientData) return null;

  const routeData = ingredientData[route];
  if (!routeData) return null;

  // For Fentanyl Buccal, need to match rxnormDoseForm
  if (ingredient === "Fentanyl" && route === "Buccal" && rxnormDoseForm) {
    return routeData.find((f) => f.rxnormDoseForm === rxnormDoseForm) || routeData[0];
  }

  return routeData[0];
}

/**
 * Check if opioid exists in data
 */
export function isOpioid(ingredient) {
  return Object.prototype.hasOwnProperty.call(OPIOIDS_DATA, ingredient);
}

/**
 * Check if route exists for opioid
 */
export function hasRoute(ingredient, route) {
  return (
    Object.prototype.hasOwnProperty.call(OPIOIDS_DATA, ingredient) &&
    Object.prototype.hasOwnProperty.call(OPIOIDS_DATA[ingredient], route)
  );
}

/**
 * Calculate MED for a single claim
 * MED = (quantity / daysSupply) * strength * conversionFactor
 */
export function calculateClaimMED(claim) {
  const { drug, quantity, daysSupply } = claim;

  if (!drug || !drug.ingredient || !drug.route || !quantity || !daysSupply) {
    return null;
  }

  const conversionData = getConversionFactor(
    drug.ingredient,
    drug.route,
    drug.rxnormDoseForm
  );

  if (!conversionData) {
    return null;
  }

  const { conversionFactor, uom } = conversionData;

  // Convert strength to match UOM (MG to MCG if needed)
  let strength = drug.strength || 0;
  let strengthUom = drug.uom || "MG";

  // If conversion factor uses MCG but strength is in MG, convert
  if (uom === "MCG" && strengthUom.toUpperCase().includes("MG")) {
    strength = strength * 1000;
    strengthUom = "MCG";
  }

  // Calculate daily MED
  const dailyMED = (quantity / daysSupply) * strength * conversionFactor;

  return {
    dailyMED,
    conversionFactor,
    strengthUsed: strength,
    uomUsed: uom,
  };
}

/**
 * Get days from epoch for date calculations
 */
function getDaysFromEpoch(date) {
  const epoch = new Date(1970, 0, 1);
  return differenceInDays(date, epoch);
}

/**
 * Calculate daily MED over the measurement period
 * Returns an object with each day's total MED
 */
export function calculateDailyMEDOverPeriod(claims, from, thru) {
  const result = {};
  const fromDays = getDaysFromEpoch(from);
  const thruDays = getDaysFromEpoch(thru);

  // Initialize all days to 0
  for (let i = fromDays; i <= thruDays; i++) {
    result[i] = 0;
  }

  // Process each claim
  claims.forEach((claim) => {
    const medResult = calculateClaimMED(claim);
    if (!medResult) return;

    const fillDate = claim.dateOfFill instanceof Date
      ? claim.dateOfFill
      : parseISO(claim.dateOfFill);
    const dateOfFillDays = getDaysFromEpoch(fillDate);
    const daysSupply = claim.daysSupply;

    // Add MED for each day of supply
    for (let i = 0; i < daysSupply; i++) {
      const dayKey = dateOfFillDays + i;
      if (Object.prototype.hasOwnProperty.call(result, dayKey)) {
        result[dayKey] += medResult.dailyMED;
      }
    }

    // Store calculated MED on claim for display
    claim.calculatedMED = medResult;
    claim.dateOfLastDose = addDays(fillDate, daysSupply - 1);
  });

  return result;
}

/**
 * Check if MED exceeds threshold for each day
 */
export function calculateWithinThreshold(dailyMED, from, thru, threshold = 120) {
  const result = {};
  const fromDays = getDaysFromEpoch(from);
  const thruDays = getDaysFromEpoch(thru);

  for (let i = fromDays; i <= thruDays; i++) {
    result[i] = (dailyMED[i] || 0) >= threshold;
  }

  return result;
}

/**
 * Calculate total days above threshold
 */
export function calculateTotalDaysAboveThreshold(withinThreshold, from, thru) {
  let total = 0;
  const fromDays = getDaysFromEpoch(from);
  const thruDays = getDaysFromEpoch(thru);

  for (let i = fromDays; i <= thruDays; i++) {
    if (withinThreshold[i]) {
      total += 1;
    }
  }

  return total;
}

/**
 * Calculate maximum consecutive days above threshold
 */
export function calculateConsecutiveDaysAboveThreshold(withinThreshold, from, thru) {
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  const fromDays = getDaysFromEpoch(from);
  const thruDays = getDaysFromEpoch(thru);

  for (let i = fromDays; i <= thruDays; i++) {
    if (withinThreshold[i]) {
      currentConsecutive += 1;
    } else {
      currentConsecutive = 0;
    }
    maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
  }

  return maxConsecutive;
}

/**
 * Count unique prescribers
 */
export function countPrescribers(claims) {
  const prescribers = new Set(claims.map((c) => c.prescriber).filter(Boolean));
  return prescribers.size;
}

/**
 * Count unique pharmacies
 */
export function countPharmacies(claims) {
  const pharmacies = new Set(claims.map((c) => c.pharmacy).filter(Boolean));
  return pharmacies.size;
}

/**
 * Filter claims that are valid opioids with known routes
 */
export function filterValidOpioidClaims(claims) {
  return claims.filter((claim) => {
    if (!claim.drug || !claim.drug.ingredient) return false;
    return hasRoute(claim.drug.ingredient, claim.drug.route);
  });
}

/**
 * Filter claims within measurement period
 */
export function filterClaimsByDate(claims, from, thru) {
  const fromDate = from instanceof Date ? from : parseISO(from);
  const thruDate = thru instanceof Date ? thru : parseISO(thru);

  return claims.filter((claim) => {
    const fillDate = claim.dateOfFill instanceof Date
      ? claim.dateOfFill
      : parseISO(claim.dateOfFill);
    const fillDays = getDaysFromEpoch(fillDate);
    return (
      fillDays >= getDaysFromEpoch(fromDate) &&
      fillDays <= getDaysFromEpoch(thruDate)
    );
  });
}

/**
 * Sort claims by fill date
 */
export function sortClaimsByDate(claims) {
  return [...claims].sort((a, b) => {
    const dateA = a.dateOfFill instanceof Date ? a.dateOfFill : parseISO(a.dateOfFill);
    const dateB = b.dateOfFill instanceof Date ? b.dateOfFill : parseISO(b.dateOfFill);
    return dateA - dateB;
  });
}

/**
 * Main opioids analysis function
 * Returns comprehensive MED analysis
 */
export function analyzeOpioids(claims, from, thru, threshold = 120) {
  // Filter and sort claims
  const validOpioidClaims = filterValidOpioidClaims(claims);
  const claimsInPeriod = filterClaimsByDate(validOpioidClaims, from, thru);
  const sortedClaims = sortClaimsByDate(claimsInPeriod);

  // Calculate daily MED
  const dailyMED = calculateDailyMEDOverPeriod(sortedClaims, from, thru);

  // Check threshold
  const withinThreshold = calculateWithinThreshold(dailyMED, from, thru, threshold);

  // Calculate totals
  const totalDaysAbove = calculateTotalDaysAboveThreshold(withinThreshold, from, thru);
  const consecutiveDays = calculateConsecutiveDaysAboveThreshold(withinThreshold, from, thru);

  // Count providers
  const prescriberCount = countPrescribers(sortedClaims);
  const pharmacyCount = countPharmacies(sortedClaims);

  // Determine warnings
  const isHighDosage = consecutiveDays >= 90;
  const isMultipleProviders = prescriberCount >= 4 && pharmacyCount >= 4;

  return {
    claims: sortedClaims,
    dailyMED,
    withinThreshold,
    totalDaysAbove,
    consecutiveDays,
    prescriberCount,
    pharmacyCount,
    isHighDosage,
    isMultipleProviders,
    warningLevel:
      isHighDosage && isMultipleProviders
        ? "critical"
        : isHighDosage || isMultipleProviders
        ? "warning"
        : "none",
  };
}

export default {
  OPIOIDS_DATA,
  OPIOIDS_LIST,
  COMMON_OPIOIDS,
  getConversionFactor,
  isOpioid,
  hasRoute,
  calculateClaimMED,
  calculateDailyMEDOverPeriod,
  calculateWithinThreshold,
  calculateTotalDaysAboveThreshold,
  calculateConsecutiveDaysAboveThreshold,
  countPrescribers,
  countPharmacies,
  filterValidOpioidClaims,
  filterClaimsByDate,
  sortClaimsByDate,
  analyzeOpioids,
};
