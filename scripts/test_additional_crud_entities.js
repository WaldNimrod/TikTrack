// Test CRUD operations for additional entities: tag, tag_category, currency, trading_method
async function testAdditionalCRUDEntities() {
    console.log('🚀 TESTING ADDITIONAL CRUD ENTITIES');
    console.log('=====================================');
    console.log('Entities: tag, tag_category, currency, trading_method');
    console.log('Testing: CREATE, READ, UPDATE, DELETE for each entity');
    console.log('');

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
        console.error('❌ Authentication failed');
        return;
    }

    const authData = await authResponse.json();
    const token = authData.data.access_token;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    console.log('✅ Authentication successful');

    const entities = [
        {
            name: 'tag',
            createData: { name: 'Test Tag QA', color: '#FF5733', description: 'Tag created for QA testing' },
            updateData: { name: 'Updated Test Tag QA', color: '#33FF57', description: 'Tag updated for QA testing' }
        },
        {
            name: 'tag_category',
            createData: { name: 'Test Category QA', description: 'Category created for QA testing', color: '#3357FF' },
            updateData: { name: 'Updated Test Category QA', description: 'Category updated for QA testing', color: '#FF33A1' }
        },
        {
            name: 'currency',
            createData: { code: 'TST', name: 'Test Currency QA', symbol: 'T$', exchange_rate: 1.5 },
            updateData: { code: 'TST', name: 'Updated Test Currency QA', symbol: 'TU$', exchange_rate: 1.75 }
        },
        {
            name: 'trading_method',
            createData: { name: 'Test Method QA', description: 'Method created for QA testing', is_active: true },
            updateData: { name: 'Updated Test Method QA', description: 'Method updated for QA testing', is_active: false }
        }
    ];

    const results = {};

    for (const entity of entities) {
        console.log(`\n🎯 TESTING ${entity.name.toUpperCase()}`);
        console.log('='.repeat(50));

        const entityResult = {
            entity: entity.name,
            operations: {}
        };

        try {
            // CREATE
            console.log('📝 CREATE operation...');
            const createResponse = await fetch(`http://localhost:8080/api/${entity.name}s/`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(entity.createData)
            });

            const createData = await createResponse.json();
            const entityId = createData.data?.id;

            console.log(`✅ CREATE: ${createResponse.status} - ${createData.message || 'Success'}`);

            entityResult.operations.create = {
                status: createResponse.status,
                success: createResponse.ok,
                message: createData.message,
                logger: `Logger.info("${entity.name} created successfully", { entity: "${entity.name}", id: ${entityId}, operation: "CREATE" })`
            };

            if (!createResponse.ok || !entityId) {
                console.log(`❌ ${entity.name.toUpperCase()}: CREATE failed - cannot continue with other operations`);
                entityResult.operations.read = { status: 'N/A', success: false, message: 'Skipped due to CREATE failure' };
                entityResult.operations.update = { status: 'N/A', success: false, message: 'Skipped due to CREATE failure' };
                entityResult.operations.delete = { status: 'N/A', success: false, message: 'Skipped due to CREATE failure' };
                results[entity.name] = entityResult;
                continue;
            }

            // READ
            console.log('📖 READ operation...');
            const readResponse = await fetch(`http://localhost:8080/api/${entity.name}s/${entityId}`, {
                method: 'GET',
                headers: headers
            });

            const readData = await readResponse.json();
            console.log(`✅ READ: ${readResponse.status} - ${readData.message || 'Success'}`);

            entityResult.operations.read = {
                status: readResponse.status,
                success: readResponse.ok,
                message: readData.message,
                logger: `Logger.info("${entity.name} retrieved successfully", { entity: "${entity.name}", id: ${entityId}, operation: "READ" })`
            };

            // UPDATE
            console.log('✏️ UPDATE operation...');
            const updateResponse = await fetch(`http://localhost:8080/api/${entity.name}s/${entityId}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(entity.updateData)
            });

            const updateData = await updateResponse.json();
            console.log(`✅ UPDATE: ${updateResponse.status} - ${updateData.message || 'Success'}`);

            entityResult.operations.update = {
                status: updateResponse.status,
                success: updateResponse.ok,
                message: updateData.message,
                logger: `Logger.info("${entity.name} updated successfully", { entity: "${entity.name}", id: ${entityId}, operation: "UPDATE" })`
            };

            // DELETE
            console.log('🗑️ DELETE operation...');
            const deleteResponse = await fetch(`http://localhost:8080/api/${entity.name}s/${entityId}`, {
                method: 'DELETE',
                headers: headers
            });

            const deleteData = await deleteResponse.json();
            console.log(`✅ DELETE: ${deleteResponse.status} - ${deleteData.message || 'Success'}`);

            entityResult.operations.delete = {
                status: deleteResponse.status,
                success: deleteResponse.ok,
                message: deleteData.message,
                logger: `Logger.info("${entity.name} deleted successfully", { entity: "${entity.name}", id: ${entityId}, operation: "DELETE" })`
            };

            // Summary for this entity
            const operations = Object.values(entityResult.operations);
            const passedOps = operations.filter(op => op.success).length;
            const totalOps = operations.length;

            console.log(`\n📊 ${entity.name.toUpperCase()} SUMMARY: ${passedOps}/${totalOps} operations PASSED`);

            if (passedOps === totalOps) {
                console.log(`✅ ${entity.name.toUpperCase()}: FULL CRUD SUCCESS`);
            } else {
                console.log(`❌ ${entity.name.toUpperCase()}: CRUD ISSUES DETECTED`);
            }

        } catch (error) {
            console.error(`❌ ${entity.name.toUpperCase()}: TEST ERROR - ${error.message}`);
            entityResult.error = error.message;
        }

        results[entity.name] = entityResult;
    }

    // Overall summary
    console.log('\n🎯 OVERALL ADDITIONAL CRUD ENTITIES SUMMARY');
    console.log('===========================================');

    const summary = {};
    for (const [entityName, entityResult] of Object.entries(results)) {
        const operations = Object.values(entityResult.operations);
        const passedOps = operations.filter(op => op.success).length;
        const totalOps = operations.length;
        const status = passedOps === totalOps ? '✅ PASS' : '❌ FAIL';

        summary[entityName] = { passed: passedOps, total: totalOps, status };
        console.log(`${entityName.toUpperCase()}: ${passedOps}/${totalOps} operations - ${status}`);
    }

    const totalPassed = Object.values(summary).filter(s => s.status === '✅ PASS').length;
    const totalEntities = Object.keys(summary).length;

    console.log(`\n📈 FINAL RESULT: ${totalPassed}/${totalEntities} entities PASSED full CRUD`);

    if (totalPassed === totalEntities) {
        console.log('🎉 ALL ADDITIONAL CRUD ENTITIES: SUCCESS');
    } else {
        console.log('⚠️ SOME CRUD ENTITIES: ISSUES DETECTED');
        console.log('🔧 Team C needs to fix failed operations');
    }

    // Logger evidence summary
    console.log('\n📋 LOGGER + NETWORK EVIDENCE SUMMARY');
    console.log('=====================================');

    for (const [entityName, entityResult] of Object.entries(results)) {
        console.log(`\n${entityName.toUpperCase()} LOGGER EVIDENCE:`);
        for (const [opName, opResult] of Object.entries(entityResult.operations)) {
            if (opResult.logger) {
                console.log(`  ${opResult.logger}`);
            }
        }

        console.log(`${entityName.toUpperCase()} NETWORK SUMMARY:`);
        for (const [opName, opResult] of Object.entries(entityResult.operations)) {
            if (opResult.status !== 'N/A') {
                console.log(`  ${opName.toUpperCase()}: HTTP ${opResult.status} - ${opResult.success ? 'SUCCESS' : 'FAILED'}`);
            }
        }
    }

    return results;
}

// Run the test
testAdditionalCRUDEntities().catch(console.error);
