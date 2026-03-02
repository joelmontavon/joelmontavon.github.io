/**
 * MED Store - Zustand store for MED Calculator state management
 */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { startOfYear, endOfYear, format, parseISO, addDays } from "date-fns";
import { analyzeOpioids, calculateClaimMED, OPIOIDS_LIST } from "@/services/opioidsService";

// Current year for default measurement period
const currentYear = new Date().getFullYear();

// Generate unique ID for claims
function generateId() {
  return `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Default claim template
function createEmptyClaim() {
  return {
    id: generateId(),
    drug: {
      ingredient: "",
      route: "Oral Pill",
      strength: 0,
      uom: "MG",
      rxnormDoseForm: null,
    },
    dateOfFill: format(new Date(), "yyyy-MM-dd"),
    quantity: 0,
    daysSupply: 30,
    prescriber: "",
    pharmacy: "",
  };
}

// Initial state
const initialState = {
  // Measurement period
  measurementPeriod: {
    from: format(startOfYear(new Date(currentYear, 0, 1)), "yyyy-MM-dd"),
    thru: format(endOfYear(new Date(currentYear, 0, 1)), "yyyy-MM-dd"),
  },

  // Patient info
  patient: {
    dob: "",
    cancerExclusion: false,
    hospiceExclusion: false,
  },

  // Claims array
  claims: [createEmptyClaim()],

  // MED Threshold (default 120)
  threshold: 120,

  // Calculated results (populated after analysis)
  results: null,

  // UI state
  isCalculating: false,
  error: null,
};

export const useMedStore = create(
  immer((set) => ({
    ...initialState,

    // ==================
    // Measurement Period Actions
    // ==================

    setMeasurementPeriod: (from, thru) =>
      set((state) => {
        state.measurementPeriod.from = from;
        state.measurementPeriod.thru = thru;
        state.results = null; // Clear results when period changes
      }),

    setMeasurementFrom: (from) =>
      set((state) => {
        state.measurementPeriod.from = from;
        state.results = null;
      }),

    setMeasurementThru: (thru) =>
      set((state) => {
        state.measurementPeriod.thru = thru;
        state.results = null;
      }),

    // ==================
    // Patient Actions
    // ==================

    setPatientDob: (dob) =>
      set((state) => {
        state.patient.dob = dob;
      }),

    setCancerExclusion: (value) =>
      set((state) => {
        state.patient.cancerExclusion = value;
      }),

    setHospiceExclusion: (value) =>
      set((state) => {
        state.patient.hospiceExclusion = value;
      }),

    // ==================
    // Claims Actions
    // ==================

    addClaim: () =>
      set((state) => {
        state.claims.push(createEmptyClaim());
      }),

    removeClaim: (claimId) =>
      set((state) => {
        const index = state.claims.findIndex((c) => c.id === claimId);
        if (index !== -1) {
          state.claims.splice(index, 1);
        }
        // Ensure at least one claim exists
        if (state.claims.length === 0) {
          state.claims.push(createEmptyClaim());
        }
        state.results = null;
      }),

    updateClaim: (claimId, updates) =>
      set((state) => {
        const claim = state.claims.find((c) => c.id === claimId);
        if (claim) {
          Object.assign(claim, updates);
          state.results = null;
        }
      }),

    updateClaimDrug: (claimId, drugUpdates) =>
      set((state) => {
        const claim = state.claims.find((c) => c.id === claimId);
        if (claim && claim.drug) {
          Object.assign(claim.drug, drugUpdates);
          state.results = null;
        }
      }),

    // Set drug from selection dropdown
    setClaimDrugFromSelection: (claimId, opioidOption) =>
      set((state) => {
        const claim = state.claims.find((c) => c.id === claimId);
        if (claim && opioidOption) {
          claim.drug = {
            ingredient: opioidOption.ingredient,
            route: opioidOption.route,
            rxnormDoseForm: opioidOption.rxnormDoseForm,
            strength: claim.drug.strength || 0,
            uom: opioidOption.uom,
          };
          state.results = null;
        }
      }),

    clearAllClaims: () =>
      set((state) => {
        state.claims = [createEmptyClaim()];
        state.results = null;
      }),

    // ==================
    // Threshold Actions
    // ==================

    setThreshold: (threshold) =>
      set((state) => {
        state.threshold = threshold;
        state.results = null;
      }),

    // ==================
    // Calculation Actions
    // ==================

    calculate: () =>
      set((state) => {
        state.isCalculating = true;
        state.error = null;

        try {
          const { claims, measurementPeriod, threshold, patient } = state;

          // Filter out empty claims
          const validClaims = claims.filter(
            (c) =>
              c.drug.ingredient &&
              c.dateOfFill &&
              c.quantity > 0 &&
              c.daysSupply > 0
          );

          if (validClaims.length === 0) {
            state.error = "Please add at least one valid claim with drug, date, quantity, and days supply.";
            state.isCalculating = false;
            return;
          }

          // Parse dates
          const fromDate = parseISO(measurementPeriod.from);
          const thruDate = parseISO(measurementPeriod.thru);

          // Perform analysis
          const analysisResults = analyzeOpioids(
            validClaims,
            fromDate,
            thruDate,
            threshold
          );

          // Calculate individual claim MEDs for display
          const claimsWithMED = validClaims.map((claim) => {
            const medResult = calculateClaimMED(claim);
            return {
              ...claim,
              medResult,
              dateOfLastDose: addDays(
                parseISO(claim.dateOfFill),
                claim.daysSupply - 1
              ),
            };
          });

          // Check exclusions
          const hasExclusions = patient.cancerExclusion || patient.hospiceExclusion;

          state.results = {
            ...analysisResults,
            claimsWithMED,
            hasExclusions,
            exclusionWarnings: {
              cancer: patient.cancerExclusion,
              hospice: patient.hospiceExclusion,
            },
            measurementPeriod: {
              from: measurementPeriod.from,
              thru: measurementPeriod.thru,
            },
            threshold,
          };

          state.isCalculating = false;
        } catch (err) {
          state.error = err.message || "An error occurred during calculation.";
          state.isCalculating = false;
        }
      }),

    clearResults: () =>
      set((state) => {
        state.results = null;
        state.error = null;
      }),

    // ==================
    // Reset
    // ==================

    reset: () =>
      set(() => ({
        ...initialState,
        claims: [createEmptyClaim()],
      })),
  }))
);

// Selectors for common data
export const selectMeasurementPeriod = (state) => state.measurementPeriod;
export const selectPatient = (state) => state.patient;
export const selectClaims = (state) => state.claims;
export const selectResults = (state) => state.results;
export const selectThreshold = (state) => state.threshold;
export const selectIsCalculating = (state) => state.isCalculating;
export const selectError = (state) => state.error;

export default useMedStore;
