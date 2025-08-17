#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Исправляем импорты с версиями
      content = content.replace(/from\s+["']([^"'@]+)@[\d.]+["']/g, 'from "$1"');
      content = content.replace(/import\s+(.+?)\s+from\s+["']([^"'@]+)@[\d.]+["']/g, 'import $1 from "$2"');
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in: ${filePath}`);
    }
  });
}

fixImports('./src/shared/ui/ui');
console.log('Import fixing completed!');
