// Debug script for notes summary - run in console
// Copy and paste this entire code block into browser console

(function() {
  console.log('🔍 === NOTES SUMMARY DEBUG ===');
  
  // 1. Check data sources
  console.log('\n1️⃣ Data Sources:');
  console.log('  window.notesData:', window.notesData?.length || 0, 'items');
  console.log('  window.filteredNotesData:', window.filteredNotesData?.length || 0, 'items');
  
  if (window.TableDataRegistry) {
    const registryData = window.TableDataRegistry.getFilteredData('notes');
    const registryFull = window.TableDataRegistry.getFullData('notes');
    console.log('  TableDataRegistry.getFilteredData:', registryData?.length || 0, 'items');
    console.log('  TableDataRegistry.getFullData:', registryFull?.length || 0, 'items');
  } else {
    console.log('  TableDataRegistry: NOT AVAILABLE');
  }
  
  // 2. Check config
  console.log('\n2️⃣ Config:');
  if (window.INFO_SUMMARY_CONFIGS && window.INFO_SUMMARY_CONFIGS.notes) {
    console.log('  Config exists:', window.INFO_SUMMARY_CONFIGS.notes);
  } else {
    console.log('  Config: NOT FOUND');
  }
  
  // 3. Check system
  console.log('\n3️⃣ System:');
  console.log('  InfoSummarySystem:', typeof window.InfoSummarySystem);
  console.log('  updatePageSummaryStats:', typeof window.updatePageSummaryStats);
  
  // 4. Sample data structure
  console.log('\n4️⃣ Sample Note Structure:');
  const sampleNote = window.notesData?.[0] || window.filteredNotesData?.[0];
  if (sampleNote) {
    console.log('  Sample note:', {
      id: sampleNote.id,
      content: sampleNote.content?.substring(0, 30) + '...',
      attachment: sampleNote.attachment,
      related_id: sampleNote.related_id,
      related_type_id: sampleNote.related_type_id,
      created_at: sampleNote.created_at,
      hasAttachment: sampleNote.attachment !== null && sampleNote.attachment !== undefined && sampleNote.attachment !== '',
      hasRelatedId: sampleNote.related_id !== null && sampleNote.related_id !== undefined
    });
  } else {
    console.log('  No sample note available');
  }
  
  // 5. Test calculations manually
  console.log('\n5️⃣ Manual Calculations:');
  const testData = window.notesData || window.filteredNotesData || [];
  if (Array.isArray(testData) && testData.length > 0) {
    const totalNotes = testData.length;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentNotes = testData.filter(note => {
      if (!note.created_at) return false;
      const noteDate = new Date(note.created_at);
      return noteDate > weekAgo;
    }).length;
    const notesWithAttachments = testData.filter(note => {
      return note.attachment !== null && note.attachment !== undefined && note.attachment !== '';
    }).length;
    const totalLinks = testData.filter(note => {
      return note.related_id !== null && note.related_id !== undefined;
    }).length;
    
    console.log('  Total Notes:', totalNotes);
    console.log('  Recent Notes (last 7 days):', recentNotes);
    console.log('  Notes with Attachments:', notesWithAttachments);
    console.log('  Total Links:', totalLinks);
  } else {
    console.log('  No data available for calculations');
  }
  
  // 6. Check current HTML
  console.log('\n6️⃣ Current HTML:');
  const summaryElement = document.getElementById('summaryStats');
  if (summaryElement) {
    console.log('  Element exists:', true);
    console.log('  InnerHTML:', summaryElement.innerHTML);
    console.log('  totalNotes element:', document.getElementById('totalNotes')?.textContent);
    console.log('  recentNotes element:', document.getElementById('recentNotes')?.textContent);
    console.log('  notesWithAttachments element:', document.getElementById('notesWithAttachments')?.textContent);
    console.log('  totalLinks element:', document.getElementById('totalLinks')?.textContent);
  } else {
    console.log('  summaryStats element: NOT FOUND');
  }
  
  // 7. Test updatePageSummaryStats call
  console.log('\n7️⃣ Testing updatePageSummaryStats:');
  const testDataForCall = window.notesData || [];
  console.log('  Calling with', testDataForCall.length, 'items');
  if (typeof window.updatePageSummaryStats === 'function') {
    try {
      window.updatePageSummaryStats('notes', testDataForCall);
      console.log('  ✅ Call completed');
      setTimeout(() => {
        console.log('  After call - totalNotes:', document.getElementById('totalNotes')?.textContent);
      }, 100);
    } catch (error) {
      console.error('  ❌ Error:', error);
    }
  } else {
    console.log('  ❌ updatePageSummaryStats not available');
  }
  
  console.log('\n✅ === DEBUG COMPLETE ===');
})();

