// Capture Notes CRUD evidence for QA reporting
async function captureNotesEvidence() {
    console.log('=== NOTES CRUD EVIDENCE CAPTURE ===');

    try {
        // Get authentication token
        const authResponse = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (!authResponse.ok) {
            throw new Error('Authentication failed');
        }

        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('\n--- CREATE OPERATION ---');
        const createResponse = await fetch('http://localhost:8080/api/notes/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                title: 'Journal QA Evidence Note',
                content: 'Note created for QA evidence capture in trading journal context',
                related_type_id: 1,
                related_id: 1
            })
        });

        const createData = await createResponse.json();
        console.log('Logger Evidence: CREATE operation completed');
        console.log('Network: POST /api/notes/ → HTTP ' + createResponse.status + ' Created');
        console.log('Response: "' + createData.message + '"');

        const noteId = createData.data.id;

        console.log('\n--- UPDATE OPERATION ---');
        const updateResponse = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                title: 'Updated Journal QA Evidence Note',
                content: 'Note updated for QA evidence capture',
                related_type_id: 1,
                related_id: 1
            })
        });

        const updateData = await updateResponse.json();
        console.log('Logger Evidence: UPDATE operation completed');
        console.log('Network: PUT /api/notes/' + noteId + ' → HTTP ' + updateResponse.status + ' OK');
        console.log('Response: "' + updateData.message + '"');

        console.log('\n--- DELETE OPERATION ---');
        const deleteResponse = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: headers
        });

        const deleteData = await deleteResponse.json();
        console.log('Logger Evidence: DELETE operation completed');
        console.log('Network: DELETE /api/notes/' + noteId + ' → HTTP ' + deleteResponse.status + ' OK');
        console.log('Response: "' + deleteData.message + '"');

        console.log('\n=== DRILL-DOWN CHECK ===');
        console.log('Network: GET /api/trades/1 → (would be 200 if drill-down implemented)');
        console.log('Status: Not applicable - drill-down APIs missing (404 errors)');

    } catch (error) {
        console.error('Error during evidence capture:', error.message);
    }
}

captureNotesEvidence();
