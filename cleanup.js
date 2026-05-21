const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.isFile() && entry.name === 'page.tsx') {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let originalContent = content;
            
            // Remove static nav
            content = content.replace(/<nav className="bg-\[#004A99\].*?<\/nav>/gs, '');
            // Remove static footer
            content = content.replace(/<footer className="bg-gray-900.*?<\/footer>/gs, '');
            
            // Remove SMART DESKTOP NAVIGATION
            content = content.replace(/\{\/\*\s*SMART DESKTOP NAVIGATION\s*\*\/\}.*?<\/nav>/gs, '');
            
            // Remove SMART MOBILE TOP BAR
            content = content.replace(/\{\/\*\s*SMART MOBILE TOP BAR\s*\*\/\}.*?<\/Link>\s*<\/div>/gs, '');
            
            // Remove MOBILE BOTTOM NAVIGATION (and RESTORED)
            content = content.replace(/\{\/\*\s*MOBILE BOTTOM NAVIGATION( RESTORED)?\s*\*\/\}.*?<\/Link>\s*<\/div>/gs, '');

            // Remove ?? TOP NAVIGATION
            content = content.replace(/\{\/\*\s*\?\?\s*TOP NAVIGATION\s*\*\/\}.*?<\/Link>\s*<\/div>/gs, '');

            if (content !== originalContent) {
                console.log(`Modified ${fullPath}`);
                fs.writeFileSync(fullPath, content, 'utf-8');
            }
        }
    }
}

processDir(appDir);
console.log("Done removing duplicates!");
