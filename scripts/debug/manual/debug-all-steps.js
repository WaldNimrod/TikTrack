// בדיקה מפורטת של כל השלבים
console.log('🔍 === בדיקת כל השלבים ===');

// בדיקת שלב 1
const step1 = document.getElementById('step-upload');
if (step1) {
    const stepContent1 = step1.querySelector('.step-content');
    console.log('Step 1 Element:', step1);
    console.log('Step 1 Display:', step1?.style.display);
    console.log('Step 1 Computed Display:', step1 ? window.getComputedStyle(step1).display : 'N/A');
    if (stepContent1) {
        console.log('Step 1 Content Height:', stepContent1?.offsetHeight);
        console.log('Step 1 Content Scroll Height:', stepContent1?.scrollHeight);
        console.log('Step 1 Content Inner HTML Length:', stepContent1?.innerHTML.length);
    }
}

// בדיקת שלב 2
const step2 = document.getElementById('step-analysis');
if (step2) {
    const stepContent2 = step2.querySelector('.step-content');
    console.log('Step 2 Element:', step2);
    console.log('Step 2 Display:', step2?.style.display);
    console.log('Step 2 Computed Display:', step2 ? window.getComputedStyle(step2).display : 'N/A');
    if (stepContent2) {
        console.log('Step 2 Content Height:', stepContent2?.offsetHeight);
        console.log('Step 2 Content Scroll Height:', stepContent2?.scrollHeight);
        console.log('Step 2 Content Inner HTML Length:', stepContent2?.innerHTML.length);
    }
}

// בדיקת שלב 3
const step3 = document.getElementById('step-preview');
if (step3) {
    const stepContent3 = step3.querySelector('.step-content');
    console.log('Step 3 Element:', step3);
    console.log('Step 3 Display:', step3?.style.display);
    console.log('Step 3 Computed Display:', step3 ? window.getComputedStyle(step3).display : 'N/A');
    if (stepContent3) {
        console.log('Step 3 Content Height:', stepContent3?.offsetHeight);
        console.log('Step 3 Content Scroll Height:', stepContent3?.scrollHeight);
        console.log('Step 3 Content Inner HTML Length:', stepContent3?.innerHTML.length);
    }
}

// בדיקת שלב 4
const step4 = document.getElementById('step-confirm');
if (step4) {
    const stepContent4 = step4.querySelector('.step-content');
    console.log('Step 4 Element:', step4);
    console.log('Step 4 Display:', step4?.style.display);
    console.log('Step 4 Computed Display:', step4 ? window.getComputedStyle(step4).display : 'N/A');
    if (stepContent4) {
        console.log('Step 4 Content Height:', stepContent4?.offsetHeight);
        console.log('Step 4 Content Scroll Height:', stepContent4?.scrollHeight);
        console.log('Step 4 Content Inner HTML Length:', stepContent4?.innerHTML.length);
    }
}

console.log('✅ === בדיקת כל השלבים הושלמה ===');
