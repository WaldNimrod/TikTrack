/**
 * useFeatureHook - [Description]
 * --------------------------------------------
 * Custom hook for [feature]
 *
 * @description [תיאור ה-hook]
 */

import { useState, useEffect } from 'react';
import serviceName from '../services/serviceName.js';
import { audit } from '../../../utils/audit.js';
import { debugLog } from '../../../utils/debug.js';

/**
 * useFeatureHook Hook
 *
 * @description [תיאור ה-hook]
 * @returns {Object} Hook state and methods
 *
 * @example
 * const { data, loading, error, refresh } = useFeatureHook();
 */
const useFeatureHook = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load data
   *
   * @description Fetch data from service
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      audit.log('[Hook]', 'Loading data');
      const result = await serviceName.getData();
      setData(result);
      audit.log('[Hook]', 'Data loaded successfully');
    } catch (err) {
      audit.error('[Hook]', 'Failed to load data', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Refresh data
   *
   * @description Reload data
   */
  const refresh = () => {
    loadData();
  };

  return {
    data,
    loading,
    error,
    refresh,
    // Add more methods here
  };
};

export default useFeatureHook;
