import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
const PhoenixFilterContext = createContext(null);
export const PhoenixFilterProvider = ({ children }) => {
  const [filters, setFiltersState] = useState({
    status: null, investmentType: null, tradingAccounts: null, // Plural verified
    dateRange: { from: null, to: null }, search: ''
  });
  useEffect(() => {
    const handleBridgeChange = (event) => {
      const { filters: allFilters } = event.detail;
      if (allFilters) setFiltersState(allFilters);
    };
    window.addEventListener('phoenix-filter-change', handleBridgeChange);
    return () => window.removeEventListener('phoenix-filter-change', handleBridgeChange);
  }, []);
  return <PhoenixFilterContext.Provider value={{ filters }}>{children}</PhoenixFilterContext.Provider>;
};
export const usePhoenixFilter = () => useContext(PhoenixFilterContext);
export default PhoenixFilterContext;