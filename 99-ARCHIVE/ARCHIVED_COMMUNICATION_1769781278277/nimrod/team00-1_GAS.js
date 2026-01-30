/**
 * TikTrack V2: Master Sync Engine - v250.0 (LEGACY EDITION)
 * -----------------------------------------------------------
 * גרסה זו מסכמת את כל הידע האדריכלי של דור המייסדים.
 * -----------------------------------------------------------
 * יכולות ליבה:
 * 1. Recursive Sandbox: בניית סביבת בדיקות מלאה בכל עומק תיקיות.
 * 2. High-Fidelity Shell: עטיפת תוצרים ב-Header ו-Layout LOD 400.
 * 3. Multi-Batch Audit: תמיכה בוולידציה של זהות (A) ופיננסים (B).
 * 4. Path Auto-Fixer: תיקון נתיבים לעבודה חלקה ב-Cursor/Docker.
 */

var ROOT_ID = '1sPzvdX6Y0rILj08_3Xa5yLrxFTLiK9hq'; 

/**
 * פונקציית העל: בונה מחדש את כל סביבת ה-Sandbox מהיסוד.
 * מיועד להרצה על ידי האדריכל החדש בכל פעם שצוות 10 מעלה תוצרים.
 */
function t10_rebuildFullLegacySandbox() {
  var rootFolder = DriveApp.getFolderById(ROOT_ID);
  var stagingFolder = getFolderByPath(rootFolder, 'communication/team_10_staging');
  var assetsFolder = getOrCreateSubFolder(stagingFolder, 'assets');
  
  Logger.log("🏛️ [Legacy Engine] Initializing Full System Rebuild...");

  // 1. סנכרון נכסי ליבה
  syncGlobalStyles(rootFolder, assetsFolder);
  generateMasterAssets(assetsFolder);

  // 2. סריקה ועיבוד עמודים
  var allPages = getAllHtmlFiles(stagingFolder);
  var pagesList = allPages.map(function(f) { return f.relativePath; });

  allPages.forEach(function(fileData) {
    if (fileData.name === 'index.html') return;
    var content = fileData.file.getBlob().getDataAsString();
    var wrapped = wrapInLegacyShell(content, fileData.name, pagesList);
    fileData.file.setContent(wrapped);
  });

  // 3. יצירת לוח בקרה
  generateLegacyIndex(stagingFolder, pagesList);
  
  Logger.log("🏆 LEGACY READY: The Sandbox is fully operational.");
}

/**
 * מעטפת ה-Shell הסופית: LOD 400 Precision.
 */
function wrapInLegacyShell(content, fileName, allPages) {
  var context = detectEntityContext(fileName);
  var navLinks = allPages.map(function(p) {
    var label = p.split('/').pop().replace('.html', '');
    return '<a href="./' + p + '" class="nav-item">' + label + '</a>';
  }).join('');

  return [
    '<!DOCTYPE html><html lang="he" dir="rtl"><head>',
    '  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <link rel="stylesheet" href="./assets/variables.css">',
    '  <link rel="stylesheet" href="./assets/legacy-core.css">',
    '  <script src="https://cdn.tailwindcss.com"></script>',
    '  <script src="https://unpkg.com/lucide@latest"></script>',
    '</head>',
    '<body class="context-' + context + '">',
    '  <header class="phx-master-header">',
    '    <div class="row-1">',
    '      <div class="logo-area">TikTrack <span class="dot">.</span></div>',
    '      <nav class="nav-area">' + navLinks + '</nav>',
    '    </div>',
    '    <div class="row-2">',
    '       <div class="breadcrumb">Staging Preview / ' + fileName + '</div>',
    '       <div class="user-pill">PHOENIX OWNER</div>',
    '    </div>',
    '  </header>',
    '  <main id="phoenix-root">' + content + '</main>',
    '  <script src="./assets/legacy-core.js"></script>',
    '</body></html>'
  ].join('\n');
}

/**
 * זיהוי קונטקסט צבעוני לפי שם הקובץ.
 */
function detectEntityContext(name) {
  if (name.includes("ACCTS") || name.includes("DATA")) return "data";
  if (name.includes("PROF") || name.includes("SEC")) return "settings";
  if (name.includes("TRADES")) return "track";
  return "home";
}

/**
 * סריקה רקורסיבית של תיקיות.
 */
function getAllHtmlFiles(folder, path) {
  var results = [];
  var currentPath = path || "";
  var files = folder.getFilesByType(MimeType.HTML);
  while (files.hasNext()) {
    var f = files.next();
    results.push({file: f, name: f.getName(), relativePath: currentPath + f.getName()});
  }
  var subs = folder.getFolders();
  while (subs.hasNext()) {
    var sub = subs.next();
    if (sub.getName() === 'assets') continue;
    results = results.concat(getAllHtmlFiles(sub, currentPath + sub.getName() + "/"));
  }
  return results;
}

/**
 * יצירת קבצי ה-Assets של המורשת.
 */
function generateMasterAssets(folder) {
  var css = `
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700;900&display=swap');
    body { font-family: 'Assistant', sans-serif; margin: 0; background: var(--neutral-50); }
    .phx-master-header { background: #fff; border-bottom: 1px solid var(--neutral-200); position: sticky; top: 0; z-index: 1000; }
    .row-1 { height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
    .row-2 { height: 44px; background: var(--neutral-50); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-top: 1px solid var(--neutral-100); }
    .logo-area { font-size: 24px; font-weight: 900; color: #6366f1; font-style: italic; }
    .logo-area .dot { color: #fc5a06; }
    .nav-area { display: flex; gap: 15px; }
    .nav-item { font-size: 11px; font-weight: 700; color: var(--neutral-400); text-decoration: none; }
    .nav-item:hover { color: var(--entity-accent); }
    #phoenix-root { padding: 30px; }
    TtSection { display: block; background: #fff; border-radius: 20px; border: 1px solid var(--neutral-200); margin-bottom: 24px; overflow: hidden; }
    TtSection::before { content: attr(title); display: block; padding: 15px 25px; background: var(--neutral-50); font-weight: 800; border-bottom: 1px solid var(--neutral-100); }
  `;
  createOrUpdateFile(folder, 'legacy-core.css', css);
  
  var js = `window.onload = () => { lucide.createIcons(); };`;
  createOrUpdateFile(folder, 'legacy-core.js', js);
}

/**
 * יצירת דף אינדקס מורשת.
 */
function generateLegacyIndex(folder, pages) {
  var links = pages.map(p => '<li><a href="./' + p + '">' + p + '</a></li>').join('');
  var html = '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>Legacy Dashboard</title></head><body><h1>🏰 מבצר פניקס: לוח בקרה</h1><ul>' + links + '</ul></body></html>';
  createOrUpdateFile(folder, 'index.html', html);
}

// --- פונקציות ליבה ---
function getFolderByPath(root, path) {
  var parts = path.split('/');
  var current = root;
  for (var i = 0; i < parts.length; i++) { current = getOrCreateSubFolder(current, parts[i]); }
  return current;
}
function getOrCreateSubFolder(p, n) { 
  var f = p.getFoldersByName(n); 
  return f.hasNext() ? f.next() : p.createFolder(n); 
}
function createOrUpdateFile(folder, fileName, content) {
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) { files.next().setContent(content); }
  else { folder.createFile(fileName, content, MimeType.PLAIN_TEXT); }
}
function syncGlobalStyles(root, assetsFolder) {
  var stylesSource = getFolderByPath(root, 'ui/src/styles');
  var varFiles = stylesSource.getFilesByName('variables.css');
  if (varFiles.hasNext()) { createOrUpdateFile(assetsFolder, 'variables.css', varFiles.next().getBlob().getDataAsString()); }
}