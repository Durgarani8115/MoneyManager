const fs = require('fs');
const path = require('path');

const dirs = ['./app', './components'];
const currencySymbol = '₹';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Let's find specific patterns where currency is used.
      // Pattern 1: \$ (literal dollar in strings/JSX) followed by a digit.
      content = content.replace(/\$([0-9])/g, `${currencySymbol}$1`);
      
      // Pattern 2: JSX literal dollar before expression: >${
      content = content.replace(/>\$\{/g, `>${currencySymbol}{`);
      
      // Pattern 3: JSX literal dollar before expression with spaces: > \$ \{
      // actually usually it's just >${ or text before it. Let's just match any $ before { that is NOT inside backticks!
      // This is too hard with regex. 
      
      // Let's replace `$${` inside backticks with `₹${`
      content = content.replace(/\$\$\{/g, `${currencySymbol}\${`);
      
      // Let's replace `-$` or `+$`
      content = content.replace(/-\$/g, `-${currencySymbol}`);
      content = content.replace(/\+\$/g, `+${currencySymbol}`);
      
      // In template literals like `Est. $${cost}` it was handled above.
      
      // Any remaining standalone `$` in JSX text, like ` ${amount}` or `Est. $`
      // We can look for `$` followed by `{` where it's NOT preceded by a backtick or `$`
      content = content.replace(/([>\s])\$\{/g, `$1${currencySymbol}{`);
      
      // `$` followed by `{` but inside string like "$"?
      
      if (content !== fs.readFileSync(fullPath, 'utf8')) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

for (const d of dirs) {
  processDir(d);
}
console.log("Done");
