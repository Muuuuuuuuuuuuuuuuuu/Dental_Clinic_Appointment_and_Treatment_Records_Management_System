const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('No TS errors found!');
} catch (e) {
  const output = e.stdout.toString() + e.stderr.toString();
  const lines = output.split('\n');
  
  const fileFixes = {};
  
  for (const line of lines) {
    const match = line.match(/^(.+\.tsx)\(\d+,\d+\): error TS2304: Cannot find name '([A-Z][a-zA-Z0-9_]*)'/);
    if (match) {
      const file = match[1];
      const name = match[2];
      
      // Known non-lucide names that might be caught
      if (['CHART_DATA', 'DocView', 'Badge', 'MOCK_DOCTOR', 'SHIFTS', 'DAYS', 'MOCK_APPOINTMENTS', 'React'].includes(name)) continue;
      
      if (!fileFixes[file]) fileFixes[file] = new Set();
      fileFixes[file].add(name);
    }
  }

  for (const [file, names] of Object.entries(fileFixes)) {
    const filePath = path.resolve(__dirname, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const nameList = Array.from(names).join(', ');
      
      // Find lucide-react import
      if (content.includes('lucide-react')) {
        content = content.replace(/from\s+["']lucide-react["'];?/, `, ${nameList} } from "lucide-react";`);
        content = content.replace(/import\s+{([^}]+)},\s*([^}]+)\s*}\s*from\s+["']lucide-react["'];?/, `import { $1, $2 } from "lucide-react";`);
      } else {
        content = `import { ${nameList} } from "lucide-react";\n` + content;
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed missing lucide icons in ${file}: ${nameList}`);
    }
  }
}
