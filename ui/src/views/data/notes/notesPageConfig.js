/**
 * Notes Page Config — D35 (MB3A)
 * --------------------------------------------------------
 * UAI Configuration for Notes page
 */

window.UAI = window.UAI || {};
window.UAI.config = {
  pageType: 'notes',
  requiresAuth: true,
  requiresHeader: true,
  dataLoader: '/src/views/data/notes/notesDataLoader.js',
  components: ['table', 'summary', 'pagination', 'actions'],
  tables: [{ id: 'notesTable', type: 'notes', pageSize: 25 }],
  summary: { enabled: true, toggleEnabled: true },
  metadata: { title: 'הערות', description: 'עמוד הערות', version: '1.0.0' }
};
