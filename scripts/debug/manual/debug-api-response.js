// קוד בדיקה נוסף לראות מה מחזיר ה-API
console.log('🔍 === DEBUG API RESPONSE ===');

if (window.currentSessionId) {
    console.log('Testing API call with detailed response...');
    fetch(`/api/user-data-import/session/${window.currentSessionId}/preview`)
        .then(response => {
            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', response.headers);
            return response.json();
        })
        .then(data => {
            console.log('Full API Response:', data);
            console.log('Response Keys:', Object.keys(data));
            
            if (data.success) {
                console.log('Preview Data:', data.preview_data);
                console.log('Preview Data Keys:', Object.keys(data.preview_data || {}));
                
                // בדיקת missing tickers
                if (data.preview_data?.missing_tickers) {
                    console.log('Missing Tickers:', data.preview_data.missing_tickers);
                    console.log('Missing Tickers Length:', data.preview_data.missing_tickers.length);
                    console.log('Missing Tickers Sample:', data.preview_data.missing_tickers.slice(0, 5));
                } else {
                    console.log('No missing tickers in response');
                }
                
                // בדיקת within file duplicates
                if (data.preview_data?.within_file_duplicates) {
                    console.log('Within File Duplicates:', data.preview_data.within_file_duplicates);
                    console.log('Within File Duplicates Length:', data.preview_data.within_file_duplicates.length);
                } else {
                    console.log('No within file duplicates in response');
                }
                
                // בדיקת existing records
                if (data.preview_data?.existing_records) {
                    console.log('Existing Records:', data.preview_data.existing_records);
                    console.log('Existing Records Length:', data.preview_data.existing_records.length);
                } else {
                    console.log('No existing records in response');
                }
                
                // בדיקת כל המפתחות
                console.log('All Preview Data Keys:', Object.keys(data.preview_data || {}));
                
            } else {
                console.log('API Error:', data.error);
            }
        })
        .catch(error => {
            console.error('API Error:', error);
        });
} else {
    console.log('No currentSessionId - cannot test API');
}

console.log('\n✅ === API RESPONSE DEBUG COMPLETE ===');
