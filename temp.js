/**
 * Trading Journal Page - Trading journal with calendar view
 *
 * This file handles the trading journal page functionality for the mockup.
 *
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeHeader() - Initializeheader
// - createAddEntryDropdown() - Createaddentrydropdown
// - initializePage() - Initializepage
// - initializeMonthYearSelectors() - Initializemonthyearselectors
// - setupActivityChartLazyLoading() - Setupactivitychartlazyloading

// === Event Handlers ===
// - replaceIconsWithIconSystem() - Replaceiconswithiconsystem
// - renderMenuIcons() - Rendermenuicons
// - handleAddEntry() - Handleaddentry
// - updateMonthDisplay() - Updatemonthdisplay
// - setMonthYear() - Setmonthyear
// - navigateMonth() - Navigatemonth
// - generateEntityTypeFilterButtons() - Generateentitytypefilterbuttons
// - handleEntryClickById() - Handleentryclickbyid
// - handleEntryClick() - Handleentryclick
// - handleDoubleClickEntry() - Handledoubleclickentry
// - prevMonth() - Prevmonth
// - nextMonth() - Nextmonth
// - handleActivityChartToggle() - Handleactivitycharttoggle
// - convertDateToChartTime() - Convertdatetocharttime

// === UI Functions ===
// - loadAndRenderCalendar() - Loadandrendercalendar
// - renderJournalEntriesTable() - Renderjournalentriestable
// - renderJournalEntriesCards() - Renderjournalentriescards
// - loadAndRenderJournalEntries() - Loadandrenderjournalentries
// - updateJournalEntriesTableBody() - Updatejournalentriestablebody
// - renderJournalEntriesTableForModal() - Renderjournalentriestableformodal
// - renderJournalEntriesCardsForModal() - Renderjournalentriescardsformodal
// - loadAndRenderActivityChart() - Loadandrenderactivitychart
// - showDropdown() - Showdropdown
// - hideDropdown() - Hidedropdown

// === Data Functions ===
// - getCSSVariableValue() - Getcssvariablevalue
// - loadPageState() - Loadpagestate
// - savePageState() - Savepagestate
// - loadTickerFilter() - Loadtickerfilter

// === Other ===
// - applyDynamicColors() - Applydynamiccolors
// - navigateToToday() - Navigatetotoday
// - filterJournalByEntityType() - Filterjournalbyentitytype
// - filterJournalByTicker() - Filterjournalbyticker
// - switchViewMode() - Switchviewmode
// - zoomToDay() - Zoomtoday
// - waitForElements() - Waitforelements

(function() {
  'use strict';

  // Current month and year for calendar navigation
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Page name for state management
  const PAGE_NAME = 'trading-journal-page';

  /**
   * Helpers for date normalization using global date utilities
   */
  const getEntryDateEnvelope = (entry) => {
    if (!entry) {return null;}
    const candidates = [
      entry.date,
      entry.created_at,
      entry.execution_date,
      entry.updated_at,
      entry.closed_at,
      entry.entry_date,
    ];
    const raw = candidates.find(v => v);
    if (window.dateUtils?.ensureDateEnvelope) {
      return window.dateUtils.ensureDateEnvelope(raw);
    }
    return raw || null;
  }

  const entryToDate = (entry) => {
    const envelope = getEntryDateEnvelope(entry);
    if (!envelope) {return null;}

    if (window.dateUtils?.toDate) {
      const d = window.dateUtils.toDate(envelope);
      if (d && !isNaN(d.getTime())) {return d;}
    }

