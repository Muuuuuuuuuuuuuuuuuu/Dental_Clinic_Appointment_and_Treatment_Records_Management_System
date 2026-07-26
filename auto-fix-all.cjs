const fs = require('fs');
const { execSync } = require('child_process');

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('All fixed!');
} catch (e) {
  const out = e.stdout.toString() + e.stderr.toString();
  const lines = out.split('\n');
  const fixes = {};
  
  for (const line of lines) {
    const m = line.match(/^(.+\.tsx)\(\d+,\d+\): error TS2304: Cannot find name '([A-Za-z0-9_]+)'/);
    if (m) {
      const file = m[1];
      const name = m[2];
      if (!fixes[file]) fixes[file] = new Set();
      fixes[file].add(name);
    }
  }

  for (const [file, names] of Object.entries(fixes)) {
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    const icons = [];
    
    for (const name of names) {
      if (name === 'CHART_DATA' || name === 'MOCK_DOCTOR' || name === 'DocView') {
        content = content.replace(/} from "\.\.\/\.\.\/shared\/data";/, `, ${name} } from "../../shared/data";`);
      } else if (name === 'Badge') {
        content = `import { Badge } from "../../shared/components/ui/badge";\n` + content;
      } else if (name.match(/^[A-Z]/)) {
        icons.push(name);
      }
    }
    
    if (icons.length > 0) {
      const iconList = icons.join(', ');
      if (content.includes('lucide-react')) {
        content = content.replace(/from "lucide-react";/, `, ${iconList} } from "lucide-react";`);
        content = content.replace(/import {([^}]+)},\s*([^}]+)}/, 'import { $1, $2 }');
      } else {
        content = `import { ${iconList} } from "lucide-react";\n` + content;
      }
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + file);
  }
}
