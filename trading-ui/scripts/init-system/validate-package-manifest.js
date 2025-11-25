/**
 * Package Manifest Validator
 * בדיקה מקיפה של מניפסט החבילות
 */

const fs = require('fs');
const path = require('path');

// Load package manifest
const manifestPath = path.join(__dirname, 'package-manifest.js');
const content = fs.readFileSync(manifestPath, 'utf8');

// Extract PACKAGE_MANIFEST
const manifestMatch = content.match(/const PACKAGE_MANIFEST = ({[\s\S]*?});/);
if (!manifestMatch) {
  console.error('❌ Could not extract PACKAGE_MANIFEST');
  process.exit(1);
}

// Evaluate the manifest (simplified - in real scenario would use proper parser)
const packages = {};
const packageRegex = /['"]([a-z-]+)['"]:\s*\{([^}]+(?:{[^}]*}[^}]*)*)\}/g;
let match;

while ((match = packageRegex.exec(content)) !== null) {
  const pkgId = match[1];
  const pkgContent = match[2];
  
  // Extract loadOrder
  const loadOrderMatch = pkgContent.match(/loadOrder:\s*([\d.]+)/);
  const loadOrder = loadOrderMatch ? parseFloat(loadOrderMatch[1]) : null;
  
  // Extract dependencies
  const depsMatch = pkgContent.match(/dependencies:\s*\[([^\]]+)\]/);
  let dependencies = [];
  if (depsMatch) {
    dependencies = depsMatch[1]
      .split(',')
      .map(d => d.trim().replace(/['"]/g, ''))
      .filter(d => d.length > 0);
  }
  
  // Extract scripts count
  const scriptsCount = (pkgContent.match(/file:/g) || []).length;
  
  // Extract deprecated flag
  const deprecated = pkgContent.includes('deprecated: true');
  
  packages[pkgId] = {
    loadOrder,
    dependencies,
    scriptsCount,
    deprecated
  };
}

console.log('='.repeat(80));
console.log('בדיקה מקיפה של מניפסט החבילות');
console.log('='.repeat(80));
console.log(`\nסה"כ חבילות: ${Object.keys(packages).length}\n`);

// 1. רשימת כל החבילות לפי loadOrder
console.log('1. רשימת כל החבילות לפי loadOrder:');
console.log('-'.repeat(80));
const sortedPackages = Object.keys(packages).sort((a, b) => {
  const orderA = packages[a].loadOrder || 999;
  const orderB = packages[b].loadOrder || 999;
  return orderA - orderB;
});

sortedPackages.forEach(pkgId => {
  const pkg = packages[pkgId];
  const deprecation = pkg.deprecated ? ' ⚠️ DEPRECATED' : '';
  console.log(`${String(pkg.loadOrder || 'N/A').padStart(5)}\t${pkgId.padEnd(25)}\tDeps: ${pkg.dependencies.length}\tScripts: ${pkg.scriptsCount}${deprecation}`);
});

// 2. בדיקת תלויות חסרות
console.log('\n2. בדיקת תלויות חסרות:');
console.log('-'.repeat(80));
const allPackageIds = Object.keys(packages);
const missingDeps = [];

sortedPackages.forEach(pkgId => {
  const pkg = packages[pkgId];
  pkg.dependencies.forEach(dep => {
    if (!allPackageIds.includes(dep)) {
      missingDeps.push({ package: pkgId, missing: dep });
    }
  });
});

if (missingDeps.length > 0) {
  console.log('❌ תלויות חסרות:');
  missingDeps.forEach(({ package: pkg, missing }) => {
    console.log(`  ${pkg} → ${missing} (לא קיים במניפסט)`);
  });
} else {
  console.log('✅ כל התלויות קיימות במניפסט');
}

// 3. בדיקת loadOrder כפולים
console.log('\n3. בדיקת loadOrder כפולים:');
console.log('-'.repeat(80));
const loadOrderMap = {};
sortedPackages.forEach(pkgId => {
  const loadOrder = packages[pkgId].loadOrder;
  if (loadOrder !== null) {
    if (!loadOrderMap[loadOrder]) {
      loadOrderMap[loadOrder] = [];
    }
    loadOrderMap[loadOrder].push(pkgId);
  }
});

const duplicates = Object.entries(loadOrderMap).filter(([order, pkgs]) => pkgs.length > 1);
if (duplicates.length > 0) {
  console.log('⚠️ loadOrder כפולים:');
  duplicates.forEach(([order, pkgs]) => {
    console.log(`  ${order}: ${pkgs.join(', ')}`);
  });
} else {
  console.log('✅ אין loadOrder כפולים');
}

// 4. בדיקת מעגלי תלויות
console.log('\n4. בדיקת מעגלי תלויות:');
console.log('-'.repeat(80));

const findCircularDeps = (startPkg, visited = new Set(), path = []) => {
  if (visited.has(startPkg)) {
    const cycleStart = path.indexOf(startPkg);
    if (cycleStart !== -1) {
      return path.slice(cycleStart).concat([startPkg]);
    }
    return null;
  }
  
  visited.add(startPkg);
  path.push(startPkg);
  
  const pkg = packages[startPkg];
  if (!pkg) return null;
  
  for (const dep of pkg.dependencies) {
    const cycle = findCircularDeps(dep, new Set(visited), [...path]);
    if (cycle) return cycle;
  }
  
  return null;
};

const circularDeps = [];
sortedPackages.forEach(pkgId => {
  const cycle = findCircularDeps(pkgId);
  if (cycle) {
    circularDeps.push(cycle);
  }
});

if (circularDeps.length > 0) {
  console.log('❌ מעגלי תלויות:');
  circularDeps.forEach(cycle => {
    console.log(`  ${cycle.join(' → ')}`);
  });
} else {
  console.log('✅ אין מעגלי תלויות');
}

// 5. בדיקת סדר טעינה נכון (תלויות נטענות לפני החבילה)
console.log('\n5. בדיקת סדר טעינה נכון:');
console.log('-'.repeat(80));
const orderIssues = [];

sortedPackages.forEach(pkgId => {
  const pkg = packages[pkgId];
  const pkgLoadOrder = pkg.loadOrder;
  
  if (pkgLoadOrder === null) return;
  
  pkg.dependencies.forEach(dep => {
    const depPkg = packages[dep];
    if (depPkg && depPkg.loadOrder !== null) {
      if (depPkg.loadOrder >= pkgLoadOrder) {
        orderIssues.push({
          package: pkgId,
          dependency: dep,
          packageOrder: pkgLoadOrder,
          depOrder: depPkg.loadOrder
        });
      }
    }
  });
});

if (orderIssues.length > 0) {
  console.log('⚠️ בעיות בסדר טעינה:');
  orderIssues.forEach(({ package: pkg, dependency: dep, packageOrder, depOrder }) => {
    console.log(`  ${pkg} (${packageOrder}) תלוי ב-${dep} (${depOrder}) - תלות נטענת אחרי החבילה!`);
  });
} else {
  console.log('✅ כל התלויות נטענות לפני החבילות התלויות');
}

// 6. בדיקת init-system dependencies
console.log('\n6. בדיקת init-system dependencies:');
console.log('-'.repeat(80));
const initSystem = packages['init-system'];
if (initSystem) {
  console.log(`init-system תלוי ב-${initSystem.dependencies.length} חבילות:`);
  initSystem.dependencies.forEach(dep => {
    const depPkg = packages[dep];
    if (depPkg) {
      console.log(`  ✅ ${dep} (loadOrder: ${depPkg.loadOrder})`);
    } else {
      console.log(`  ❌ ${dep} (לא קיים!)`);
    }
  });
  
  // Check if all packages are included
  const allOtherPackages = Object.keys(packages).filter(p => p !== 'init-system');
  const missingInInit = allOtherPackages.filter(p => !initSystem.dependencies.includes(p));
  if (missingInInit.length > 0) {
    console.log(`\n⚠️ חבילות שלא מופיעות ב-init-system dependencies:`);
    missingInInit.forEach(p => {
      const pkg = packages[p];
      console.log(`  ${p} (loadOrder: ${pkg.loadOrder})`);
    });
  } else {
    console.log('\n✅ init-system כולל את כל החבילות האחרות');
  }
}

// 7. סיכום
console.log('\n' + '='.repeat(80));
console.log('סיכום:');
console.log('='.repeat(80));
console.log(`✅ חבילות: ${Object.keys(packages).length}`);
console.log(`${missingDeps.length === 0 ? '✅' : '❌'} תלויות חסרות: ${missingDeps.length}`);
console.log(`${duplicates.length === 0 ? '✅' : '⚠️'} loadOrder כפולים: ${duplicates.length}`);
console.log(`${circularDeps.length === 0 ? '✅' : '❌'} מעגלי תלויות: ${circularDeps.length}`);
console.log(`${orderIssues.length === 0 ? '✅' : '⚠️'} בעיות סדר טעינה: ${orderIssues.length}`);

if (missingDeps.length === 0 && duplicates.length === 0 && circularDeps.length === 0 && orderIssues.length === 0) {
  console.log('\n✅ המניפסט תקין לחלוטין!');
  process.exit(0);
} else {
  console.log('\n⚠️ נמצאו בעיות שצריך לתקן');
  process.exit(1);
}

