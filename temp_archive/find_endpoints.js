const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern, excludeDirs) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                results = results.concat(searchDir(fullPath, pattern, excludeDirs));
            }
        } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(pattern)) {
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.includes(pattern)) {
                        results.push(`${fullPath}:${index + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    });
    return results;
}

const rootDir = 'c:\\Users\\USER\\Desktop\\VIU\\Above\\My websites\\Hotel\\hotel-booking-system\\airgo-web\\app';
const patterns = ['api/hotels', 'api/rooms', 'api/cars', 'delete-partner'];
const exclude = ['node_modules', '.next', '.git'];

try {
    patterns.forEach(pattern => {
        const matches = searchDir(rootDir, pattern, exclude);
        console.log(`--- Pattern: ${pattern} ---`);
        matches.forEach(m => console.log(m));
    });
} catch (e) {
    console.error(e);
}
