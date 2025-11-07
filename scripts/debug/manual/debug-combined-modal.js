// בדיקה מהירה של המודל המשולב
console.log('🔍 === בדיקת המודל המשולב ===');

// בדיקת השלבים
const allSteps = document.querySelectorAll('.import-step');
console.log('All Steps:', allSteps.length);
allSteps.forEach((step, index) => {
    const computedStyle = window.getComputedStyle(step);
    console.log(`Step ${index + 1} (${step.id}):`, {
        display: step.style.display,
        computedDisplay: computedStyle.display,
        visibility: computedStyle.visibility,
        height: computedStyle.height,
        maxHeight: computedStyle.maxHeight,
        overflow: computedStyle.overflow
    });
});

// בדיקת השלב הנוכחי
const currentStepElement = document.querySelector('.import-step[style*="display: block"]');
console.log('Current Step Element:', currentStepElement);
console.log('Current Step ID:', currentStepElement?.id);

// בדיקת התוכן של השלב הנוכחי
if (currentStepElement) {
    const stepContent = currentStepElement.querySelector('.step-content');
    console.log('Step Content:', stepContent);
    console.log('Step Content Height:', stepContent?.offsetHeight);
    console.log('Step Content Scroll Height:', stepContent?.scrollHeight);
    console.log('Step Content Inner HTML Length:', stepContent?.innerHTML.length);
}

// בדיקת המודל
const modal = document.getElementById('importUserDataModal');
const modalBody = modal?.querySelector('.modal-body');
console.log('Modal:', modal);
console.log('Modal Body:', modalBody);
console.log('Modal Body Height:', modalBody?.offsetHeight);
console.log('Modal Body Scroll Height:', modalBody?.scrollHeight);

console.log('✅ === בדיקת המודל המשולב הושלמה ===');
