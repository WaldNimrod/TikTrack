// בדיקה מפורטת של CSS בשלב 3
console.log('🔍 === בדיקת CSS בשלב 3 ===');

const step3 = document.getElementById('step-preview');
if (step3) {
    const stepContent = step3.querySelector('.step-content');
    const confirmationSummary = step3.querySelector('.confirmation-summary');
    const previewSummary = step3.querySelector('.preview-summary');
    const previewSection = step3.querySelector('.preview-section');
    
    // בדיקת CSS של step-content
    if (stepContent) {
        const computedStyle = window.getComputedStyle(stepContent);
        console.log('Step Content CSS:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            height: computedStyle.height,
            maxHeight: computedStyle.maxHeight,
            overflow: computedStyle.overflow,
            overflowY: computedStyle.overflowY,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex
        });
    }
    
    // בדיקת CSS של confirmation-summary
    if (confirmationSummary) {
        const computedStyle = window.getComputedStyle(confirmationSummary);
        console.log('Confirmation Summary CSS:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            height: computedStyle.height,
            maxHeight: computedStyle.maxHeight,
            overflow: computedStyle.overflow,
            margin: computedStyle.margin,
            padding: computedStyle.padding
        });
    }
    
    // בדיקת CSS של preview-summary
    if (previewSummary) {
        const computedStyle = window.getComputedStyle(previewSummary);
        console.log('Preview Summary CSS:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            height: computedStyle.height,
            maxHeight: computedStyle.maxHeight,
            overflow: computedStyle.overflow,
            margin: computedStyle.margin,
            padding: computedStyle.padding
        });
    }
    
    // בדיקת CSS של preview-section
    if (previewSection) {
        const computedStyle = window.getComputedStyle(previewSection);
        console.log('Preview Section CSS:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            height: computedStyle.height,
            maxHeight: computedStyle.maxHeight,
            overflow: computedStyle.overflow,
            margin: computedStyle.margin,
            padding: computedStyle.padding
        });
    }
}

console.log('✅ === בדיקת CSS בשלב 3 הושלמה ===');
