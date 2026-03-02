import { create } from "zustand";
import { startOfYear, endOfYear, format } from "date-fns";
import { calculateAdherence, getDaysInPeriod } from "@/services/pdcService";

// Current year for default measurement period
const currentYear = new Date().getFullYear();

// Default measurement period (current year)
const defaultFromDate = startOfYear(new Date(currentYear, 0, 1));
const defaultThruDate = endOfYear(new Date(currentYear, 0, 1));

// Initial claim template
const createEmptyClaim = () => ({
  id: crypto.randomUUID(),
  drug: null,
  dateOfFill: "",
  daysSupply: 30,
});

// Initial eligibility period template
const createEmptyEligPeriod = () => ({
  id: crypto.randomUUID(),
  from: "",
  thru: "",
});

/**
 * PDC Store using Zustand
 * Manages all state for the PDC calculator
 */
export const usePdcStore = create((set, get) => ({
  // Measurement period
  measurementPeriod: {
    from: format(defaultFromDate, "yyyy-MM-dd"),
    thru: format(defaultThruDate, "yyyy-MM-dd"),
  },

  // Selected measure classes (e.g., "Diabetes Medications", "Statin Medications")
  selectedMeasures: [],

  // Claims array
  claims: [createEmptyClaim()],

  // Eligibility periods (optional)
  eligPeriods: [],

  // Drug database (loaded from pdcDrugs.json)
  drugDatabase: [],

  // Calculation results
  results: null,

  // Loading states
  isLoading: false,
  isCalculating: false,

  // Error state
  error: null,

  // Actions

  /**
   * Set the measurement period
   */
  setMeasurementPeriod: (from, thru) => {
    set((state) => ({
      measurementPeriod: { from, thru },
    }));
    // Recalculate if we have claims
    get().calculate();
  },

  /**
   * Set selected measure classes
   */
  setSelectedMeasures: (measures) => {
    set({ selectedMeasures: measures });
    get().calculate();
  },

  /**
   * Add a new claim
   */
  addClaim: () => {
    set((state) => ({
      claims: [...state.claims, createEmptyClaim()],
    }));
  },

  /**
   * Remove a claim by ID
   */
  removeClaim: (id) => {
    set((state) => {
      const newClaims = state.claims.filter((c) => c.id !== id);
      // Keep at least one claim
      return {
        claims: newClaims.length > 0 ? newClaims : [createEmptyClaim()],
      };
    });
    get().calculate();
  },

  /**
   * Update a claim
   */
  updateClaim: (id, field, value) => {
    set((state) => ({
      claims: state.claims.map((claim) =>
        claim.id === id ? { ...claim, [field]: value } : claim
      ),
    }));
    get().calculate();
  },

  /**
   * Update entire claim object
   */
  setClaim: (id, claimData) => {
    set((state) => ({
      claims: state.claims.map((claim) =>
        claim.id === id ? { ...claim, ...claimData } : claim
      ),
    }));
    get().calculate();
  },

  /**
   * Clear all claims
   */
  clearClaims: () => {
    set({ claims: [createEmptyClaim()], results: null });
  },

  /**
   * Add eligibility period
   */
  addEligPeriod: () => {
    set((state) => ({
      eligPeriods: [...state.eligPeriods, createEmptyEligPeriod()],
    }));
  },

  /**
   * Remove eligibility period
   */
  removeEligPeriod: (id) => {
    set((state) => ({
      eligPeriods: state.eligPeriods.filter((e) => e.id !== id),
    }));
    get().calculate();
  },

  /**
   * Update eligibility period
   */
  updateEligPeriod: (id, field, value) => {
    set((state) => ({
      eligPeriods: state.eligPeriods.map((period) =>
        period.id === id ? { ...period, [field]: value } : period
      ),
    }));
    get().calculate();
  },

  /**
   * Clear eligibility periods
   */
  clearEligPeriods: () => {
    set({ eligPeriods: [] });
    get().calculate();
  },

  /**
   * Set drug database
   */
  setDrugDatabase: (drugs) => {
    set({ drugDatabase: drugs });
  },

  /**
   * Get unique measure classes from drug database
   */
  getAvailableMeasures: () => {
    const { drugDatabase } = get();
    const measures = [...new Set(drugDatabase.map((d) => d.measure))];
    return measures.sort();
  },

  /**
   * Get drugs filtered by selected measures
   */
  getFilteredDrugs: () => {
    const { drugDatabase, selectedMeasures } = get();
    if (selectedMeasures.length === 0) {
      return drugDatabase;
    }
    return drugDatabase.filter((d) => selectedMeasures.includes(d.measure));
  },

  /**
   * Main calculation function
   */
  calculate: () => {
    const { claims, measurementPeriod, selectedMeasures, eligPeriods } = get();

    // Validate we have valid claims
    const validClaims = claims.filter(
      (c) => c.drug && c.dateOfFill && c.daysSupply > 0
    );

    if (validClaims.length === 0) {
      set({ results: null });
      return;
    }

    // Validate measurement period
    if (!measurementPeriod.from || !measurementPeriod.thru) {
      set({ results: null, error: "Please set a valid measurement period" });
      return;
    }

    try {
      set({ isCalculating: true, error: null });

      // Use selected measures or all measures if none selected
      const classesToUse =
        selectedMeasures.length > 0 ? selectedMeasures : get().getAvailableMeasures();

      const results = calculateAdherence(
        validClaims,
        measurementPeriod.from,
        measurementPeriod.thru,
        classesToUse
      );

      // Calculate days in measurement period
      const daysInPeriod = getDaysInPeriod(
        measurementPeriod.from,
        measurementPeriod.thru
      );

      set({
        results: {
          ...results.summary,
          daysInMeasurementPeriod: daysInPeriod,
          claims: results.claims,
          pdcOverTime: results.pdcOverTime,
          daysLate: results.daysLate,
          calendar: results.calendar,
        },
        isCalculating: false,
      });
    } catch (err) {
      set({
        error: err.message || "Calculation error",
        isCalculating: false,
        results: null,
      });
    }
  },

  /**
   * Reset the entire store
   */
  reset: () => {
    set({
      measurementPeriod: {
        from: format(defaultFromDate, "yyyy-MM-dd"),
        thru: format(defaultThruDate, "yyyy-MM-dd"),
      },
      selectedMeasures: [],
      claims: [createEmptyClaim()],
      eligPeriods: [],
      results: null,
      error: null,
    });
  },

  /**
   * Load sample data for testing
   */
  loadSampleData: () => {
    const { drugDatabase } = get();

    // Find a statin drug
    const statin = drugDatabase.find((d) => d.measure === "Statin Medications");
    // Find a diabetes drug
    const diabetes = drugDatabase.find((d) => d.measure === "Diabetes Medications");

    const sampleClaims = [
      {
        id: crypto.randomUUID(),
        drug: statin || drugDatabase[0],
        dateOfFill: "2025-01-15",
        daysSupply: 30,
      },
      {
        id: crypto.randomUUID(),
        drug: statin || drugDatabase[0],
        dateOfFill: "2025-02-14",
        daysSupply: 30,
      },
      {
        id: crypto.randomUUID(),
        drug: statin || drugDatabase[0],
        dateOfFill: "2025-03-16",
        daysSupply: 30,
      },
    ];

    set({
      claims: sampleClaims,
      selectedMeasures: statin ? ["Statin Medications"] : [],
    });

    get().calculate();
  },
}));

export default usePdcStore;
