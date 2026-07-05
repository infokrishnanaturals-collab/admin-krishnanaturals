const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // We want to fix: fetch('/api/ 
    // And replace it with: fetch(process.env.NEXT_PUBLIC_API_URL + '/ 
    
    const newContent = content.replace(/fetch\(['"`]\/api\//g, (match, offset, string) => {
        let originalQuote = match.match(/['"`]/)[0];
        return `fetch(process.env.NEXT_PUBLIC_API_URL + ${originalQuote}/`;
    });

    if (content !== newContent) {
        fs.writeFileSync(f, newContent);
        console.log('Fixed fetch calls in', f);
    }
});
