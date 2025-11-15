/**
 * Jest Project Configuration
 * --------------------------
 * Defines the default multi-project setup for TikTrack tests.
 */

const {
    unitProject,
    integrationProject,
    componentProject
} = require('./tests/config/jest-base');

module.exports = {
    projects: [unitProject, integrationProject, componentProject],
    moduleFileExtensions: ['js', 'json', 'node']
};
