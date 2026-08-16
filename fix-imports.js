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
  // Remove Clerk import
  content = content.replace(/import \{ auth \} from "@clerk\/nextjs\/server";\r?\n?/g, '');
  // Fix double NextAuth import
  content = content.replace(/import \{ auth \} from "@\/auth";\r?\nimport \{ auth \} from "@\/auth";/g, 'import { auth } from "@/auth";');
  fs.writeFileSync(file, content);
});
