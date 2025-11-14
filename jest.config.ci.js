/**
 * Jest CI Configuration
 * ---------------------
 * Extends the base project setup with a combined coverage project.
 */

const {
    unitProject,
    integrationProject,
    componentProject,
    combinedCoverageProject
} = require('./tests/config/jest-base');

module.exports = {
    projects: [
        unitProject,
        integrationProject,
        componentProject,
        combinedCoverageProject
    ],
    moduleFileExtensions: ['js', 'json', 'node']
};

