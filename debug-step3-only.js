// בדיקה מהירה של שלב 3 בלבד
console.log('🔍 === בדיקת שלב 3 בלבד ===');

// בדיקת שלב 3
const step3 = document.getElementById('step-preview');
console.log('Step 3 Element:', step3);
console.log('Step 3 Display:', step3?.style.display);
console.log('Step 3 Computed Display:', step3 ? window.getComputedStyle(step3).display : 'N/A');

// בדיקת התוכן של שלב 3
if (step3) {
    const stepContent = step3.querySelector('.step-content');
    console.log('Step 3 Content:', stepContent);
    console.log('Step 3 Content Height:', stepContent?.offsetHeight);
    console.log('Step 3 Content Scroll Height:', stepContent?.scrollHeight);
    console.log('Step 3 Content Inner HTML Length:', stepContent?.innerHTML.length);
    
    // בדיקת הסקציות בתוך שלב 3
    const confirmationSummary = step3.querySelector('.confirmation-summary');
    const previewSummary = step3.querySelector('.preview-summary');
    const previewSection = step3.querySelector('.preview-section');
    
    console.log('Confirmation Summary:', confirmationSummary);
    console.log('Preview Summary:', previewSummary);
    console.log('Preview Section:', previewSection);
    
    console.log('Confirmation Summary Height:', confirmationSummary?.offsetHeight);
    console.log('Preview Summary Height:', previewSummary?.offsetHeight);
    console.log('Preview Section Height:', previewSection?.offsetHeight);
}

// בדיקת המודל כששלב 3 פעיל
const modal = document.getElementById('importUserDataModal');
const modalBody = modal?.querySelector('.modal-body');
console.log('Modal Body Height:', modalBody?.offsetHeight);
console.log('Modal Body Scroll Height:', modalBody?.scrollHeight);

console.log('✅ === בדיקת שלב 3 הושלמה ===');
