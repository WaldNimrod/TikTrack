/**
 * Notes Data Loader — D35 (MB3A)
 * --------------------------------------------------------
 * טעינת נתונים לעמוד הערות
 * מקור: TEAM_20_TO_TEAM_30_NOTES_SUMMARY_ENDPOINT_RESPONSE.md, OpenAPI Addendum
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

/**
 * Fetch Notes Summary
 * GET /api/v1/notes/summary
 */
async function fetchNotesSummary() {
  try {
    await sharedServices.init();
    const response = await sharedServices.get('/notes/summary');
    return {
      totalNotes:
        (response.total_notes != null
          ? response.total_notes
          : response.totalNotes) || 0,
      recentNotes:
        (response.recent_notes != null
          ? response.recent_notes
          : response.recentNotes) || 0,
      totalAttachments:
        (response.total_attachments != null
          ? response.total_attachments
          : response.totalAttachments) || 0,
      pinnedNotes:
        (response.pinned_notes != null
          ? response.pinned_notes
          : response.pinnedNotes) || 0,
      notesWithTags:
        (response.notes_with_tags != null
          ? response.notes_with_tags
          : response.notesWithTags) || 0,
      notesByParentType:
        (response.notes_by_parent_type != null
          ? response.notes_by_parent_type
          : response.notesByParentType) || {},
    };
  } catch (error) {
    maskedLog('[Notes Data Loader] Error fetching summary:', {
      errorCode: error && error.code,
      status: error && error.status,
    });
    return {
      totalNotes: 0,
      recentNotes: 0,
      totalAttachments: 0,
      pinnedNotes: 0,
      notesWithTags: 0,
      notesByParentType: {},
    };
  }
}

/**
 * Fetch Notes
 * GET /api/v1/notes?parent_type=...
 */
async function fetchNotes(filters = {}) {
  try {
    await sharedServices.init();
    const params = {};
    if (filters.parentType && filters.parentType !== 'all') {
      params.parent_type = filters.parentType;
    }
    if (filters.parentId) params.parent_id = filters.parentId;
    const response = await sharedServices.get('/notes', params);
    const data = Array.isArray(response)
      ? response
      : (response?.data ??
          response?.notes ??
          response?.results ??
          response?.items ??
          []) ||
        [];
    // CRITICAL: total must always reflect actual row count (pagination displays correctly)
    const total = Math.max(
      data.length,
      (response.total != null ? response.total : response.total_count) || 0,
    );
    return { data, total };
  } catch (error) {
    maskedLog('[Notes Data Loader] Error fetching notes:', {
      errorCode: error && error.code,
      status: error && error.status,
    });
    return { data: [], total: 0 };
  }
}

/**
 * Load all data for Notes View
 */
async function loadNotesData(filters = {}) {
  try {
    const [summary, notesData] = await Promise.all([
      fetchNotesSummary(),
      fetchNotes(filters),
    ]);
    return {
      summary,
      notes: notesData,
    };
  } catch (error) {
    maskedLog('[Notes Data Loader] Error loading:', {
      errorCode: error && error.code,
    });
    return {
      summary: {
        totalNotes: 0,
        recentNotes: 0,
        totalAttachments: 0,
        pinnedNotes: 0,
        notesWithTags: 0,
        notesByParentType: {},
      },
      notes: { data: [], total: 0 },
    };
  }
}

export { fetchNotesSummary, fetchNotes, loadNotesData };
