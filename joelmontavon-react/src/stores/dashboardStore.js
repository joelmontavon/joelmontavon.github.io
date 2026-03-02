import { create } from "zustand";
import {
  loadAllData,
  getAvailableYears,
  filterSummaryData,
  calculateStatistics,
  sortContractsByRating,
  getContractScores,
  getMeasureDefinitions,
} from "@/services/dashboardService";

/**
 * Dashboard Store using Zustand
 * Manages all state for the Medicare Part D Star Ratings Dashboard
 */
export const useDashboardStore = create((set, get) => ({
  // Raw data
  summaryData: null,
  measuresData: null,
  scoresData: null,

  // Loading states
  isLoading: true,
  isScoresLoading: false,
  error: null,

  // Filters
  selectedYear: null,
  selectedContractType: "MA-PD", // Default to MA-PD
  searchTerm: "",

  // Available options
  availableYears: [],
  contractTypes: ["MA-PD", "PDP"],

  // Processed data
  filteredContracts: [],
  statistics: null,

  // UI state
  sortAscending: false,
  expandedContract: null,
  showScoresModal: false,
  selectedContractScores: null,
  selectedContractMeasures: null,

  /**
   * Initialize the dashboard by loading all data
   */
  initialize: async () => {
    set({ isLoading: true, error: null });

    try {
      const { summary, measures, scores } = await loadAllData();

      // Get available years from summary data
      const years = getAvailableYears(summary);
      const defaultYear = years.length > 0 ? years[0] : null;

      set({
        summaryData: summary,
        measuresData: measures,
        scoresData: scores,
        availableYears: years,
        selectedYear: defaultYear,
        isLoading: false,
      });

      // Apply initial filters
      get().applyFilters();
    } catch (error) {
      set({
        error: error.message || "Failed to load dashboard data",
        isLoading: false,
      });
    }
  },

  /**
   * Set selected year and refilter
   */
  setYear: (year) => {
    set({ selectedYear: year });
    get().applyFilters();
  },

  /**
   * Set selected contract type and refilter
   */
  setContractType: (contractType) => {
    set({ selectedContractType: contractType });
    get().applyFilters();
  },

  /**
   * Set search term and refilter
   */
  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().applyFilters();
  },

  /**
   * Clear all filters
   */
  clearFilters: () => {
    const { availableYears } = get();
    set({
      selectedYear: availableYears.length > 0 ? availableYears[0] : null,
      selectedContractType: "MA-PD",
      searchTerm: "",
    });
    get().applyFilters();
  },

  /**
   * Toggle sort order
   */
  toggleSort: () => {
    set((state) => ({ sortAscending: !state.sortAscending }));
    get().applyFilters();
  },

  /**
   * Apply all filters and update processed data
   */
  applyFilters: () => {
    const { summaryData, selectedYear, selectedContractType, searchTerm, sortAscending } = get();

    if (!summaryData) return;

    // Apply filters
    const filtered = filterSummaryData(summaryData, {
      year: selectedYear,
      contractType: selectedContractType,
      searchTerm: searchTerm || null,
    });

    // Sort by rating
    const sorted = sortContractsByRating(filtered, sortAscending);

    // Calculate statistics
    const stats = calculateStatistics(sorted);

    set({
      filteredContracts: sorted,
      statistics: stats,
    });
  },

  /**
   * Expand/collapse contract details
   */
  toggleContractExpand: async (contractNumber) => {
    const { expandedContract, scoresData, measuresData, selectedYear, selectedContractType } = get();

    if (expandedContract === contractNumber) {
      // Collapse
      set({
        expandedContract: null,
        selectedContractScores: null,
        selectedContractMeasures: null,
      });
    } else {
      // Expand and load scores
      set({ isScoresLoading: true, expandedContract: contractNumber });

      try {
        const scores = getContractScores(scoresData, contractNumber, selectedYear);
        const measures = getMeasureDefinitions(measuresData, selectedYear, selectedContractType);

        set({
          selectedContractScores: scores,
          selectedContractMeasures: measures,
          isScoresLoading: false,
        });
      } catch {
        set({
          isScoresLoading: false,
          error: "Failed to load contract scores",
        });
      }
    }
  },

  /**
   * Get star icon count for a score
   */
  getStarCount: (score) => {
    if (score === null || score === undefined) return 0;
    const parsed = typeof score === "number" ? score : parseFloat(score);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed);
  },

  /**
   * Reset the store
   */
  reset: () => {
    set({
      selectedYear: null,
      selectedContractType: "MA-PD",
      searchTerm: "",
      sortAscending: false,
      expandedContract: null,
      selectedContractScores: null,
      selectedContractMeasures: null,
    });
    get().applyFilters();
  },
}));

export default useDashboardStore;
