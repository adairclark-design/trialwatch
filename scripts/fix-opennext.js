const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next') && !file.includes('.open-next') && !file.includes('.git')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

walk('.').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  if (content.includes("export const runtime = 'edge'")) {
    content = content.replace(/export const runtime = 'edge'[\r\n]*/g, '');
    modified = true;
  }

  if (content.includes('const db = getDb()')) {
    content = content.replace(/const db = getDb\(\)/g, 'const db = await getDb()');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
  }
});
console.log('Done.');
