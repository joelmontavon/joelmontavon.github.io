import { parseISO, differenceInDays, addDays, isWithinInterval, isAfter, isBefore, isValid } from "date-fns";

/**
 * Parse a date string or return the date if already a Date object
 */
function parseDate(date) {
  if (date instanceof Date) return date;
  if (typeof date === "string") return parseISO(date);
  return null;
}

/**
 * Get days from epoch (Unix timestamp in days)
 */
function getDaysFromEpoch(date) {
  const parsed = parseDate(date);
  if (!parsed || !isValid(parsed)) return null;
  return Math.floor(parsed.getTime() / (1000 * 60 * 60 * 24));
}

/**
 * Filter claims by drug class (measure)
 * A claim matches if any of its drug's components belong to the selected classes
 */
function filterByClasses(claims, classes) {
  if (!classes || classes.length === 0) return claims;

  return claims.filter((claim) => {
    if (!claim.drug || !claim.drug.measure) return false;
    return classes.some((cls) => claim.drug.measure === cls);
  });
}

/**
 * Filter claims by date range (based on fill date)
 */
function filterByDates(claims, fromDate, thruDate) {
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  if (from === null || thru === null) return claims;

  return claims.filter((claim) => {
    const fillDate = getDaysFromEpoch(claim.dateOfFill);
    return fillDate !== null && fillDate >= from && fillDate <= thru;
  });
}

/**
 * Sort claims by fill date (ascending)
 */
function sortClaims(claims) {
  return [...claims].sort((a, b) => {
    const dateA = parseDate(a.dateOfFill);
    const dateB = parseDate(b.dateOfFill);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Adjust claims for overlap
 * Returns an object with coverage days per drug ingredient and modifies claims with adjusted dates
 */
function adjustForOverlap(sortedClaims) {
  const coverageByDrug = {};

  sortedClaims.forEach((claim) => {
    const fillDateEpoch = getDaysFromEpoch(claim.dateOfFill);
    if (fillDateEpoch === null) return;

    // Get drug ingredients (for combination drugs)
    let drugs = [];
    if (claim.drug && claim.drug.id) {
      // Split combination drugs by '/'
      drugs = claim.drug.id.split("/").map((d) => d.trim());
    } else {
      drugs = ["unknown"];
    }

    // Initialize coverage tracking for each drug
    drugs.forEach((drug) => {
      if (!coverageByDrug[drug]) {
        coverageByDrug[drug] = {};
      }
    });

    let currentDay = fillDateEpoch;
    let coveredDays = 0;

    // Find the first non-covered day for each day of supply
    while (coveredDays < claim.daysSupply) {
      let isAlreadyCovered = false;

      // Check if all drugs in this claim are already covered on this day
      for (const drug of drugs) {
        if (coverageByDrug[drug][currentDay]) {
          isAlreadyCovered = true;
          break;
        }
      }

      if (!isAlreadyCovered) {
        // Mark this day as covered for all drugs in the claim
        if (coveredDays === 0) {
          claim.dateOfFillAdj = new Date(currentDay * 24 * 60 * 60 * 1000);
        }
        drugs.forEach((drug) => {
          coverageByDrug[drug][currentDay] = 1;
        });
        coveredDays++;
      }

      currentDay++;
    }

    // Set the last dose date
    claim.dateOfLastDose = new Date((currentDay - 1) * 24 * 60 * 60 * 1000);
  });

  return coverageByDrug;
}

/**
 * Calculate days late between fills
 */
function calculateDaysLate(sortedClaims, thruDate) {
  const result = {
    daysLate: [],
    daysLateBand: [],
    daysLate0: 0,
    daysLate3: 0,
    daysLate7: 0,
    daysLate14: 0,
    daysLate30: 0,
    stopped: false,
    significantGap: false,
    pattern: "",
    trend: "",
    profile: "",
  };

  const thru = getDaysFromEpoch(thruDate);

  for (let i = 1; i < sortedClaims.length; i++) {
    const prevLastDose = getDaysFromEpoch(sortedClaims[i - 1].dateOfLastDose);
    const currFill = getDaysFromEpoch(sortedClaims[i].dateOfFill);

    if (prevLastDose !== null && currFill !== null) {
      const gap = Math.max(currFill - prevLastDose - 1, 0);
      result.daysLate.push(gap);
    }
  }

  // Add gap from last fill to end of measurement period
  if (sortedClaims.length > 0 && thru !== null) {
    const lastLastDose = getDaysFromEpoch(sortedClaims[sortedClaims.length - 1].dateOfLastDose);
    if (lastLastDose !== null) {
      result.daysLate.push(Math.max(thru - lastLastDose - 1, 0));
    }
  }

  // Count gaps by threshold
  for (let i = 0; i < result.daysLate.length; i++) {
    if (result.daysLate[i] > 0) result.daysLate0 += 1;
    if (result.daysLate[i] > 3) result.daysLate3 += 1;
    if (result.daysLate[i] > 7) result.daysLate7 += 1;
    if (result.daysLate[i] > 14) result.daysLate14 += 1;
    if (result.daysLate[i] > 30) result.daysLate30 += 1;

    // Band classification
    if (result.daysLate[i] === 0) result.daysLateBand[i] = 0;
    else if (result.daysLate[i] <= 3) result.daysLateBand[i] = 1;
    else if (result.daysLate[i] <= 7) result.daysLateBand[i] = 2;
    else if (result.daysLate[i] <= 14) result.daysLateBand[i] = 3;
    else result.daysLateBand[i] = 4;

    if (result.daysLate[i] > 30) result.stopped = true;
  }

  // Determine pattern
  if (result.stopped) result.pattern = "Discontinued";
  else if (result.daysLate30) result.pattern = "Significant gap(s)";
  else if (result.daysLate14 > 1) result.pattern = "Several gaps";
  else if (result.daysLate.length > 0 && result.daysLate7 / result.daysLate.length >= 0.5)
    result.pattern = "Highly inconsistent";
  else if (result.daysLate.length > 0 && result.daysLate3 / result.daysLate.length >= 0.5)
    result.pattern = "Inconsistent";
  else result.pattern = "Consistent";

  // Determine trend
  let increasing = 0;
  let decreasing = 0;

  for (let i = result.daysLate.length - 2; i >= 1; i--) {
    if (!result.significantGap) {
      if (result.daysLateBand[i - 1] < result.daysLateBand[i]) increasing += 1;
      else if (result.daysLateBand[i - 1] > result.daysLateBand[i]) decreasing += 1;
      if (result.daysLate[i - 1] > 30) result.significantGap = true;
    }
  }

  if (result.pattern !== "Discontinued") {
    if (!decreasing && increasing) result.trend = " with downward trend";
    else if (decreasing > 1 && !increasing) result.trend = " with strong upward trend";
    else if (decreasing && !increasing) result.trend = " with upward trend";
  }

  result.profile = result.pattern + result.trend;

  return result;
}

/**
 * Calculate coverage for each day in the measurement period
 */
function calculateDrugsCovered(coverageByDrug, fromDate, thruDate) {
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  if (from === null || thru === null) return {};

  const result = {};

  for (let day = from; day <= thru; day++) {
    result[day] = 0;
    for (const drug in coverageByDrug) {
      if (coverageByDrug[drug][day]) {
        result[day] += coverageByDrug[drug][day];
      }
    }
  }

  return result;
}

/**
 * Find the index date (first day with coverage)
 */
function findIndexDate(drugsCovered, fromDate, thruDate) {
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  if (from === null || thru === null) return null;

  for (let day = from; day <= thru; day++) {
    if (drugsCovered[day]) {
      return new Date(day * 24 * 60 * 60 * 1000);
    }
  }

  return null;
}

/**
 * Calculate cumulative days in measurement period (from index date)
 */
function calculateDaysInMeasurementPeriod(drugsCovered, fromDate, thruDate, threshold = 1) {
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  if (from === null || thru === null) return {};

  const result = {};
  let counting = 0;

  for (let day = from; day <= thru; day++) {
    if (drugsCovered[day] >= threshold) {
      counting = 1;
    }
    result[day] = day === from ? counting : result[day - 1] + counting;
  }

  return result;
}

/**
 * Calculate cumulative days covered
 */
function calculateDaysCovered(drugsCovered, fromDate, thruDate, threshold = 1) {
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  if (from === null || thru === null) return {};

  const result = {};
  let cumulative = 0;

  for (let day = from; day <= thru; day++) {
    if (drugsCovered[day] >= threshold) {
      cumulative += 1;
    }
    result[day] = cumulative;
  }

  return result;
}

/**
 * Calculate calendar coverage (for each day: 1 = covered, 0 = not covered after index, null = before index)
 */
function calculateCalendar(drugsCovered, fromDate, thruDate, threshold = 1) {
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  if (from === null || thru === null) return {};

  const result = {};
  let hasStarted = false;

  for (let day = from; day <= thru; day++) {
    if (drugsCovered[day] >= threshold) {
      hasStarted = true;
      result[day] = 1;
    } else {
      result[day] = hasStarted ? 0 : null;
    }
  }

  return result;
}

/**
 * Calculate PDC values over time
 */
function calculatePDC(daysInMeasurementPeriod, daysCovered, fromDate, thruDate) {
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  if (from === null || thru === null) return [];

  const result = [];
  let currentValue = null;

  for (let day = from; day <= thru; day++) {
    if (daysInMeasurementPeriod[day]) {
      currentValue = daysCovered[day] / daysInMeasurementPeriod[day];
    }
    result.push({
      date: new Date(day * 24 * 60 * 60 * 1000),
      pdc: currentValue,
    });
  }

  return result;
}

/**
 * Main adherence calculation function
 * Takes claims, date range, and drug classes, returns comprehensive PDC analysis
 */
export function calculateAdherence(claims, fromDate, thruDate, classes, threshold = 1) {
  // Step 1: Filter claims by drug class
  const filteredByClass = filterByClasses(claims, classes);

  // Step 2: Filter claims by date range
  const filteredByDate = filterByDates(filteredByClass, fromDate, thruDate);

  // Step 3: Sort claims by fill date
  const sortedClaims = sortClaims(filteredByDate);

  // Step 4: Count unique fill dates
  const uniqueFillDates = new Set(
    sortedClaims.map((c) => parseDate(c.dateOfFill)?.toDateString()).filter(Boolean)
  ).size;

  // Step 5: Calculate span (days between first and last fill)
  const span =
    sortedClaims.length > 1
      ? getDaysFromEpoch(sortedClaims[sortedClaims.length - 1].dateOfFill) -
        getDaysFromEpoch(sortedClaims[0].dateOfFill) +
        1
      : 0;

  // Step 6: Adjust for overlap
  const coverageByDrug = adjustForOverlap(sortedClaims);

  // Step 7: Calculate days late
  const daysLate = calculateDaysLate(sortedClaims, thruDate);

  // Step 8: Calculate drugs covered per day
  const drugsCovered = calculateDrugsCovered(coverageByDrug, fromDate, thruDate);

  // Step 9: Find index date
  const indexDate = findIndexDate(drugsCovered, fromDate, thruDate);

  // Step 10: Calculate cumulative days in measurement period
  const daysInMeasurementPeriod = calculateDaysInMeasurementPeriod(
    drugsCovered,
    fromDate,
    thruDate,
    threshold
  );

  // Step 11: Calculate cumulative days covered
  const daysCovered = calculateDaysCovered(drugsCovered, fromDate, thruDate, threshold);

  // Step 12: Calculate calendar coverage
  const calendar = calculateCalendar(drugsCovered, fromDate, thruDate, threshold);

  // Step 13: Calculate PDC over time
  const pdcOverTime = calculatePDC(daysInMeasurementPeriod, daysCovered, fromDate, thruDate);

  // Get final values
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  const finalDaysCovered = thru !== null && from !== null ? daysCovered[thru] || 0 : 0;
  const finalDaysInPeriod = thru !== null && from !== null ? daysInMeasurementPeriod[thru] || 0 : 0;
  const finalPDC = finalDaysInPeriod > 0 ? finalDaysCovered / finalDaysInPeriod : 0;

  return {
    claims: sortedClaims,
    uniqueDatesOfFill: uniqueFillDates,
    span,
    coverageByDrug,
    daysLate,
    drugsCovered,
    indexDate,
    daysInMeasurementPeriod,
    daysCovered,
    calendar,
    pdcOverTime,
    // Summary results
    summary: {
      daysCovered: finalDaysCovered,
      daysInPeriod: finalDaysInPeriod,
      pdc: finalPDC,
      isAdherent: finalPDC >= 0.8,
      totalClaims: sortedClaims.length,
      indexDate,
      profile: daysLate.profile,
    },
  };
}

/**
 * Calculate days in measurement period
 */
export function getDaysInPeriod(fromDate, thruDate) {
  const from = getDaysFromEpoch(fromDate);
  const thru = getDaysFromEpoch(thruDate);

  if (from === null || thru === null) return 0;

  return thru - from + 1;
}

/**
 * Check if a date is within the measurement period
 */
export function isDateInRange(date, fromDate, thruDate) {
  const d = parseDate(date);
  const from = parseDate(fromDate);
  const thru = parseDate(thruDate);

  if (!d || !from || !thru) return false;

  return isWithinInterval(d, { start: from, end: thru });
}

export default {
  calculateAdherence,
  getDaysInPeriod,
  isDateInRange,
};
