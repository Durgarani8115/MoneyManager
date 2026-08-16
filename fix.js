const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./actions').filter(f => f.endsWith('.js') || f.endsWith('.ts'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove duplicate auth imports
  content = content.replace(/import \{ auth \} from "@\/auth";\r?\nimport \{ auth \} from "@\/auth";/g, 'import { auth } from "@/auth";');
  // Fix the literal backtick n
  content = content.replace(/const session = await auth\(\);`n    if \(!session\?\.user\) throw new Error\("Unauthorized"\);`n    const user = session\.user;/g, 'const session = await auth();\n    if (!session?.user) throw new Error("Unauthorized");\n    const user = session.user;');
  fs.writeFileSync(file, content);
});
