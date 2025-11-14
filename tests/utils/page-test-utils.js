const {
    resolvePagePath,
    readHtmlFile,
    loadPageDom,
    mountHtml,
    resetDom,
    setPageLocation,
    loadHtmlFragment
} = require('../support/dom-loader');

function loadPageTemplate(pageName) {
    const filePath = resolvePagePath(pageName);
    return readHtmlFile(filePath);
}

function mountPageTemplate(pageName, options = {}) {
    return loadPageDom(pageName, options);
}

module.exports = {
    loadPageTemplate,
    mountPageTemplate,
    loadPageDom,
    mountHtml,
    resetDom,
    setPageLocation,
    loadHtmlFragment,
    resolvePagePath,
    readHtmlFile
};

